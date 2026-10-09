# Historical roadmap ? archived October 9, 2026

This is a historical record, not the current product specification or release checklist.
It includes retired premium/payment features and superseded plans. Use the root ROADMAP.md for current status.

# Mample - Kısa Yol Haritası

## ✅ TAMAMLANANLAR (Şu Ana Kadar Neler Hallettik?)
- **Backend & Altyapı:** Firebase fonksiyonları (Bildirim atma, QR kod eşleşmesi, cihaz bağlantıları) kusursuz çalışıyor.
- **Chrome Eklentisi:** Yapay zeka asistanları (Claude, Gemini, ChatGPT vb.) için hem Seçimli mod (/mample) hem de Otonom Sistem Modu (/mamplen) özellikleri bitirildi.
- **CLI Aracı:** Bilgisayardaki terminal süreçlerinden bildirim atma özelliği (mample auth, mample run vb.) aktif.
- **Mobil Uygulama:** Bildirimleri alma, QR okutma, premium ekranı tasarımı, ayarlar menüsü ve kılavuz sayfaları tasarımı bitti.
- **Son UI/UX Dokunuşları ve Özellikler (Bugün Yaptıklarımız):**
  - Web sitesindeki (Guide) ve Mobil uygulamadaki kullanım kılavuzu metinleri güncellendi, cihaz bağlantısı kesme yönlendirmeleri iyileştirildi.
  - Web sitesindeki rehberde ilgili başlıklar arası kaydırmalı linkler (smooth scroll) eklendi.
  - Ayarlar ekranındaki "Bize Ulaşın" bölümüne güncel "X" logosu ve "LinkedIn" bağlantısı (beyaz illüstrasyon stiliyle) eklendi.
  - "Verileri Sıfırla" uyarısına "Premium öğeleriniz silinmeyecektir" ibaresi eklendi.
  - Bug Report (Hata Bildirimi) ve E-posta butonları aktifleştirildi; odun.coop@gmail.com adresine yönlendirmeler yapıldı.
  - Android bildirim çubuğu simgesi (%25 küçültülerek) estetik hale getirildi ve bildirim adının mor renk olma sorunu varsayılan (beyaz) renge çevrilerek düzeltildi.
  - Eklentideki 500ms'lik kusurlu tarama döngüsü (startAutoObserver) kaldırılarak tamamen anlık tepki veren MutationObserver altyapısına geçildi.
  - Eklentinin otomatik tuş bulma sistemine yeni siteler (Grok, Poe, Perplexity) eklendi ve tüm sitelerin seçicileri hem Türkçe hem İngilizce varyasyonlarıyla desteklendi.
  - Web sitesi ve mobil uygulamadaki "Nasıl Çalışır?" rehber metinlerinde bulunan desteklenen siteler listesi güncellendi.
  - Chrome eklentisindeki tuş atama UI'ı yenilenerek "Özel Tuş Seçimini Kullan", "Tuş Seç" ve "Tuşu Sil" olarak ikiye/üçe bölündü.
  - /mamplen (One-Off System Mode) mantığı düzenlendi, prompt gönderiminde eklentinin sadece o seferlik çalışıp sonrasında arka planda beklemeye geçmesi sağlandı.
  - Eklentideki 10 saniyelik hatalı zaman aşımı (timeout) sorunu çözüldü, izleyicinin (observer) doğru zamanda tetiklenmesi sağlandı.
  - Eklenti penceresinin dikey boşlukları (padding/margin) optimize edildi ve eşleşme sonrası ekranda kalan devasa boş QR kod alanı gizlenerek scroll (kaydırma) sorunu giderildi.
  - Eklentinin TR ve EN çeviri dosyaları (messages.json), yenilenen UI butonları ve güncel bilgi (tooltip) metinleriyle uyumlu hale getirildi.
  - Yapay zeka asistanlarının izin sorununu (IDE permission prompts) tamamen aşmak için CLAUDE.md ve setup.md kural şablonları oluşturuldu ve web sitesine (indirilebilir formatta) entegre edildi.
  - Web sitesindeki ve mobil uygulamadaki kullanım kılavuzlarına "Otonom Kullanım (İzin Sorularını Kapatmak)" adında yeni bir madde eklendi, FAQ içerisindeki eski anlatım kaldırılıp arayüze (page.js ve guide_sheet.dart) başarıyla yansıtıldı.
  - Web ve mobil arasındaki tüm Rehber (Guide) çevirileri İngilizce ve Türkçe için birebir senkronize edildi (`en.json`, `tr.json`, `app_localizations.dart`).
  - Chrome eklentisindeki "İndirmelerden Bildirim Al" kaydırmalı (switch) butonu kaldırılarak, web stiline uygun pastel renkli standart bir checkbox ile değiştirildi.
  - Android ana ekran uygulama simgesinin (launcher icon) yeşil kare kalması sorunu `rounded_icon.png` dosyasının manuel olarak Android mipmap klasörlerine kopyalanmasıyla çözüldü.
  - Mağaza metinleri hazırlandı, son kod uyarıları (deprecated) temizlendi ve Mample'ın Release APK ve AAB paketleri (ortam değişkeni hataları düzeltilerek) başarıyla oluşturuldu.
  - Web sitesindeki (Guide) kart yapısı güncellendi: Eski `/mamplen` kartı yerine "İndirmelerden Bildirim Al" (Downloads Toggle) eklendi; eklenti arayüzündeki bileşenler (QR okuyucu bölümü ve Checkbox alanı) resim kullanılmadan saf HTML/CSS ile yeniden kodlanarak kusursuz bir şekilde sayfa içine gömüldü.
  - `en.json` ve `tr.json` çeviri dosyalarındaki akordeon başlıklarındaki numara uyumsuzlukları temizlenerek sayfa düzeni daha modern ve pürüzsüz hale getirildi.
  - Kapsamlı SEO iyileştirmeleri yapıldı: Sitenin `layout.js` dosyasına OpenGraph/Twitter logoları eklendi; Sayfalara FAQPage, Organization ve BreadcrumbList schemaları (JSON-LD) entegre edildi; PWA sinyalleri için `manifest.js` oluşturuldu ve alt sayfa yönlendirmeleri kalıcı (301) yapıldı.
  - `robots.txt` yapılandırması Next.js Metadata API'si (`robots.js`) yerine, Google PageSpeed Insights'ın doğrudan statik dosya tavsiyesi (performans uyarısı) üzerine klasik `/public/robots.txt` olarak güncellendi ve yayına alındı.
  - Web sitesindeki indirme alanına Edge tarayıcı eklentisi için ikon eklendi (eski/standart FontAwesome SVG formatı kullanılarak sorunsuz gösterim sağlandı). Chrome simgesindeki (*) işareti metin rengiyle uyumlu hale getirildi.
  - Edge Eklenti Mağazası (Add-ons) için SEO dostu açıklama metinleri ve mağaza arama terimleri (7 farklı dilde) oluşturuldu.
