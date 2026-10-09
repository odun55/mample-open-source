# CLI QR pairing

`mample auth --qr` (or `mample auth` without an argument) is an alternative way to
enter the same Secret Key used by `mample auth <secret_key>`. Both call
`cli/lib/auth.js` and the existing `registerCLIConnection` endpoint. Notification,
revocation, key rotation, terminal identity and connection lifetime stay identical.

The terminal creates a random polling key, a separate random QR claim token and an
RSA-3072 key pair. Recovery material is saved through the existing protected,
atomic config writer before network access. Only the public key is uploaded.
`cliPairing` stores a 90-second invitation. Its ID is the polling key's SHA-256 hash;
the QR carries that ID, the claim token and a versioned `mample://cli-pair` URI.

The signed-in mobile app submits its locally stored Secret Key to
`completeCLIPairing`, which enforces Firebase App Check, checks that the key belongs
to the authenticated user and consumes the invitation in a Firestore transaction.
It stores only RSA-OAEP-SHA256 ciphertext, decryptable by the originating terminal.
The terminal polls using its separate polling key, decrypts the Secret Key and runs
the existing auth flow. A lost response or failed local write can be retried using
the pending recovery material. Existing saved credentials remain until auth succeeds.

Expired invitations cannot be revived; refreshing creates new random credentials.
Consumed invitations reject a second scan, including concurrent attempts. The
paired ciphertext remains recoverable until the invitation record is cleaned up;
it never extends or expires the permanent `connections` document. Firestore rules
deny all client access to the invitation collection through the existing catch-all.
Creation is rate limited by IP; mobile claims are rate limited by user separately
from notification delivery. Terminal polling is every two seconds and stops after
five minutes. Public polling still incurs Firestore reads; production traffic and
billing should be monitored alongside existing public CLI endpoints.

## Release

Deploy `cliPairing` and `completeCLIPairing` in `europe-west1`, deploy Firestore index
configuration (including TTL on `cli_pairing_invites.cleanup_at`), ship the updated
mobile app with its existing App Check setup, and publish the updated CLI. TTL
cleanup is asynchronous; the server checks invite expiry independently. No
connection migration or notification endpoint change is required.

Before publishing, test on a physical phone: scan a fresh terminal QR, send a
notification, wait beyond invite expiry and send another, rescan the old QR and
confirm rejection, then revoke the terminal from the phone. Also check manual
Secret Key auth, `mample disconnect`, and existing extension UUID scanning.

## Deployment record — 2026-10-08

- Project: `mample-fca3c`; region: `europe-west1`.
- Successfully created `cliPairing` and `completeCLIPairing` as Gen 2 functions.
  Their implementation is in `firebase/functions/src/cliPairing.js`; exports in
  `firebase/functions/src/index.js` make both endpoints deployable. They provide
  the temporary, single-use key handoff used before the existing CLI auth flow.
- Deployed `firebase/firestore.indexes.json`. A subsequent server-side index
  listing confirmed `ttl: true` for `cli_pairing_invites.cleanup_at`, with no
  single-field indexes for that field. This configuration cleans temporary
  invitations; TTL deletion itself is asynchronous.
- No existing functions, connections, or indexes were removed. Existing functions
  and Firestore rules were not redeployed by this targeted deployment.
- All 29 Firebase unit tests passed immediately before deployment.
- Live checks: `cliPairing` GET returned 405; an invalid POST returned 400; polling
  with a fresh random key returned 200/expired, confirming Firestore access without
  creating a user connection; an unauthenticated `completeCLIPairing` request
  returned 401.
- This document was updated to record the deployed scope and verification;
  implementation files were not changed during deployment.
- Still pending: install the updated mobile app and exercise QR scanning,
  notification delivery, replay rejection and disconnection on a physical phone.
- Deployment reported that Node.js 20 is deprecated and scheduled for
  decommissioning on 2026-10-30. Plan a supported runtime upgrade separately;
  this deployment completed successfully on the existing runtime.
