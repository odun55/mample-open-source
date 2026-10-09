# Mample

Mample sends free notifications to your Android phone when terminal commands, builds or AI coding tasks finish. It connects the mobile app and a lightweight CLI without email/password registration.

There is no monthly notification quota, premium tier or subscription. Short-term rate limits protect the notification service from spam.

## Release scope

- **Available workflow:** Android app, terminal CLI and AI assistants that can execute terminal commands.
- **In development:** browser extensions, page-element tracking and browser download notifications. Existing extension code and demos are preserved.
- **Mobile release:** the public download section remains marked as coming soon while the release is prepared.
- **CLI pairing:** the source implements `mample auth --qr` alongside manual Secret Key entry. QR needs a compatible mobile build and pairing backend. Physical-device tests and package publication are tracked separately in the [roadmap](ROADMAP.md).

[Source repository](https://github.com/odun55/mample-open-source) · [Website](https://mample.vercel.app) · [Mobile & CLI guide](https://mample.vercel.app/en/guide) · [Browser extension](https://mample.vercel.app/en/extension)

## Set up the CLI

Use a compatible Android build. Check the website for public availability, or build the app using the [development guide](docs/development.md).

```bash
npm install -g mample
mample auth "your-secret-key"
mample "Hello from the terminal!"
```

Alternatively, run `mample auth --qr` and scan the QR with Mample. `mample auth` without a key also starts QR pairing. The invitation is single-use, expires after 90 seconds and refreshes while the CLI waits, for up to five minutes. The QR does not contain the Secret Key. The resulting terminal connection has no automatic expiry; revoke it from the app or with `mample disconnect`.

Send an alert after a successful command in Bash, Zsh or PowerShell 7:

```bash
npm run build && mample "Build finished"
```

The updated CLI adds `mample disconnect` to revoke this terminal connection and remove its saved local credentials. If the server cannot confirm revocation, credentials are kept so you can retry.

The source CLI version is 1.0.2. Source changes and npm publication are separate: check `mample --version` and `mample auth --help` after installation. If QR or disconnect is missing, use the developer setup until a compatible package is published.

Run `mample --help` for the commands supported by the installed version. The current CLI does not implement `mample login` or `mample run`.

An AI coding assistant with terminal access can use the same CLI: ask it to run `mample "Task finished"` when it completes the task.

## Free usage and protection

The current backend permits up to 5 requests per connection or CLI key and 20 requests per anonymous user across all connections in a rolling 60-second window. These are short-term anti-spam limits, not a monthly allowance. HTTP 429 responses include a retry time.

The app keeps the latest 50 notifications locally without restricting new notification delivery. Network access, phone background restrictions and backend availability can affect delivery.

## Browser extensions

Browser support is in development. The [extension page](https://mample.vercel.app/en/extension) preserves the existing setup instructions, demos and Chrome listing. It is separate from the mobile/CLI guide.

## Repository

- [mample_app](mample_app/): Flutter mobile app.
- [cli](cli/): terminal CLI.
- [firebase](firebase/): notification delivery, pairing and request protection.
- [website](website/): bilingual site, guides and policies.

Original project source is licensed under [MIT](LICENSE). Bundled third-party code retains its own notices; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Source availability does not grant access to production Firebase administration or credentials.

## Develop and contribute

See [development setup](docs/development.md), [contribution guide](CONTRIBUTING.md), [security reporting](SECURITY.md) and the [roadmap](ROADMAP.md). Browser extensions remain a separate Mample 2.0 development scope.

For a local CLI installation from source:

```bash
cd cli
npm install
npm test
npm link
```

Then use the global `mample` command. Delivery still requires a mobile connection and compatible Firebase backend.

## Backend and data

FCM delivers push notifications. Firebase also stores anonymous user IDs, delivery tokens, CLI key hashes, connection records, preferences and rate-limit counters. Messages are temporarily queued for delivery; notification history stays on the phone.

The current Cloud Functions backend requires a Firebase Blaze project. Making Mample free for users does not remove infrastructure costs. Configure budget alerts and applicable service spend caps before publishing.

See [transition and validation notes](docs/free-core-transition.md), [privacy policy](https://mample.vercel.app/en/privacy) and [roadmap](ROADMAP.md).
