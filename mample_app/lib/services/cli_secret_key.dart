import 'dart:math';

class CLISecretKey {
  // 36 lowercase letters/digits. 25 independently generated symbols provide
  // over 128 random bits; existing credentials are never truncated or rotated.
  static const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  static const prefix = 'mample-';
  static const randomLength = 25;

  static String generate() {
    final random = Random.secure();
    return prefix +
        List.generate(
          randomLength,
          (_) => alphabet[random.nextInt(alphabet.length)],
        ).join();
  }
}
