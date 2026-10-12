# Mample roadmap

Updated 12 October 2026. Source completion, deployed service behavior and public package availability are tracked separately.

## Current scope

- Android app, CLI and Firebase notification delivery.
- Manual Secret Key and QR pairing. QR invitations expire after 90 seconds; registered terminal connections remain until revoked.
- Anonymous mobile account, connection management and account deletion.
- English and Turkish website, usage guide and privacy information.
- Free use with short term anti spam limits. The latest 200 notifications are stored locally.

The public repository contains current source. A feature present here may require a newer mobile build, CLI package or backend deployment than the version a user has installed. The Android app's public Play release is pending production access; an internal test release and production access application do not make it publicly downloadable.

## In development

- Browser page element and download notifications across the extension variants.
- Better independent setup for contributors using their own Firebase project.
- Real device and release channel validation after each product change.

## Release checks

- Verify the installed CLI version and package behavior after npm publication.
- Check signed Android release behavior, App Check, background notification delivery and account deletion on a real device.
- Add the real Google Play listing URL to the website only after public availability is confirmed.

See [development setup](docs/development.md), [contribution guide](CONTRIBUTING.md) and [QR pairing design](docs/cli-qr-pairing.md).