- **AEO (Answer Engine Optimization) & Repo Temizliği:**
  - Ana dizindeki dağınık dosyalar (mağaza metinleri, scriptler, görseller) `docs/store_listings/`, `scripts/` ve `assets/marketing/` gibi düzenli klasörlere taşındı.
  - Gereksiz `.crx` ve `.zip` dosyaları silinerek `.gitignore` güncellendi (`.pem` dahil edildi).
  - GitHub kök dizini için ve `website` klasörü için yapay zeka botlarına (AEO) uygun, "Sıfır Kurulum" vurgulu yeni `README.md` dosyaları oluşturuldu. *(Not: Bu metinler ve website içerikleri/mağaza açıklamaları ilerleyen aşamalarda tekrar değiştirilecek ve geliştirilecektir.)*
- **Mimaride Sadeleştirme (Buradayız):**
  - Eklentiden (Chrome) karmaşık `/mamplen` ve "Sistem Tuşu" mantığı tamamen silinerek, sadece kullanıcıların seçtiği özel tuşları (Custom Key) temel alan tekil komut (`/mample`) yapısına geçildi. Arayüzdeki (Popup) sistem siteleri listesi ve kullanım açıklamaları temizlendi.
  - Mobil uygulamadaki '?' (Yardım) butonu sadeleştirildi; içerideki karmaşık `GuideSheet` sayfası projeden silinerek doğrudan `https://mample.vercel.app` adresine yönlendirecek şekilde güncellendi.
  - Eklentideki `cloneNode` tabanlı, sayfayı bütünüyle kopyalayarak zamanı dondurmaya (Freeze Time) çalışan ağır seçim ekranı mantığından vazgeçildi. Bunun yerine doğrudan canlı sayfanın üzerine binen sade ve risksiz bir overlay sistemine geçildi. Bu sayede ChatGPT, Deepseek gibi modern sitelerde (özellikle Edge tarayıcısında) yaşanan "beyaz ekran" çökme hataları kesin olarak çözüldü.
  - Claude.ai gibi ikon tabanlı veya SVG kullanan sitelerde yaşanan "tooltip üzerinde kare simgesi çıkma" sorunu çözüldü. Tuş adları ayıklanırken `innerText` yerine `aria-label` etiketine öncelik verilerek görünmez etiketler başarıyla okunur hale getirildi.
  - **Yayına Alma (Web):** Vercel üzerinden web sitesi başarıyla yayına alındı. Edge Middleware (`middleware.js`) sorunları kaldırılarak Native Redirects (`app/page.js` ve `next.config.mjs`) altyapısına geçildi. Dinamik sayfa başlığı ve Mample Favicon'u eklendi.
