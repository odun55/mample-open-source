// Override at build time; an explicitly empty value disables the support card.
const _supportUrl = String.fromEnvironment(
  'MAMPLE_SUPPORT_URL',
  defaultValue: 'https://buymeacoffee.com/mample',
);

Uri? parseCoffeeSupportUri(String value) {
  final uri = Uri.tryParse(value.trim());
  if (uri == null ||
      uri.scheme != 'https' ||
      !const {'buymeacoffee.com', 'www.buymeacoffee.com'}.contains(uri.host) ||
      uri.userInfo.isNotEmpty ||
      (uri.hasPort && uri.port != 443) ||
      uri.pathSegments.where((segment) => segment.isNotEmpty).length != 1 ||
      uri.pathSegments.any((segment) => segment == '.' || segment == '..') ||
      uri.hasQuery ||
      uri.hasFragment) {
    return null;
  }
  return uri;
}

Uri? get coffeeSupportUri => parseCoffeeSupportUri(_supportUrl);
