import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../providers/locale_provider.dart';
import '../services/diagnostics_service.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key, required this.onStart});
  final Future<void> Function() onStart;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _busy = false;

  Future<void> _start() async {
    setState(() => _busy = true);
    try {
      await widget.onStart();
    } catch (error, stack) {
      DiagnosticsService.record('Onboarding completion', error, stack);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context).translate('onboarding_error'),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 16, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Mample',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () async {
                            try {
                              await LocaleProvider.setLocale(
                                l10n.locale.languageCode == 'tr' ? 'en' : 'tr',
                              );
                            } catch (error, stack) {
                              DiagnosticsService.record(
                                'Onboarding language',
                                error,
                                stack,
                              );
                            }
                          },
                    child: Text(
                      l10n.locale.languageCode == 'tr' ? 'English' : 'Türkçe',
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  padding: const EdgeInsets.all(28),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: (constraints.maxHeight - 56).clamp(
                        0,
                        double.infinity,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: (constraints.maxWidth - 56)
                              .clamp(0.0, 420.0)
                              .toDouble(),
                          child: AspectRatio(
                            key: const ValueKey('onboarding-image'),
                            aspectRatio: 4 / 3,
                            child: Image.asset(
                              'assets/images/onboarding/03-benefits.png',
                              fit: BoxFit.contain,
                              excludeFromSemantics: true,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        Text(
                          l10n.translate('onboarding_title'),
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.8,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          l10n.translate('onboarding_body'),
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 17,
                            height: 1.5,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              child: FilledButton(
                onPressed: _busy ? null : _start,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                ),
                child: _busy
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        l10n.translate('onboarding_start'),
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
