# Mample — güncel yol haritası

Güncelleme: 9 Ekim 2026. Bu liste kaynak kodu, yerel doğrulama ve yayın durumunu ayrı tutar. Önceki çalışmalar [tarihsel arşivde](docs/history/roadmap-before-open-source.md) korunur; arşivdeki premium/ödeme maddeleri güncel ürün davranışı değildir.

## Mample 1.0 kapsamı

Android uygulama + CLI + Firebase bildirim akışı. Terminal erişimi olan yapay zekâ asistanları CLI'ı çağırabilir; Mample görev bitişini kendiliğinden algılamaz. Premium, abonelik veya aylık bildirim kotası yoktur. Kısa süreli kötüye kullanım sınırları korunur. Eklenti kodları Mample 2.0 geliştirme kapsamında korunur.

## Kaynakta tamamlananlar

- [x] Mobil premium/ödeme ve aylık kota akışlarının kaldırılması; son 50 bildirimin yerel geçmişinin korunması.
- [x] CLI QR ve manuel Secret Key seçeneklerinin aynı bağlantı akışına bağlanması.
- [x] Tek kullanımlık 90 saniyelik QR daveti; süresiz terminal bağlantısı.
- [x] Tekrar eşleştirmede terminal kimliğinin korunması; sahiplik kontrollü disconnect.
- [x] CLI ve Firebase kritik eşleştirme/bildirim akışları için gerçek Node testleri.
- [x] Mobil/CLI rehberi ile tarayıcı eklentisi sayfasının ayrılması.
- [x] Türkçe/İngilizce QR, anonim oturum ve yapay zekâ izin anlatımının düzeltilmesi.
- [x] README, CLI/mobil/web belgeleri ve llms.txt içindeki eski QR anlatımının düzeltilmesi.
- [x] MIT lisansı, katkı rehberi, güvenlik bildirim süreci, üçüncü taraf lisans bildirimi ve geliştirme kurulumu.
- [x] Web destek tasarımı; gerçek ödeme adresi gelene kadar ödeme butonunun gizlenmesi.
- [x] Web ve Google Play çekim/yayın planlarının hazırlanması.

## Açık kaynak yayını

- [x] Yerel Git geçmişinin hedefli ve değerleri gizleyen taraması yapıldı.
- [x] Güvenli yayın yolu seçildi: `odun55/Mample` özel kalacak; `odun55/mample-open-source` temiz kaynaklarla yeni geçmişten başlayacak.
- [x] Üretim/telefon günlükleri, eklenti ZIP'leri ve yerel Android Firebase yapılandırması kaynak dağıtımından çıkarıldı; yerel kopyalar korundu.
- [x] Temiz kaynak kopyası ayrı secret scanner ile tarandı; eski Git geçmişi, uzak refs ve Actions kayıt/artefaktları yeni depoya aktarılmayacak.
- [x] Temiz kaynak ve belgeler GitHub'a gönderildi; MIT lisansı ve otomatik kaynak kontrolleri doğrulandı.
- [x] [Yeni depo](https://github.com/odun55/mample-open-source) herkese açık yapıldı; anonim erişim doğrulandı. Eski depo özel kaldı.

Eski özel depodaki anahtar/token kayıtlarının geçerliliği ayrı bir işletim kontrolüdür; bu kayıtlar yeni açık kaynak depoya taşınmaz.

## Ürün yayını için kalanlar

- [ ] Gerçek Android telefonda QR/Secret Key bağlantısı, ön plan/arka plan/kilit ekranı bildirimi, anahtar yenileme ve bağlantı kaldırma testi.
- [ ] CLI 1.0.2 kaynak değişikliklerinin npm yayın durumu ve temiz paket kurulumu doğrulanacak.
- [ ] Desteklenen Firebase çalışma zamanına geçiş ayrıca test edilip dağıtılacak; App Check ve maliyet ayarları canlı panelden doğrulanacak.
- [ ] Güncel imzalı Android AAB ve test kanalı doğrulanacak; Play Console ücretsiz model ve veri beyanları kontrol edilecek.
- [ ] Web metin değişiklikleri Vercel'e dağıtılıp iki dilde kontrol edilecek. Mobil “Yakında” durumu gerçek yayın gerçekleşene kadar korunacak.
- [ ] Web demo çekimleri ve MP4/GIF üretimi — kullanıcının tercihiyle sonraya bırakıldı.
- [ ] Google Play gerçek telefon görselleri — çekim aşamasında hazırlanacak.
- [ ] Destek adresi — kullanıcının tercihiyle boş kalacak.

Açık kaynak yayını ile mobil mağaza/npm yayını farklı işlerdir; kaynak açılması fiziksel cihaz testi veya mağaza onayı anlamına gelmez.

## Mample 2.0

- [ ] Tarayıcı DOM takibi ve indirme bildirimleri için ayrı yayın/test akışı.
- [ ] Arka plan sekmesi davranışlarının araştırılması; görünür sayfa önerisinin korunması.
- [ ] Heartbeat veya sesli çözüm ancak diğer seçenekler yetersizse değerlendirilecek.

## İlgili belgeler

- [Geliştirme kurulumu](docs/development.md)
- [Katkı rehberi](CONTRIBUTING.md) · [Güvenlik](SECURITY.md)
- [Açık kaynak yayın kaydı](docs/open-source-release.md)
- [Ücretsiz Core geçiş kaydı](docs/free-core-transition.md)
- [QR teknik akışı](docs/cli-qr-pairing.md)
- [Web medya çekim planı](docs/marketing-capture-plan.md)
- [Google Play hazırlığı](docs/google-play-release-checklist.md)
- [Google Play ücretsiz sürüm planı](docs/store_listings/google_play_free_release_plan.md)
