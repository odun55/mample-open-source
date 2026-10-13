# Development setup

Use Node.js 22, npm, Flutter and Android tooling compatible with `mample_app`.
Use your own Firebase project and signing credentials.

## Website

```bash
cd website
npm install
npm run dev
npm run build
```

The site is available at `http://localhost:3000/en` and `/tr`.
See [website setup](../website/README.md) for optional environment variables.

## CLI

```bash
cd cli
npm install
npm test
npm link
mample auth qr
mample "Task completed"
```

Manual pairing uses `mample auth "your-secret-key"`. On Windows PowerShell,
use `mample.cmd` if the npm launcher is blocked. Credentials are stored in
the current user's `.mample/config.json`; do not share this file.
A successful CLI response confirms server acceptance, not phone delivery.

## Firebase

1. Create your own project with anonymous Authentication and Firestore.
2. Register an Android app and put its client configuration in
   `mample_app/android/app/google-services.json`. This file is ignored.
3. Configure App Check for your development device and release signing.
4. Run `npm test` in `firebase/functions`. Deploy Functions, rules and indexes
   to your project using an explicit `--project YOUR_PROJECT_ID`. Backend
   functions use `europe-west1`.
5. Replace the hosted CLI URLs in `cli/lib/notify.js` and `cli/lib/pair.js`
   with your own endpoints. Keep mobile callable regions aligned.

Never deploy development changes to Mample's production project or commit
service-account JSON and signing credentials.

## Android

```bash
cd mample_app
flutter pub get
flutter analyze
flutter test
flutter run
```

A release build requires your own ignored `android/key.properties` and
keystore. Generate missing local Flutter/Gradle wrapper files with compatible
tooling. Build with `flutter build appbundle --release` after signing setup.

Before release, test QR and manual pairing, notifications in foreground,
background and locked screen, key renewal, disconnection and account deletion
on a real phone. Local tests do not establish device delivery.
