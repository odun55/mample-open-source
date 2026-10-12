import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/fcm_service.dart';
import '../services/cli_secret_key.dart';
import '../services/diagnostics_service.dart';
import '../services/firebase_error_message.dart';
import '../l10n/app_localizations.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'qr_scanner_screen.dart';
import 'notifications_sheet.dart';
import 'settings_screen.dart';
import 'support_prompt_dialog.dart';
import '../services/coffee_support.dart';
import '../services/engagement_prompt_service.dart';
import '../services/notification_history_store.dart';
import '../services/account_deletion_service.dart';
import '../widgets/secret_key_card.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:flutter/foundation.dart' show defaultTargetPlatform;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.initializeBackend});
  final Future<void> Function() initializeBackend;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _cliSecretKey;
  String? _uid;
  Object? _initializationError;
  Object? _lastDeviceError;
  StreamSubscription? _authSub;
  Stream<QuerySnapshot>? _connections;
  Query<Map<String, dynamic>>? _connectionsQuery;
  Timer? _promptTimer;
  EngagementPromptService? _promptPolicy;
  bool _sessionReady = false;
  bool _initializing = false;
  String? _deletionState;
  bool _deleting = false;
  final Set<int> _visitedTabs = {0};
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final ScrollController _scrollController = ScrollController();

  // 0: Home, 1: Notifications, 2: Settings
  int _currentIndex = 0;

  // Animasyon state'leri
  bool _isCopied = false;
  double _devicesRefreshTurns = 0.0;
  bool _isRefreshingDevices = false;
  bool _isRefreshingTerminalData = false;

  @override
  void initState() {
    super.initState();
    _initializeSession();
  }

  @override
  void dispose() {
    _authSub?.cancel();
    _promptTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  String _createSecretKey() {
    return CLISecretKey.generate();
  }

  Future<void> _loadSecretKey() async {
    const secureStorage = FlutterSecureStorage();
    String? key = await secureStorage.read(key: 'cli_secret_key');

    if (key == null) {
      key = _createSecretKey();
      await secureStorage.write(key: 'cli_secret_key', value: key);
    }

    if (!mounted) return;
    setState(() {
      _cliSecretKey = key;
    });
  }

  void _setUser(String? uid) {
    if (!mounted || uid == _uid) return;
    setState(() {
      _uid = uid;
      _lastDeviceError = null;
      _connectionsQuery = uid == null || kIsWeb
          ? null
          : FirebaseFirestore.instance
                .collection('connections')
                .where('uid', isEqualTo: uid);
      _connections = _connectionsQuery?.snapshots();
    });
  }

  Future<void> _prepareBackend() async {
    await widget.initializeBackend();
    if (!mounted) return;
    if (kIsWeb) {
      _setUser('offline');
    } else {
      _authSub ??= FirebaseAuth.instance.authStateChanges().listen(
        (user) => _setUser(user?.uid),
      );
      _setUser(FirebaseAuth.instance.currentUser?.uid);
    }
  }

  Future<void> _initializeSession() async {
    if (_initializing) return;
    _initializing = true;
    final timer = Stopwatch()..start();
    if (mounted) {
      setState(() {
        _initializationError = null;
        _sessionReady = false;
      });
    }
    try {
      _deletionState = await AccountDeletionService.state();
      if (_deletionState != null) {
        if (_deletionState == 'deleted') {
          if (mounted) setState(() {});
          return;
        }
        await _prepareBackend();
        if (mounted) setState(() {});
        if (_deletionState != 'deleted') await _deleteAccount();
        return;
      }
      await Future.wait<void>([_loadSecretKey(), _prepareBackend()]);
      if (!mounted) return;
      await FCMService().init(secretKey: _cliSecretKey);
      if (!mounted) return;
      setState(() => _sessionReady = true);
      if (!kIsWeb) unawaited(_beginEngagementSession());
      _promptTimer ??= Timer(const Duration(seconds: 30), _maybePrompt);
    } catch (error, stack) {
      unawaited(
        DiagnosticsService.record('Session initialization', error, stack),
      );
      if (mounted) setState(() => _initializationError = error);
    } finally {
      _initializing = false;
      debugPrint(
        'Startup: notification session ${timer.elapsedMilliseconds}ms',
      );
    }
  }

  Future<void> _beginEngagementSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _promptPolicy = EngagementPromptService(prefs);
      await _promptPolicy!.beginSession();
    } catch (error, stack) {
      unawaited(
        DiagnosticsService.record('Engagement preferences', error, stack),
      );
    }
  }

  Future<void> _deleteAccount() async {
    if (_deleting || _isRefreshingTerminalData) return;
    _promptTimer?.cancel();
    _promptTimer = null;
    setState(() {
      _deleting = true;
      _sessionReady = false;
      _deletionState = 'pending';
    });
    try {
      await AccountDeletionService.delete();
      if (mounted) {
        setState(() {
          _deletionState = 'deleted';
          _cliSecretKey = null;
          _promptPolicy = null;
        });
      }
    } catch (error, stack) {
      await DiagnosticsService.record('Account deletion', error, stack);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context).translate('delete_account_error'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  Future<void> _startAgain() async {
    try {
      await AccountDeletionService.startAgain();
      if (!mounted) return;
      setState(() {
        _deletionState = null;
        _currentIndex = 0;
        _visitedTabs.clear();
        _visitedTabs.add(0);
      });
      await _initializeSession();
    } catch (error, stack) {
      await DiagnosticsService.record(
        'Restart after account deletion',
        error,
        stack,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context).translate('connection_error'),
            ),
          ),
        );
      }
    }
  }

  bool get _canPrompt =>
      mounted &&
      _sessionReady &&
      _currentIndex == 0 &&
      !_isRefreshingTerminalData &&
      !_isRefreshingDevices &&
      WidgetsBinding.instance.lifecycleState == AppLifecycleState.resumed &&
      (ModalRoute.of(context)?.isCurrent ?? false);

  Future<void> _maybePrompt() async {
    if (!_canPrompt || _promptPolicy == null) return;
    try {
      final policy = _promptPolicy!;
      await policy.prefs.reload();
      final uri = coffeeSupportUri;
      final usage = await NotificationHistoryStore.instance.usage();
      // Avoid calling the platform at all unless a review could be due.
      final reviewDue =
          policy.eligible(
            reviewAvailable: true,
            supportAvailable: uri != null,
            usage: usage,
          ) ==
          EngagementPrompt.review;
      final reviewAvailable =
          reviewDue &&
          defaultTargetPlatform == TargetPlatform.android &&
          await InAppReview.instance.isAvailable();
      final kind = policy.eligible(
        reviewAvailable: reviewAvailable,
        supportAvailable: uri != null,
        usage: usage,
      );
      if (!mounted || !_canPrompt || kind == null) return;
      await policy.recordRequest(kind);
      if (!mounted || !_canPrompt) return;
      if (kind == EngagementPrompt.review) {
        await InAppReview.instance.requestReview();
      } else {
        await showSupportPrompt(context, uri!, policy);
      }
    } catch (error, stack) {
      unawaited(DiagnosticsService.record('Engagement request', error, stack));
    }
  }

  void _selectTab(int index) {
    if (index == 0 && _currentIndex == 0 && _scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
      return;
    }
    setState(() {
      _visitedTabs.add(index);
      _currentIndex = index;
    });
  }

  Future<void> _refreshConnections() async {
    final query = _connectionsQuery;
    if (query == null || _isRefreshingDevices) return;
    setState(() {
      _devicesRefreshTurns += 1;
      _isRefreshingDevices = true;
    });
    try {
      await query
          .get(const GetOptions(source: Source.server))
          .timeout(const Duration(seconds: 15));
      if (mounted &&
          identical(query, _connectionsQuery) &&
          _lastDeviceError != null) {
        setState(() {
          _lastDeviceError = null;
          _connections = query.snapshots();
        });
      }
    } catch (error, stack) {
      unawaited(
        DiagnosticsService.record('Connected devices refresh', error, stack),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              firebaseErrorMessage(error, AppLocalizations.of(context)),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isRefreshingDevices = false);
    }
  }

  Future<void> _generateNewSecretKey() async {
    const storage = FlutterSecureStorage();
    final previousKey = await storage.read(key: 'cli_secret_key');
    final newKey = _createSecretKey();
    await storage.write(key: 'cli_secret_key', value: newKey);
    try {
      await FCMService().init(secretKey: newKey);
      if (mounted) setState(() => _cliSecretKey = newKey);
    } catch (error, stack) {
      DiagnosticsService.record('Connection operation', error, stack);
      if (previousKey != null) {
        await storage.write(key: 'cli_secret_key', value: previousKey);
      }
      rethrow;
    }
  }

  Future<bool> _performRenewSecretKey() async {
    if (_isRefreshingTerminalData) return false;
    if (!_sessionReady) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context).translate('session_initializing'),
          ),
        ),
      );
      return false;
    }
    setState(() => _isRefreshingTerminalData = true);
    try {
      await _generateNewSecretKey();
      return true;
    } catch (error, stack) {
      DiagnosticsService.record('Connection operation', error, stack);
      debugPrint('Secret key renewal failed: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context).translate('connection_error'),
            ),
          ),
        );
      }
      return false;
    } finally {
      if (mounted) setState(() => _isRefreshingTerminalData = false);
    }
  }

  void _renewSecretKey() {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: theme.cardColor,
        title: Text(
          l10n.translate('renew_secret_key'),
          style: TextStyle(color: textColor),
        ),
        content: Text(
          l10n.translate('renew_secret_key_desc'),
          style: TextStyle(color: textColor.withValues(alpha: 0.7)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              l10n.translate('cancel'),
              style: TextStyle(color: textColor.withValues(alpha: 0.54)),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _performRenewSecretKey();
            },
            child: Text(
              l10n.translate('confirm'),
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _cliSecretKey!));
    setState(() => _isCopied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          AppLocalizations.of(context).translate('copied_secret_key'),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isCopied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    Widget buildHomeBody() {
      if (_cliSecretKey == null) {
        return Center(
          child: _initializationError == null
              ? const CircularProgressIndicator(color: Color(0xFF4CAF50))
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      l10n.translate('startup_error'),
                      textAlign: TextAlign.center,
                    ),
                    TextButton(
                      onPressed: _initializeSession,
                      child: Text(l10n.translate('retry')),
                    ),
                  ],
                ),
        );
      }

      return CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(
                left: 24.0,
                right: 24.0,
                top: 24.0,
                bottom: 16.0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Image.asset(
                            'assets/images/logo.png',
                            width: 40,
                            height: 40,
                            fit: BoxFit.cover,
                            filterQuality: FilterQuality.high,
                            isAntiAlias: true,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Mample',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  SecretKeyCard(
                    secretKey: _cliSecretKey!,
                    busy: _isRefreshingTerminalData,
                    copied: _isCopied,
                    canRenew: _sessionReady,
                    onCopy: _copyToClipboard,
                    onRenew: _renewSecretKey,
                  ),
                ],
              ),
            ),
          ),

          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyHeaderDelegate(
              height: 64.0,
              child: Container(
                color: theme.scaffoldBackgroundColor,
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.translate('connected_devices'),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: textColor.withValues(alpha: 0.54),
                      ),
                    ),
                    AnimatedRotation(
                      turns: _devicesRefreshTurns,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeOutQuart,
                      child: IconButton(
                        tooltip: l10n.translate('refresh_devices'),
                        icon: Icon(
                          Icons.autorenew,
                          color: textColor.withValues(alpha: 0.54),
                          size: 22,
                        ),
                        onPressed:
                            _isRefreshingDevices || _connectionsQuery == null
                            ? null
                            : _refreshConnections,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Container(
              color: Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: _buildActiveConnectionsList(),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      );
    }

    if (_deletionState != null) {
      final deleted = _deletionState == 'deleted';
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    l10n.translate(
                      deleted ? 'account_deleted' : 'account_deletion_pending',
                    ),
                    textAlign: TextAlign.center,
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    l10n.translate(
                      deleted
                          ? 'account_deleted_desc'
                          : 'account_deletion_pending_desc',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  if (_deleting)
                    const CircularProgressIndicator()
                  else
                    ElevatedButton(
                      onPressed: deleted ? _startAgain : _deleteAccount,
                      child: Text(
                        l10n.translate(deleted ? 'start_again' : 'retry'),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      key: _scaffoldKey,
      extendBody: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      body: IndexedStack(
        index: _currentIndex,
        children: [
          SafeArea(child: buildHomeBody()),
          if (_visitedTabs.contains(1))
            NotificationsSheet(
              onBack: () => _selectTab(0),
              isActive: _currentIndex == 1,
            )
          else
            const SizedBox.shrink(),
          if (_visitedTabs.contains(2))
            SettingsScreen(
              onBack: () => setState(() => _currentIndex = 0),
              onDeleteAccount: _sessionReady ? _deleteAccount : null,
            )
          else
            const SizedBox.shrink(),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              tooltip: l10n.translate('scan_code'),
              onPressed: !_sessionReady
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        PageRouteBuilder(
                          pageBuilder:
                              (context, animation, secondaryAnimation) =>
                                  const QRScannerScreen(),
                          transitionsBuilder:
                              (context, animation, secondaryAnimation, child) {
                                const begin = Offset(1.0, 0.0);
                                const end = Offset.zero;
                                const curve = Curves.easeOutQuart;
                                var tween = Tween(
                                  begin: begin,
                                  end: end,
                                ).chain(CurveTween(curve: curve));
                                return SlideTransition(
                                  position: animation.drive(tween),
                                  child: child,
                                );
                              },
                        ),
                      );
                    },
              backgroundColor: theme.primaryColor,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(Icons.qr_code_scanner, size: 28),
            )
          : null,
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: _selectTab,
              backgroundColor: theme.cardColor,
              indicatorColor: theme.primaryColor.withValues(alpha: 0.16),
              elevation: 0,
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              destinations: [
                NavigationDestination(
                  icon: const Icon(Icons.home_outlined),
                  selectedIcon: const Icon(Icons.home_rounded),
                  label: l10n.translate('home'),
                ),
                NavigationDestination(
                  icon: const Icon(Icons.notifications_none_rounded),
                  selectedIcon: const Icon(Icons.notifications_rounded),
                  label: l10n.translate('notifications'),
                ),
                NavigationDestination(
                  icon: const Icon(Icons.settings_outlined),
                  selectedIcon: const Icon(Icons.settings_rounded),
                  label: l10n.translate('settings'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActiveConnectionsList() {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    if (kIsWeb) {
      return Center(
        child: Text(
          l10n.translate('web_mode_disabled'),
          style: TextStyle(color: textColor.withValues(alpha: 0.5)),
        ),
      );
    }

    if (_initializationError != null || _uid == null) {
      return Padding(
        padding: const EdgeInsets.only(top: 40),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _initializationError == null
                    ? l10n.translate('session_initializing')
                    : firebaseErrorMessage(_initializationError, l10n),
                textAlign: TextAlign.center,
              ),
              if (_initializationError != null)
                TextButton(
                  onPressed: _initializeSession,
                  child: Text(l10n.translate('retry')),
                ),
            ],
          ),
        ),
      );
    }

    return StreamBuilder<QuerySnapshot>(
      stream: _connections,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          if (!identical(_lastDeviceError, snapshot.error)) {
            _lastDeviceError = snapshot.error;
            DiagnosticsService.record(
              'Connected devices',
              snapshot.error!,
              snapshot.stackTrace,
            );
          }
          return Padding(
            padding: const EdgeInsets.only(top: 40),
            child: Text(
              firebaseErrorMessage(snapshot.error, l10n),
              textAlign: TextAlign.center,
            ),
          );
        }
        if (!snapshot.hasData) {
          return const Padding(
            padding: EdgeInsets.only(top: 40.0),
            child: Center(
              child: CircularProgressIndicator(color: Color(0xFF4CAF50)),
            ),
          );
        }

        _lastDeviceError = null;
        final docs = snapshot.data!.docs;

        final activeDocs = docs.where((doc) {
          final data = doc.data() as Map<String, dynamic>;
          if (data['expires_at'] == null) return true;
          final expiresAt = (data['expires_at'] as Timestamp).toDate();
          return expiresAt.isAfter(DateTime.now());
        }).toList();

        if (activeDocs.isEmpty) {
          return Padding(
            padding: const EdgeInsets.only(top: 40.0),
            child: Align(
              alignment: Alignment.topCenter,
              child: Text(
                l10n.translate('no_active_devices'),
                style: TextStyle(color: textColor.withValues(alpha: 0.5)),
              ),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: activeDocs.length,
          itemBuilder: (context, index) {
            final doc = activeDocs[index];
            final data = doc.data() as Map<String, dynamic>;
            final expiresAt = data['expires_at'] != null
                ? (data['expires_at'] as Timestamp).toDate()
                : null;
            final platform =
                data['platform']?.toString() ??
                l10n.translate('unknown_device');

            return _ConnectionCard(
              key: ValueKey(doc.id),
              connectionId: doc.id,
              title: platform,
              expiresAt: expiresAt,
              onDelete: () async {
                try {
                  await FirebaseFirestore.instance
                      .collection('connections')
                      .doc(doc.id)
                      .delete();
                } catch (error, stack) {
                  DiagnosticsService.record(
                    'Connection operation',
                    error,
                    stack,
                  );
                  debugPrint('Connection deletion failed: $error');
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n.translate('connection_error'))),
                  );
                }
              },
            );
          },
        );
      },
    );
  }
}

