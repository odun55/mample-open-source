import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'account_deletion_service.dart';

/// Local first-run state; reading it never starts an account or requests access.
class OnboardingService {
  static const completedKey = 'onboarding_completed_v1';
  static const _storage = FlutterSecureStorage();

  static Future<bool> isRequired() async {
    // Deletion recovery always takes priority, even if the Secret Key is gone.
    if (await AccountDeletionService.state() != null) return false;
    if (await _storage.read(key: completedKey) == 'true') return false;
    // Existing installations migrate without interrupting their normal startup.
    if (await _storage.read(key: 'cli_secret_key') != null) {
      await complete();
      return false;
    }
    return true;
  }

  static Future<void> complete() =>
      _storage.write(key: completedKey, value: 'true');
}
