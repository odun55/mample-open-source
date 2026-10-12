import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/services/diagnostics_service.dart';
import 'package:mample_app/screens/settings_screen.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test(
    'report retains occurrence time and replaces the previous error',
    () async {
      final firstTime = DateTime.utc(2026, 10, 9, 10, 20);
      await DiagnosticsService.record(
        'QR pairing',
        StateError('first'),
        StackTrace.fromString('frame'),
        occurredAt: firstTime,
      );
      final first = await DiagnosticsService.latestReport();
      expect(first, contains(firstTime.toLocal().toIso8601String()));
      expect(first, contains('frame'));
      await DiagnosticsService.record(
        'Connected devices',
        StateError('second'),
        null,
      );
      final latest = await DiagnosticsService.latestReport();
      expect(latest, contains('second'));
      expect(latest, isNot(contains('first')));
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getKeys(), {DiagnosticsService.storageKey});
      await DiagnosticsService.clear();
      expect(await DiagnosticsService.latestReport(), isNull);
    },
  );

  test(
    'stored report removes credentials and bounds large error dumps',
    () async {
      final secret = List.filled(64, 'a').join();
      final token = List.filled(120, 'b').join();
      await DiagnosticsService.record(
        'QR pairing',
        StateError(
          'mample-$secret token=$token claim_token=shortsecret person@example.com https://example.com/?secret=private',
        ),
        StackTrace.fromString(List.filled(10000, 'x').join()),
      );
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString(DiagnosticsService.storageKey)!;
      for (final value in [
        secret,
        token,
        'shortsecret',
        'person@example.com',
        'secret=private',
      ]) {
        expect(stored, isNot(contains(value)));
      }
      expect(stored.length, lessThan(17000));
    },
  );

  testWidgets(
    'settings opens a report without requiring an email app and contact has only email and website',
    (tester) async {
      await tester.pumpWidget(const MaterialApp(home: SettingsScreen()));
      expect(find.text('How Does It Work?'), findsNothing);
      await tester.runAsync(() async {
        await tester.tap(find.text('Bug Report'));
        await Future<void>.delayed(Duration.zero);
      });
      await tester.pumpAndSettle();
      expect(
        tester.widget<SelectableText>(find.byType(SelectableText)).data,
        contains('No error has been recorded'),
      );
      await tester.tap(find.text('Close'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Contact Us'));
      await tester.pumpAndSettle();
      expect(find.text('E-Mail'), findsOneWidget);
      expect(find.text('Website'), findsOneWidget);
      expect(find.text('Threads'), findsNothing);
      expect(find.text('Twitter'), findsNothing);
      expect(find.text('LinkedIn'), findsNothing);
    },
  );
}
