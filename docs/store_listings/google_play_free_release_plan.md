# Google Play — ücretsiz sürüm geçiş planı

Tarih: 2026-10-08. Bu belge hazırlık planıdır; Play Console'da değişiklik yapılmadı.
Güncel metin taslağı: [TR / EN mağaza metinleri](google_play_store_listing.md).

## Yeni ekran görüntüsü seti

TR ve EN için aynı sırada 6 gerçek telefon ekranı hazırlanacak. Önerilen çalışma
tuvali 1080×1920 PNG; bu bizim üretim tercihimizdir. Yüklemeden önce Console'un
ilgili cihaz türü için gösterdiği güncel gereksinimler kontrol edilecek. Google
cihaz türü başına en fazla 8 ekran görüntüsüne izin veriyor.

| Sıra | Gerçek uygulama ekranı | Kısa başlık TR / EN |
| --- | --- | --- |
| 01 | Gelen görev bildirimi, mesaj okunabilir | İşin bittiğinde haberin olsun / Know when your task is done |
| 02 | Ana ekran ve Terminal Aracı alanı | Terminalini telefonuna bağla / Connect your terminal to your phone |
| 03 | Yeni terminal QR akışında uygulamanın okuyucu/onay ekranı | QR ile kolay bağlantı / Pair with a QR code |
| 04 | Bağlı Cihazlar, en az iki örnek terminal adı | Bağlantılarını yönet / Manage your connections |
| 05 | Uygulama içi gerçek bildirim geçmişi | Son bildirimlerin bir arada / Your recent notifications in one place |
| 06 | Bildirim mesajı ve bağlantı adı tercihleri | Bildirimlerini kişiselleştir / Make notifications your own |

Premium/abonelik ekranlarını, satın alma butonlarını, fiyatları ve eski 100/100
kota göstergelerini kaldıran güncel build'den çekim yapılacak. Tarayıcı, iOS veya
Wear OS özelliği uygulamada mevcut değilse bunlar gösterilmeyecek. Telefon
ekranı yerine yalnızca terminal ekranı mağaza görseli olarak kullanılmayacak.
TR/EN setlerini `assets/marketing/captures/play/tr` ve `en` altında numaralandır.
Gerçek anahtar ve kişisel içerikleri kullanma; test terminal adları ve örnek mesajlar kullan.

Uygulama simgesi ve feature graphic de eski premium mesajı için kontrol edilecek.
Görselleri Mample'ın koyu zemin/yeşil vurgusuna uyarla, kısa özellik başlıkları
kullan; fiyat etiketi, “%100 free”, indirim, sıralama veya ödül rozetleri koyma.
Ücretsiz modeli fiyatlandırma alanında ve açıklamanın doğal metninde anlat.
Görsel metin ve yerleşim rehberi: [Google önizleme varlıkları](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).

## Açıklama ve yayın metinleri