- **Kota Sistemi (Ücretsiz Kullanıcı Sınırları):** 
  - Ücretsiz kullanıcılar için "30 günde 100 bildirim" sınırı arka planda (FCM Service) kodlandı. Limit aşılırsa bildirimlerin gelmesi ve listelenmesi engellendi.
  - Bildirimler sekmesinin sağ üst köşesine sadece ücretsiz kullanıcıların görebileceği soluk renkte (Örn: `14 gün kaldı • 70/100`) kota sayacı eklendi.
- **Yerelleştirme (Localization):** Web sitesi (en.json, tr.json), Chrome Eklentisi (messages.json) ve Mobil Uygulamanın (app_localizations.dart) tüm ekranlarındaki Türkçe / İngilizce altyapısı %100 oranında tamamlandı.

- [x] **Mağaza Sayfaları Hazırlığı (Store Listings) - TAMAMLANDI:**
  - [x] Chrome Web Mağazası için izin gerekçeleri (Justifications) ve gizlilik politikası URL'si ayarlandı.
  - [x] Chrome Web Mağazası için görsel materyallerin (Mağaza simgesi, promosyon görselleri / tanıtım videosu) hazırlanması ve yerelleştirilmesi (TR/EN).
  - [x] Web sitesi, Mobil Uygulama ve Eklentinin varsayılan (default) dili global hedef kitlesi için İngilizce (EN) olarak ayarlandı.
- [x] **Play Store & Ödeme Sistemi (Payment) :** 
  - [x] Google Play Store için tanıtım metinleri ve ekran görüntülerinin hazırlanması.
- [x] **Firebase Projesi Taşıma :** 
  - [x] Yeni Firebase projesinin Console üzerinden açılıp Firestore ve Auth servislerinin aktif edilmesi.
  - [x] Mobil Uygulamanın yeni projeye bağlanması (`flutterfire configure` ile `firebase_options.dart` yenilemesi).
  - [x] Cloud Functions (Backend) kodlarının yeni projeye (`firebase use --add`) deploy edilmesi.
  - [x] Chrome Eklentisi, CLI aracı ve Web sitesindeki eski `firebaseConfig` bilgilerinin yenisiyle değiştirilmesi.
- [x] **SEO ve Google Görünürlüğü (Web):**
  - [x] Next.js projesi içerisine `sitemap.xml` ve `robots.txt` dosyalarının (dinamik veya statik) oluşturulup entegre edilmesi.
  - [x] Sitenin Google Search Console'a eklenmesi ve sitemap ile birlikte hızlı indeksleme (tarama) talebinin gönderilmesi.
- [x] **Güvenlik (Security) İyileştirmeleri (Yayından Önce):**
  - [x] `is_premium` yetkisinin istemci (client) tarafından yazılmasını engellemek için Firestore kurallarının sıkılaştırılması.
  - [x] Müşteriye sahte premium vermek yerine, In-App Purchase makbuzlarının Cloud Functions tarafında doğrulanması.
  - [x] Hassas anahtarların (`cli_secret_key` vb.) `flutter_secure_storage` ile şifrelenerek saklanması.
  - [x] **Not:** Firestore başlangıçta 'Test Mode' ile kuruldu. `firestore.rules` dosyamız deploy edildiğinde kuralların güvenli moda (üzerine yazılarak) geçtiği kontrol edilmeli.
  - [x] **Not:** Authentication şu an 'Anonim (Anonymous)' olarak çalışıyor. İleride (hesap eşitleme vb. gerekirse) Google veya E-posta ile girişe geçilecekse Firebase üzerinden ayrıca yapılandırılması gerekecek.
