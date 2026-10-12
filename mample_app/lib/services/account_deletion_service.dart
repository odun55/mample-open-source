import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:math';
import 'diagnostics_service.dart';
import 'engagement_prompt_service.dart';
import 'fcm_service.dart';
import 'notification_history_store.dart';

/// A persisted journal prevents startup from recreating an account while a
/// deletion or its device cleanup needs to be retried.
class AccountDeletionService {
  static const stateKey = 'account_deletion_state';
  static const _storage = FlutterSecureStorage();

  static Future<String?> state() => _storage.read(key: stateKey);

  static Future<void> delete() async {
    final current = await state();
    if (current == null) {
      if (FirebaseAuth.instance.currentUser == null) {
        throw StateError('No authenticated account to delete');
      }
      final random = Random.secure();
      final receipt = List.generate(
        32,
        (_) => random.nextInt(256).toRadixString(16).padLeft(2, '0'),
      ).join();
      await _storage.write(
        key: 'account_deletion_uid',
        value: FirebaseAuth.instance.currentUser!.uid,
      );
      await _storage.write(key: 'account_deletion_receipt', value: receipt);
      await _storage.write(key: stateKey, value: 'pending');
    }
    await FCMService().suspendForDeletion();
    if (current != 'server_deleted' && current != 'deleted') {
      final receipt = await _storage.read(key: 'account_deletion_receipt');
      final uid = await _storage.read(key: 'account_deletion_uid');
      if (receipt == null || uid == null) {
        throw StateError('Deletion receipt is missing');
      }
      var confirmed = false;
      if (current == 'pending') {
        // This endpoint does not attach an expired Auth token. Its receipt can
        // finish a request whose server response was lost after Auth deletion.
        final appCheck = await FirebaseAppCheck.instance.getToken();
        final project = Firebase.app().options.projectId;
        final response = await http
            .post(
              Uri.parse(
                'https://europe-west1-$project.cloudfunctions.net/resumeAccountDeletion',
              ),
              headers: {
                'Content-Type': 'application/json',
                'X-Firebase-AppCheck': appCheck ?? '',
              },
              body: jsonEncode({'uid': uid, 'deletion_token': receipt}),
            )
            .timeout(const Duration(seconds: 130));
        if (response.statusCode == 200) {
          confirmed = jsonDecode(response.body)['success'] == true;
        } else if (response.statusCode != 404) {
          throw StateError('Account deletion could not be resumed');
        }
      }
      if (!confirmed) {
        final result =
            await FirebaseFunctions.instanceFor(region: 'europe-west1')
                .httpsCallable(
                  'deleteAccount',
                  options: HttpsCallableOptions(
                    timeout: const Duration(seconds: 120),
                  ),
                )
                .call({'confirm': true, 'deletion_token': receipt});
        if (result.data is! Map || result.data['success'] != true) {
          throw StateError('Account deletion was not confirmed by the server');
        }
      }
      await _storage.write(key: stateKey, value: 'server_deleted');
    }
    await FCMService().deleteDeviceToken();
    await FirebaseAuth.instance.signOut();
    await _storage.delete(key: 'cli_secret_key');
    await NotificationHistoryStore.instance.eraseAccountHistory();
    await DiagnosticsService.clear();
    final prefs = await SharedPreferences.getInstance();
    for (final key
        in prefs
            .getKeys()
            .where((key) => key.startsWith(EngagementPromptService.prefix))
            .toList()) {
      await prefs.remove(key);
    }
    await _storage.write(key: stateKey, value: 'deleted');
    await _storage.delete(key: 'account_deletion_receipt');
    await _storage.delete(key: 'account_deletion_uid');
  }

  static Future<void> startAgain() async {
    if (await state() != 'deleted') {
      throw StateError('Finish account deletion before starting again');
    }
    await FCMService().resumeAfterDeletion();
    await _storage.delete(key: stateKey);
  }
}