- [x] TR/EN taslakta abonelik ve premium vaatleri olmadan mevcut işlevler anlatılıyor.
- [x] QR komutu ve korunmuş Secret Key alternatifi eklendi.
- [ ] Metinleri yalnızca güncel QR destekli CLI paketi ve mobil sürüm hazır olduğunda Console'a aktar.
- [ ] Başlık 30, kısa açıklama 80 karakter sınırını kontrol et; başlık/kısa
  açıklamaya “Free”, “No Ads”, indirim veya emoji ekleme. Tam açıklama alanını
  Console sınırına göre kontrol et. [Mağaza metin rehberi](https://support.google.com/googleplay/android-developer/answer/13393723?hl=en).
- [ ] Varsayılan listeyi, TR çevirisini, özel mağaza listelerini ve varsa mağaza
  deneylerini aynı mesaja getir; eski premium metninin hiçbir varyantta kalmadığını doğrula.
- [ ] Sürüm notlarında ücretsiz model, QR alternatifi ve kalıcı bağlantı davranışını belirt.

## Play Console'da kontrol edilecek ayarlar

| Alan | Yapılacak işlem | Neden |
| --- | --- | --- |
| Uygulama fiyatlandırması | “Free / Ücretsiz” olduğunu doğrula; ücretliyse ücretsiz yap | Ücretsiz indirilebilir olmalı |
| Abonelikler | `mample_premium_monthly` ürününün aktif base plan ve tekliflerini yeni satışlara kapat | Yeni ödeme alınmasını durdur |
| Tek seferlik ürünler | `mample_premium_lifetime` ürününü ve varsa satın alma seçeneklerini satışa kapat | Lifetime satışı kaldırılıyor |
| Siparişler / aboneler | Aktif abonelik bulunmadığını Console'da doğrula; varsa ayrı iptal/iade sürecini değerlendir | Bir base planı kapatmak mevcut yenilemeleri durdurmaz |
| Reklam beyanı | Güncel uygulama ve SDK'larda reklam yoksa “No / Hayır” seçimini doğrula | Gelir amacı ile reklam varlığı farklı konular |
| Veri güvenliği | Firebase anonim kimlik, FCM/kurulum kimlikleri, bildirim içeriği, geçici kayıtlar ve kullanılan SDK'lara göre formu gözden geçir | Ücretsiz uygulama da veri işler; “veri toplanmıyor” otomatik sonucu çıkarılamaz |
| Gizlilik politikası | Gerçek veri akışıyla uyumlu URL'yi ve uygulama içi erişimi kontrol et; artık olmayan ödeme/RevenueCat işlemlerini varsa çıkar | Mağaza, uygulama ve politika tutarlı olmalı |
| Uygulama erişimi | İncelemeciye Node.js/CLI kurulumu, QR veya Secret Key ile eşleştirme ve test bildirimi adımlarını ver | Asıl işlevin incelenebilmesi gerekir |
| İçerik derecelendirmesi / hedef kitle | Yalnızca gerçek işlev veya hedef kitle değiştiyse güncelle | Ücretsiz olmak bu cevapları kendiliğinden değiştirmez |
| Test / dağıtım | Güncel AAB'yi ilgili test kanalına yükle; ülke/cihaz kapsamını ve eski sürümlerin dağıtımını gözden geçir | Eski satın alma ekranlarının yayın akışında kalmasını önle |

Fiyatlandırma notu: Google ücretli uygulamayı ücretsiz yapmaya izin veriyor;
ücretsiz sunulmuş aynı paket daha sonra ücretliye çevrilemiyor.
[Resmî fiyatlandırma rehberi](https://support.google.com/googleplay/android-developer/answer/6334373?hl=en).
Abonelik planını devre dışı bırakmak mevcut otomatik yenilemeleri iptal etmiyor.
[Resmî abonelik yönetimi](https://support.google.com/googleplay/android-developer/answer/140504?hl=en).
Reklam beyanı gerçek reklam kullanımına göre yapılmalı.
[İnceleme hazırlığı](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en).

Veri güvenliği incelemesi, yalnızca yeni kodu değil Google Play'de dağıtılan ilgili
sürümleri ve üçüncü taraf SDK'ları da kapsamalı; ödeme verisi artık toplanmıyorsa
hangi aktif sürümlerin hâlâ işlediğini kontrol etmeden beyanı kaldırma.
[Resmî Data safety rehberi](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

## Kod ve altyapı kontrolü

Mevcut `pubspec.yaml` içinde RevenueCat / `in_app_purchase` bağımlılığı ve ana
Android manifestinde `BILLING` / `AD_ID` izni bulunmadı. Bu, yayınlanacak AAB'nin
birleşik manifestini kontrol etmenin yerine geçmez; transitive SDK'ları da incele.

- [ ] Son release AAB'de satın alma SDK'sı, billing izni, paywall ve kota ekranı olmadığını doğrula.
- [ ] Çalışmayan ödeme webhooklarını, ödeme doğrulama servislerini, ödeme anahtarlarını
  ve kullanılmayan SDK hesaplarını envanterle; canlı bağımlılık kalmadıysa kapat.
- [ ] Finansal kayıtları veya Play ödeme profilini topluca silme; ücretsiz model
  geliştirici kimliğini ya da geçmiş kayıtları kaldırmayı gerektirmez.
- [ ] Web desteği gönüllü ve özellik açmıyor; uygulama içi ödeme/destek akışı
  eklemek bu planın kapsamında değil. “Ücretsiz proje” ile resmî nonprofit/dernek
  statüsünü aynı şey sayma; geliştirici hesap türünü bu gerekçeyle değiştirme.
- [ ] Firebase App Check, bildirim izinleri, spam/rate limit ve maliyet korumalarını koru.

## Yayın kabulü

- [ ] Güncel QR destekli build gerçek telefonda test edildi.
- [ ] Her iki dilin gerçek ekran görüntüleri ve açıklamaları tamamlandı.
- [ ] Satın alma girişleri kapalı; reklam/veri güvenliği/gizlilik beyanları gerçek davranışa uyuyor.
- [ ] Test kanalı güncellemesi ve mağaza listelemesi birlikte gözden geçirildi.

Canlı Console ayarları bu çalışma sırasında okunmadı; mevcut fiyat, ürün durumu
ve aktif abonelik sayısı bu belgede doğrulanmış bilgi olarak sunulmuyor.
