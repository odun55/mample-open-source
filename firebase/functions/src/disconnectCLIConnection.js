const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("node:crypto");

exports.disconnectCLIConnection = onRequest(
  { region: "europe-west1", timeoutSeconds: 15, memory: "256MiB", cors: true, invoker: "public", maxInstances: 3 },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { cli_secret_key: key, connection_id: id } = req.body || {};
    if (typeof key !== "string" || !key.trim() || key.length > 256 ||
        typeof id !== "string" || !id.trim() || id.length > 256 || id.includes("/")) {
      return res.status(400).json({ error: "Valid CLI key and connection ID required" });
    }

    try {
      const db = getFirestore();
      const hash = crypto.createHash("sha256").update(key, "utf8").digest("hex");
      const users = await db.collection("users").where("cli_secret_key_hash", "==", hash).limit(1).get();
      if (users.empty) return res.status(401).json({ error: "Invalid CLI Secret Key" });
      const user = users.docs[0];
      const ref = db.collection("connections").doc(id);
      // Check ownership and the current key inside the deletion transaction.
      const authorized = await db.runTransaction(async (transaction) => {
        const [currentUser, connection] = await transaction.getAll(user.ref, ref);
        if (!currentUser.exists || currentUser.data().cli_secret_key_hash !== hash) return false;
        if (!connection.exists) return true; // Already revoked from the phone.
        if (connection.data().uid !== user.id) return false;
        transaction.delete(ref);
        return true;
      });
      if (!authorized) return res.status(401).json({ error: "Invalid connection or CLI Secret Key" });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("disconnectCLIConnection failed:", error);
      return res.status(500).json({ error: "Unable to disconnect. Please retry." });
    }
  }
);
