import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mample_app/l10n/app_localizations.dart';
import 'package:mample_app/screens/notifications_sheet.dart';
import 'package:mample_app/services/notification_history_store.dart';

class MemoryHistory extends NotificationHistoryStore {
  @override
  Future<void> close() async => revision.dispose();
  final entries = <Map<String, dynamic>>[];
  @override
  Future<List<Map<String, dynamic>>> load() async => List.of(entries);
  @override
  Future<bool> add(Map<String, dynamic> entry, DateTime receivedAt) async {
    entries.insert(0, entry);
    revision.value++;
    return true;
  }

  @override
  Future<void> removeIds(Set<String> ids) async {
    entries.removeWhere((entry) => ids.contains(entry['id']));
    revision.value++;
  }
}

Future<void> showHistory(WidgetTester tester) async {
  final store = MemoryHistory();
  NotificationHistoryStore.instance = store;
  for (final id in ['first', 'second']) {
    await store.add({
      'id': id,
      'title': id,
      'body': 'Body',
      'time': DateTime.now().toIso8601String(),
    }, DateTime.now());
  }
  await tester.pumpWidget(
    const MaterialApp(
      localizationsDelegates: [AppLocalizations.delegate],
      home: NotificationsSheet(),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('history renders title and body', (tester) async {
    await showHistory(tester);
    expect(find.text('first'), findsOneWidget);
    expect(find.text('Body'), findsNWidgets(2));
    expect(tester.takeException(), isNull);
  });
  testWidgets('left swipe deletes, right swipe keeps notification', (
    tester,
  ) async {
    await showHistory(tester);
    final card = find.byKey(const ValueKey('notification-first'));
    await tester.drag(card, const Offset(350, 0));
    await tester.pumpAndSettle();
    expect(find.text('first'), findsOneWidget);
    await tester.drag(card, const Offset(-350, 0));
    await tester.pumpAndSettle();
    expect(find.text('first'), findsNothing);
    expect(
      (await NotificationHistoryStore.instance.load()).single['id'],
      'second',
    );
  });
  testWidgets('trash slides left and fades before removal', (tester) async {
    await showHistory(tester);
    final card = find.byKey(const ValueKey('notification-first'));
    await tester.tap(
      find.descendant(of: card, matching: find.byIcon(Icons.delete_outline)),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 160));
    final slide = tester.widget<SlideTransition>(
      find.descendant(of: card, matching: find.byType(SlideTransition)),
    );
    final fade = tester.widget<FadeTransition>(
      find.descendant(of: card, matching: find.byType(FadeTransition)),
    );
    expect(slide.position.value.dx, lessThan(0));
    expect(fade.opacity.value, lessThan(1));
    expect(find.text('first'), findsOneWidget);
    await tester.pumpAndSettle();
    expect(find.text('first'), findsNothing);
  });
  testWidgets(
    'clear all animates every card and retains an arrival during removal',
    (tester) async {
      await showHistory(tester);
      await tester.tap(find.text('Clear All'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 160));
      for (final id in ['first', 'second']) {
        final slide = tester.widget<SlideTransition>(
          find.descendant(
            of: find.byKey(ValueKey('notification-$id')),
            matching: find.byType(SlideTransition),
          ),
        );
        expect(slide.position.value.dx, lessThan(0));
      }
      await NotificationHistoryStore.instance.add({
        'id': 'arrival',
        'title': 'arrival',
        'body': '',
        'time': DateTime.now().toIso8601String(),
      }, DateTime.now());
      await tester.pumpAndSettle();
      expect(find.text('first'), findsNothing);
      expect(find.text('second'), findsNothing);
      expect(find.text('arrival'), findsOneWidget);
    },
  );
}
