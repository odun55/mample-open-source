import 'dart:async';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  bool saved = await FCMService.saveNotification(message);
  if (!saved) return;

  // Android'de kilit ekranını uyandırmak için local notification (fullScreenIntent ile)
  if (message.notification == null && message.data.containsKey('title')) {
    final backgroundPlugin = FlutterLocalNotificationsPlugin();
    const initializationSettingsAndroid = AndroidInitializationSettings('@drawable/ic_notification');
    const initializationSettings = InitializationSettings(android: initializationSettingsAndroid);
    await backgroundPlugin.initialize(settings: initializationSettings);
    
    await backgroundPlugin.show(
      id: message.hashCode,
      title: message.data['title'],
      body: message.data['body'],
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'mample_notifications_v1',
          'Mample Notifications',
          channelDescription: 'Notifications from Mample',
          importance: Importance.high,
          priority: Priority.high,
          playSound: true,
          category: AndroidNotificationCategory.message,
          icon: '@drawable/ic_stat_mample',
        ),
      ),
    );
  }
}

class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  FirebaseMessaging? _messaging;
  FirebaseAuth? _auth;
  FirebaseFirestore? _firestore;
  final FlutterLocalNotificationsPlugin _localNotificationsPlugin = FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'mample_notifications_v1',
    'Mample Notifications',
    description: 'Notifications from Mample',
    importance: Importance.high,
  );

  Future<void> _initQueue = Future<void>.value();
  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _messageSubscription;

  Future<void> init() {
    return _enqueue(_initialize);
  }

  Future<void> _enqueue(Future<void> Function() operation) {
    final pending = _initQueue.then((_) => operation());
    _initQueue = pending.then<void>((_) {}, onError: (Object error, StackTrace stack) {});
    return pending;
  }

  Future<void> _initialize() async {
    if (kIsWeb) return;
    _messaging = FirebaseMessaging.instance;
    _auth = FirebaseAuth.instance;
    _firestore = FirebaseFirestore.instance;

    // 1. Bildirim İzinlerini İste (FCM)
    await _messaging!.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Yerel Bildirim Eklentisini Başlat
    await _localNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    const initializationSettingsAndroid = AndroidInitializationSettings('@drawable/ic_stat_mample');
    const initializationSettings = InitializationSettings(android: initializationSettingsAndroid);
    await _localNotificationsPlugin.initialize(settings: initializationSettings);

    // iOS için ön planda bildirim ayarı (Android'de local notification kullanıyoruz)
    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // Arka plan bildirim dinleyicisini ayarla
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 2. Gizli Anahtarı Al ve Hashle
    const secureStorage = FlutterSecureStorage();
    String? secretKey = await secureStorage.read(key: 'cli_secret_key');
    if (secretKey == null) return;
    
    final bytes = utf8.encode(secretKey);
    final hashedKey = sha256.convert(bytes).toString();

    // 3. Anonim Giriş Yap
    if (_auth!.currentUser == null) {
      await _auth!.signInAnonymously();
    }
    
    final uid = _auth!.currentUser?.uid;
    if (uid == null) return;

    // 4. FCM Token Al ve Kaydet
    String? token = await _messaging!.getToken();
    if (token != null) {
      await _updateUserRecord(uid, token, hashedKey);
    }

    _tokenSubscription ??= _messaging!.onTokenRefresh.listen((newToken) async {
      try {
        await _enqueue(() async {
        final currentUid = _auth!.currentUser?.uid;
        final currentKey = await secureStorage.read(key: 'cli_secret_key');
        if (currentUid == null || currentKey == null) return;
        final currentHash = sha256.convert(utf8.encode(currentKey)).toString();
        await _updateUserRecord(currentUid, newToken, currentHash);
        });
      } catch (error) {
        debugPrint('FCM token update failed: $error');
      }
    });

    // 5. Uygulama Açıkken Gelen Bildirimleri Dinle ve Göster
    _messageSubscription ??= FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      bool saved = await saveNotification(message);
      if (!saved) return;
      
      final title = message.notification?.title ?? message.data['title'];
      final body = message.notification?.body ?? message.data['body'];

      // Uygulama ön plandayken bildirimi yerel olarak göster
      if (title != null) {
        await _localNotificationsPlugin.show(
          id: message.hashCode,
          title: title,
          body: body,
          notificationDetails: NotificationDetails(
            android: AndroidNotificationDetails(
              _channel.id,
              _channel.name,
              channelDescription: _channel.description,
              icon: '@drawable/ic_stat_mample',
              importance: Importance.high,
              priority: Priority.high,
              playSound: true,
              category: AndroidNotificationCategory.message,
            ),
          ),
        );
      }
    });
  }

  Future<void> _updateUserRecord(String uid, String token, String hashedKey) async {
    if (_firestore == null) return;
    await _firestore!.collection('users').doc(uid).set({
      'fcm_token': token,
      'cli_secret_key_hash': hashedKey,
      'updated_at': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  static Future<void> _saveQueue = Future<void>.value();

  static Future<bool> saveNotification(RemoteMessage message) {
    final result = _saveQueue.then((_) => _saveNotification(message));
    _saveQueue = result.then<void>((_) {}, onError: (Object error, StackTrace stack) {});
    return result;
  }

  static Future<bool> _saveNotification(RemoteMessage message) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.reload();
    
    List<String> notifications = prefs.getStringList('mample_notifications') ?? [];
    
    final title = message.notification?.title ?? message.data['title'];
    final body = message.notification?.body ?? message.data['body'];
    
    if (title == null && body == null) return true;

    if (message.messageId != null && notifications.any((encoded) {
      try {
        return jsonDecode(encoded)['id'] == message.messageId;
      } catch (_) {
        return false;
      }
    })) {
      return false;
    }

    final newNotification = {
      'id': message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      'title': title ?? 'Yeni Bildirim',
      'body': body ?? '',
      'time': DateTime.now().toIso8601String(),
      'isRead': false,
    };
    
    notifications.insert(0, jsonEncode(newNotification));
    
    // Sadece son 50 bildirimi sakla
    if (notifications.length > 50) {
      notifications = notifications.sublist(0, 50);
    }
    
    await prefs.setStringList('mample_notifications', notifications);
    
    
    return true;
  }
}