- [x] **Yerelleştirme (Localization) Cilası:** 
  - [x] İngilizce - Türkçe altyapı bitti ancak uygulama yayına girmeden önce çeviri metinleri (dil seçenekleri) gözden geçirilip zenginleştirilecek. (TAMAMLANDI)
- [x] **Ödeme Sistemi (Payment) ve Son Testler - EN SON YAPILACAK:** 
  - [x] Google Play Console'da uygulamanın taslak olarak oluşturulup ilk AAB'nin yüklenmesi.
  - [x] **Firebase App Check Enforce:** Uygulama Play Console'da oluşturulduktan sonra uygulamanın Release SHA-256 kodunu kopyalayıp Firebase -> App Check -> Play Integrity bölümüne kaydetmek ve App Check'i "Enforce" (Zorunlu) moduna almak.
  - [x] `mample_premium_monthly` ve `mample_premium_lifetime` ürünlerinin market paneline eklenmesi.
  - [x] Flutter `in_app_purchase` entegrasyonunun tamamlanması (Market fiyatlarını uygulamaya dinamik olarak çekmek).
  - [x] Ödeme sisteminin sandbox (test) üzerinden kontrol edilmesi. (Canlı ortamda test edilecek)
- [x] **Yayına Alma (Publish) Süreçleri:**
  - [x] **DEPLOY ÖNCESİ KRİTİK HATIRLATMA:** Chrome eklentisindeki panoya kopyalama kodu başarıyla **SİLİNDİ** ve eklenti zip'lenmeye hazır. (İleride geri getirmek için `teach_mode_clipboard_guide.md` dosyasına bakınız).
  - [x] Chrome Web Mağazası geliştirici paneline `zip` dosyasının yüklenmesi ve incelenmeye gönderilmesi.
  - [ ] Google Play Store kapalı test (Closed Testing) başvurusu ve uygulamanın yayına alınması.
  - [ ] **Mobil Uygulama Yayınlandığında Yapılacaklar (Web Sitesi):** `website/app/[lang]/page.js` dosyasındaki `styles.contactBox` içerisindeki (üzerinde SOON yazan ve kartı tıklanamaz yapan) `absolute` konumlandırmalı katman bloğunu silin ve `contactBox` ana div'ine eklenen `style={{ position: 'relative', overflow: 'hidden' }}` kodunu kaldırın.
  - [x] Opera Eklenti Mağazası (Opera Add-ons) için mağaza metinlerinin girilmesi ve `zip` dosyasının gönderilmesi.
  - [x] Mozilla Firefox Add-ons mağazası için eklenti portlamasının (manifest güncellemeleri vb.) yapılması ve mağaza onayına gönderilmesi.
  - [x] **Edge Mağazası Yayın Sonrası (Web & SEO):** Edge eklentisi mağazada tam olarak yayınlanıp gerçek URL alındığında, web sitesindeki 



## YAPILACAKLAR 

