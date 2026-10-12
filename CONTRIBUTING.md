# Contributing to Mample

Read [development setup](docs/development.md) and the [roadmap](ROADMAP.md).
Mample 1.0 focuses on Android, CLI and Firebase delivery; browser extensions
have a separate Mample 2.0 development scope.

Useful contributions include reproducible bug reports, terminal/AI workflow
improvements, accessibility fixes, Turkish and English copy, and browser
extension research. For substantial changes, open an issue describing the
problem and proposed behavior before building a large feature.

1. Describe bugs with expected behavior, actual behavior, platform and version.
   Use synthetic messages and redact credentials in screenshots.
2. Work on a branch and keep each pull request focused on one problem.
3. Preserve manual Secret Key pairing when changing QR pairing. Expiring a QR
   invitation must not expire the resulting durable terminal connection.
4. Keep Turkish and English site content aligned. Distinguish source behavior
   from package publication, deployment and device validation.
5. Run checks relevant to your change and include results in the PR.

## Website and documentation

- Read `website/AGENTS.md` and the installed Next.js documentation before changing
  the site. Keep `dictionaries/en.json` and `dictionaries/tr.json` aligned.
- Use [mample.app](https://mample.app) in current public documentation. Keep the
  homepage, Guide, extension page and `website/public/llms.txt` consistent.
- Preserve official Google Play and GitHub assets unchanged. Sources and usage
  details live in `website/public/brand/README.md`; brand assets are not MIT code.
- The Google Play badge needs a real `NEXT_PUBLIC_GOOGLE_PLAY_URL` listing.
  Do not invent a listing, release date or download destination.
- Support is voluntary. The website's yellow Support Mample button is a normal
  link; it does not require a third-party script or confer paid features.
  An explicitly empty `NEXT_PUBLIC_SUPPORT_URL` hides the button.
- Keep Mample Extension marked as in development. It is linked in the preview
  below support and in the footer, separately from the mobile/CLI guide.
- For layout changes, check both languages, narrow/mobile widths, keyboard
  focus and link destinations. For embedded services, verify the actual
  Content-Security-Policy as well as the build.

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

Financial support is optional and is never required to contribute. See
[Support Mample](https://buymeacoffee.com/mample) if you would like to help with
development and infrastructure costs.
