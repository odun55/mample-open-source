# Mample

Mample sends notifications from terminal commands, builds and AI coding tasks to an Android phone. The app uses an anonymous account; pair a terminal with a QR code or Secret Key. The source is open under the [MIT license](LICENSE), and the service has no subscription or monthly notification quota. Short term rate limits protect it from spam.

[Website](https://mample.app) · [Google Play](https://play.google.com/store/apps/details?id=com.odunco.mample) · [Guide](https://mample.app/en/guide) · [Report an issue](https://github.com/odun55/mample-open-source/issues) · [Contribute](CONTRIBUTING.md)

## Use Mample

Install [Mample on Google Play](https://play.google.com/store/apps/details?id=com.odunco.mample), then install the CLI:

```bash
npm install -g mample
mample auth qr
mample "Build finished"
```

The app scans the QR code. You can also pair with `mample auth "your-secret-key"`; `mample auth --qr` remains an alias. Use `mample ""` for the default message. On Windows PowerShell, use `mample.cmd` if the npm PowerShell launcher is blocked. A successful CLI response confirms that the server accepted the request; phone display depends on connectivity and Android settings.

The source may be ahead of the published npm package or Android release. Check the installed CLI with `mample --version` and `mample auth --help`. The Android app is available through [Google Play](https://play.google.com/store/apps/details?id=com.odunco.mample). Source code and store publication have separate release processes.

## Repository

| Directory | Contents |
| --- | --- |
| [mample_app](mample_app/) | Flutter Android app |
| [cli](cli/) | Terminal command and tests |
| [firebase](firebase/) | Cloud Functions, Firestore rules and tests |
| [website](website/) | English and Turkish site, Guide and policies |

The Android app and CLI are the current product workflow. Browser page tracking and download notifications remain in development; extension source is maintained separately and is not part of this public release. The website retains an extension preview. The app keeps the latest 200 notifications on the phone; this history size is not a sending quota. Firebase stores anonymous IDs, delivery tokens, connection records and temporary queued messages needed for delivery. See the [privacy policy](https://mample.app/en/privacy).

## Develop

Start with the [development guide](docs/development.md). Use your own Firebase project and local Android configuration; production credentials are not included. The main checks are `npm test` in `cli` and `firebase/functions`, `flutter analyze` and `flutter test` in `mample_app`, and `npm run build` in `website`. The [roadmap](ROADMAP.md) records the product scope and release status.

Contributions and bug reports are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and report security issues through [SECURITY.md](SECURITY.md). Bundled third party code and brand assets retain their owners' terms; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
