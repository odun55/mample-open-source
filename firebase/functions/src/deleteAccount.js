const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getAppCheck } = require("firebase-admin/app-check");
const crypto = require("node:crypto");
const validToken = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");

// Small commits allow accounts with more than 500 related records to be erased.
async function deleteQuery(db, query, beforeDelete = async () => {}) {
  for (;;) {
    const page = await query.limit(200).get();
    if (page.empty) return;
    const batch = db.batch();
    for (const doc of page.docs) {
      await beforeDelete(doc, batch);
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
}

async function eraseAccount(db, auth, uid, receiptHash, expectedKeyHash = null) {
  const userRef = db.collection("users").doc(uid);
  // Block writes from still-valid ID tokens after Auth deletion. This minimal
  // security record contains no key, token or message; configure TTL cleanup_at.
  const hash = await db.runTransaction(async (tx) => {
    const guardRef = db.collection("account_deletion_guards").doc(uid);
    const [user, guard] = await tx.getAll(userRef, guardRef);
    // Web callers must still own the current key when the deletion lock commits.
    // A key rotated between lookup and this transaction cannot erase the account.
    if (expectedKeyHash && user.exists && user.data().cli_secret_key_hash !== expectedKeyHash) {
      throw new HttpsError("permission-denied", "Credential no longer valid.");
    }
    if (guard.exists && guard.data().receipt_hash !== receiptHash) {
      throw new HttpsError("permission-denied", "A different deletion request is already pending.");
    }
    tx.set(db.collection("account_deletion_guards").doc(uid), {
      cleanup_at: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      receipt_hash: receiptHash,
    });
    if (!user.exists) return null;
    tx.update(userRef, { account_deleting: true, notifications_disabled: true,
      fcm_token: FieldValue.delete() });
    return user.data().cli_secret_key_hash || null;
  });

  await deleteQuery(db, db.collection("connections").where("uid", "==", uid),
    async (doc, batch) => batch.delete(db.collection("rateLimits").doc(`conn_${doc.id}`)));
  await deleteQuery(db, db.collection("pending_notifications").where("userId", "==", uid));
  await deleteQuery(db, db.collection("cli_pairing_invites").where("uid", "==", uid));
  await deleteQuery(db, db.collection("rateLimits").where("owner_uid", "==", uid));
  const batch = db.batch();
  for (const id of [`user_${uid}`, `user_pairing_${uid}`, `pairing_claim_${uid}`, `web_deletion_${uid}`,
    ...(hash ? [`cli_${hash}`] : [])]) batch.delete(db.collection("rateLimits").doc(id));
  await batch.commit();
  // Keep the authenticated session available until cleanup has succeeded, so a
  // network/server failure can be retried. Missing Auth users are already erased.
  await db.recursiveDelete(userRef);
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
  }
  return { success: true };
}

exports.deleteAccount = onCall({ region: "europe-west1", enforceAppCheck: true,
  timeoutSeconds: 120, memory: "256MiB", maxInstances: 3 }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before deleting your account.");
  if (request.data?.confirm !== true || !validToken(request.data?.deletion_token)) {
    throw new HttpsError("invalid-argument", "Confirm account deletion with a retry receipt.");
  }
  // The caller cannot supply another user's UID.
  try {
    return await eraseAccount(getFirestore(), getAuth(), request.auth.uid, hashToken(request.data.deletion_token));
  } catch (error) {
    console.error("Account deletion failed:", error.code || "unknown");
    throw new HttpsError("internal", "Deletion could not finish. Please retry.");
  }
});

// The official website verifies ownership with the same high-entropy credential
// used by paired terminals. No UID supplied by a visitor is trusted. Keys are
// accepted only in a POST body, never logged, emailed, stored or returned.
exports.deleteAccountWithKey = onRequest({ region: "europe-west1", invoker: "public",
  timeoutSeconds: 120, memory: "256MiB", maxInstances: 3, concurrency: 10 }, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const key = req.body?.cli_secret_key;
  if (req.rawBody?.length > 2048 || req.body?.confirm !== true ||
    typeof key !== "string" || !/^mample-[A-Za-z0-9_-]{6,249}$/.test(key)) {
    return res.status(400).json({ error: "invalid" });
  }
  const keyHash = hashToken(key);
  // Stable, credential-bound receipt makes response loss safely retryable, even
  // if Firestore cleanup succeeded and Auth deletion has not yet finished.
  const receiptHash = hashToken(`web-account-deletion:${key}`);
  try {
    const db = getFirestore();
    const users = await db.collection("users").where("cli_secret_key_hash", "==", keyHash).limit(1).get();
    let uid;
    if (!users.empty) {
      uid = users.docs[0].id;
      const { checkRateLimits } = require("./rateLimit");
      const limit = await checkRateLimits(db, uid, `web_deletion_${uid}`);
      if (!limit.allowed) {
        res.set("Retry-After", String(limit.retryAfter));
        return res.status(429).json({ error: "rate-limited" });
      }
    } else {
      const guards = await db.collection("account_deletion_guards")
        .where("receipt_hash", "==", receiptHash).limit(1).get();
      if (guards.empty) return res.status(401).json({ error: "invalid-credential" });
      uid = guards.docs[0].id;
    }
    return res.status(200).json(await eraseAccount(db, getAuth(), uid, receiptHash, keyHash));
  } catch (error) {
    if (error.code === "permission-denied") return res.status(409).json({ error: "credential-changed-or-deletion-pending" });
    console.error("Web account deletion failed:", error.code || "unknown");
    return res.status(500).json({ error: "retry" });
  }
});

// A persisted, unguessable receipt can finish an ALREADY authenticated deletion
// after Auth has been removed and the original response was lost. It cannot
// initiate deletion of another account. Never put the receipt in URLs or logs.
exports.resumeAccountDeletion = onRequest({ region: "europe-west1", invoker: "public",
  timeoutSeconds: 120, memory: "256MiB", maxInstances: 3 }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { uid, deletion_token } = req.body || {};
  if (typeof uid !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(uid) || !validToken(deletion_token)) {
    return res.status(400).json({ error: "Invalid deletion receipt" });
  }
  try {
    await getAppCheck().verifyToken(req.header("X-Firebase-AppCheck") || "");
  } catch (_) {
    return res.status(401).json({ error: "App Check required" });
  }
  try {
    const db = getFirestore();
    const guard = await db.collection("account_deletion_guards").doc(uid).get();
    const receiptHash = hashToken(deletion_token);
    if (!guard.exists) {
      // After TTL has removed the receipt, only CONFIRM an already absent
      // account. This branch never deletes or updates any record.
      try {
        await getAuth().getUser(uid);
      } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
        const user = await db.collection("users").doc(uid).get();
        if (!user.exists) return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: "No matching deletion request" });
    }
    if (guard.data().receipt_hash !== receiptHash) {
      return res.status(404).json({ error: "No matching deletion request" });
    }
    return res.status(200).json(await eraseAccount(db, getAuth(), uid, receiptHash));
  } catch (error) {
    console.error("Account deletion resume failed:", error.code || "unknown");
    return res.status(500).json({ error: "Deletion could not finish. Please retry." });
  }
});
