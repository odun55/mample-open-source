/// Versioned terminal invitations are distinct from extension UUIDs.
class CLIPairingCode {
  final String id;
  final String token;

  const CLIPairingCode(this.id, this.token);

  static CLIPairingCode? parse(String code) {
    if (!code.startsWith('mample:')) return null;
    final uri = Uri.tryParse(code);
    final hex = RegExp(r'^[a-f0-9]{64}$');
    if (uri == null ||
        uri.scheme != 'mample' ||
        uri.host != 'cli-pair' ||
        uri.path.isNotEmpty ||
        uri.fragment.isNotEmpty ||
        uri.hasPort ||
        uri.userInfo.isNotEmpty ||
        uri.queryParametersAll.length != 3 ||
        uri.queryParametersAll.values.any((values) => values.length != 1) ||
        uri.queryParameters['v'] != '1' ||
        !hex.hasMatch(uri.queryParameters['id'] ?? '') ||
        !hex.hasMatch(uri.queryParameters['token'] ?? '')) {
      throw const FormatException('Invalid terminal pairing QR');
    }
    return CLIPairingCode(
      uri.queryParameters['id']!,
      uri.queryParameters['token']!,
    );
  }
}
