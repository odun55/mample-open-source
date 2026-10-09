const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const crypto = require("crypto");

function hashValue(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

exports.registerExtensionConnection = onRequest(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB", cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { cli_secret_key } = req.body || {};

    if (!cli_secret_key) {
      return res.status(400).json({ error: "cli_secret_key gerekli" });
    }

    const db = getFirestore();

    try {
      const hashedKey = hashValue(cli_secret_key);
      const snap = await db.collection("users").where("cli_secret_key_hash", "==", hashedKey).limit(1).get();
      
      if (snap.empty) {
        return res.status(401).json({ error: "Geçersiz Secret Key" });
      }
      
      const userId = snap.docs[0].id;

      // 24 saatlik expiration süresi hesaplama
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create a new connection doc for the Chrome Extension
      const docRef = await db.collection("connections").add({
        uid: userId,
        platform: "Tarayıcı Eklentisi",
        created_at: Timestamp.now(),
        expires_at: Timestamp.fromDate(expiresAt)
      });

      // Eklentiye yeni oluşturulan connection_id'yi döndürüyoruz
      return res.status(200).json({ success: true, connection_id: docRef.id });

    } catch (error) {
      console.error("registerExtensionConnection hatası:", error);
      return res.status(500).json({ error: "Sunucu hatası", detail: error.message });
    }
  }
);
