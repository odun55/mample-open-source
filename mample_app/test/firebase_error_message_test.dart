import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/services/firebase_error_message.dart';

void main() {
  final l10n = AppLocalizations(const Locale('en'));
  test(
    'App Check rejection has its own recovery message in both languages',
    () {
      for (final locale in ['en', 'tr']) {
        final localized = AppLocalizations(Locale(locale));
        expect(
          firebaseErrorMessage(
            FirebaseException(
              plugin: 'firebase_app_check',
              code: 'unknown',
              message: 'private attestation details',
            ),
            localized,
          ),
          localized.translate('firebase_app_check_error'),
        );
        expect(
          firebaseErrorMessage(
            FirebaseException(
              plugin: 'firebase_app_check',
              code: 'network-request-failed',
            ),
            localized,
          ),
          localized.translate('firebase_network_error'),
        );
      }
    },
  );
  test('a denied device query is not presented as an empty device list', () {
    final message = firebaseErrorMessage(
      FirebaseException(plugin: 'cloud_firestore', code: 'permission-denied'),
      l10n,
    );
    expect(message, contains('permission-denied'));
    expect(message, isNot(l10n.translate('no_active_devices')));
  });
  test('QR expiry and invalid QR have distinct recovery messages', () {
    expect(
      firebaseErrorMessage(
        FirebaseException(
          plugin: 'cloud_functions',
          code: 'failed-precondition',
        ),
        l10n,
        pairing: true,
      ),
      l10n.translate('pairing_expired'),
    );
    expect(
      firebaseErrorMessage(
        const FormatException('invalid'),
        l10n,
        pairing: true,
      ),
      l10n.translate('invalid_pairing_code'),
    );
  });
  test('network failures do not expose raw server details', () {
    expect(
      firebaseErrorMessage(
        FirebaseException(
          plugin: 'cloud_firestore',
          code: 'unavailable',
          message: 'private details',
        ),
        l10n,
      ),
      l10n.translate('firebase_network_error'),
    );
  });
}
