import 'package:firebase_core/firebase_core.dart';
import '../l10n/app_localizations.dart';

String firebaseErrorMessage(
  Object? error,
  AppLocalizations l10n, {
  bool pairing = false,
}) {
  if (error is FormatException) return l10n.translate('invalid_pairing_code');
  if (error is FirebaseException) {
    if (error.plugin == 'firebase_app_check' &&
        ![
          'unavailable',
          'network-request-failed',
          'deadline-exceeded',
        ].contains(error.code)) {
      return l10n.translate('firebase_app_check_error');
    }
    switch (error.code) {
      case 'unauthenticated':
      case 'permission-denied':
        return '${l10n.translate('firebase_access_error')} (${error.code})';
      case 'unavailable':
      case 'network-request-failed':
      case 'deadline-exceeded':
        return l10n.translate('firebase_network_error');
      case 'failed-precondition':
        if (pairing) return l10n.translate('pairing_expired');
    }
    return '${l10n.translate(pairing ? 'pairing_failed' : 'devices_load_error')} (${error.code})';
  }
  return l10n.translate(pairing ? 'pairing_failed' : 'devices_load_error');
}
