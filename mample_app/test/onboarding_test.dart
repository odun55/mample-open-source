import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mample_app/main.dart';
import 'package:mample_app/providers/locale_provider.dart';
import 'package:mample_app/screens/onboarding_screen.dart';
import 'package:mample_app/services/onboarding_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
    localeNotifier.value = const Locale('en');
  });

  testWidgets(
    'first run waits for Start before creating a key or starting the backend',
    (tester) async {
      final backend = Completer<void>();
      var starts = 0;
      final app = MampleApp(
        initializeBackend: () {
          starts++;
          return backend.future;
        },
      );
      await tester.pumpWidget(app);
      await tester.pumpAndSettle();
      expect(find.text('What is Mample?'), findsOneWidget);
      expect(find.byType(PageView), findsNothing);
      expect(find.text('Next'), findsNothing);
      expect(find.text('Back'), findsNothing);
      expect(starts, 0);
      expect(
        await const FlutterSecureStorage().read(key: 'cli_secret_key'),
        isNull,
      );
      await tester.tap(find.text('Start'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      expect(starts, 1);
      expect(find.text('Secret Key'), findsOneWidget);
      expect(await OnboardingService.isRequired(), isFalse);
      expect(
        await const FlutterSecureStorage().read(key: 'cli_secret_key'),
        startsWith('mample-'),
      );
      await tester.pumpWidget(const SizedBox.shrink());
      backend.complete();
      await tester.pump();
      expect(tester.takeException(), isNull);
    },
  );

  test('existing users and deletion journals bypass onboarding', () async {
    FlutterSecureStorage.setMockInitialValues({
      'cli_secret_key': 'existing-key',
    });
    expect(await OnboardingService.isRequired(), isFalse);
    expect(
      await const FlutterSecureStorage().read(
        key: OnboardingService.completedKey,
      ),
      'true',
    );
    for (final state in ['pending', 'server_deleted', 'deleted']) {
      FlutterSecureStorage.setMockInitialValues({
        'account_deletion_state': state,
      });
      expect(await OnboardingService.isRequired(), isFalse);
    }
    FlutterSecureStorage.setMockInitialValues({
      OnboardingService.completedKey: 'true',
    });
    expect(await OnboardingService.isRequired(), isFalse);
  });

  testWidgets('single Turkish card fits a small screen with enlarged text', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.5;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
    localeNotifier.value = const Locale('tr');
    await tester.pumpWidget(MampleApp(initializeBackend: () async {}));
    await tester.pumpAndSettle();
    expect(find.text('Mample nedir?'), findsOneWidget);
    final imageSize = tester.getSize(
      find.byKey(const ValueKey('onboarding-image')),
    );
    expect(imageSize.width / imageSize.height, closeTo(4 / 3, 0.001));
    final image = tester.widget<Image>(find.byType(Image));
    expect(
      (image.image as AssetImage).assetName,
      'assets/images/onboarding/03-benefits.png',
    );
    expect(find.text('Başla'), findsOneWidget);
    expect(find.byType(PageView), findsNothing);
    expect(tester.takeException(), isNull);
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();
    expect(find.text('Start'), findsOneWidget);
    expect(find.byType(OnboardingScreen), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
