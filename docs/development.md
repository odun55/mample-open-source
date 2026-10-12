# Development setup

Clone the public source before following the component setup below:

```bash
git clone https://github.com/odun55/mample-open-source.git
cd mample-open-source
```

## Requirements

Use Node.js 22 for local JavaScript tooling, npm, Flutter with the Dart SDK
required by `mample_app/pubspec.yaml`, and Android SDK/Java tooling compatible
with the Android Gradle configuration. Firebase Functions declares Node.js 22
in `firebase/functions/package.json`; use the same major version for backend tests.

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
The terminal and AI sections use MP4 players; missing media shows a placeholder.
See `website/README.md` for capture assets and playback behavior. Copy
`.env.example` to `.env.local` for optional local support and store-link settings.
`NEXT_PUBLIC_SUPPORT_URL` defaults to the real Mample support page; an empty value
hides the button. The yellow Support Mample link is server-rendered and uses the
bundled Geist font, with no Buy Me a Coffee embed script. Set
`NEXT_PUBLIC_GOOGLE_PLAY_URL` only after obtaining the real store listing URL;
otherwise the official badge stays inactive. Restart/rebuild after changing env
values. Verify both languages, mobile wrapping and keyboard focus for UI edits.

## CLI

```bash
cd cli
npm install
npm test
npm link
```

Use the global `mample` command. Pair with `mample auth qr` or
`mample auth "your-secret-key"`; bare `mample auth` starts QR pairing.
Credentials live in the current user's `.mample/config.json`; do not share it.
Tests mock requests. Linking the CLI does not start a backend or pair a phone.

Use `mample ""` for the default notification message configured in the app;
use `mample "Task completed"` for a custom message. Bare `mample` also selects
the default. There are no `mample run`, `mample notify` or `mample send` commands.
In Windows CMD use `mample`; if PowerShell blocks the npm `.ps1` launcher, use
`mample.cmd` with the same arguments. Both launch the same global CLI.
Do not change execution policy or loosen credential-file permissions.
Assistant sandbox access follows the environment approval process.
Server acceptance does not confirm display on the phone.


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
5. CLI HTTPS endpoints currently name Mample's hosted project. Replace that
   host in `cli/lib/notify.js` and `cli/lib/pair.js` with your own deployed URLs.
   Browser extension source is maintained separately from this public release.
   Mobile callables use the mobile Firebase configuration; keep their region
   aligned with backend deployment.
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
have no automatic expiry. Interactive QR pairing uses R to refresh and Q
to cancel; an expired invitation is never automatically replaced. Cancellation
requires the updated cliPairing backend so the old invitation is revoked.
Manual Secret Key pairing remains supported. The
latest 200 history entries on the phone are not a delivery quota. Short-term
backend rate limits remain enabled.

New mobile Secret Keys use `m-` followed by 26 lowercase Crockford Base32
symbols (28 characters total, previously 71). Every symbol is independently
selected using `Random.secure()`, providing 130 random bits. No existing key is
truncated, reformatted, or automatically rotated. Stored keys remain usable;
new installations and explicit key renewal generate the compact format. Renewal
changes the credential and requires reconnecting clients that use the old key.
Both formats use the existing SHA-256 verification and QR encryption flow.
Diagnostics redacts both formats. This does not change QR invite tokens,
connection identifiers, or rate limits.

## Mobile support link

Settings contains a voluntary Buy Me a Coffee card next to the contact/help
options. It opens https://buymeacoffee.com/mample by default. Override the profile
at build time with `--dart-define=MAMPLE_SUPPORT_URL=<real-profile-url>`; no
source edit is needed. An explicitly empty `--dart-define=MAMPLE_SUPPORT_URL=`
disables the card and displays Coming soon. Only a Buy Me a Coffee creator
profile URL is accepted. The active
card opens the external browser using the existing link-opening fallback.
Contributions do not unlock features, badges, subscriptions or usage privileges.

For Google Play distribution, review the actual payment flow before enabling
an external payment link. Google's direct-tip exception requires the full tip
to reach the creator and no digital goods/services in return; a provider's
fees and creator shop/membership offerings must be assessed against that rule.
This UI does not establish store approval. Reference:
https://support.google.com/googleplay/android-developer/answer/10281818
