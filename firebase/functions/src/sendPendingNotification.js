const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

exports.sendPendingNotification = onDocumentCreated(
  {
    document: "pending_notifications/{docId}",
    region: "europe-west1",
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 3
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { userId, fcmToken, title, body } = data;

    if (!fcmToken) {
      console.error("FCM Token eksik, bildirim gönderilemiyor.");
      return;
    }

    try {
      await getMessaging().send({
        token: fcmToken,
        notification: {
          title: title || "Mample",
          body: body || ""
        },
        apns: {
          payload: {
            aps: {
              sound: "default"
            }
          }
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "mample_notifications_v1"
          }
        },
        data: { 
          title: title || "Mample", 
          body: body || "", 
          task_name: body || "", 
          timestamp: String(Date.now()) 
        },
      });

      // Başarılı olursa belgeyi sil (veya status: "sent" yap)
      await snapshot.ref.delete();
      
    } catch (fcmError) {
      console.error("Bildirim gönderim hatası:", fcmError);
      
      const db = getFirestore();
      
      // Token geçersizse temizle
      if (fcmError.code === "messaging/registration-token-not-registered" || fcmError.code === "messaging/invalid-registration-token") {
        if (userId) {
          try {
            const conns = await db.collection("connections").where("uid", "==", userId).get();
            const batch = db.batch();
            conns.forEach(doc => batch.delete(doc.ref));
            batch.update(db.collection("users").doc(userId), { fcm_token: null });
            await batch.commit();
            console.log(`Geçersiz token temizlendi, User ID: ${userId}`);
          } catch (cleanupError) {
            console.error("Temizlik hatası:", cleanupError);
          }
        }
      }
      
      // Hatalı belgeyi veritabanından kaldır
      await snapshot.ref.delete();
    }
  }
);
