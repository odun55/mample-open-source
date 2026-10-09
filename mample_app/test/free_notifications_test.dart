import 'dart:convert';
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
    for (var i = 0; i < 101; i++) {
      expect(await FCMService.saveNotification(RemoteMessage(
        messageId: 'free-$i',
        data: {'title': 'Task completed', 'body': 'Build $i'},
      )), isTrue);
    }
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getStringList('mample_notifications')!;
    expect(saved, hasLength(50));
    expect(jsonDecode(saved.first)['id'], 'free-100');
    expect(prefs.getInt('quota_count'), 500);
  });
  test('concurrent delivery retains unique messages and suppresses duplicates', () async {
    SharedPreferences.setMockInitialValues({});
    final messages = List.generate(20, (i) => RemoteMessage(messageId: 'concurrent-$i', data: {'title': 'Task', 'body': 'Build $i'}));
    final saved = await Future.wait(messages.map(FCMService.saveNotification));
    expect(saved.every((result) => result), isTrue);
    expect(await FCMService.saveNotification(messages.first), isFalse);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getStringList('mample_notifications'), hasLength(20));
  });
}
