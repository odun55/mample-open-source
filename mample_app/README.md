# Mample Android app

Flutter client for receiving terminal notifications, scanning pairing QR codes,
managing connections and keeping the latest 200 notifications locally.
There is no premium tier, subscription or monthly notification quota.

Android is the release target. Generated web/Windows files do not mean those
platforms support the complete notification and pairing workflow.

See [development setup](../docs/development.md) for your own Firebase project,
Android configuration and App Check setup. Never commit signing credentials,
FCM tokens, CLI Secret Keys or debug App Check tokens.

```bash
flutter pub get
flutter analyze
flutter test
flutter run
```

Release builds require your own signing configuration. Public availability
and physical-device release checks are tracked in the [roadmap](../ROADMAP.md).

The app and CLI form Mample's 1.0 workflow; browser integrations remain in
development. See the [mobile & CLI guide](https://mample.app/en/guide).

Settings includes an optional support link to https://buymeacoffee.com/mample.
It does not unlock features or remove a quota: Mample has no subscription or
monthly notification allowance. Configure the mobile link with
`MAMPLE_SUPPORT_URL` at build time, separately from the website's
`NEXT_PUBLIC_SUPPORT_URL`; see [development setup](../docs/development.md).
