import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/services/engagement_prompt_service.dart';

void main() {
  late SharedPreferences prefs;
  late EngagementPromptService policy;
  var now = DateTime(2026, 1, 1);
  const prefix = EngagementPromptService.prefix;

  setUp(() async {
    now = DateTime(2026, 1, 1);
    SharedPreferences.setMockInitialValues({});
    prefs = await SharedPreferences.getInstance();
    policy = EngagementPromptService(prefs, now: () => now);
    await policy.beginSession();
  });

  EngagementPrompt? eligible({bool review = true, bool support = true}) =>
      policy.eligible(reviewAvailable: review, supportAvailable: support);

  Future<void> experiencedUser() async {
    await prefs.setInt('${prefix}launches', 10);
    await prefs.setStringList(
      'mample_notifications',
      List.generate(
        20,
        (i) => jsonEncode({
          'title': 'Notification $i',
          'time': DateTime(2026, 1, 1 + i % 3).toIso8601String(),
        }),
      ),
    );
  }

  test('first launch and elapsed time alone never trigger requests', () async {
    expect(eligible(), isNull);
    now = now.add(const Duration(days: 30));
    expect(eligible(), isNull);
    await prefs.setInt('${prefix}launches', 10);
    await prefs.setStringList('mample_notifications', ['bad JSON', '{}', '[]']);
    expect(eligible(), isNull);
  });

  test('a one-day burst of twenty notifications is not enough', () async {
    now = now.add(const Duration(days: 14));
    await prefs.setInt('${prefix}launches', 10);
    await prefs.setStringList(
      'mample_notifications',
      List.generate(
        20,
        (i) => jsonEncode({
          'title': 'Notification $i',
          'time': now.toIso8601String(),
        }),
      ),
    );
    expect(eligible(), isNull);
    await experiencedUser();
    final history = prefs.getStringList('mample_notifications')!;
    await prefs.setStringList(
      'mample_notifications',
      history.take(19).toList(),
    );
    expect(eligible(), isNull);
    await prefs.setStringList('mample_notifications', history);
    expect(eligible(), EngagementPrompt.review);
  });

  test(
    'review needs seven days, five launches and twenty notifications across three days',
    () async {
      await experiencedUser();
      now = now.add(const Duration(days: 6));
      expect(eligible(), isNull);
      now = now.add(const Duration(days: 1));
      await prefs.setInt('${prefix}launches', 4);
      expect(eligible(), isNull);
      await prefs.setInt('${prefix}launches', 5);
      expect(eligible(), EngagementPrompt.review);
      expect(eligible(review: false), isNull);
    },
  );

  test(
    'shared cooldown prevents stacking, each request repeats at most every 90 days',
    () async {
      await experiencedUser();
      now = now.add(const Duration(days: 14));
      expect(eligible(), EngagementPrompt.review);
      await policy.recordRequest(EngagementPrompt.review);
      expect(eligible(), isNull);
      now = now.add(const Duration(days: 29));
      expect(eligible(), isNull);
      now = now.add(const Duration(days: 1));
      expect(eligible(), EngagementPrompt.support);
      await policy.recordRequest(EngagementPrompt.support);
      now = now.add(const Duration(days: 30));
      expect(eligible(), isNull);
      now = now.add(const Duration(days: 30));
      expect(eligible(), EngagementPrompt.review);
      expect(eligible(review: false), isNull);
    },
  );

  test(
    'unavailable store does not prevent optional support; opt-out survives history reset',
    () async {
      await experiencedUser();
      now = now.add(const Duration(days: 14));
      expect(eligible(review: false), EngagementPrompt.support);
      expect(eligible(review: false, support: false), isNull);
      await policy.disableSupportRequests();
      await prefs.remove('mample_notifications');
      await experiencedUser();
      final restarted = EngagementPromptService(prefs, now: () => now);
      await restarted.beginSession();
      expect(
        restarted.eligible(reviewAvailable: false, supportAvailable: true),
        isNull,
      );
      expect(eligible(), EngagementPrompt.review);
    },
  );

  test('backward clock changes never bypass cooldown', () async {
    await experiencedUser();
    now = now.add(const Duration(days: 14));
    await policy.recordRequest(EngagementPrompt.review);
    now = now.subtract(const Duration(days: 7));
    expect(eligible(), isNull);
  });
}
