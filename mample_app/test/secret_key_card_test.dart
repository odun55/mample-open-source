import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/widgets/secret_key_card.dart';

void main() {
  for (final language in ['en', 'tr']) {
    testWidgets('$language key actions fit narrow screens with large text', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(320, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      var copies = 0;
      await tester.pumpWidget(
        MaterialApp(
          locale: Locale(language),
          supportedLocales: const [Locale('en'), Locale('tr')],
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: Scaffold(
            body: MediaQuery(
              data: const MediaQueryData(textScaler: TextScaler.linear(1.6)),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: SecretKeyCard(
                  secretKey: 'mample-abcdefghijklmnopqrstuvwxyz',
                  busy: false,
                  copied: false,
                  canRenew: false,
                  onCopy: () => copies++,
                  onRenew: () => fail(
                    'Renew must stay disabled until the session is ready',
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final maskedKey = 'mample-abc${List.filled(23, '*').join()}';
      expect(find.text(maskedKey), findsOneWidget);
      expect(find.text('mample-abcdefghijklmnopqrstuvwxyz'), findsNothing);
      final maskedSpans =
          (tester.widget<Text>(find.text(maskedKey)).textSpan! as TextSpan)
              .children!
              .cast<TextSpan>();
      expect(maskedSpans[0].text, 'mample-');
      expect(maskedSpans[1].text, 'abc');
      expect(maskedSpans[0].style!.color, maskedSpans[2].style!.color);
      expect(maskedSpans[1].style!.color, isNot(maskedSpans[2].style!.color));
      await tester.tap(
        find.byWidgetPredicate((widget) => widget is FilledButton),
      );
      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pump();
      expect(find.text('mample-abcdefghijklmnopqrstuvwxyz'), findsOneWidget);
      final revealedSpans =
          (tester
                      .widget<Text>(
                        find.text('mample-abcdefghijklmnopqrstuvwxyz'),
                      )
                      .textSpan!
                  as TextSpan)
              .children!
              .cast<TextSpan>();
      expect(revealedSpans[2].text, 'def');
      expect(revealedSpans[2].style!.color, maskedSpans[2].style!.color);
      expect(find.text(maskedKey), findsNothing);
      expect(find.byType(AlertDialog), findsNothing);
      await tester.tap(find.byIcon(Icons.visibility_off_outlined));
      await tester.pump();
      expect(find.text(maskedKey), findsOneWidget);
      expect(find.text('mample-abcdefghijklmnopqrstuvwxyz'), findsNothing);
      expect(copies, 1);
      expect(
        tester
            .widget<OutlinedButton>(
              find.byWidgetPredicate((widget) => widget is OutlinedButton),
            )
            .onPressed,
        isNull,
      );
      expect(tester.takeException(), isNull);
    });
  }
}
