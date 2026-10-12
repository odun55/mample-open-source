import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/services/notification_history_store.dart';
import 'package:mample_app/services/notification_usage.dart';

Map<String, dynamic> entry(String id) => {
  'id': id,
  'title': id,
  'body': 'Body',
  'time': DateTime(2026, 10, 10).toIso8601String(),
  'isRead': true,
};

void main() {
  test(
    'account deletion blocks late arrivals and clears lifetime usage until explicit restart',
    () async {
      final store = NotificationHistoryStore.instance;
      final now = DateTime(2026, 10, 11);
      await store.add(entry('before'), now);
      await store.setReceivingEnabled(false);
      await store.eraseAccountHistory();
      expect(await store.add(entry('late'), now), isFalse);
      expect(await store.load(), isEmpty);
      expect((await store.usage()).received, 0);
      await store.setReceivingEnabled(true);
      expect(await store.add(entry('new-account'), now), isTrue);
      expect((await store.usage()).received, 1);
    },
  );

  test(
    'migration preserves order, read status and lifetime usage, removes legacy copies',
    () async {
      SharedPreferences.setMockInitialValues({
        NotificationHistoryStore.legacyKey: [
          'broken',
          jsonEncode(entry('new')),
          jsonEncode(entry('old')),
          jsonEncode(entry('new')),
        ],
        NotificationUsage.storageKey: NotificationUsage(78, {
          '2026-10-10',
        }).encode(),
      });
      final store = NotificationHistoryStore.instance;
      final history = await store.load();
      expect(history.map((item) => item['id']), ['new', 'old']);
      expect(history.first['isRead'], isTrue);
      expect((await store.usage()).received, 78);
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.containsKey(NotificationHistoryStore.legacyKey), isFalse);
      expect(prefs.containsKey(NotificationUsage.storageKey), isFalse);
    },
  );

  test(
    'deleting captured IDs concurrently with arrivals preserves new messages and usage',
    () async {
      final store = NotificationHistoryStore.instance;
      await store.add(entry('old'), DateTime(2026, 10, 8));
      final captured = (await store.load())
          .map((item) => item['id'] as String)
          .toSet();
      await Future.wait([
        store.removeIds(captured),
        store.add(entry('new'), DateTime(2026, 10, 9)),
      ]);
      expect((await store.load()).single['id'], 'new');
      expect((await store.usage()).received, 2);
      await store.clear();
      expect(await store.load(), isEmpty);
      expect((await store.usage()).received, 2);
    },
  );
}