- [ ] **Mample 1.0 Odaklarının Netleştirilmesi:** İlk açık kaynak sürümün ana odağını mobil uygulama + CLI + terminal bildirim akışı olarak konumlandırmak; eklentileri üründen çıkarmadan sonraki sürüm kapsamına almak.
- [ ] **Mample 2.0 Eklenti Desteği:** Tarayıcı eklentilerini Mample 2.0 ile gelecek ek özellik paketi olarak düzenlemek, mevcut eklenti kodlarını korumak ve bu sürüm için ayrı bir geliştirme akışı belirlemek.
- [ ] **Açık Kaynak ve Ücretsiz Sürüm:** Mample'ı açık kaynak olarak yayınlamak; temel bildirim, mobil uygulama ve CLI akışını ücretsiz sunmak.
- [ ] **Ödeme Sisteminin Kaldırılması:** RevenueCat, premium paketler, abonelik/lifetime satın alma akışları ve ödeme doğrulama kodlarını Core sürümünden çıkarmak.
- [ ] **Premium Bağımlılıklarının Temizlenmesi:** Aktif premium kullanıcı bulunmadığı için kullanıcı migrasyonu planlamadan; mobil uygulamadaki premium ekranlarını, premium durum kontrollerini, premium çevirilerini, RevenueCat bağlantılarını ve ödeme odaklı ayarları ücretsiz/açık kaynak ürün modeline uygun şekilde kaldırmak veya yeniden düzenlemek.
- [ ] **Eklentiler İçin Ayrı Alt Sayfa:** Mevcut web sitesi ve Guide yapısını koruyarak, Mample alanı altında eklenti kullanımı için ayrı bir alt sayfa/alt bölüm oluşturmak.
- [ ] **Web Navigasyonunun Güncellenmesi:** Sol üstteki Mample markasını korumak; gerekiyorsa buradan Mample 2.0 eklenti anlatımına yönlendiren sade bir alt navigasyon bağlantısı eklemek.
- [ ] **Guide İçeriğinin Sınırlı Güncellenmesi:** Mevcut CLI/mobil/terminal rehberlerini büyük ölçüde değiştirmemek; eklenti, DOM takibi, indirme bildirimi ve tarayıcı kullanımını yalnızca yeni eklenti alt sayfasında anlatmak.
- [ ] **Eklenti Alt Sayfası İçeriği:** Mample 2.0 eklentileri için kurulum akışı, desteklenen tarayıcılar, kullanım örnekleri ve mağaza bağlantıları hazırlamak.
- [ ] **Mobil Mağaza Sayfası Görselleri:** Google Play Store için eski ekran görüntülerini yenilemek; ödeme/premium odaklı görselleri kaldırıp ücretsiz ve açık kaynak ürün mesajına uygun yeni ekran görüntüleri hazırlamak.
- [ ] **Mağaza Metinlerinin Güncellenmesi:** Play Store, web sitesi ve README metinlerini yeni ücretsiz/açık kaynak Mample 1.0 modeline göre güncellemek; eklenti anlatımlarını ilgili alt sayfaya taşımak.
- [ ] **Dokümantasyon ve Lisans:** Açık kaynak lisansını, katkı rehberini, güvenlik bildirim sürecini ve geliştirici kurulum dokümantasyonunu hazırlamak.
- [ ] **Gizli Bilgilerin Temizlenmesi:** Açık kaynak yayınından önce secret key, servis hesabı, ödeme anahtarı, deploy logları ve üretim kullanıcı verilerinin repoda bulunmadığını doğrulamak.
- [ ] **Mample 1.0 Yayın Kriterleri:** Mobil uygulama, CLI, Firebase bildirim akışı, QR eşleştirme ve temel dokümantasyonun eklentiler olmadan kararlı şekilde çalıştığını doğrulamak.
- [ ] **CLI için QR ile Bağlanma Seçeneği (kodlandı; telefon testi ve paket yayını bekliyor):** `mample auth --qr` mevcut `mample auth <secret_key>` ile aynı Secret Key ve bağlantı akışını kullanıyor. Firebase QR fonksiyonları dağıtıldı; güncel mobil build ile uçtan uca test ve CLI paket yayını tamamlanacak.
- [ ] **CLI QR Eşleştirme Güvenliği:** Terminaldeki QR içeriğini eklenti QR akışından ayırmak; QR davetini yaklaşık 90 saniyede bir yenilemek, tek kullanımlık yapmak ve yalnızca eşleştirme aşamasında geçerli tutmak.
- [ ] **Süresiz CLI/PC Bağlantısı:** QR ile eşleştirme tamamlandıktan sonra oluşturulan terminal bağlantısını mevcut CLI bağlantıları gibi süresiz ve kullanıcı silene kadar geçerli tutmak. QR’ın kısa ömürlü olması, oluşturulan PC bağlantısının süresini sınırlamamalı.
- [ ] **CLI QR Testi ve Rehber Güncellemesi:** QR oluşturma, mobil okutma, süresi dolan ve tekrar kullanılan davetlerin reddedilmesi ile eşleştirme sonrası kalıcı terminal bağlantısını test etmek. Özellik uygulanıp doğrulandıktan sonra web ve mobil rehberlere Secret Key yanında QR seçeneğini eklemek.
- [ ] **Test Altyapısı:** CLI, Firebase Functions ve kritik mobil bildirim/eşleştirme akışları için gerçek otomatik testler eklemek; mevcut sahte test komutlarını düzeltmek.
- [ ] **Firebase Maliyet ve Kötüye Kullanım Koruması:** Premium kaldırılmış olsa da rate limit, spam önleme, bildirim hacmi kontrolü ve Firebase maliyet korumalarını korumak ve test etmek.
- [ ] **Lisans Seçimi:** Mample 1.0 için uygun açık kaynak lisansını (ör. MIT veya Apache-2.0) seçmek ve lisans dosyasını eklemek.
- [ ] **Gizlilik Politikası Kontrolü:** Mevcut kullanıcı verisi ve gizlilik politikalarını yeniden tasarlamadan, açık kaynak sürümdeki gerçek veri akışlarıyla hâlâ uyumlu olduklarını kontrol etmek.
- [ ] **Tarayıcı Arka Plan DOM İzleme Araştırması:** Mevcut bir Heartbeat sistemi eklemek yerine, kullanıcı sekmeden uzaklaştığında tarayıcıların DOM gözlemleme/JavaScript zamanlayıcılarını yavaşlatması veya durdurması sorununu araştırmak.
- [ ] **Heartbeat Son Çare Planı:** DOM izleme donmalarını başka yöntemlerle çözemediğimiz durumda Heartbeat benzeri bir canlılık mekanizmasını Mample 2.0 kapsamında kontrollü olarak denemek; mevcut sesli arka plan çözümünü son seçenek olarak değerlendirmek.
- [ ] **Sesli Çözümün Kullanıcı Deneyimi:** Arka planda ses oynatmanın sekmede oluşturduğu ses simgesi ve rahatsızlık sorununu belgelemek; ses çözümünü varsayılan yöntem yapmamak.

