import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Small lifetime aggregates, independent of the notification history limit.
/// Only three distinct dates are needed; no message contents are retained here.
class NotificationUsage {
  NotificationUsage(this.received, this.days);
  final int received;
  final Set<String> days;
  static const storageKey = 'mample_notification_usage';

  static String _day(DateTime date) => '${date.year}-${date.month}-${date.day}';

  static NotificationUsage load(SharedPreferences prefs, List<String> history) {
    final existing = decode(prefs.getString(storageKey));
    if (existing != null) return existing;
    var received = 0;
    final days = <String>{};
    for (final encoded in history) {
      try {
        final value = jsonDecode(encoded);
        if (value is! Map ||
            (value['title'] is! String && value['body'] is! String)) {
          continue;
        }
        final date = value['time'] is String
            ? DateTime.tryParse(value['time'])?.toLocal()
            : null;
        if (date == null) continue;
        received++;
        if (days.length < 3) days.add(_day(date));
      } on FormatException {
        // Bad history records do not count as usage.
      }
    }
    return NotificationUsage(received, days);
  }

  static NotificationUsage? decode(String? encoded) {
    try {
      final value = encoded == null ? null : jsonDecode(encoded);
      if (value is Map &&
          value['received'] is int &&
          value['received'] >= 0 &&
          value['days'] is List &&
          (value['days'] as List).every((day) => day is String)) {
        return NotificationUsage(
          value['received'] as int,
          (value['days'] as List).cast<String>().take(3).toSet(),
        );
      }
    } on FormatException {
      // Invalid aggregate data can be backfilled from legacy history.
    }
    return null;
  }

  NotificationUsage adding(DateTime date) {
    final updatedDays = {...days};
    if (updatedDays.length < 3) updatedDays.add(_day(date.toLocal()));
    return NotificationUsage(received + 1, updatedDays);
  }

  Future<bool> save(SharedPreferences prefs) =>
      prefs.setString(storageKey, encode());

  String encode() => jsonEncode({'received': received, 'days': days.toList()});
}
