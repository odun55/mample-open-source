const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const crypto = require("node:crypto");
const { checkRateLimits } = require("./rateLimit");

const options = { region: "europe-west1", timeoutSeconds: 15, memory: "256MiB", maxInstances: 3 };
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const token = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const INVITE_MS = 90_000;

// The terminal owns the polling key; the phone sees only the separate claim token.
exports.cliPairing = onRequest({ ...options, invoker: "public" }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { action, terminal_key, claim_token, public_key } = req.body || {};
  if (!["start", "poll"].includes(action) || !token(terminal_key) ||
      (action === "start" && (!token(claim_token) || typeof public_key !== "string" || public_key.length > 1000))) {
    return res.status(400).json({ error: "Invalid pairing request" });
  }
  if (action === "start") {
    try {
      const key = crypto.createPublicKey(public_key);
      if (key.asymmetricKeyType !== "rsa" || key.asymmetricKeyDetails.modulusLength !== 3072) throw new Error("Invalid key");
    } catch (error) {
      return res.status(400).json({ error: "Invalid pairing public key" });
    }
  }
  const db = getFirestore();
  const keyHash = hash(terminal_key);
  const ref = db.collection("cli_pairing_invites").doc(keyHash);
  try {
    if (action === "start") {
      const ip = hash(req.ip || "unknown");
      const limit = await checkRateLimits(db, `pairing_${ip}`, `pairing_ip_${ip}`);
      if (!limit.allowed) {
        res.set("Retry-After", String(limit.retryAfter));
        return res.status(429).json({ error: "Too many pairing attempts. Please retry later." });
      }
    }
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (doc.exists) {
        const invite = doc.data();
        if (invite.status === "paired") return { status: "paired", encrypted_key: invite.encrypted_key };
        if (invite.expires_at.toMillis() <= Date.now()) return { status: "expired" };
        return { status: "pending", invite_id: ref.id, expires_at: invite.expires_at.toMillis() };
      }
      if (action === "poll") return { status: "expired" };
      const expiresAt = Date.now() + INVITE_MS;
      tx.create(ref, {
        status: "pending", claim_hash: hash(claim_token), public_key,
        expires_at: Timestamp.fromMillis(expiresAt),
        // Configure Firestore TTL on cleanup_at; it is never used for connection expiry.
        cleanup_at: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      });
      return { status: "pending", invite_id: ref.id, expires_at: expiresAt };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("CLI pairing failed:", error);
    return res.status(500).json({ error: "Unable to pair. Please retry." });
  }
});

exports.completeCLIPairing = onCall({ ...options, enforceAppCheck: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before pairing.");
  const { invite_id, claim_token, cli_secret_key } = request.data || {};
  if (!token(invite_id) || !token(claim_token) || typeof cli_secret_key !== "string" ||
      !cli_secret_key || Buffer.byteLength(cli_secret_key, "utf8") > 256) {
    throw new HttpsError("invalid-argument", "Invalid terminal QR or Secret Key.");
  }
  const db = getFirestore();
  const limit = await checkRateLimits(db, `pairing_${request.auth.uid}`, `pairing_claim_${request.auth.uid}`);
  if (!limit.allowed) throw new HttpsError("resource-exhausted", "Too many pairing attempts.");
  return db.runTransaction(async (tx) => {
    const inviteRef = db.collection("cli_pairing_invites").doc(invite_id);
    const userRef = db.collection("users").doc(request.auth.uid);
    const [inviteDoc, userDoc] = await tx.getAll(inviteRef, userRef);
    const invite = inviteDoc.exists ? inviteDoc.data() : null;
    if (!invite || invite.status !== "pending" || invite.expires_at.toMillis() <= Date.now() ||
        invite.claim_hash !== hash(claim_token)) {
      throw new HttpsError("failed-precondition", "This QR has expired or has already been used.");
    }
    if (!userDoc.exists || userDoc.data().notifications_disabled === true) {
      throw new HttpsError("permission-denied", "This account cannot create connections.");
    }
    if (userDoc.data().cli_secret_key_hash !== hash(cli_secret_key)) {
      throw new HttpsError("permission-denied", "Refresh your mobile Secret Key before pairing.");
    }
    // Persist only ciphertext. Only the originating terminal has the private key.
    const encryptedKey = crypto.publicEncrypt({ key: invite.public_key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(cli_secret_key)).toString("base64");
    tx.update(inviteRef, { status: "paired", encrypted_key: encryptedKey, claim_hash: FieldValue.delete() });
    return { success: true };
  });
});
