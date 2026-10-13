# CLI QR pairing

`mample auth qr` (or `mample auth` without an argument) is an alternative way to
enter the same Secret Key used by `mample auth <secret_key>`. Both call
`cli/lib/auth.js` and the existing `registerCLIConnection` endpoint. Notification,
revocation, key rotation, terminal identity and connection lifetime stay identical.
The previous `mample auth --qr` syntax remains supported for compatibility.

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
Interactive terminals use R to refresh and Q to cancel, without Enter. There is
no automatic refresh. Expired invitations wait for a deliberate refresh, and
non-interactive callers rerun the command. Refresh and cancellation revoke the
previous invite with its polling key before discarding local recovery material.
Consumed invitations reject a second scan, including concurrent attempts. The
paired ciphertext remains recoverable until the invitation record is cleaned up;
it never extends or expires the permanent `connections` document. Firestore rules
deny all client access to the invitation collection through the existing catch-all.
Creation is rate limited by IP; mobile claims are rate limited by user separately
from notification delivery. Terminal polling is every two seconds and stops after
five minutes. Public polling still incurs Firestore reads; production traffic and
billing should be monitored alongside existing public CLI endpoints.

## Release checks

For your own Firebase project, deploy `cliPairing` and `completeCLIPairing` in
`europe-west1` with the Firestore index configuration (including TTL on
`cli_pairing_invites.cleanup_at`). Configure App Check for your Android signing
setup before releasing the mobile app and CLI. TTL cleanup is asynchronous; the
server checks invite expiry independently. No connection migration or notification
endpoint change is required.

Before publishing, test on a physical phone: scan a fresh terminal QR, send a
notification, wait beyond invite expiry and send another, rescan the old QR and
confirm rejection, then revoke the terminal from the phone. Also check manual
Secret Key auth, `mample disconnect`, and existing extension UUID scanning.
