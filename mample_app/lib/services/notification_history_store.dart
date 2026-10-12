import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';
import 'notification_usage.dart';

/// On phones, SQLite transactions coordinate foreground UI and FCM background
/// isolates. Browser/desktop previews retain the preferences implementation.
class NotificationHistoryStore {
  NotificationHistoryStore({DatabaseFactory? factory, String? path})
    : _factory = factory,
      _path = path;

  static NotificationHistoryStore instance = NotificationHistoryStore();
  static const maxEntries = 200;
  static const legacyKey = 'mample_notifications';
  final DatabaseFactory? _factory;
  final String? _path;
  final revision = ValueNotifier<int>(0);
  Future<Database>? _opening;
  Future<void> _preferencesQueue = Future<void>.value();

  bool get _usePreferences =>
      _factory == null &&
      (kIsWeb ||
          defaultTargetPlatform == TargetPlatform.windows ||
          defaultTargetPlatform == TargetPlatform.linux);

  Future<T> _withPreferences<T>(Future<T> Function(SharedPreferences) action) {
    final result = _preferencesQueue.then((_) async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return action(prefs);
    });
    _preferencesQueue = result.then<void>(
      (_) {},
      onError: (Object e, StackTrace s) {},
    );
    return result;
  }

  Future<Database> get _database =>
      _opening ??= _open().catchError((Object error, StackTrace stack) {
        _opening = null;
        Error.throwWithStackTrace(error, stack);
      });

  static Map<String, dynamic>? _decodeLegacy(String encoded) {
    try {
      final value = jsonDecode(encoded);
      if (value is! Map ||
          value['id'] is! String ||
          (value['id'] as String).isEmpty ||
          value['title'] is! String) {
        return null;
      }
      return {
        'id': value['id'],
        'title': value['title'],
        'body': value['body'] is String ? value['body'] : '',
        'time': value['time'] is String ? value['time'] : '',
        'isRead': value['isRead'] == true,
      };
    } on FormatException {
      return null;
    }
  }

  static List<Map<String, dynamic>> _legacyEntries(SharedPreferences prefs) {
    final seen = <String>{};
    return (prefs.getStringList(legacyKey) ?? [])
        .map(_decodeLegacy)
        .whereType<Map<String, dynamic>>()
        .where((entry) => seen.add(entry['id'] as String))
        .take(maxEntries)
        .toList();
  }

  static Map<String, Object?> _row(Map<String, dynamic> entry) => {
    'id': entry['id'],
    'title': entry['title'],
    'body': entry['body'],
    'time': entry['time'],
    'is_read': entry['isRead'] == true ? 1 : 0,
  };

  static Future<void> _prune(DatabaseExecutor db) => db.rawDelete(
    'DELETE FROM notifications WHERE seq NOT IN (SELECT seq FROM notifications ORDER BY seq DESC LIMIT ?)',
    [maxEntries],
  );

  Future<Database> _open() async {
    final factory = _factory ?? databaseFactory;
    final path =
        _path ?? '${await factory.getDatabasesPath()}/mample_notifications.db';
    final db = await factory.openDatabase(
      path,
      options: OpenDatabaseOptions(
        version: 1,
        singleInstance: _factory == null,
        onCreate: (db, version) async {
          await db.execute(
            'CREATE TABLE notifications (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, title TEXT NOT NULL, body TEXT NOT NULL, time TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0)',
          );
          await db.execute(
            'CREATE TABLE notification_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
          );
        },
      ),
    );
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      final history = prefs.getStringList(legacyKey) ?? [];
      final entries = _legacyEntries(prefs);
      final usage = NotificationUsage.load(prefs, history);
      await db.transaction((tx) async {
        final migrated = await tx.query(
          'notification_metadata',
          where: 'key = ?',
          whereArgs: ['migrated_preferences'],
        );
        if (migrated.isNotEmpty) return;
        final batch = tx.batch();
        // Legacy preferences already store newest first.
        for (final entry in entries.reversed) {
          batch.insert(
            'notifications',
            _row(entry),
            conflictAlgorithm: ConflictAlgorithm.ignore,
          );
        }
        batch.insert('notification_metadata', {
          'key': 'usage',
          'value': usage.encode(),
        });
        batch.insert('notification_metadata', {
          'key': 'migrated_preferences',
          'value': '1',
        });
        await batch.commit(noResult: true);
        await _prune(tx);
      });
      // Remove legacy copies only after the complete transaction commits.
      await prefs.remove(legacyKey);
      await prefs.remove(NotificationUsage.storageKey);
      return db;
    } catch (_) {
      await db.close();
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> load() async {
    if (_usePreferences) {
      return _withPreferences((prefs) async => _legacyEntries(prefs));
    }
    final db = await _database;
    final rows = await db.query(
      'notifications',
      orderBy: 'seq DESC',
      limit: maxEntries,
    );
    return rows
        .map(
          (row) => {
            'id': row['id'],
            'title': row['title'],
            'body': row['body'],
            'time': row['time'],
            'isRead': row['is_read'] == 1,
          },
        )
        .toList();
  }

  static Future<NotificationUsage> _readUsage(DatabaseExecutor db) async {
    final rows = await db.query(
      'notification_metadata',
      where: 'key = ?',
      whereArgs: ['usage'],
      limit: 1,
    );
    return NotificationUsage.decode(
          rows.isEmpty ? null : rows.first['value'] as String?,
        ) ??
        NotificationUsage(0, {});
  }

  Future<NotificationUsage> usage() async {
    if (_usePreferences) {
      return _withPreferences(
        (prefs) async =>
            NotificationUsage.load(prefs, prefs.getStringList(legacyKey) ?? []),
      );
    }
    return _readUsage(await _database);
  }

  Future<bool> add(Map<String, dynamic> entry, DateTime receivedAt) async {
    bool inserted;
    if (_usePreferences) {
      inserted = await _withPreferences((prefs) async {
        if (prefs.getBool('mample_receiving_disabled') == true) return false;
        final entries = _legacyEntries(prefs);
        if (entries.any((item) => item['id'] == entry['id'])) return false;
        final usage = NotificationUsage.load(
          prefs,
          prefs.getStringList(legacyKey) ?? [],
        ).adding(receivedAt);
        entries.insert(0, entry);
        await prefs.setStringList(
          legacyKey,
          entries.take(maxEntries).map(jsonEncode).toList(),
        );
        await usage.save(prefs);
        return true;
      });
    } else {
      final db = await _database;
      inserted = await db.transaction((tx) async {
        if ((await tx.query(
          'notification_metadata',
          where: 'key = ?',
          whereArgs: ['receiving_disabled'],
          limit: 1,
        )).isNotEmpty) {
          return false;
        }
        if ((await tx.query(
          'notifications',
          columns: ['id'],
          where: 'id = ?',
          whereArgs: [entry['id']],
          limit: 1,
        )).isNotEmpty) {
          return false;
        }
        await tx.insert('notifications', _row(entry));
        final usage = (await _readUsage(tx)).adding(receivedAt);
        await tx.update(
          'notification_metadata',
          {'value': usage.encode()},
          where: 'key = ?',
          whereArgs: ['usage'],
        );
        await _prune(tx);
        return true;
      });
    }
    if (inserted) revision.value++;
    return inserted;
  }

  /// Delete the captured IDs, never replace storage with a stale UI snapshot.
  Future<void> removeIds(Set<String> ids) async {
    if (ids.isEmpty) return;
    if (_usePreferences) {
      await _withPreferences((prefs) async {
        await prefs.setStringList(
          legacyKey,
          _legacyEntries(prefs)
              .where((entry) => !ids.contains(entry['id']))
              .map(jsonEncode)
              .toList(),
        );
      });
    } else {
      final db = await _database;
      await db.transaction((tx) async {
        final batch = tx.batch();
        for (final id in ids) {
          batch.delete('notifications', where: 'id = ?', whereArgs: [id]);
        }
        await batch.commit(noResult: true);
      });
    }
    revision.value++;
  }

  Future<void> clear() async {
    if (_usePreferences) {
      await _withPreferences((prefs) async {
        await prefs.remove(legacyKey);
      });
    } else {
      await (await _database).delete('notifications');
    }
    revision.value++;
  }

  // SQLite serializes this with background-isolate inserts, so late FCM events
  // cannot repopulate history after account deletion.
  Future<void> setReceivingEnabled(bool enabled) async {
    if (_usePreferences) {
      await _withPreferences((prefs) async {
        await prefs.setBool('mample_receiving_disabled', !enabled);
      });
    } else {
      final db = await _database;
      if (enabled) {
        await db.delete(
          'notification_metadata',
          where: 'key = ?',
          whereArgs: ['receiving_disabled'],
        );
      } else {
        await db.insert('notification_metadata', {
          'key': 'receiving_disabled',
          'value': 'true',
        }, conflictAlgorithm: ConflictAlgorithm.replace);
      }
    }
  }

  Future<void> eraseAccountHistory() async {
    await clear();
    if (!_usePreferences) {
      await (await _database).update(
        'notification_metadata',
        {'value': NotificationUsage(0, {}).encode()},
        where: 'key = ?',
        whereArgs: ['usage'],
      );
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(legacyKey);
    await prefs.remove(NotificationUsage.storageKey);
  }

  @visibleForTesting
  Future<void> close() async {
    await _preferencesQueue;
    final pending = _opening;
    if (pending != null) await (await pending).close();
    revision.dispose();
  }
}
