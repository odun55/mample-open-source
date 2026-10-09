import 'dart:async';
import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/fcm_service.dart';
import '../l10n/app_localizations.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'qr_scanner_screen.dart';
import 'notifications_sheet.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _cliSecretKey;
  String? _uid;
  StreamSubscription? _authSub;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final ScrollController _scrollController = ScrollController();
  
  // 0: Home, 1: Notifications, 2: Settings
  int _currentIndex = 0;

  // Animasyon state'leri
  bool _isCopied = false;
  double _terminalRefreshTurns = 0.0;
  double _devicesRefreshTurns = 0.0;
  bool _isRefreshingDevices = false;
  bool _isRefreshingTerminalData = false;

  @override
  void initState() {
    super.initState();
    _initSecretKey();
    if (!kIsWeb) {
      try {
        _authSub = FirebaseAuth.instance.authStateChanges().listen((user) {
          if (mounted) {
            setState(() {
              _uid = user?.uid ?? "offline";
            });
          }
        });
      } catch (e) {
        debugPrint("Auth Error: $e");
      }
    } else {
      _uid = "offline";
    }
  }

  @override
  void dispose() {
    _authSub?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  String _createSecretKey() {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    return 'mample-${bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join()}';
  }

  Future<void> _initSecretKey() async {
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
    try {
      await FCMService().init();
    } catch (e) {
      debugPrint("FCM Init Error: $e");
    }
    if (!mounted) return;
    setState(() {
      try {
        _uid = !kIsWeb ? FirebaseAuth.instance.currentUser?.uid ?? "offline" : "offline";
      } catch (e) {
        _uid = "offline";
      }
    });
  }

  Future<void> _generateNewSecretKey() async {
    const storage = FlutterSecureStorage();
    final previousKey = await storage.read(key: 'cli_secret_key');
    final newKey = _createSecretKey();
    await storage.write(key: 'cli_secret_key', value: newKey);
    try {
      await FCMService().init();
      if (mounted) setState(() => _cliSecretKey = newKey);
    } catch (error) {
      if (previousKey != null) {
        await storage.write(key: 'cli_secret_key', value: previousKey);
      }
      rethrow;
    }
  }

  Future<bool> _performRenewSecretKey() async {
    if (_isRefreshingTerminalData) return false;
    setState(() => _isRefreshingTerminalData = true);
    try {
      await _generateNewSecretKey();
      return true;
    } catch (error) {
      debugPrint('Secret key renewal failed: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).translate('connection_error'))));
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
        title: Text(l10n.translate('refresh_terminal'), style: TextStyle(color: textColor)),
        content: Text(
            l10n.translate('refresh_terminal_desc'),
            style: TextStyle(color: textColor.withValues(alpha: 0.7))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.translate('cancel'), style: TextStyle(color: textColor.withValues(alpha: 0.54))),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _performRenewSecretKey();
            },
            child: Text(l10n.translate('confirm'), style: const TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _cliSecretKey!));
    setState(() => _isCopied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isCopied = false);
    });
  }

  List<TextSpan> _buildColorfulKey(String key, Color primaryColor, Color normalColor) {
    List<TextSpan> spans = [];
    if (key.startsWith('mample-')) {
      spans.add(TextSpan(text: 'mample-', style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold)));
      key = key.substring(7);
    }
    
    bool isGreen = false;
    for (int i = 0; i < key.length; i += 3) {
      int end = (i + 3 < key.length) ? i + 3 : key.length;
      String chunk = key.substring(i, end);
      spans.add(TextSpan(
        text: chunk,
        style: TextStyle(color: isGreen ? primaryColor : normalColor, fontWeight: isGreen ? FontWeight.bold : FontWeight.normal),
      ));
      isGreen = !isGreen;
    }
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);

    Widget buildHomeBody() {
      if (_cliSecretKey == null) {
        return const Center(child: CircularProgressIndicator(color: Color(0xFF4CAF50)));
      }

      return CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        slivers: [
          SliverAppBar(
            backgroundColor: theme.scaffoldBackgroundColor.withValues(alpha: 0.85),
            expandedHeight: 270.0, // Artırıldı (Bottom overflow hatasını önlemek için)
            floating: true,
            pinned: false,
            elevation: 0,
            flexibleSpace: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 15.0, sigmaY: 15.0),
                child: FlexibleSpaceBar(
                  collapseMode: CollapseMode.parallax,
                  background: Padding(
                    padding: const EdgeInsets.only(left: 24.0, right: 24.0, top: 24.0, bottom: 16.0),
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
          
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: theme.cardColor,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.05), width: 1),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              )
                            ]
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(l10n.translate('terminal_tool'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: textColor.withValues(alpha: 0.54))),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () {
                                        showDialog(
                                          context: context,
                                          builder: (ctx) => AlertDialog(
                                            backgroundColor: theme.cardColor,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                            title: Text(l10n.translate('full_secret_key'), style: TextStyle(color: textColor)),
                                            content: SelectableText.rich(
                                              TextSpan(children: _buildColorfulKey(_cliSecretKey!, theme.primaryColor, textColor.withValues(alpha: 0.9))),
                                              style: const TextStyle(fontFamily: 'monospace', fontSize: 16),
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: () {
                                                  Clipboard.setData(ClipboardData(text: _cliSecretKey!));
                                                  setState(() => _isCopied = true);
                                                  Future.delayed(const Duration(seconds: 2), () {
                                                    if (mounted) setState(() => _isCopied = false);
                                                  });
                                                  Navigator.pop(ctx);
                                                },
                                                child: Text(l10n.translate('copy'), style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
                                              ),
                                              TextButton(
                                                onPressed: () => Navigator.pop(ctx),
                                                child: Text(l10n.translate('close'), style: TextStyle(color: textColor.withValues(alpha: 0.54))),
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                      child: _isRefreshingTerminalData
                                        ? const Align(
                                            alignment: Alignment.centerLeft,
                                            child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4CAF50)))
                                          )
                                        : Text(
                                          '${_cliSecretKey!.substring(0, min(16, _cliSecretKey!.length))}...',
                                          style: TextStyle(fontSize: 16, fontFamily: 'monospace', color: textColor, fontWeight: FontWeight.bold),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                    ),
                                  ),
                                  AnimatedRotation(
                                    turns: _terminalRefreshTurns,
                                    duration: const Duration(milliseconds: 500),
                                    curve: Curves.easeOutQuart,
                                    child: IconButton(
                                      icon: Icon(Icons.autorenew, color: textColor.withValues(alpha: 0.7), size: 22),
                                      onPressed: () {
                                        setState(() => _terminalRefreshTurns += 1.0);
                                        _renewSecretKey();
                                      },
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  AnimatedSwitcher(
                                    duration: const Duration(milliseconds: 300),
                                    transitionBuilder: (child, animation) => ScaleTransition(scale: animation, child: child),
                                    child: IconButton(
                                      key: ValueKey<bool>(_isCopied),
                                      icon: Icon(
                                        _isCopied ? Icons.check_circle_rounded : Icons.copy,
                                        color: _isCopied ? const Color(0xFF4CAF50) : theme.primaryColor,
                                        size: 22,
                                      ),
                                      onPressed: _isCopied ? null : _copyToClipboard,
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                    ),
                                  )
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
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
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: textColor.withValues(alpha: 0.54)),
                    ),
                    AnimatedRotation(
                      turns: _devicesRefreshTurns,
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeOutQuart,
                      child: IconButton(
                        icon: Icon(Icons.autorenew, color: textColor.withValues(alpha: 0.54), size: 22),
                        onPressed: () async {
                          setState(() {
                            _devicesRefreshTurns += 1.0;
                            _isRefreshingDevices = true;
                          });
                          await Future.delayed(const Duration(milliseconds: 600));
                          if (mounted) {
                            setState(() => _isRefreshingDevices = false);
                          }
                        },
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
              child: _uid == null 
                ? const Center(child: CircularProgressIndicator()) 
                : _buildActiveConnectionsList(),
            ),
          ),
          
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
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
          NotificationsSheet(onBack: () => setState(() => _currentIndex = 0), isActive: _currentIndex == 1), 
          SettingsScreen(
            onBack: () => setState(() => _currentIndex = 0),
            onResetData: _performRenewSecretKey,
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: _currentIndex == 0 ? FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) => const QRScannerScreen(),
              transitionsBuilder: (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0);
                const end = Offset.zero;
                const curve = Curves.easeOutQuart;
                var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                return SlideTransition(position: animation.drive(tween), child: child);
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
      ) : null,
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20.0, sigmaY: 20.0),
              child: Container(
                height: 70,
                decoration: BoxDecoration(
                  color: theme.cardColor.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: Icon(Icons.home_rounded, color: _currentIndex == 0 ? theme.primaryColor : textColor.withValues(alpha: 0.54), size: 28),
                      onPressed: () {
                        if (_currentIndex == 0) {
                          _scrollController.animateTo(0, duration: const Duration(milliseconds: 500), curve: Curves.easeOut);
                        } else {
                          setState(() => _currentIndex = 0);
                        }
                      },
                    ),
                    IconButton(
                      icon: Icon(Icons.notifications_none_rounded, color: _currentIndex == 1 ? theme.primaryColor : textColor.withValues(alpha: 0.54), size: 26),
                      onPressed: () {
                        setState(() => _currentIndex = 1);
                      },
                    ),
                    IconButton(
                      icon: Icon(Icons.settings_outlined, color: _currentIndex == 2 ? theme.primaryColor : textColor.withValues(alpha: 0.54), size: 26),
                      onPressed: () {
                        setState(() => _currentIndex = 2);
                      },
                    ),
                  ],
                ),
              ),
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

    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('connections')
          .where('uid', isEqualTo: _uid)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return Text(l10n.translate('error_occurred'));
        if (!snapshot.hasData || _isRefreshingDevices) return const Padding(padding: EdgeInsets.only(top: 40.0), child: Center(child: CircularProgressIndicator(color: Color(0xFF4CAF50))));

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
            final expiresAt = data['expires_at'] != null ? (data['expires_at'] as Timestamp).toDate() : null;
            final platform = data['platform']?.toString() ?? l10n.translate('unknown_device');

            return _ConnectionCard(
              key: ValueKey(doc.id),
              connectionId: doc.id,
              title: platform,
              expiresAt: expiresAt,
              onDelete: () async {
                try {
                  await FirebaseFirestore.instance.collection('connections').doc(doc.id).delete();
                } catch (error) {
                  debugPrint('Connection deletion failed: $error');
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.translate('connection_error'))));
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

  void _showRenameDialog(BuildContext context, String currentTitle, String connectionId) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);
    final controller = TextEditingController(text: currentTitle);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(l10n.translate('change_connection_name'), style: TextStyle(color: textColor)),
        content: TextField(
          controller: controller,
          style: TextStyle(color: textColor),
          decoration: InputDecoration(
            hintText: l10n.translate('new_name'),
            hintStyle: TextStyle(color: textColor.withValues(alpha: 0.5)),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: textColor.withValues(alpha: 0.3))),
            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: theme.primaryColor)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.translate('cancel'), style: TextStyle(color: textColor.withValues(alpha: 0.54))),
          ),
          TextButton(
            onPressed: () {
              final newName = controller.text.trim();
              if (newName.isNotEmpty && newName != currentTitle) {
                FirebaseFirestore.instance.collection('connections').doc(connectionId).update({
                  'platform': newName,
                });
              }
              Navigator.pop(ctx);
            },
            child: Text(l10n.translate('ok'), style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
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
        border: Border.all(color: Colors.white.withValues(alpha: 0.05), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ]
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
                )
              ]
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
                  icon: Icon(Icons.edit, size: 16, color: textColor.withValues(alpha: 0.5)),
                  padding: const EdgeInsets.only(left: 8),
                  constraints: const BoxConstraints(),
                  onPressed: () {
                    _showRenameDialog(context, widget.title, widget.connectionId);
                  },
                ),
              ],
            ),
          ),

          if (widget.expiresAt == null)
            Text(
              "∞",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: textColor.withValues(alpha: 0.7),
              ),
            )
          else
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
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: theme.cardColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  title: Text(l10n.translate('disconnect'), style: TextStyle(color: textColor)),
                  content: Text(l10n.translate('disconnect_desc'), style: TextStyle(color: textColor.withValues(alpha: 0.7))),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(l10n.translate('cancel'), style: TextStyle(color: textColor.withValues(alpha: 0.54))),
                    ),
                    TextButton(
                      onPressed: () {
                        widget.onDelete();
                        Navigator.pop(context);
                      },
                      child: Text(l10n.translate('disconnect'), style: const TextStyle(color: Colors.redAccent)),
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
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return SizedBox(
      height: height,
      child: child,
    );
  }

  @override
  bool shouldRebuild(covariant _StickyHeaderDelegate oldDelegate) {
    return oldDelegate.child != child || oldDelegate.height != height;
  }
}
