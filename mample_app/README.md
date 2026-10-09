# Mample Android app

Flutter client for receiving terminal notifications, scanning pairing QR codes,
managing connections and keeping the latest 50 notifications locally.
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
