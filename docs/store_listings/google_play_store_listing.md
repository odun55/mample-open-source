# Google Play mağaza metinleri

Güncellenmiş Android ve terminal CLI sürümü için hazırlanmış yayın taslağıdır. QR anlatımı, güncel mobil uygulama ve CLI paketi birlikte yayınlandığında mağazaya aktarılmalıdır. Planlanan tarayıcı özellikleri yayındaki özellik gibi sunulmaz. Ekran görüntüsü ve Console ayar planı: [Google Play ücretsiz sürüm geçişi](google_play_free_release_plan.md).

## Türkçe

### Uygulama adı
Mample: Terminal Bildirimleri

### Kısa açıklama
Terminal işlemleriniz tamamlandığında Android telefonunuza bildirim alın.

### Tam açıklama
Bilgisayarınızdaki uzun işlemler boyunca ekran başında beklemeyin. Mample, terminal komutlarınıza eklediğiniz bir bildirim komutuyla Android telefonunuza haber verir.

Derleme, test, betik veya model eğitimi tamamlandığında kendi mesajınızı gönderin. Terminal komutu çalıştırabilen bir yapay zeka asistanına da görev sonunda Mample ile bildirim göndermesini söyleyebilirsiniz. Asistanı ayrıca yapılandırmanız gerekir; Mample işlemleri kendiliğinden izlemez.

Tamamen ücretsiz
Aylık bildirim kotası, premium paket veya abonelik yoktur. Kötüye kullanımı önlemek için kısa süreli gönderim sınırları uygulanır.

Nasıl başlanır?
1. Android uygulamasını açın ve bildirim iznini verin.
2. Bilgisayarınıza Node.js ve Mample CLI aracını kurun:
npm install -g mample
3. QR ile bağlanın: terminalde aşağıdaki komutu çalıştırın ve kodu Mample uygulamasıyla okutun:
mample auth --qr
İsterseniz uygulamanın Terminal Aracı bölümündeki Secret Key’i elle de girebilirsiniz:
mample auth "gizli-anahtarınız"
4. İlk mesajınızı gönderin:
mample "İşlem tamamlandı!"

Bash, Zsh veya PowerShell 7 kullanıyorsanız başarılı bir derleme sonrası bildirim gönderebilirsiniz:
npm run build && mample "Derleme tamamlandı!"

Bağlantılar ve geçmiş
Bağlı terminal cihazlarını uygulamada görebilir ve bağlantılarını kaldırabilirsiniz. Son 50 bildirim telefonda yerel olarak saklanır. E-posta ve şifreyle kayıt gerekmez; bildirimlerin doğru cihaza ulaşması için Firebase anonim kimlik doğrulaması kullanılır.

QR daveti tek kullanımlıktır ve 90 saniyede bir yenilenir. QR veya Secret Key ile kurulan terminal bağlantısı süresizdir; bağlantıyı uygulamadan kaldırabilir veya anahtarı yenileyebilirsiniz.

Bilmeniz gerekenler
Telefon ve bilgisayarın internet bağlantısı gerekir. Android bildirim izinleri, pil tasarrufu, arka plan kısıtlamaları ve ağ koşulları teslimatı etkileyebilir. Bildirim, ekranın mutlaka uyanacağını garanti etmez. Mesajınıza gizli bilgi eklemeyin ve Secret Key'inizi paylaşmayın.

Kurulum: https://mample.vercel.app/tr/guide
Gizlilik: https://mample.vercel.app/tr/privacy
Destek: odun.coop@gmail.com

## English

### App name
Mample: Terminal Notifications

### Short description
Get notifications on your Android phone when your terminal tasks finish.

### Full description
Stop waiting at your computer during long tasks. Add a Mample notification command to your terminal workflow and receive a message on your Android phone.

Send your own message when a build, test, script or model training task finishes. You can also instruct an AI coding assistant with terminal access to notify you through Mample after completing a task. Configure the assistant separately; Mample does not automatically monitor your tasks.

Completely free
No monthly notification quota, premium tier or subscription. Short-term sending limits prevent abuse.

Get started
1. Open the Android app and allow notifications.
2. Install Node.js and the Mample CLI on your computer:
npm install -g mample
3. Connect with QR: run the command below in your terminal and scan the code with the Mample app:
mample auth --qr
Or enter the Secret Key from the app's Terminal Tool section manually:
mample auth "your-secret-key"
4. Send your first message:
mample "Task completed!"

In Bash, Zsh or PowerShell 7, send a notification after a successful build:
npm run build && mample "Build completed!"

Connections and history
View your connected terminals and revoke their connections in the app. The latest 50 notifications are stored locally on your phone. No email/password registration is required; Firebase anonymous authentication routes notifications to the correct device.

The QR invitation is single-use and refreshes every 90 seconds. Terminal connections created with QR or Secret Key do not expire; you can revoke them in the app or rotate the key.

Before you start
Your phone and computer need internet access. Android notification permissions, battery saving, background restrictions and network conditions can affect delivery. A notification does not guarantee that the screen wakes. Keep sensitive information out of messages and do not share your Secret Key.

Setup: https://mample.vercel.app/en/guide
Privacy: https://mample.vercel.app/en/privacy
Support: odun.coop@gmail.com
