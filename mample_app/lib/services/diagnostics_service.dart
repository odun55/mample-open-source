import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'cli_secret_key.dart';

/// Keeps only the latest error locally. Reports never include connection keys.
class DiagnosticsService {
  static const storageKey = 'mample_last_error';
  static Future<void> _writes = Future.value();

  static String sanitize(String value) {
    var result = value.replaceAll(
      RegExp(
        r'-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----',
      ),
      '[redacted private key]',
    );
    result = result.replaceAll(
      RegExp(
        r'\b(?:[a-f0-9]{64}|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})\b',
        caseSensitive: false,
      ),
      '[redacted key]',
    );
    result = result.replaceAll(
      // Redact both previous compact formats and the lowercase current format.
      RegExp(
        '\\b(?:m-[A-Za-z0-9]{22,26}|mample-[A-Za-z0-9]{22}|${CLISecretKey.prefix}[${CLISecretKey.alphabet}]{${CLISecretKey.randomLength}})\\b',
      ),
      '[redacted key]',
    );
    result = result.replaceAll(
      RegExp(r'\b[A-Za-z0-9_\-:.]{80,}\b'),
      '[redacted token]',
    );
    result = result.replaceAll(
      RegExp(r'AIza[A-Za-z0-9_-]+'),
      '[redacted API key]',
    );
    result = result.replaceAll(
      RegExp(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}'),
      '[redacted email]',
    );
    result = result.replaceAll(RegExp(r'https?://[^\s]+'), '[redacted URL]');
    result = result.replaceAllMapped(
      RegExp(
        r'(token|secret[_ ]?key|claim[_ ]?token|authorization|password)\s*[:=]\s*[^\s,;]+',
        caseSensitive: false,
      ),
      (match) => '${match[1]}=[redacted]',
    );
    return result.length > 8000
        ? '${result.substring(0, 8000)}\n[truncated]'
        : result;
  }

  static Future<void> record(
    String location,
    Object error,
    StackTrace? stack, {
    DateTime? occurredAt,
  }) {
    // Capture the occurrence time before waiting for storage.
    final report = jsonEncode({
      'time': (occurredAt ?? DateTime.now()).toUtc().toIso8601String(),
      'location': sanitize(location),
      'error': sanitize(error.toString()),
      'stack': sanitize(stack?.toString() ?? ''),
    });
    _writes = _writes.then((_) async {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(storageKey, report);
      } catch (_) {
        // Reporting must not interrupt the original operation.
      }
    });
    return _writes;
  }

  static Future<String?> latestReport() async {
    await _writes;
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString(storageKey);
      if (stored == null) return null;
      final report = jsonDecode(stored) as Map<String, dynamic>;
      final time = DateTime.parse(report['time'] as String).toLocal();
      final offset = time.timeZoneOffset;
      final sign = offset.isNegative ? '-' : '+';
      final hours = offset.inHours.abs().toString().padLeft(2, '0');
      final minutes = (offset.inMinutes.abs() % 60).toString().padLeft(2, '0');
      return 'Mample error report\nOccurred: ${time.toIso8601String()} UTC$sign$hours:$minutes\n'
          'Location: ${report['location']}\n\n${report['error']}\n\n${report['stack']}';
    } catch (_) {
      return null;
    }
  }

  static Future<void> clear() {
    final pending = _writes.then((_) async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(storageKey);
    });
    _writes = pending.then<void>(
      (_) {},
      onError: (Object error, StackTrace stack) {},
    );
    return pending;
  }
}
