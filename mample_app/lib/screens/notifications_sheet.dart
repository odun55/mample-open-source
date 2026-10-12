import 'dart:async';
import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/notification_history_store.dart';
import '../services/diagnostics_service.dart';

class NotificationsSheet extends StatefulWidget {
  final VoidCallback? onBack;
  final bool isActive;

  static const removalDuration = Duration(milliseconds: 320);
  const NotificationsSheet({super.key, this.onBack, this.isActive = true});

  @override
  State<NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends State<NotificationsSheet>
    with WidgetsBindingObserver {
  List<Map<String, dynamic>> _notifications = [];
  final Set<String> _removing = {};
  late final NotificationHistoryStore _store;
  bool _loadFailed = false;
  int _loadGeneration = 0;

  @override
  void initState() {
    super.initState();
    _store = NotificationHistoryStore.instance;
    _store.revision.addListener(_historyChanged);
    WidgetsBinding.instance.addObserver(this);
    _loadNotifications();
  }

  @override
  void dispose() {
    _store.revision.removeListener(_historyChanged);
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && widget.isActive) {
      _loadNotifications();
    }
  }

  void _historyChanged() {
    if (widget.isActive && _removing.isEmpty) unawaited(_loadNotifications());
  }

  @override
  void didUpdateWidget(NotificationsSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      _loadNotifications();
    }
  }

  Future<void> _loadNotifications() async {
    if (_removing.isNotEmpty) return;
    final generation = ++_loadGeneration;
    try {
      final notifications = await _store.load();
      if (!mounted || generation != _loadGeneration || _removing.isNotEmpty) {
        return;
      }
      setState(() {
        _notifications = notifications;
        _loadFailed = false;
      });
    } catch (error, stack) {
      unawaited(
        DiagnosticsService.record('Notification history loading', error, stack),
      );
      if (mounted && generation == _loadGeneration) {
        setState(() => _loadFailed = true);
      }
    }
  }

  Future<void> _deleteNotifications(Set<String> ids) async {
    ids = ids.difference(_removing);
    if (ids.isEmpty) return;
    setState(() => _removing.addAll(ids));
    final duration = MediaQuery.disableAnimationsOf(context)
        ? Duration.zero
        : NotificationsSheet.removalDuration;
    try {
      await Future.wait<void>([
        _store.removeIds(ids),
        Future<void>.delayed(duration),
      ]);
      if (!mounted) return;
      setState(
        () => _notifications.removeWhere((entry) => ids.contains(entry['id'])),
      );
    } catch (error, stack) {
      unawaited(
        DiagnosticsService.record(
          'Notification history deletion',
          error,
          stack,
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(
                context,
              ).translate('notification_delete_error'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _removing.removeAll(ids));
        if (_removing.isEmpty) await _loadNotifications();
      }
    }
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
              onPressed: _removing.isNotEmpty
                  ? null
                  : () => _deleteNotifications(
                      _notifications
                          .map((entry) => entry['id'] as String)
                          .toSet(),
                    ),
              child: Text(
                l10n.translate('clear_all'),
                style: const TextStyle(
                  color: Color(0xFF4CAF50),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: _loadFailed && _notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(l10n.translate('notification_load_error')),
                  TextButton(
                    onPressed: _loadNotifications,
                    child: Text(l10n.translate('retry')),
                  ),
                ],
              ),
            )
          : _notifications.isEmpty
          ? _buildEmptyState(textColor, l10n)
          : RefreshIndicator(
              onRefresh: _loadNotifications,
              color: const Color(0xFF6C63FF),
              child: ListView.builder(
                padding: const EdgeInsets.only(
                  left: 24.0,
                  right: 24.0,
                  bottom: 100.0,
                  top: 8.0,
                ),
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final notification = _notifications[index];
                  final id = notification['id'] as String;
                  return _SlidingNotification(
                    key: ValueKey('notification-$id'),
                    removing: _removing.contains(id),
                    onDelete: () => _deleteNotifications({id}),
                    builder: (onDelete) => _buildNotificationCard(
                      notification,
                      theme,
                      textColor,
                      l10n,
                      onDelete,
                    ),
                  );
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

  Widget _buildNotificationCard(
    Map<String, dynamic> notification,
    ThemeData theme,
    Color textColor,
    AppLocalizations l10n,
    VoidCallback? onDelete,
  ) {
    final isRead = notification['isRead'] == true;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor, // CLI kutusuyla aynı elevated gri
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          // Okunmadıysa hafif yeşil çerçeve efekti
          color: isRead
              ? Colors.transparent
              : const Color(0xFF4CAF50).withValues(alpha: 0.3),
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
                    color: isRead
                        ? textColor.withValues(alpha: 0.7)
                        : textColor,
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
                    IconButton(
                      onPressed: onDelete,
                      tooltip: l10n.translate('delete_notification'),
                      icon: const Icon(
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

/// A single animation path for a completed left swipe, trash and Clear All.
class _SlidingNotification extends StatefulWidget {
  const _SlidingNotification({
    super.key,
    required this.removing,
    required this.onDelete,
    required this.builder,
  });
  final bool removing;
  final VoidCallback onDelete;
  final Widget Function(VoidCallback? onDelete) builder;
  @override
  State<_SlidingNotification> createState() => _SlidingNotificationState();
}

class _SlidingNotificationState extends State<_SlidingNotification>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: NotificationsSheet.removalDuration,
    value: widget.removing ? 1 : 0,
  );
  late final Animation<Offset> _slide = Tween(
    begin: Offset.zero,
    end: const Offset(-1, 0),
  ).animate(_controller);
  late final Animation<double> _fade = Tween(
    begin: 1.0,
    end: 0.0,
  ).animate(_controller);
  late final Animation<double> _size = Tween(
    begin: 1.0,
    end: 0.0,
  ).chain(CurveTween(curve: const Interval(0.65, 1))).animate(_controller);

  @override
  void didUpdateWidget(_SlidingNotification oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.removing != oldWidget.removing) {
      _controller.animateTo(
        widget.removing ? 1 : 0,
        duration: MediaQuery.disableAnimationsOf(context)
            ? Duration.zero
            : NotificationsSheet.removalDuration,
        curve: widget.removing ? Curves.easeInCubic : Curves.easeOutCubic,
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) => GestureDetector(
      behavior: HitTestBehavior.opaque,
      onHorizontalDragUpdate: widget.removing
          ? null
          : (details) {
              _controller.value =
                  (_controller.value - details.delta.dx / constraints.maxWidth)
                      .clamp(0.0, 1.0);
            },
      onHorizontalDragEnd: widget.removing
          ? null
          : (details) {
              if (_controller.value >= 0.35 ||
                  (details.primaryVelocity ?? 0) < -600) {
                widget.onDelete();
              } else {
                _controller.animateBack(0, curve: Curves.easeOutCubic);
              }
            },
      onHorizontalDragCancel: widget.removing
          ? null
          : () => _controller.animateBack(0),
      child: SizeTransition(
        sizeFactor: _size,
        child: FadeTransition(
          opacity: _fade,
          child: SlideTransition(
            position: _slide,
            child: widget.builder(widget.removing ? null : widget.onDelete),
          ),
        ),
      ),
    ),
  );
}
