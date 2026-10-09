# Google Play ve web yayın kontrol listesi

7 Ekim 2026. Bu hazırlık belgesi, panel işlemlerinin yapıldığı veya yayının onaylandığı anlamına gelmez.

## Site ve CLI
- [ ] Site değişikliklerini Vercel'in bağlı olduğu dala gönder; deployment sonrası iki dilde guide ve privacy sayfalarını kontrol et.
- [ ] Mobil “Yakında” durumu şimdilik korunsun.
- [ ] npm paketini güncelle. Bugünkü registry kontrolünde yayımlanan sürüm 1.0.1; yerel bağlantı düzeltmeleri ve disconnect henüz npm kullanıcılarına ulaşmıyor. Yeni paketi temiz kurulumla doğrula.

## Ana mağaza girişi
Play Console → Mample → Mağazadaki varlığınız / Store presence → Ana mağaza girişi / Main store listing.
- [ ] Türkçe ve İngilizce alanları [hazır metinlerden](store_listings/google_play_store_listing.md) doldur.
- [ ] Web sitesi: https://mample.vercel.app
- [ ] Destek e-postası: odun.coop@gmail.com
- [ ] 512 × 512 PNG uygulama simgesi.
- [ ] 1024 × 500 JPEG veya alfa içermeyen PNG özellik grafiği.
- [ ] En az iki gerçek uygulama ekran görüntüsü: ana ekran, bağlantılar, bildirim geçmişi. Secret Key görünmesin. Tarayıcı taslakları mobil ekran görüntüsü yerine kullanılmasın.
- [ ] Önizlemede metin ve görselleri kontrol et.

Kaynak: [Google Play önizleme varlıkları](https://support.google.com/googleplay/android-developer/answer/9866151).

## Uygulama içeriği
Play Console → Politika / Policy → Uygulama içeriği / App content. Panel diline göre adlar farklı olabilir.
- [ ] Gizlilik URL'si: https://mample.vercel.app/tr/privacy (İngilizce: /en/privacy). Önce güncel siteyi yayınla.
- [ ] Reklamlar: mevcut uygulama reklam göstermiyor; “Hayır”.
- [ ] Uygulama erişimi: anonim oturum otomatik oluşur. Bildirim göndermek için bilgisayarda Node.js/CLI kurulumu ve Secret Key ile eşleştirme gerektiğini inceleme notuna yaz. Kendi anahtarını paylaşma.
- [ ] İçerik derecelendirmesi ve hedef kitle anketlerini gerçek kullanımına göre tamamla.
- [ ] Fiyat ücretsiz; eski ürün ve abonelikler kapalı olsun.

### Veri güvenliği taslağı
“Hiç veri toplamıyoruz” mevcut uygulamayla uyuşmaz.
- Anonim Firebase kullanıcı kimliği: kullanıcı kimlikleri; kimlik doğrulama ve uygulama işlevi.
- FCM token'ı ve Firebase kurulum kimlikleri: cihaz veya diğer kimlikler; bildirim teslimatı.
- Kullanıcının bildirim mesajı Firebase gönderim kuyruğunda işlenir. Geçici tutulması otomatik olarak beyan dışında bırakmaz.
- Bağlantı adı/kimliği, tercihler ve hız sınırı kayıtları sunucuda tutulur.
- Firebase SDK'ları IP adresi ve teknik istek verilerini işler; SDK sürümlerini ve panel veri kategorilerini karşılaştır.
- E-posta/şifreyle kayıt, ödeme bilgisi ve reklam SDK'sı mevcut akışta yok.
- Hizmet sağlayıcılarına aktarımı Google'ın paylaşım tanımı ve istisnalarıyla değerlendir.
- HTTPS aktarım sırasında şifrelemedir; uçtan uca şifreleme iddiasında bulunma.
- Sitenin Vercel Analytics'i mobil analitik SDK'sı değildir.

Bu, tamamlanmış form değildir. Mesaj içeriğinin kategorisi, SDK verileri ve silme yanıtları nihai release paketiyle doğrulanmalı.
Kaynaklar: [Firebase Android veri açıklamaları](https://firebase.google.com/docs/android/play-data-disclosure), [Google Play Veri güvenliği](https://support.google.com/googleplay/android-developer/answer/10787469).

### Veri silme
Verileri Sıfırla yerel geçmişi ve bağlantıları temizler, anahtarı değiştirir; anonim Auth kaydını tamamen silmez.
- [ ] Destek üzerinden sahipliği doğrulama ve ilgili Auth/Firestore kayıtlarını silme sürecini netleştir. E-postayla gizli anahtar isteme.
- [ ] Site talep bağlantısı: https://mample.vercel.app/tr/privacy#privacy-6
- [ ] Hesap oluşturma/silme sorularını yalnızca “e-posta istemiyoruz” gerekçesiyle cevaplama. Anonim oturum akışını Google'ın hesap tanımıyla değerlendir. Site talebi uygulama içinden hesap silme işlevinin yerine geçmez.

Kaynak: [Google Play hesap silme şartları](https://support.google.com/googleplay/android-developer/answer/13327111).

## Yayın paketi ve test
- [ ] Gerçek Android telefonda açık uygulama, arka plan ve kilit ekranı bildirimlerini test et. Ekranın uyanmasını ayrı gözlemle.
- [ ] Tekrar eşleştirme, bağlantı kaldırma ve anahtar yenileme sonrası davranışı dene.
- [ ] Release imzalı AAB oluştur. Debug APK mağaza yayını için kullanılmaz. key.properties mevcut; imza ve AAB henüz doğrulanmış değil.
- [ ] versionCode önceki Console paketinden büyük olmalı. Mevcut pubspec değeri 9; Console değeri bilinmiyor.
- [ ] Release App Check'i Play imzasıyla doğrula; emülatör debug token'ı yayın cihazlarının yerine geçmez.
- [ ] Önce Dahili test / Internal testing kanalına yükle; ön lansman raporunu incele.
- [ ] 13 Kasım 2023 sonrasında açılmış kişisel hesaplarda üretim erişimi için en az 12 katılımcıyla kesintisiz 14 günlük kapalı test şartını kontrol et. Bu tüm hesaplara uygulanmaz.

Kaynaklar: [Android App Bundle](https://developer.android.com/guide/app-bundle), [Kişisel hesaplarda test şartları](https://support.google.com/googleplay/android-developer/answer/14151465).

## Backend
- [ ] Cloud Functions Node 20 çalışma zamanını desteklenen sürüme yükselt; 30 Ekim 2026 son kullanım tarihi yaklaşmaktadır. Ayrı testlerle doğrula.
- [ ] Bütçe uyarılarını ve hizmet harcama sınırlarını kontrol et. 100 TL bütçe uyarısı toplam Firebase faturası için kesin durdurma sınırı değildir.

Çalışma zamanı kaynağı: [Google Cloud destek takvimi](https://docs.cloud.google.com/functions/docs/runtime-support).
