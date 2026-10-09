const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

exports.disconnectExtension = onRequest(
  { region: "europe-west1", timeoutSeconds: 15, memory: "256MiB", cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { connection_id } = req.body || {};

    if (!connection_id) {
      return res.status(400).json({ error: "connection_id gerekli" });
    }

    const db = getFirestore();

    try {
      await db.collection("connections").doc(connection_id).delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("disconnectExtension hatası:", error);
      return res.status(500).json({ error: "Sunucu hatası", detail: error.message });
    }
  }
);