## 2026-10-08 — Web desteği, demo medyası ve Google Play yenilemesi

- [x] **Destek alanının tasarımı:** Kahve emojisi ve büyük merkezî bağış alanı kaldırıldı; SSS altında, altbilgiden önce metni solda ve eylemleri sağda olan sade destek kartı eklendi. Üst menü ve altbilgi destek alanına bağlanıyor; mobilde kart tek sütuna geçiyor.
- [ ] **Destek adresi:** Kullanıcının isteğiyle boş bırakıldı; ödeme bağlantısı uydurulmayacak. Adres verilince `NEXT_PUBLIC_SUPPORT_URL` ayarlanıp gerçek destek butonu doğrulanacak; bu sırada geri bildirim bağlantısı kullanılabilir.
- [x] **GIF çekim planı:** `docs/marketing-capture-plan.md` içinde `gif_4` kurulum, `gif_5` QR/Secret Key bağlantısı, `gif_6` bildirim ve `gif_7` yapay zeka akışlarının kare sıraları, çözünürlük, süre ve dosya isimleri belirlendi.
- [ ] **Ham ekran görüntüleri:** Kullanıcıdan her akış için sıralı PNG setleri alınacak; aynı cihaz/tema/pencere ölçüsü kullanılacak, gerçek anahtar ve kişisel veri görünmeyecek. Ekran görüntülerinden anlatım animasyonu yapılabilir; gerçek tarama/yazma hareketi istenirse ekran kaydı da alınacak.
- [ ] **Web medya üretimi:** Şu an eksik olan `website/public/images/gif_4`–`gif_7` için MP4 ana çıktı ve GIF yedeği üretilecek; iki dilin medyası hazır olduğunda dil bazlı seçim eklenecek. Okunabilirlik ve mobil kırpma kontrol edilecek.
- [x] **Google Play metin taslağı:** `docs/store_listings/google_play_store_listing.md` içindeki TR/EN metinlere QR alternatifi ve kalıcı bağlantı davranışı eklendi; premium/abonelik modeli vaat edilmiyor.
- [x] **Google Play ekran ve ayar planı:** `docs/store_listings/google_play_free_release_plan.md` içinde altı ekranlık TR/EN liste, ücretsiz fiyatlandırma, eski ürün satışlarını kapatma, aktif aboneleri doğrulama, reklam ve Data safety beyanları, gizlilik ve release AAB kontrolü yazıldı.
- [ ] **Google Play yeni görselleri:** Güncel uygulamadan bildirim, ana ekran, QR, bağlı cihazlar, geçmiş ve tercihler ekranları çekilecek; premium/kota görselleri kaldırılacak. Fiyat/sıralama rozetleri yerine gerçek özellik başlıkları kullanılacak.
- [ ] **Play Console işlemleri:** Planlanan ücretsiz modele göre ayarlar panelde kontrol edilip uygulanacak; bu çalışma sırasında Console ayarları değiştirilmedi. Abonelik planını kapatmanın mevcut yenilemeleri iptal etmediği ayrıca doğrulanacak.
- [ ] **Yayın:** Mobil/CLI QR testi, web medya seti ve mağaza metinleri hazır olunca yeni web sürümü ve Play güncellemesi yayınlanacak; bugünkü web tasarımı henüz canlıya dağıtılmadı.
