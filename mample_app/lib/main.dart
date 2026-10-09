import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'package:flutter/foundation.dart';
import 'screens/home_screen.dart';
import 'providers/locale_provider.dart';
import 'l10n/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase Başlatma
  try {
    if (!kIsWeb) {
      await Firebase.initializeApp();
      
      // Firebase App Check Başlatma
      await FirebaseAppCheck.instance.activate(
        androidProvider: kDebugMode ? AndroidProvider.debug : AndroidProvider.playIntegrity,
        appleProvider: AppleProvider.deviceCheck,
      );
    }
  } catch (e) {
    debugPrint("Firebase başlatılamadı: $e");
  }

  await LocaleProvider.loadSavedLocale();
  
  // Status bar'ı şeffaf ve iOS tarzı yapalım
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Custom Crash Ekranı
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Material(
      color: const Color(0xFF0A0A0A),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 64),
              const SizedBox(height: 24),
              const Text(
                'Oops! Beklenmedik Bir Hata Oluştu.',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1C1C1E),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  details.exceptionAsString(),
                  style: const TextStyle(color: Colors.white54, fontSize: 13, fontFamily: 'monospace'),
                  textAlign: TextAlign.center,
                  maxLines: 5,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () {
                  // Rapor gönderme (şu anlık UI simülasyonu)
                },
                icon: const Icon(Icons.send),
                label: const Text('Hata Raporunu Gönder', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  };

  runApp(const MampleApp());
}

class MampleApp extends StatelessWidget {
  const MampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<Locale>(
      valueListenable: localeNotifier,
      builder: (_, Locale currentLocale, __) {
                final darkTheme = ThemeData(
                  brightness: Brightness.dark,
                  scaffoldBackgroundColor: const Color(0xFF121214),
                  primaryColor: const Color(0xFF88D49E),
                  cardColor: const Color(0xFF1E1E20),
                  bottomAppBarTheme: const BottomAppBarThemeData(
                    color: Colors.transparent,
                    elevation: 0,
                  ),
                  cardTheme: CardThemeData(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    elevation: 0,
                  ),
                  dividerColor: Colors.white12,
                  iconTheme: const IconThemeData(color: Colors.white70),
                  colorScheme: const ColorScheme.dark(
                    primary: Color(0xFF88D49E),
                    secondary: Colors.white,
                    surface: Color(0xFF1E1E20),
                  ),
                  textTheme: GoogleFonts.interTextTheme(
                    ThemeData.dark().textTheme.copyWith(
                      displayLarge: const TextStyle(fontSize: 34, fontWeight: FontWeight.bold, letterSpacing: -1.0, color: Colors.white),
                      titleLarge: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: -0.5, color: Colors.white),
                      bodyLarge: const TextStyle(fontSize: 17, fontWeight: FontWeight.normal, color: Colors.white70),
                    ),
                  ),
                  useMaterial3: true,
                );

                return MaterialApp(
                  title: 'Mample',
                  debugShowCheckedModeBanner: false,
                  themeMode: ThemeMode.dark,
                  locale: currentLocale,
                  supportedLocales: const [
                    Locale('en', ''),
                    Locale('tr', ''),
                  ],
                  localizationsDelegates: const [
                    AppLocalizations.delegate,
                    GlobalMaterialLocalizations.delegate,
                    GlobalWidgetsLocalizations.delegate,
                    GlobalCupertinoLocalizations.delegate,
                  ],
                  theme: darkTheme,
                  darkTheme: darkTheme,
                  home: const HomeScreen(),
                );
      },
    );
  }
}
