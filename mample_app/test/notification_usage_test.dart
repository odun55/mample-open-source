import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/services/fcm_service.dart';
import 'package:mample_app/services/notification_usage.dart';
import 'package:mample_app/services/notification_history_store.dart';

void main() {
  test(
    'usage backfills valid history and survives truncation or history removal',
    () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final history = List.generate(
        50,
        (i) => jsonEncode({
          'title': 'Notification $i',
          'time': DateTime(2026, 1, 1 + i % 3).toIso8601String(),
        }),
      );
      final usage = NotificationUsage.load(prefs, [
        ...history,
        'invalid',
        '{}',
      ]);
      expect(usage.received, 50);
      expect(usage.days.length, 3);
      await usage.adding(DateTime(2026, 1, 4)).save(prefs);
      final retained = NotificationUsage.load(prefs, []);
      expect(retained.received, 51);
      expect(retained.days.length, 3);
    },
  );

  test(
    'actual notification persistence counts messages once and ignores empty messages',
    () async {
      SharedPreferences.setMockInitialValues({});
      const message = RemoteMessage(
        messageId: 'usage-first',
        data: {'title': 'Done'},
      );
      expect(await FCMService.saveNotification(message), isTrue);
      expect(await FCMService.saveNotification(message), isFalse);
      await FCMService.saveNotification(
        const RemoteMessage(messageId: 'usage-empty'),
      );
      final usage = await NotificationHistoryStore.instance.usage();
      expect(usage.received, 1);
      expect(usage.days.length, 1);
    },
  );
}
