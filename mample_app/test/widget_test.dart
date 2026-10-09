import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/screens/notifications_sheet.dart';

void main() {
  testWidgets('history loads valid entries and skips malformed data', (tester) async {
    SharedPreferences.setMockInitialValues({'mample_notifications': ['invalid-json', jsonEncode({'id': 'build', 'title': 'Build complete', 'body': 'Ready', 'time': DateTime.now().toIso8601String()})]});
    await tester.pumpWidget(const MaterialApp(localizationsDelegates: [AppLocalizations.delegate], home: NotificationsSheet()));
    await tester.pumpAndSettle();
    expect(find.text('Build complete'), findsOneWidget);
    expect(find.text('Ready'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
