/**
 * checkPairing — Mample Cloud Function (Gen 2)
 */

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

exports.checkPairing = onRequest(
  { region: "europe-west1", timeoutSeconds: 10, memory: "128MiB", cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { connection_id } = req.query;
    if (!connection_id) return res.status(400).json({ error: "connection_id gerekli" });

    const db = getFirestore();

    try {
      const connDoc = await db.collection("connections").doc(connection_id).get();

      if (!connDoc.exists) {
        return res.status(200).json({ paired: false });
      }

      const data = connDoc.data();
      const expiresAt = data.expires_at ? data.expires_at.toMillis() : 0;

      // Sadece expires_at varsa ve süresi dolmuşsa sil
      if (data.expires_at && Date.now() > expiresAt) {
        await connDoc.ref.delete();
        return res.status(410).json({ paired: false, reason: "Süresi doldu" });
      }

      // Token geçerliliğini dry-run ile kontrol et (Kullanıcı uygulamayı silmişse anında kopar)
      const userDoc = await db.collection("users").doc(data.uid).get();
      if (userDoc.exists) {
        const fcmToken = userDoc.data().fcm_token;
        if (fcmToken) {
          try {
            await getMessaging().send({ token: fcmToken, data: { check: "1" } }, true);
          } catch (e) {
            if (e.code === "messaging/registration-token-not-registered" || e.code === "messaging/invalid-registration-token") {
              await connDoc.ref.delete();
              await db.collection("users").doc(data.uid).update({ fcm_token: null });
              return res.status(200).json({ paired: false, reason: "Uygulama silinmiş" });
            }
          }
        } else {
          // Token yoksa bağlantıyı kopar
          await connDoc.ref.delete();
          return res.status(200).json({ paired: false, reason: "Token bulunamadı" });
        }
      }

      return res.status(200).json({ paired: true, uid: data.uid });

    } catch (error) {
      console.error("checkPairing hatası:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  }
);
