import 'package:shared_preferences/shared_preferences.dart';
import 'notification_usage.dart';

enum EngagementPrompt { review, support }

/// Device-local policy. A request consumes a slot even if Play suppresses its UI;
/// the API cannot tell us whether a rating was submitted.
class EngagementPromptService {
  EngagementPromptService(this.prefs, {DateTime Function()? now})
    : _now = now ?? DateTime.now;

  final SharedPreferences prefs;
  final DateTime Function() _now;
  static const prefix = 'mample_engagement_';
  static const cooldown = Duration(days: 30);

  Future<void> beginSession() async {
    if (!prefs.containsKey('${prefix}first_seen')) {
      await prefs.setInt('${prefix}first_seen', _now().millisecondsSinceEpoch);
    }
    await prefs.setInt(
      '${prefix}launches',
      (prefs.getInt('${prefix}launches') ?? 0) + 1,
    );
  }

  bool _elapsed(String key, Duration minimum) {
    final timestamp = prefs.getInt('$prefix$key');
    return timestamp == null ||
        _now().difference(DateTime.fromMillisecondsSinceEpoch(timestamp)) >=
            minimum;
  }

  EngagementPrompt? eligible({
    required bool reviewAvailable,
    required bool supportAvailable,
    NotificationUsage? usage,
  }) {
    final firstSeen = prefs.getInt('${prefix}first_seen');
    if (firstSeen == null || !_elapsed('last_prompt', cooldown)) return null;
    final age = _now().difference(
      DateTime.fromMillisecondsSinceEpoch(firstSeen),
    );
    final launches = prefs.getInt('${prefix}launches') ?? 0;
    final history = prefs.getStringList('mample_notifications') ?? [];
    final received = usage ?? NotificationUsage.load(prefs, history);
    if (received.received < 20 || received.days.length < 3) return null;

    final review =
        reviewAvailable &&
        age >= const Duration(days: 7) &&
        launches >= 5 &&
        _elapsed('last_review', const Duration(days: 90));
    final support =
        supportAvailable &&
        !(prefs.getBool('${prefix}support_disabled') ?? false) &&
        age >= const Duration(days: 14) &&
        launches >= 10 &&
        _elapsed('last_support', const Duration(days: 90));
    // Alternate when both are eligible, never stack requests in one session.
    if (support &&
        (!review || prefs.getString('${prefix}last_kind') == 'review')) {
      return EngagementPrompt.support;
    }
    return review ? EngagementPrompt.review : null;
  }

  Future<void> recordRequest(EngagementPrompt kind) async {
    final timestamp = _now().millisecondsSinceEpoch;
    await prefs.setInt('${prefix}last_prompt', timestamp);
    await prefs.setInt('${prefix}last_${kind.name}', timestamp);
    await prefs.setString('${prefix}last_kind', kind.name);
  }

  Future<void> disableSupportRequests() =>
      prefs.setBool('${prefix}support_disabled', true);
}
