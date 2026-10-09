# Web demoları için çekim ve GIF planı

Tarih: 2026-10-08. Durum: çekimler bekleniyor; bu belgede yeni GIF üretilmedi.

## Mevcut entegrasyon

Ana sayfadaki `InteractiveGif`, terminal için `gif_4`, `gif_5`, `gif_6`; yapay zeka
bölümü için `gif_7` isimlerini kullanıyor. Önce MP4, bulunamazsa GIF yükleniyor.
`website/public/images/` içinde bu dosyalar şu an yok; eksik medya metin yer
tutucusuna düşüyor. Üretilecek dosyalar mevcut oynatıcıya doğrudan uyacak.

## Göndermen gereken ekranlar

Her akışı ayrı klasörde, TR ve EN olarak çek. Dosyaları aşağıdaki sırayla numaralandır.
Başlangıç için İngilizce set yeterli; Türkçe set yayın öncesinde tamamlanmalı.

| Akış / hedef | Gereken ekran görüntüleri, sırayla | Hedef süre |
| --- | --- | --- |
| `gif_4` — CLI kurulumu | `01`: temiz terminal; `02`: `npm install -g mample` yazılmış; `03`: kurulum tamamlandı, terminal tekrar hazır | 6–8 sn |
| `gif_5` — bağlantı | `01`: `mample auth --qr`; `02`: terminalde QR ve telefonda QR okuyucu; `03`: telefonda gerçek onay ve terminalde bağlantı başarısı; `04`: ayrı örnekte `mample auth "DEMO_KEY"`; `05`: Secret Key yöntemiyle bağlantı başarısı | 10–14 sn |
| `gif_6` — bildirim | `01`: doğrudan test mesajı komutu; `02`: terminalde gönderim başarısı ve telefonda aynı mesaj; `03`: `npm run build && mample "Build completed"` (PowerShell 7 / Bash); `04`: derleme tamamlandı ve telefon bildirimi | 8–12 sn |
| `gif_7` — yapay zeka asistanı | `01`: görev ve bitince `mample` çalıştırma talimatı; `02`: asistan çalışıyor; `03`: asistanın global `mample` komutunu çalıştırması; `04`: telefonda aynı görev bildirimi | 8–12 sn |

Telefon ve terminal aynı karede zorunlu değil; eşleşen adımları ayrı PNG olarak
gönderebilirsin, yan yana sahneler hazırlanabilir. QR veya bildirim görselleri
gerçek test sonucundan gelmeli; yalnızca ekran görüntülerinden gerçek tarama,
yazma veya tıklama videosu elde edildiği iddia edilmemeli.

## Çekim standardı

- Ham PNG gönder; mesajlaşma uygulamalarının küçülttüğü JPEG veya kırpılmış önizleme kullanma.
- Masaüstünde aynı pencere boyutu: önerilen 1600×900 veya 1920×1080, aynı terminal
  fontu ve yakınlaştırma, okunabilir komutlar. Bildirim penceresi hariç gereksiz
  sekmeleri ve kişisel klasör yollarını kapat.
- Telefonda aynı cihaz, dikey yön, tema, dil ve font ölçeği; önerilen 1080×1920
  veya cihazın doğal çözünürlüğü. Paywall, premium rozet veya aylık kota görünmesin.
- Test profili kullan; gerçek Secret Key, canlı QR daveti, FCM tokenı, e-posta ve
  kişisel bildirimler görünmesin. Gerekirse çekimden sonra anahtarı yenile ve
  kayıttaki geçici QR davetinin süresinin dolmasını bekle; gerçek anahtarı yayınlama.
- Dosya düzeni: `assets/marketing/captures/web/en/gif_5/01.png` ve aynı yapıda `tr`.
  Üretilecek medya klasörü yeni çekimler gelince oluşturulacak.
- Her set için adım sırası ve bekleme sürelerini küçük bir `notes.txt` dosyasına
  yaz; metin eklenmesi gereken alanları ayrıca belirt.

## Ekran görüntülerinden üretim

Sabit ekranlardan kısa beklemeler, yakınlaştırma ve geçişlerle bir anlatım GIF’i
ve eş MP4 hazırlanabilir. Gerçek hareket isteniyorsa aynı akışın 1080p, 24/30 fps
ekran kaydını da gönder; özellikle QR taraması ve yazma animasyonu için kayıt daha iyi.

MP4 ana çıktı olacak: H.264, `yuv420p`, sessiz, web başlangıcı için faststart.
GIF yedek çıktı: okunabilirlik korunarak yaklaşık 8–12 fps ve optimize palet.
Bu değerler çekime göre ayarlanacak; ilk karede ana adım görünmeli, döngü geçişi
ani sıçramamalı. Tüm demolar aynı 16:9 tuvalde hazırlanmalı; mevcut oynatıcının
`object-fit: cover` kırpmasını hesaba katarak kritik yazıları kenarlara koyma.

İlk aşamada İngilizce videolar `website/public/images/gif_4.mp4`–`gif_7.mp4` ve
aynı adlarla `.gif` olacak. Türkçe medya da hazır olduğunda oynatıcıya dil bazlı
dosya seçimi eklenmeli; İngilizce medyayı Türkçe diye etiketleme.

## Kabul kontrolü

- [ ] QR ve Secret Key alternatifleri açıkça anlaşılıyor; ikisi de aynı auth akışına bağlanıyor.
- [ ] Terminal komutu ve telefondaki mesaj eşleşiyor; demo gerçek güncel uygulamadan geliyor.
- [ ] Masaüstü ve mobilde kod okunuyor; kişisel bilgiler görünmüyor.
- [ ] MP4, GIF yedeği, tekrar oynatma, sekme görünürlüğü ve eksik medya davranışı kontrol edildi.
- [ ] Web medyası güncel uygulama/CLI sürümüyle birlikte yayınlandı.

Google Play için GIF yerine gerçek uygulama ekranlarının PNG seti hazırlanacak;
ayrıntılar `docs/store_listings/google_play_free_release_plan.md` içinde.
