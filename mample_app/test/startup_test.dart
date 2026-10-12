import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/main.dart';
import 'package:mample_app/providers/locale_provider.dart';
import 'package:mample_app/screens/notifications_sheet.dart';
import 'package:mample_app/screens/settings_screen.dart';

// Startup now reads the first-run gate before constructing HomeScreen.
Future<void> waitFor(WidgetTester tester, Finder finder) async {
  for (var frame = 0; frame < 20 && finder.evaluate().isEmpty; frame++) {
    await tester.pump(const Duration(milliseconds: 20));
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({
      'cli_secret_key': 'mample-test-local-key',
    });
    localeNotifier.value = const Locale('en');
  });

  testWidgets(
    'local home and settings render while the backend is pending; pairing stays gated',
    (tester) async {
      final backend = Completer<void>();
      await tester.pumpWidget(
        MampleApp(initializeBackend: () => backend.future),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await waitFor(tester, find.text('Secret Key'));
      expect(find.text('Secret Key'), findsOneWidget);
      expect(find.text('Copy'), findsOneWidget);
      expect(find.text('Renew'), findsOneWidget);
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Notifications'), findsOneWidget);
      expect(
        tester
            .widget<FloatingActionButton>(find.byType(FloatingActionButton))
            .onPressed,
        isNull,
      );
      expect(find.byType(NotificationsSheet), findsNothing);
      expect(find.byType(SettingsScreen), findsNothing);
      expect(
        Theme.of(
          tester.element(find.byType(Scaffold)),
        ).textTheme.bodyLarge?.fontFamily,
        'Inter',
      );
      await tester.tap(find.byIcon(Icons.settings_outlined));
      await tester.pump();
      expect(find.byType(SettingsScreen), findsOneWidget);
      expect(find.byType(NotificationsSheet), findsNothing);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
      backend.complete();
      await tester.pump();
    },
  );

  testWidgets('backend errors are visible and retry starts a new attempt', (
    tester,
  ) async {
    final retry = Completer<void>();
    var attempts = 0;
    await tester.pumpWidget(
      MampleApp(
        initializeBackend: () {
          attempts++;
          return attempts == 1
              ? Future<void>.error(StateError('test startup failure'))
              : retry.future;
        },
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    await waitFor(tester, find.text('Try again'));
    expect(find.text('Try again'), findsOneWidget);
    await tester.ensureVisible(find.text('Try again'));
    await tester.tap(find.text('Try again'));
    await tester.pump();
    expect(attempts, 2);
    expect(find.text('Try again'), findsNothing);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox.shrink());
    retry.complete();
    await tester.pump();
  });

  testWidgets(
    'deleted account stays deleted on startup without creating a backend session',
    (tester) async {
      FlutterSecureStorage.setMockInitialValues({
        'account_deletion_state': 'deleted',
      });
      var backendStarts = 0;
      await tester.pumpWidget(
        MampleApp(
          initializeBackend: () async {
            backendStarts++;
          },
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Your account has been deleted'), findsOneWidget);
      expect(find.text('Start Again'), findsOneWidget);
      expect(find.text('Secret Key'), findsNothing);
      expect(find.byType(SettingsScreen), findsNothing);
      expect(backendStarts, 0);
      expect(tester.takeException(), isNull);
    },
  );
}
