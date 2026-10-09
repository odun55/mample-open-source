# Mample - Chrome Web Mağazası Listeleme İçeriği

Bu dosya, Mample Chrome eklentisinin mağazada yayınlanırken kullanılacak olan **Türkçe** ve **İngilizce** metinlerini içerir. 
*Not: Chrome mağazası metinleri otomatik çevirmez. Mağaza panelinde "Add Language (Dil Ekle)" diyerek İngilizce sekmesi açmalı ve aşağıdaki metinleri ilgili dillere yapıştırmalısın.*

---

## 🇹🇷 TÜRKÇE VİTRİN METİNLERİ (Turkish Listing)

**Eklenti Başlığı (Maks 45 Karakter):**
Mample - Tüm Bildirimler Tek Yerde

**Kısa Açıklama (Maks 150 Karakter):**
Web'deki ve bilgisayarınızdaki uzun işlemler bittiğinde anında telefonunuza bildirim alın. Hesap açmak veya kayıt olmak yok!

**Detaylı Açıklama (Maks 16.000 Karakter):**
```text
Mample, tarayıcınızda veya bilgisayarınızda başlattığınız uzun süreçleri sizin yerinize bekler ve tamamlandıklarında telefonunuza anında bildirim gönderir. İster bir yapay zeka aracında içerik üretin, ister bilgisayarınızda büyük bir dosya derleyin; tüm bildirimlerinizi TEK BİR MERKEZDE toplayın!

Herhangi bir hesaba (e-posta, şifre) ihtiyacınız yoktur. Telefonunuzdaki QR kodu eklentiye okutarak saniyeler içinde eşleşirsiniz. Mample %100 gizlilik odaklı çalışır; verilerinizi asla okumaz veya kaydetmez.

🚀 Neler Yapabilirsiniz?

• Yapay Zeka Süreç Takibi: Popüler yapay zeka araçlarında uzun metinler veya görseller üretilirken ekran başında beklemeyin. Mample süreci otomatik algılar ve bittiğinde telefonunuzu titretir.

• Akıllı Eleman Seçici: Herhangi bir web sitesinde (video renderlama, analiz, dosya yüklemeleri) beklediğiniz bir buton kaybolduğunda veya ortaya çıktığında tetiklenecek hedefi eklenti üzerinden tek tıkla seçin.

• Terminal (CLI) Entegrasyonu: Yazılım ve derleme süreçlerinizi de Mample'a bağlayın! Terminal komut dizilerinizin arkasına "&& mample 'İşlem Bitti'" yazarak tüm bilgisayar süreçleriniz için mobil bildirim alın.

• Hesap Yok, Kayıt Yok: Form doldurmak, şifre ezberlemek yok. Sadece QR kodu okutun ve anonim, tamamen güvenli şekilde kullanmaya başlayın.

📱 Kolay Kullanım
Mample'ı kullanmaya başlamak saniyeler sürer. Telefonunuza Mample uygulamasını indirip eklentideki QR kodu okutarak anında eşleşin. Ardından web'de beklediğiniz butonu seçin veya terminalinize mample komutunu ekleyin. Siz çayınızı alıp rahatlarken, işlemleriniz bittiğinde bildirim doğrudan cebinize gelsin!
```

---

## 🇬🇧 İNGİLİZCE VİTRİN METİNLERİ (English Listing)

**Extension Title (Max 45 Chars):**
Mample - Push Notifications to Phone

**Short Description (Max 150 Chars):**
Get instant push notifications to your phone when web downloads, AI generations, and terminal scripts finish. A zero-config Pushbullet alternative.

**Detailed Description:**
```text
Mample waits for your long processes to finish on your browser or computer and sends an instant push notification to your phone. Whether you are generating AI content or compiling code, collect ALL your notifications in ONE SINGLE APP!

No accounts, emails, or passwords required. Simply scan the QR code to pair your devices securely in seconds. Mample is 100% privacy-focused; it never reads, stores, or transmits your personal data.

🚀 What Can You Do?

• AI Generation Tracker: Don't wait around while popular AI tools generate long texts or images. Mample automatically tracks the generation and notifies you when it's done.

• Smart Element Picker: On any website (video rendering, file uploads, data analysis), simply click the loading button you are waiting for. Mample will automatically alert you the moment it disappears or changes.

• Terminal (CLI) Integration: Connect your computer to your phone! Just add "&& mample 'Build Completed'" to your CLI scripts and get mobile alerts for your code compilations or long-running tasks.

• No Sign-ups, Zero Friction: No emails to give, no passwords to remember. Just scan the QR code to pair your browser to your phone anonymously and securely.

📱 Easy to Use
Getting started with Mample is incredibly simple. After downloading the mobile app, scan the QR code from the extension to pair your devices instantly. Then, select any button you are waiting for on the web or add the mample command to your terminal. Grab a coffee while your task runs in the background, and get a ping the moment it's done!
```

---

## 🔒 MAĞAZA İZİN GEREKÇELERİ (Permission Justifications)

Chrome Web Mağazası geliştirici panelinde sizden istenen izin gerekçelerine (Justifications) aşağıdaki metinleri kopyalayıp yapıştırabilirsiniz.

### Host Permission: `<all_urls>` (Ana Makine İzni)
**Gerekçe / Açıklama:**
"Mample'ın temel işlevi 'Akıllı Eleman Seçici'dir. Kullanıcılar, durum değişikliklerini izlemek için kesinlikle HERHANGİ BİR web sitesindeki herhangi bir kullanıcı arayüzü öğesini (yükleme ikonu, oluştur butonu veya video işleme ilerleme çubuğu gibi) tıklayıp seçebilirler. Kullanıcılar internetteki herhangi bir rastgele web sitesinde uzun süren görevleri izleyebildiğinden, eklentimizin `<all_urls>` içerisine içerik komut dosyasını (content script) enjekte etmesi gerekir. Böylece kullanıcının seçtiği DOM öğesi değiştiğinde veya kaybolduğunda MutationObserver kullanarak algılayabilir ve onlara bildirim gönderebiliriz."

### activeTab & scripting
**Gerekçe / Açıklama:**
"Kullanıcı eklenti simgesine tıkladığında eleman seçici arayüzümüzü mevcut sayfaya enjekte etmek için activeTab ve scripting izinlerini kullanıyoruz. Bu, kullanıcıların o anki aktif sekmede izlemek istedikleri belirli DOM öğesinin üzerine görsel olarak gelmelerini ve seçmelerini sağlar."

### storage
**Gerekçe / Açıklama:**
"Eklentinin, anlık bildirimleri arka ucumuz (backend) aracılığıyla hangi mobil cihaza göndereceğini bilmesi için kullanıcının benzersiz bağlantı anahtarını (QR kod ile oluşturulan) güvenli bir şekilde kaydetmesi amacıyla storage (depolama) iznine ihtiyacımız var."

### downloads
**Gerekçe / Açıklama:**
"Kullanıcının tarayıcı indirmelerini izlemek için downloads (indirmeler) izni gereklidir. Eklenti, bir dosya indirmesi tamamlandığında bunu algılar ve kullanıcının ekran başında beklemesine gerek kalmaması için eşleştirilmiş mobil cihazına anlık bildirim gönderir."
