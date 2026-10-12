import 'package:mample_app/services/notification_history_store.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/services/fcm_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('legacy exhausted quota does not block new notifications', () async {
    SharedPreferences.setMockInitialValues({
      'is_premium': false,
      'quota_count': 500,
      'quota_start_date': 'invalid-legacy-date',
    });
    for (var i = 0; i < 205; i++) {
      expect(
        await FCMService.saveNotification(
          RemoteMessage(
            messageId: 'free-$i',
            data: {'title': 'Task completed', 'body': 'Build $i'},
          ),
        ),
        isTrue,
      );
    }
    final prefs = await SharedPreferences.getInstance();
    final saved = await NotificationHistoryStore.instance.load();
    expect(saved, hasLength(200));
    expect(saved.first['id'], 'free-204');
    expect(saved.last['id'], 'free-5');
    expect(prefs.getInt('quota_count'), 500);
  });
  test(
    'concurrent delivery retains unique messages and suppresses duplicates',
    () async {
      SharedPreferences.setMockInitialValues({});
      final messages = List.generate(
        20,
        (i) => RemoteMessage(
          messageId: 'concurrent-$i',
          data: {'title': 'Task', 'body': 'Build $i'},
        ),
      );
      final saved = await Future.wait(
        messages.map(FCMService.saveNotification),
      );
      expect(saved.every((result) => result), isTrue);
      expect(await FCMService.saveNotification(messages.first), isFalse);
      expect(await NotificationHistoryStore.instance.load(), hasLength(20));
    },
  );
}
