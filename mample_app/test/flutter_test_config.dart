import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:mample_app/services/notification_history_store.dart';

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  sqfliteFfiInit();
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    NotificationHistoryStore.instance = NotificationHistoryStore(
      factory: databaseFactoryFfiNoIsolate,
      path: inMemoryDatabasePath,
    );
  });
  tearDown(() async => NotificationHistoryStore.instance.close());
  await testMain();
}
