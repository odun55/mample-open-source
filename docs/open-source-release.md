# Open-source release preparation — October 9, 2026

## Prepared source

- README, site dictionaries, CLI/mobile/web docs and llms.txt align on source
  QR support, manual Secret Key support, anonymous sessions and release status.
- Assistant instructions describe command execution within existing permission
  policies; they do not claim to bypass permissions or detect completion itself.
- Original code uses MIT, consistent with the existing CLI package license.
  QRCode.js attribution is retained in the root notice and extension folders.
- Contribution/security/development docs and source checks are included.
- Diagnostic logs, generated extension ZIPs and Android production client config
  are removed from tracking; ignored local copies remain on the workstation.

## Publication model

The existing remote `odun55/Mample` was verified private through GitHub metadata.
Local history contains an extension signing private key in `chrome-extension.pem`
and an FCM delivery token in `mample_app/logcat9.txt`. The targeted scan checked
689 blobs reachable from local refs. Gitleaks 8.30.1 independently confirmed
the private-key finding; it scanned 95 non-merge commits and reported six
candidates: one private key, two Firebase client API identifiers and three
translation-field false positives. The narrow `.gitleaks.toml` exception only
allows the exact non-secret field name `privacy_3_desc` in the two dictionaries;
it does not exclude their values or disable any scanner rule.

No matched key or token value is included in this document. Reports remain in
a local temporary directory. A Firebase client API identifier is not an Admin
SDK private credential. It still needs correct project restrictions.

The user selected a new repository with clean history on October 9, 2026.
The publication target is `odun55/mample-open-source`; the original
`odun55/Mample` stays private. No commits, tags, logs or hosted artifacts from
the original repository are transferred. The new repo starts from reviewed
source files and its own initial commit.

Do not later mirror the original private history into the public repository.
Its signing-key and device-token records remain private; review their use as
a separate operational task, preserving extension identity when necessary.
Untracking current files does not sanitize the original repository's history.

## Validation

- CLI: 19 unit tests passed.
- Firebase Functions: 29 unit tests passed.
- Website: production build passed; generated TR/EN home, guide and extension
  pages were checked for removed commands and inaccurate permission claims.
- Physical-phone delivery, Play Integrity and release AAB checks remain separate.
- Live website deployment and repository visibility change have not been done.
- A history-free 327-file source snapshot was prepared under the ignored
  `public-release/source` folder. This is a local review artifact, not a public
  repository. The snapshot contains the original source and license notices,
  without tracked production logs, signing keys or distribution archives.
- Gitleaks scanned this snapshot with the narrow translation-field exception
  and found no leaks. This does not prove that the existing private history or
  hosted artifacts are safe to publish.

Official references:

- [GitHub repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [QRCode.js license](https://github.com/davidshimjs/qrcodejs/blob/master/LICENSE)
- [Gitleaks release used](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1)
