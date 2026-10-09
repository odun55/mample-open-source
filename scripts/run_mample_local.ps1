# Bu script, Mample mobil uygulamasını terminalden (localhost) çalıştırırken 
# Windows bilgisayar adındaki Türkçe karakter ('ı' harfi vb.) sorununu aşmak için ortam değişkenlerini ayarlar.

$env:ANDROID_HOME = "d:\kodlama\projeler\Mample\.android_sdk"
$env:ANDROID_SDK_ROOT = "d:\kodlama\projeler\Mample\.android_sdk"
$env:GRADLE_USER_HOME = "d:\kodlama\projeler\Mample\.gradle_cache"
$env:PUB_CACHE = "d:\kodlama\projeler\Mample\.pub_cache"

Set-Location -Path "d:\kodlama\projeler\Mample\mample_app"

Write-Host "Ortam değişkenleri (Environment Variables) başarıyla ayarlandı!" -ForegroundColor Green
Write-Host "Mample Uygulaması Flutter ile başlatılıyor..." -ForegroundColor Cyan

# Web (Localhost Chrome) üzerinden mi yoksa cihaza/emülatöre mi (Android) kurulacağı
$device = Read-Host "Nerede çalıştırmak istersiniz? (1: Web/Localhost, 2: Android Emülatör/Cihaz)"

if ($device -eq '1') {
    Write-Host "Chrome'da (Localhost) açılıyor..." -ForegroundColor Yellow
    flutter run -d chrome
} else {
    Write-Host "Android Cihaz/Emülatörde açılıyor..." -ForegroundColor Yellow
    flutter run
}
