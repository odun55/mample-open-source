# Development setup

Clone the public source before following the component setup below:

```bash
git clone https://github.com/odun55/mample-open-source.git
cd mample-open-source
```

## Requirements

Use Node.js 22 for local JavaScript tooling, npm, Flutter with the Dart SDK
required by `mample_app/pubspec.yaml`, and Android SDK/Java tooling compatible
with the Android Gradle configuration. Firebase Functions currently declares
Node 20; changing the deployed runtime is a separate tested task.

Android is the mobile release target. Generated web/Windows files are not a
complete supported release. Package availability is separate from source.

## Website

```bash
cd website
npm install
npm run dev
```

Open `http://localhost:3000/tr` or `/en`. Keep both dictionaries aligned.
`npm run build` checks production output; Google Fonts may require network.
Demo media remains a placeholder until captures are supplied. Copy
`.env.example` to `.env.local` for optional local support-link configuration.

## CLI

```bash
cd cli
npm install
npm test
npm link
```

Use the global `mample` command. Pair with `mample auth --qr` or
`mample auth "your-secret-key"`; bare `mample auth` starts QR pairing.
Credentials live in the current user's `.mample/config.json`; do not share it.
Tests mock requests. Linking the CLI does not start a backend or pair a phone.

## Your own Firebase environment

Do not deploy development changes to Mample's production project.

1. Create your own Firebase project. Register an Android app with application
   ID `com.odunco.mample`, or consistently change the ID for your fork. Enable
   anonymous Authentication and create Firestore.
2. Download your client config to
   `mample_app/android/app/google-services.json`. This local file is ignored;
   obtain it from your own project instead of copying production configuration.
3. Configure App Check. Authorize your local debug-device token for development;
   release uses Play Integrity with your own signing configuration.
4. Install dependencies and run `npm test` in `firebase/functions`. Use Firebase
   CLI from `firebase` with an explicit `--project YOUR_PROJECT_ID` to deploy
   Functions and Firestore rules. The function region is `europe-west1`.
   Review billing before deploying.
5. CLI and extension HTTPS endpoints currently name Mample's hosted project.
   Replace that host in `cli/lib/notify.js`, `cli/lib/pair.js` and the extension
   files you use with your own deployed URLs. Mobile callables use the mobile
   Firebase configuration; keep their region aligned with backend deployment.
   A turnkey environment switch and full emulator wiring are not implemented.

Never commit service-account JSON or production signing credentials. Firebase
CLI authentication remains in your local tooling.

## Android

```bash
cd mample_app
flutter pub get
flutter analyze
flutter test
flutter run
```

Release requires your own ignored `android/key.properties` and keystore;
debug uses Android debug signing. Generate missing local Flutter/Gradle wrapper
files with compatible tooling: the wrapper JAR and SDK paths are not distributed
in this repository. After signing setup, use `flutter build appbundle --release`.

Test pairing, foreground/background/locked-screen notifications, key rotation
and disconnection on a real device before release. Mock/unit tests do not
establish actual delivery.

## Behavior

The CLI runs when invoked; it does not automatically watch tasks. Callers decide
when to send messages. QR invites expire after 90 seconds; terminal connections
have no automatic expiry. Manual Secret Key pairing remains supported. The
latest 50 history entries on the phone are not a delivery quota. Short-term
backend rate limits remain enabled.
