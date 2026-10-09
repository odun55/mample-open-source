# Firebase Console kontrol listesi

Proje: mample-fca3c. Android uygulaması: com.odunco.mample.

## 1. Bütçe uyarısı ve hizmet sınırı

Blaze'e geçerken belirlenen 100 TL bütçe yalnızca uyarı verir. Firebase Console > Settings > Usage and billing > Details & settings > Service-level spend caps altında Cloud Functions için ayrıca aylık sınır yapılandır.
Mutlak bütçenin altında bir tutar seç: gecikmeli uygulama nedeniyle bu tutar aşılabilir. Firestore bu sınırın kapsamında değildir; mevcut bütçe uyarısını koru.

## 2. Anonim giriş

Build > Authentication > Sign-in method altında Anonymous sağlayıcısının Enabled olduğunu doğrula. Zaten açıksa değiştirme.

## 3. Debug App Check

Telefonda debug uygulamasını aç. Android Studio Logcat içinde DebugAppCheckProvider veya debug secret ara.
Build > App Check > Apps bölümünde com.odunco.mample uygulamasının menüsünü aç > Manage debug tokens > Add debug token. Token'a kendi bilgisayarını/telefonunu tanıtan bir ad ver ve Logcat'teki token'ı kaydet.
Token'ı repoya koyma veya paylaşma. Release derlemesi debug sağlayıcısını kullanmaz; Play Integrity kullanır.
App Check istek metriklerini kontrol et. Debug cihazı doğrulamadan enforcement ayarlarını değiştirme.

## 4. Sunucu ve Firestore yayını

Kodun yerelde değişmesi canlı Functions ve kuralları değiştirmez. Console'da veri koleksiyonlarını elle oluşturman veya eski kota/premium alanlarını topluca silmen gerekmiyor.
Firebase CLI kuruldu. İlk giriş terminalden yapılır:

```powershell
firebase.cmd login
```

Yayın adımına geçtiğimizde firebase klasöründe kullanılacak komut:

```powershell
firebase.cmd deploy --project mample-fca3c --only firestore:rules,functions
```

İlk yerel kurulum sırasında yayın yapılmadı. 7 Ekim 2026 tarihinde kurallar ve yedi güncel fonksiyon başarıyla yayımlandı; eski verifyPurchase fonksiyonu silindi. Yeniden yayın yalnızca yeni sunucu değişikliği olduğunda gerekli.
Yayın sonrasında Functions listesinde triggerNotification, sendPendingNotification, registerCLIConnection ve disconnectCLIConnection bulunmalı.

## 5. Telefon testi

Telefon USB hata ayıklaması açıkken bağlanmalı. Mobil anahtarla CLI eşleştir, bildirim gönder, uygulama arka plandayken tekrar dene ve mample disconnect ile yalnızca ilgili terminalin kaldırıldığını doğrula.

## Yerel güvenlik testi

Canlı veriye dokunmadan firebase klasöründe:

```powershell
firebase.cmd emulators:exec --only firestore --project demo-mample --config firebase.json "node functions/test/firestoreRules.integration.cjs"
```

15 kontrol: kullanıcı sahipliği, sunucu moderasyon alanı, normal FCM güncellemesi, sunucuya özel kuyruk/sayaç erişimi ve bağlantı oluşturma/adlandırma/silme.

Kaynaklar:
- https://firebase.google.com/docs/projects/billing/spend-caps
- https://firebase.google.com/docs/auth/flutter/anonymous-auth
- https://firebase.google.com/docs/app-check/flutter/debug-provider
