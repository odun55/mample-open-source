import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../l10n/app_localizations.dart';

class NotificationsSheet extends StatefulWidget {
  final VoidCallback? onBack;
  final bool isActive;

  const NotificationsSheet({super.key, this.onBack, this.isActive = false});

  @override
  State<NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends State<NotificationsSheet> {
  List<Map<String, dynamic>> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  @override
  void didUpdateWidget(NotificationsSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      _loadNotifications();
    }
  }

  Future<void> _loadNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.reload(); // Fetch updates from background isolate
    final List<String> saved = prefs.getStringList('mample_notifications') ?? [];
    
    final notifications = <Map<String, dynamic>>[];
    for (final encoded in saved) {
      try {
        final decoded = jsonDecode(encoded);
        if (decoded is Map<String, dynamic>) notifications.add(decoded);
      } on FormatException {
        debugPrint('Skipping a malformed notification history entry.');
      }
    }
    if (!mounted) return;
    setState(() => _notifications = notifications);
  }

  Future<void> _saveNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> toSave = _notifications.map((e) => jsonEncode(e)).toList();
    await prefs.setStringList('mample_notifications', toSave);
  }

  void _clearAll() {
    setState(() {
      _notifications.clear();
    });
    _saveNotifications();
  }

  void _removeNotification(String id) {
    setState(() {
      _notifications.removeWhere((n) => n['id'] == id);
    });
    _saveNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: textColor, size: 22),
          onPressed: widget.onBack ?? () => Navigator.maybePop(context),
        ),
        title: Text(
          l10n.translate('notifications'),
          style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
        ),
        actions: [
          if (_notifications.isNotEmpty)
            TextButton(
              onPressed: _clearAll,
              child: Text(
                l10n.translate('clear_all'),
                style: const TextStyle(color: Color(0xFF4CAF50), fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState(textColor, l10n)
          : RefreshIndicator(
              onRefresh: _loadNotifications,
              color: const Color(0xFF6C63FF),
              child: ListView.builder(
                padding: const EdgeInsets.only(left: 24.0, right: 24.0, bottom: 100.0, top: 8.0),
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final notification = _notifications[index];
                  return _buildNotificationCard(notification, theme, textColor, l10n);
                },
              ),
            ),
    );
  }

  Widget _buildEmptyState(Color textColor, AppLocalizations l10n) {
    return Center(
      child: Text(
        l10n.translate('no_notifications'),
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textColor.withValues(alpha: 0.5),
        ),
      ),
    );
  }



  Widget _buildNotificationCard(Map<String, dynamic> notification, ThemeData theme, Color textColor, AppLocalizations l10n) {
    final isRead = notification['isRead'] == true;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor, // CLI kutusuyla aynı elevated gri
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          // Okunmadıysa hafif yeşil çerçeve efekti
          color: isRead ? Colors.transparent : const Color(0xFF4CAF50).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Okunmadı Noktası
          Container(
            margin: const EdgeInsets.only(top: 6, right: 12),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isRead ? Colors.transparent : const Color(0xFF4CAF50),
              shape: BoxShape.circle,
            ),
          ),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  notification['title'],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                    color: isRead ? textColor.withValues(alpha: 0.7) : textColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  notification['body'],
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor.withValues(alpha: 0.54),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatTime(notification['time'], l10n),
                      style: TextStyle(
                        fontSize: 12,
                        color: textColor.withValues(alpha: 0.24),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _removeNotification(notification['id']),
                      child: const Icon(
                        Icons.delete_outline,
                        color: Colors.redAccent,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String isoTime, AppLocalizations l10n) {
    try {
      final DateTime time = DateTime.parse(isoTime);
      final Duration diff = DateTime.now().difference(time);
      if (diff.inMinutes < 1) return l10n.translate('just_now');
      if (diff.inHours < 1) {
        return '${diff.inMinutes} ${l10n.translate('minutes_ago')}';
      }
      if (diff.inDays < 1) {
        return '${diff.inHours} ${l10n.translate('hours_ago')}';
      }
      return '${diff.inDays} ${l10n.translate('days_ago')}';
    } catch (e) {
      return isoTime;
    }
  }
}
