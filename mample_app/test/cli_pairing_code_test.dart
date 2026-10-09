import 'package:flutter_test/flutter_test.dart';
import 'package:mample_app/services/cli_pairing_code.dart';

void main() {
  final id = List.filled(64, 'a').join();
  final token = List.filled(64, 'b').join();
  final code = 'mample://cli-pair?v=1&id=$id&token=$token';

  test('terminal QR parses separately from legacy extension UUID', () {
    expect(CLIPairingCode.parse(code)?.id, id);
    expect(CLIPairingCode.parse(code)?.token, token);
    expect(
      CLIPairingCode.parse('00000000-0000-4000-8000-000000000001'),
      isNull,
    );
  });

  test('unsupported versions and malformed credentials are rejected', () {
    for (final value in [
      code.replaceFirst('v=1', 'v=2'),
      '$code&id=$id',
      '$code&extra=1',
      '$code#fragment',
      code.replaceFirst('cli-pair', 'other'),
      code.replaceFirst(token, 'bad'),
    ]) {
      expect(() => CLIPairingCode.parse(value), throwsFormatException);
    }
  });
}
