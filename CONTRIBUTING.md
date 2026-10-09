# Contributing to Mample

Read [development setup](docs/development.md) and the [roadmap](ROADMAP.md).
Mample 1.0 focuses on Android, CLI and Firebase delivery; browser extensions
have a separate Mample 2.0 development scope.

1. Describe bugs with expected behavior, actual behavior, platform and version.
   Use synthetic messages and redact credentials in screenshots.
2. Work on a branch and keep each pull request focused on one problem.
3. Preserve manual Secret Key pairing when changing QR pairing. Expiring a QR
   invitation must not expire the resulting durable terminal connection.
4. Keep Turkish and English site content aligned. Distinguish source behavior
   from package publication, deployment and device validation.
5. Run checks relevant to your change and include results in the PR.

## Validation

Run `npm test` in `cli` and `firebase/functions`; `flutter analyze` and
`flutter test` in `mample_app`; `npm run build` in `website`, as relevant.
Mock tests do not verify real FCM delivery, Play Integrity or phone background
behavior. Document required manual validation separately.

Do not commit production logs, signing keys, local credentials, user data or
generated distribution archives. Use your own Firebase test project; do not
deploy contributions to the hosted Mample project.

Contributions to original project code use the [MIT license](LICENSE).
Preserve third-party notices. Report vulnerabilities privately via
[SECURITY.md](SECURITY.md).
