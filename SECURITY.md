# Security reporting

Send suspected vulnerabilities to **odun.coop@gmail.com**, with subject
**Mample security report**. Do not publish live exploit credentials in issues.
Include affected components, version or commit, impact and reproduction steps
using a test account. No guaranteed response time or bounty is offered.

Never send CLI Secret Keys, signing keys, service-account private keys, FCM
tokens, App Check debug tokens or another user's notification content.
Maintainers may request additional non-secret reproduction details.

The current source is the maintained development baseline. Older published
packages may not contain the same fixes; no separate LTS policy exists.

## Source publication

Review the tree and Git history, including logs, archives and hosted Actions
artifacts. Removing a file from the latest commit does not remove its history.
Rotate or revoke exposed credentials before publication; source cleanup alone
does not invalidate them.

`node scripts/audit-public-source.cjs` and its `--history` option perform a
read-only targeted scan, reporting locations without matched values. This is
not a complete secret scanner; supplement it with a dedicated scanner and
review binary archives, external refs and hosted artifacts before changing
visibility. Firebase client identifiers are not Admin SDK private credentials;
backend protection depends on rules, authentication and App Check.
