# Ücretsiz Core sürümüne geçiş

## Kodda tamamlananlar

- Mobilde 30 günlük bildirim kotası ve sayaç kaldırıldı. Son 50 bildirimin yerel geçmişi korunur; bu teslimat kotası değildir.
- RevenueCat başlatma, premium ekranı, premium aktarımı, satın alma çevirileri, purchases_flutter paketi ve Android Billing bağımlılığı kaldırıldı.
- Backend verifyPurchase dışa aktarımı, doğrulama dosyası ve yalnızca ödemede kullanılan Google API bağımlılıkları kaldırıldı.
- Yeni CLI anahtarları 32 güvenli rastgele bayttan üretilir. Eski anahtarlar bağlantıları bozmamak için korunur; uygulamadaki Terminal Yenile işlemi güvenli anahtar üretir.
- Bildirim gönderme ve gönderim işçisi maxInstances: 3 ile yapılandırıldı.

## Kötüye kullanım koruması

- Bağlantı/CLI anahtarı başına kayan 60 saniyede 5 istek.
- Kullanıcı UID başına, tüm bağlantılar ve CLI anahtarları toplamında kayan 60 saniyede 20 istek.
- Sayaçlar tek Firestore transaction içinde kontrol edilir ve birlikte güncellenir. Reddedilen istek kuyruğa girmez.
- Her kullanıcı için aynı koruma uygulanır; eski is_admin muafiyeti kaldırıldı.
- HTTP 429 yanıtı Retry-After başlığı ve retry_after saniye değerini içerir.
- Anahtarsız connection_id isteklerinde App Check korunur. Mevcut CLI'ın birlikte gönderdiği bağlantı kimliği ve anahtar kabul edilir; anahtarın bağlantı sahibinin hash'i ile eşleşmesi zorunludur. Sahte anahtar bu denetimi atlayamaz.
- Kimlik bilgileri, alan türleri ve metin uzunlukları doğrulanır. Son mesaj UTF-8 olarak 1000 baytı, başlık 200 baytı aşamaz.
- Admin SDK/Console üzerinden users/{uid}.notifications_disabled = true ayarı gönderimi kapatır. Firestore kuralları bu alanın istemci tarafından değiştirilmesini engeller.
- Kullanıcı belgeleri istemciden yalnızca fcm_token, cli_secret_key_hash, updated_at, default_message ve show_connection_name alanlarını değiştirebilir.

Bu koruma aylık kullanım kotası değildir. Çok sayıda anonim hesap oluşturma, ele geçirilmiş anahtarlar veya geçersiz istek seli için tam DDoS/maliyet koruması sağlamaz. Reddedilen HTTP istekleri ve kimlik sorguları da maliyet oluşturabilir. Kullanıcı hız sınırı kuyruğa giren bildirim hacmini azaltır; proje harcamasını kesin olarak sınırlandırmaz.

## Yerel doğrulama

- firebase/functions içinde npm.cmd test: 17 backend Node testi ve 5 CLI testi geçti.
- Backend değişiklikleri için JavaScript sözdizimi kontrolü geçti.
- Flutter testi: mample_app/test/free_notifications_test.dart; eski kotası dolmuş kullanıcı için 101 bildirim ve 50 kayıtlık geçmiş senaryosu.
- Flutter 3.47.6 / Dart 3.13.5 ile mobil analiz temiz; üç mobil test geçti. Android derleme araçları Java 21 ile yapılandırıldı.
- Firestore kuralları demo-mample yerel emülatöründe 15 kontrolle doğrulandı: sahiplik, moderasyon alanının korunması, normal FCM yazımı, sunucuya özel koleksiyonlar ve bağlantı işlemleri.
- purchases_flutter kaldırıldı; flutter pub get ile paket ve plugin kayıtları yeni Flutter yolunda yenilendi.

## Kurulumdan sonra

mample_app klasöründe:

    flutter pub get
    flutter analyze
    flutter test test/free_notifications_test.dart
    flutter build appbundle --release

Gerçek cihazda ön plan, arka plan ve uygulama kapalıyken bildirim; CLI bağlantısı; QR eşleştirme; ayarlar kaydı; Terminal Yenile ve veri sıfırlama doğrulanmalı.

## Yayın öncesi kalanlar

