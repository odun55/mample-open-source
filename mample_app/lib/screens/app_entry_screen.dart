import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/diagnostics_service.dart';
import '../services/onboarding_service.dart';
import 'home_screen.dart';
import 'onboarding_screen.dart';

class AppEntryScreen extends StatefulWidget {
  const AppEntryScreen({super.key, required this.initializeBackend});
  final Future<void> Function() initializeBackend;

  @override
  State<AppEntryScreen> createState() => _AppEntryScreenState();
}

class _AppEntryScreenState extends State<AppEntryScreen> {
  bool? _showOnboarding;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _failed = false);
    try {
      final required = await OnboardingService.isRequired();
      if (mounted) setState(() => _showOnboarding = required);
    } catch (error, stack) {
      DiagnosticsService.record('Onboarding initialization', error, stack);
      if (mounted) setState(() => _failed = true);
    }
  }

  Future<void> _start() async {
    await OnboardingService.complete();
    if (mounted) setState(() => _showOnboarding = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_showOnboarding == true) {
      return OnboardingScreen(onStart: _start);
    }
    if (_showOnboarding == false) {
      return HomeScreen(initializeBackend: widget.initializeBackend);
    }
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: _failed
              ? Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        l10n.translate('onboarding_error'),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: _load,
                        child: Text(l10n.translate('onboarding_retry')),
                      ),
                    ],
                  ),
                )
              : const CircularProgressIndicator(),
        ),
      ),
    );
  }
}
