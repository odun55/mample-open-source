import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/screens/settings_screen.dart';

void main() {
  for (final language in ['en', 'tr']) {
    testWidgets(
      '$language deletion confirmation explains identity change and cancellation does nothing',
      (tester) async {
      var deletions = 0;
      await tester.binding.setSurfaceSize(const Size(360, 640));
      addTearDown(() => tester.binding.setSurfaceSize(null));
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
            home: SettingsScreen(
              onDeleteAccount: () async {
                deletions++;
              },
            ),
          ),
        );
        await tester.pumpAndSettle();
        final title = language == 'tr'
            ? 'Hesabı ve Verileri Sil'
            : 'Delete Account and Data';
        final cancel = language == 'tr' ? 'İptal' : 'Cancel';
        final confirm = language == 'tr'
            ? 'Kalıcı Olarak Sil'
            : 'Delete Permanently';
        expect(find.text('Reset Data'), findsNothing);
        expect(find.text('Verileri Sıfırla'), findsNothing);
        await tester.ensureVisible(find.text(title));
        await tester.tap(find.text(title));
        await tester.pumpAndSettle();
        expect(
          find.textContaining(
            language == 'tr' ? 'farklı bir hesap ID' : 'different account ID',
          ),
          findsOneWidget,
        );
        await tester.tap(find.text(cancel));
        await tester.pumpAndSettle();
        expect(deletions, 0);
        await tester.tap(find.text(title));
        await tester.pumpAndSettle();
        await tester.tap(find.text(confirm));
        await tester.pumpAndSettle();
        expect(deletions, 1);
        expect(tester.takeException(), isNull);
      },
    );
  }
}
