const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");

function hashValue(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

exports.registerCLIConnection = onRequest(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB", cors: true, invoker: "public", maxInstances: 3 },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { cli_secret_key, pc_name, terminal_id, connection_id } = req.body || {};
    if (typeof cli_secret_key !== "string" || !cli_secret_key || cli_secret_key.length > 256 ||
        (pc_name !== undefined && (typeof pc_name !== "string" || pc_name.length > 100)) ||
        (terminal_id !== undefined && (typeof terminal_id !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(terminal_id))) ||
        (connection_id !== undefined && (typeof connection_id !== "string" ||
          !/^[A-Za-z0-9_-]{1,200}$/.test(connection_id)))) {
      return res.status(400).json({ error: "Invalid terminal credentials or identity" });
    }
    const db = getFirestore();
    try {
      const hashedKey = hashValue(cli_secret_key);
      const users = await db.collection("users").where("cli_secret_key_hash", "==", hashedKey).limit(1).get();
      if (users.empty) return res.status(401).json({ error: "Invalid CLI Secret Key" });
      const userRef = users.docs[0].ref;
      const userId = users.docs[0].id;
      const platform = pc_name ? `Terminal (${pc_name})` : "Terminal (CLI)";
      // Stable identity makes retries safe even if saving the response fails.
      const targetRef = terminal_id ?
        db.collection("connections").doc("cli_" + hashValue(userId + ":" + terminal_id.toLowerCase())) :
        db.collection("connections").doc();
      const previousRef = connection_id ? db.collection("connections").doc(connection_id) : null;
      const result = await db.runTransaction(async (transaction) => {
        const refs = [userRef, targetRef];
        if (previousRef && previousRef.id !== targetRef.id) refs.push(previousRef);
        const snapshots = await transaction.getAll(...refs);
        const currentUser = snapshots[0];
        if (!currentUser.exists || currentUser.data().cli_secret_key_hash !== hashedKey) {
          return { error: "Invalid CLI Secret Key", code: 401 };
        }
        if (currentUser.data().notifications_disabled === true) {
          return { error: "Notifications disabled", code: 403 };
        }
        const target = snapshots[1];
        const previous = previousRef?.id === targetRef.id ? target : snapshots[2];
        if (previous?.exists && previous.data().uid !== userId) {
          return { error: "Invalid connection owner", code: 401 };
        }
        // Keep existing legacy terminal IDs and user-defined names during migration.
        const existing = target.exists ? target : previous?.exists ? previous : null;
        if (existing) {
          if (existing.data().uid !== userId || existing.data().expires_at ||
              (terminal_id && existing.data().terminal_id &&
               existing.data().terminal_id !== terminal_id.toLowerCase())) {
            return { error: "Invalid terminal connection", code: 401 };
          }
          const updates = terminal_id ? { terminal_id: terminal_id.toLowerCase() } : {};
          if (existing.data().platform === "Terminal (Terminal)") updates.platform = platform;
          if (Object.keys(updates).length) transaction.update(existing.ref, updates);
          return { success: true, connection_id: existing.id, created: false };
        }
        transaction.create(targetRef, {
          uid: userId, platform, created_at: FieldValue.serverTimestamp(),
          ...(terminal_id ? { terminal_id: terminal_id.toLowerCase() } : {}),
        });
        return { success: true, connection_id: targetRef.id, created: true };
      });
      if (result.error) return res.status(result.code).json({ error: result.error });
      return res.status(200).json(result);
    } catch (error) {
      console.error("registerCLIConnection failed:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);
