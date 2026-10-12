# Account and data deletion

Mample offers **Delete Account and Data** in Android Settings and an [English](https://mample.app/en/delete-account) or [Turkish](https://mample.app/tr/delete-account) web form. Deletion is irreversible. It invalidates the account ID, Secret Key and connections and removes pending messages and the app's local notification history. The app waits on a deleted state until the user deliberately chooses to start again with a new anonymous account.

The mobile request authenticates the current user and requires App Check. The web form accepts the current Secret Key over HTTPS and requires explicit confirmation. It does not accept a caller supplied account ID. The web route cannot remotely erase local history or saved credentials on a user's devices.

The backend disables sending for the account, deletes owned connection and queue records in bounded batches, then deletes Firebase Auth. A short lived deletion guard blocks stale clients from recreating the account. Retries use a receipt so interrupted cleanup can finish without starting deletion for another account. Legacy records without a reliable owner may remain until their normal expiry, and provider technical logs follow their own retention policies.

For implementation and tests, see [deleteAccount.js](../firebase/functions/src/deleteAccount.js), [Firestore rules](../firebase/firestore.rules), the [mobile settings screen](../mample_app/lib/screens/settings_screen.dart) and the [web form](../website/app/%5Blang%5D/delete-account/page.js). Never send a Secret Key, FCM token or deletion receipt in an issue or email.