1. Firebase maliyet alarmı ve desteklenen servisler için spend cap yapılandırması. Alarm tek başına hizmeti durdurmaz. maxInstances tüm proje için kesin harcama sınırı değildir.
2. Firestore kuralları ve Functions test projesinde doğrulandıktan sonra birlikte yayımlanmalı. Mevcut canlı verifyPurchase fonksiyonu kaynak kodundan kaldırılmasıyla kendiliğinden hemen silinmez; deploy sırasında kaldırılması ayrıca doğrulanmalı.
3. Play Console/RevenueCat üzerinden gerçek aktif abonelik bulunmadığı doğrulanmalı; eski satış ürünleri kapatılmalı. Bu turda bu panellere erişilmedi.
4. Web, mağaza metinleri ve gizlilik/şartlar sonraki adımda güncellenmeli.
5. Anonim hesap çoğaltma ve kayıt endpointleri için ayrı koruma değerlendirilmesi yapılmalı; mevcut bildirim limiter'ı kayıt isteklerini sınırlamaz.

Resmî kaynaklar:
- https://firebase.google.com/docs/functions/manage-functions
- https://firebase.google.com/docs/projects/billing/budget-alerts
- https://firebase.google.com/docs/projects/billing/spend-caps

## CLI bağlantısını kapatma

`mample disconnect` yalnızca anahtar sahibine ait seçili bağlantıyı transaction içinde siler; sunucu başarıyı onayladıktan sonra yerel giriş dosyasını kaldırır. Ağ/sunucu hatasında dosya tekrar denemek için korunur. `disconnectCLIConnection` endpointi ve yeni CLI birlikte yayınlanmalı; yayın öncesinde yeni komut canlı serviste çalışmaz.

## Yerel Android kurulumu ve paket doğrulaması

Java 21, Android Command-line Tools, Android 36/35/34 platformları, gerekli Build Tools, NDK 28.2.13676358 ve CMake 3.22.1 kuruldu. SDK lisansları ve kullanıcı PATH ayarları tamamlandı. Firebase CLI kuruldu; mample komutu yerel CLI'a bağlandı.

Gradle 8.14.4, AGP 8.11.1 ve Kotlin 2.2.20 ile debug APK derlemesi başarılı. Tüm native kütüphanelerin sembollerini APK içinde tutan keepDebugSymbols ayarı kaldırıldı; eski paket çıktısı yeniden oluşturuldu ve debug APK boyutu 1.445.468.613 bayttan 189.503.941 bayta düştü.

Fiziksel telefon testi ve release AAB doğrulaması henüz yapılmadı. Android Studio emülatöründe uygulama açıldı. 7 Ekim 2026 tarihinde mample-fca3c projesine Firestore kuralları ve yedi güncel fonksiyon başarıyla yayımlandı; eski verifyPurchase fonksiyonu silindi. Yerel kaynak keşfi zaman aşımı için yalnızca yayın komutunda FUNCTIONS_DISCOVERY_TIMEOUT=60 kullanıldı. Node.js 20 çalışma zamanı 30 Ekim 2026 tarihinde kullanım dışı kalmadan Node.js 22 geçişi tamamlanmalı. Console adımları docs/firebase-console-checklist.md içinde.

## Emulator bildirim testi ve terminal tekrar eslestirme

7 Ekim 2026: emulatorde on planda ve arka planda bildirim teslimi dogrulandi. Arka plan bildirimi Android bildirim kaydinda mample_notifications_v1 kanalinda importance=4 ile goruldu; son test mesaji yerel bildirim gecmisine de kaydedildi. Ekranin uyanmasi fiziksel cihazda henuz dogrulanmadi.

CLI kimlik dosyasinin Windows izinleri kullanici adi yerine mevcut kullanicinin SID'si ile belirleniyor. Dosya izinli gecici dosyada hazirlanip atomik olarak degistiriliyor; okuma hatalari artik baglanti yokmus gibi gizlenmiyor.

CLI auth kalici terminal_id degerini sunucu isteginden once kaydediyor. registerCLIConnection bu kimlikle tekrar denemelerde ayni kaydi kullanir; mevcut baglanti ID'si ve kullanicinin verdigi isim korunur. Iki canli yeniden eslestirme denemesinde yeni kayit olusmadi. Bu oturumdaki bilinen basarisiz kaydetme denemesinden kalan tek kayit sahiplik kontrollu disconnectCLIConnection endpointi ile kaldirildi; asil terminal baglantisi korundu ve toplam baglanti sayisi bire indi.

Dogrulama: 12 CLI testi, 23 sunucu testi ve Android debug APK derlemesi basarili. registerCLIConnection ve sendPendingNotification guncellemeleri canliya yayimlandi. scripts/diagnose-notifications.cjs yalnizca mevcut terminal sahibini inceler ve anahtar/FCM tokenlarini yazdirmadan tanilama yapar; Cloud Logging sorgulari icin istege bagli --logs kullanilir.
