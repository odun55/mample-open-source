/**
 * triggerNotification — Mample Cloud Function (Gen 2)
 */

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAppCheck } = require("firebase-admin/app-check");
const crypto = require("crypto");
const { checkRateLimits } = require("./rateLimit");
const { validateNotificationRequest } = require("./notificationValidation");

function hashValue(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

exports.triggerNotification = onRequest(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB", cors: true, invoker: "public", maxInstances: 3 },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const validationError = validateNotificationRequest(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const { connection_id, cli_secret_key, task_name, source } = req.body;
    const taskName = task_name || "";

    // App Check Doğrulaması (Eğer CLI değilse)
    if (connection_id && !cli_secret_key) {
      const appCheckToken = req.header("X-Firebase-AppCheck");
      if (!appCheckToken) {
        return res.status(401).json({ error: "Unauthorized: App Check token eksik." });
      }
      try {
        await getAppCheck().verifyToken(appCheckToken);
      } catch (err) {
        console.error("App Check doğrulama hatası:", err);
        return res.status(401).json({ error: "Unauthorized: Geçersiz App Check token." });
      }
    }

    const db = getFirestore();

    try {
      let fcmToken = null;
      let userId = null;
      let connectionName = "Cihaz";
      let userDoc = null;
      let rateLimitKey = null;

      if (connection_id) {
        const connRef = db.collection("connections").doc(connection_id);
        const connDoc = await connRef.get();
        if (!connDoc.exists) return res.status(401).json({ error: "Geçersiz bağlantı" });

        const connData = connDoc.data();
        connectionName = connData.platform || "Cihaz";
        const expiresAt = connData.expires_at ? connData.expires_at.toMillis() : 0;
        if (connData.expires_at && Date.now() > expiresAt) {
          await connRef.delete();
          return res.status(401).json({ error: "Bağlantı süresi dolmuş" });
        }

        userId = connData.uid;
        userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists || !userDoc.data().fcm_token) {
          return res.status(500).json({ error: "FCM token bulunamadı" });
        }
        // Existing CLI clients send both fields. The key must belong to this connection owner.
        if (cli_secret_key && userDoc.data().cli_secret_key_hash !== hashValue(cli_secret_key)) {
          return res.status(401).json({ error: "Geçersiz CLI Secret Key" });
        }
        fcmToken = userDoc.data().fcm_token;
        rateLimitKey = `conn_${connection_id}`;
      } else {
        const hashedKey = hashValue(cli_secret_key);
        const snap = await db.collection("users").where("cli_secret_key_hash", "==", hashedKey).limit(1).get();
        if (snap.empty) return res.status(401).json({ error: "Geçersiz CLI Secret Key" });
        userDoc = snap.docs[0];
        userId = userDoc.id;
        connectionName = "Terminal";
        if (!userDoc.data().fcm_token) return res.status(500).json({ error: "FCM token bulunamadı" });
        fcmToken = userDoc.data().fcm_token;
        rateLimitKey = `cli_${hashedKey}`;
      }

      const userData = userDoc.data();
      if (userData.notifications_disabled === true) {
        return res.status(403).json({ error: "Bildirim gönderimi devre dışı." });
      }

      const limit = await checkRateLimits(db, userId, rateLimitKey);
      if (!limit.allowed) {
        res.set("Retry-After", String(limit.retryAfter));
        return res.status(429).json({ error: "Çok fazla istek", retry_after: limit.retryAfter });
      }

      const defaultMessage = userData.default_message || "Görevin tamamlandı!";
      const showConnectionName = userData.show_connection_name ?? true;

      let finalBody = taskName ? taskName : defaultMessage;
      if (source) {
        finalBody = `${source} - ${finalBody}`;
      }
      
      const finalTitle = showConnectionName ? connectionName : "Mample";
      if (typeof finalBody !== "string" || typeof finalTitle !== "string" ||
          Buffer.byteLength(finalBody, "utf8") > 1000 || Buffer.byteLength(finalTitle, "utf8") > 200) {
        return res.status(400).json({ error: "Bildirim metni çok uzun veya geçersiz." });
      }

      try {
        await db.collection("pending_notifications").add({
          userId: userId,
          fcmToken: fcmToken,
          title: finalTitle,
          body: finalBody,
          status: "pending",
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (dbError) {
        throw dbError;
      }

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error("triggerNotification hatası:", error);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  }
);
