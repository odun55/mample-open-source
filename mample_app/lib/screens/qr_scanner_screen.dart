import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/cli_pairing_code.dart';
import '../l10n/app_localizations.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController();
  bool _isProcessing = false;
  bool _isSuccess = false;
  DateTime? _lastScanTime;

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _handleBarcode(BarcodeCapture capture) async {
    final l10n = AppLocalizations.of(context);

    if (_isProcessing || _isSuccess) return;

    // 3 saniyelik okuma bekleme süresi (debounce)
    if (_lastScanTime != null &&
        DateTime.now().difference(_lastScanTime!).inSeconds < 3)
      return;
    _lastScanTime = DateTime.now();

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? code = barcodes.first.rawValue;
    if (code == null || code.length < 10) return; // Geçersiz kod kontrolü

    setState(() {
      _isProcessing = true;
    });

    try {
      await _scannerController.stop();
      final uid = kIsWeb ? null : FirebaseAuth.instance.currentUser?.uid;
      // Web debug modunda Firebase'i atla
      if (!kIsWeb) {
        if (uid == null) {
          throw Exception(l10n.translate('user_session_not_found'));
        }

        final cliInvite = CLIPairingCode.parse(code);
        if (cliInvite != null) {
          const storage = FlutterSecureStorage();
          final secretKey = await storage.read(key: 'cli_secret_key');
          if (secretKey == null)
            throw const FormatException('Secret Key is unavailable');
          await FirebaseFunctions.instanceFor(
            region: 'europe-west1',
          ).httpsCallable('completeCLIPairing').call<Map<String, dynamic>>({
            'invite_id': cliInvite.id,
            'claim_token': cliInvite.token,
            'cli_secret_key': secretKey,
          });
        } else {
          // Only legacy extension UUIDs may reach the Firestore document path.
          if (!RegExp(
            r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
          ).hasMatch(code)) {
            throw const FormatException('Invalid Mample QR code');
          }
          await FirebaseFirestore.instance
              .collection('connections')
              .doc(code)
              .set({
                'uid': uid,
                'platform': l10n.translate('chrome_extension'),
                'created_at': FieldValue.serverTimestamp(),
                'expires_at': Timestamp.fromMillisecondsSinceEpoch(
                  DateTime.now().millisecondsSinceEpoch + (23 * 60 * 60 * 1000),
                ),
              });
        }
      }

      if (!mounted) return;

      setState(() {
        _isProcessing = false;
        _isSuccess = true;
      });

      // 2 saniye bekle ve ekranı kapat
      await Future.delayed(const Duration(milliseconds: 2000));
      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
      });
      await _scannerController.start();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${l10n.translate('connection_error')}${e.toString()}'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(l10n.translate('scan_code')),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor:
            Theme.of(context).textTheme.bodyLarge?.color ?? Colors.white,
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scannerController,
            onDetect: _handleBarcode,
          ),

          // Kamera Üzeri Tasarım (Köşeli Odak)
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(
                  color: Theme.of(context).primaryColor,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),

          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Text(
              l10n.translate('align_qr_code'),
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(backgroundColor: Colors.black54),
            ),
          ),

          if (_isProcessing)
            Container(
              color: Colors.black87,
              child: const Center(
                child: CircularProgressIndicator(color: Color(0xFF6C63FF)),
              ),
            ),

          if (_isSuccess)
            Container(
              color: Colors.black87,
              child: Center(
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.elasticOut,
                  builder: (context, scale, child) {
                    return Transform.scale(
                      scale: scale,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle,
                            color: Color(0xFF4CAF50),
                            size: 120,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            l10n.translate('pairing_successful'),
                            style: TextStyle(
                              color: Colors.white.withValues(
                                alpha: scale,
                              ), // Opaklık animasyonu
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}
