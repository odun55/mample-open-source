import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import 'package:mample_app/services/cli_secret_key.dart';
import 'package:mample_app/services/diagnostics_service.dart';

void main() {
  test('compact credentials retain at least 128 random bits', () {
    final bits =
        CLISecretKey.randomLength * log(CLISecretKey.alphabet.length) / ln2;
    expect(bits, greaterThanOrEqualTo(128));
    expect(
      CLISecretKey.alphabet.split('').toSet().length,
      CLISecretKey.alphabet.length,
    );
  });
  test(
    'new credentials are short, easy to type and independently generated',
    () {
      final keys = List.generate(100, (_) => CLISecretKey.generate());
      for (final key in keys) {
        expect(key.length, 32);
        expect(key, matches(r'^mample-[a-z0-9]{25}$'));
      }
      expect(keys.toSet().length, keys.length);
    },
  );

  test(
    'short and legacy credentials are redacted even without a field label',
    () {
      final short = CLISecretKey.generate();
      final previous = 'm-${List.filled(26, 'a').join()}';
      final previousCompact = 'm-${List.filled(22, 'z').join()}';
      final previousPrefixed = 'mample-${List.filled(22, 'Z').join()}';
      final legacy = 'mample-${List.filled(64, 'a').join()}';
      final report = DiagnosticsService.sanitize(
        'Failed with $short and $previous and $previousCompact and $previousPrefixed and $legacy',
      );
      expect(report, isNot(contains(short)));
      expect(report, isNot(contains(previous)));
      expect(report, isNot(contains(previousCompact)));
      expect(report, isNot(contains(previousPrefixed)));
      expect(report, isNot(contains(legacy)));
      expect(report, contains('[redacted key]'));
    },
  );
}
