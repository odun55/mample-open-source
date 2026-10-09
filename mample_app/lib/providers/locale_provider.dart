import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Küresel dil yöneticimiz
final ValueNotifier<Locale> localeNotifier = ValueNotifier(const Locale('en'));

class LocaleProvider {
  static const String _localeKey = 'app_locale';

  // Başlangıçta SharedPreferences'tan seçili dili yükler
  static Future<void> loadSavedLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLocale = prefs.getString(_localeKey);
    if (savedLocale != null) {
      localeNotifier.value = Locale(savedLocale);
    } else {
      // Varsayılan olarak İngilizce
      localeNotifier.value = const Locale('en');
    }
  }

  // Dili değiştirir ve SharedPreferences'a kaydeder
  static Future<void> setLocale(String languageCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localeKey, languageCode);
    localeNotifier.value = Locale(languageCode);
  }
}
