# Mample roadmap

## Current scope

- Android app, CLI and Firebase notification delivery.
- Manual Secret Key and QR pairing. QR invitations expire after 90 seconds; registered terminal connections remain until revoked.
- Anonymous mobile account, connection management and account deletion.
- English and Turkish website, usage guide and privacy information.
- Free use with short term anti spam limits. The latest 200 notifications are stored locally.

The public repository contains source code. Installed versions may differ from it.
Check the [website](https://mample.app) for Android availability.

## In development

- Browser page element and download notifications. Extension source is maintained separately until that product is ready for its own release.
- Better independent setup for contributors using their own Firebase project.
- Real device and release channel validation after each product change.

## Release checks

- Verify the installed CLI version and package behavior after npm publication.
- Check signed Android release behavior, App Check, background notification delivery and account deletion on a real device.
- Add the real Google Play listing URL to the website only after public availability is confirmed.

See [development setup](docs/development.md), [contribution guide](CONTRIBUTING.md) and [QR pairing design](docs/cli-qr-pairing.md).