class _ConnectionCard extends StatefulWidget {
  final String connectionId;
  final DateTime? expiresAt;
  final VoidCallback onDelete;
  final String title;

  const _ConnectionCard({
    super.key,
    required this.connectionId,
    required this.expiresAt,
    required this.onDelete,
    required this.title,
  });

  @override
  State<_ConnectionCard> createState() => _ConnectionCardState();
}

class _ConnectionCardState extends State<_ConnectionCard> {
  Timer? _timer;
  bool _expired = false;
  Duration _timeLeft = Duration.zero;

  @override
  void initState() {
    super.initState();
    if (widget.expiresAt == null) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _updateTimeLeft();
    });
    _updateTimeLeft();
  }

  void _updateTimeLeft() {
    if (!mounted || widget.expiresAt == null || _expired) return;

    final now = DateTime.now();
    if (widget.expiresAt!.isAfter(now)) {
      setState(() {
        _timeLeft = widget.expiresAt!.difference(now);
      });
    } else {
      _expired = true;
      _timer?.cancel();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) widget.onDelete();
      });
    }
  }

  void _showRenameDialog(
    BuildContext context,
    String currentTitle,
    String connectionId,
  ) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);
    final controller = TextEditingController(text: currentTitle);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          l10n.translate('change_connection_name'),
          style: TextStyle(color: textColor),
        ),
        content: TextField(
          controller: controller,
          style: TextStyle(color: textColor),
          decoration: InputDecoration(
            hintText: l10n.translate('new_name'),
            hintStyle: TextStyle(color: textColor.withValues(alpha: 0.5)),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: textColor.withValues(alpha: 0.3)),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: theme.primaryColor),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              l10n.translate('cancel'),
              style: TextStyle(color: textColor.withValues(alpha: 0.54)),
            ),
          ),
          TextButton(
            onPressed: () {
              final newName = controller.text.trim();
              if (newName.isNotEmpty && newName != currentTitle) {
                FirebaseFirestore.instance
                    .collection('connections')
                    .doc(connectionId)
                    .update({'platform': newName});
              }
              Navigator.pop(ctx);
            },
            child: Text(
              l10n.translate('ok'),
              style: TextStyle(
                color: theme.primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration duration, BuildContext context) {
    final l10n = AppLocalizations.of(context);
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String hours = twoDigits(duration.inHours);
    String minutes = twoDigits(duration.inMinutes.remainder(60));
    String seconds = twoDigits(duration.inSeconds.remainder(60));

    if (duration.inHours > 0) {
      return "$hours ${l10n.translate('hr_short')} $minutes ${l10n.translate('min_short')}";
    }
    return "$minutes ${l10n.translate('min_short')} $seconds ${l10n.translate('sec_short')}";
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.05),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: theme.primaryColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: theme.primaryColor.withValues(alpha: 0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),

          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    widget.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.edit,
                    size: 16,
                    color: textColor.withValues(alpha: 0.5),
                  ),
                  padding: const EdgeInsets.only(left: 8),
                  constraints: const BoxConstraints(),
                  tooltip: l10n.translate('change_connection_name'),
                  onPressed: () {
                    _showRenameDialog(
                      context,
                      widget.title,
                      widget.connectionId,
                    );
                  },
                ),
              ],
            ),
          ),

          if (widget.expiresAt != null)
            Text(
              _formatDuration(_timeLeft, context),
              style: TextStyle(
                fontSize: 12,
                color: textColor.withValues(alpha: 0.7),
              ),
            ),

          const SizedBox(width: 8),

          IconButton(
            icon: const Icon(Icons.link_off, color: Colors.redAccent),
            tooltip: l10n.translate('disconnect'),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: theme.cardColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  title: Text(
                    l10n.translate('disconnect'),
                    style: TextStyle(color: textColor),
                  ),
                  content: Text(
                    l10n.translate('disconnect_desc'),
                    style: TextStyle(color: textColor.withValues(alpha: 0.7)),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        l10n.translate('cancel'),
                        style: TextStyle(
                          color: textColor.withValues(alpha: 0.54),
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        widget.onDelete();
                        Navigator.pop(context);
                      },
                      child: Text(
                        l10n.translate('disconnect'),
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// CustomScrollView için yapışkan (sticky) header
class _StickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double height;

  _StickyHeaderDelegate({required this.child, required this.height});

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return SizedBox(height: height, child: child);
  }

  @override
  bool shouldRebuild(covariant _StickyHeaderDelegate oldDelegate) {
    return oldDelegate.child != child || oldDelegate.height != height;
  }
}
