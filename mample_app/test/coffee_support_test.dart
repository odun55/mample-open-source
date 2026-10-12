import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/screens/settings_screen.dart';
import 'package:mample_app/services/coffee_support.dart';

void main() {
  test('only an HTTPS Buy Me a Coffee creator profile activates support', () {
    expect(
      parseCoffeeSupportUri('https://buymeacoffee.com/example'),
      isNotNull,
    );
    expect(
      parseCoffeeSupportUri('https://www.buymeacoffee.com/example/'),
      isNotNull,
    );
    for (final value in [
      '',
      'http://buymeacoffee.com/example',
      'https://buymeacoffee.com/',
      'https://example.com/profile',
      'https://buymeacoffee.com.evil.test/profile',
      'https://user@buymeacoffee.com/example',
      'https://buymeacoffee.com:444/example',
      'https://buymeacoffee.com/example/membership',
      'https://buymeacoffee.com/example?redirect=elsewhere',
    ]) {
      expect(parseCoffeeSupportUri(value), isNull, reason: value);
    }
  });

  for (final lang in ['en', 'tr']) {
    testWidgets(
      '$lang settings reflect the configured support URL, including large text',
      (tester) async {
        tester.view.physicalSize = const Size(360, 900);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        await tester.pumpWidget(
          MaterialApp(
            locale: Locale(lang),
            supportedLocales: const [Locale('en'), Locale('tr')],
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            builder: (context, child) => MediaQuery(
              data: MediaQuery.of(
                context,
              ).copyWith(textScaler: const TextScaler.linear(1.5)),
              child: child!,
            ),
            home: const SettingsScreen(),
          ),
        );
        await tester.pumpAndSettle();
        final title = lang == 'tr' ? 'Bizi destekleyin' : 'Support us';
        final enabled = coffeeSupportUri != null;
        final l10n = AppLocalizations.of(
          tester.element(find.byType(SettingsScreen)),
        );
        final label = l10n.translate(
          enabled ? 'coffee_support_open' : 'coffee_support_pending',
        );
        await tester.ensureVisible(find.text(title));
        await tester.pumpAndSettle();
        expect(find.text(label), findsOneWidget);
        expect(find.byIcon(Icons.favorite_border), findsOneWidget);
        final card = tester.widget<ListTile>(
          find
              .ancestor(of: find.text(title), matching: find.byType(ListTile))
              .first,
        );
        expect(card.onTap, enabled ? isNotNull : isNull);
        expect(tester.takeException(), isNull);
      },
    );
  }
}
