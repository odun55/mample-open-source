import 'dart:math';
import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/cli_secret_key.dart';

class SecretKeyCard extends StatefulWidget {
  const SecretKeyCard({
    super.key,
    required this.secretKey,
    required this.busy,
    required this.copied,
    required this.canRenew,
    required this.onCopy,
    required this.onRenew,
  });
  final String secretKey;
  final bool busy;
  final bool copied;
  final bool canRenew;
  final VoidCallback onCopy;
  final VoidCallback onRenew;

  @override
  State<SecretKeyCard> createState() => _SecretKeyCardState();
}

class _SecretKeyCardState extends State<SecretKeyCard> {
  bool _revealed = false;

  @override
  void didUpdateWidget(covariant SecretKeyCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.secretKey != widget.secretKey) _revealed = false;
  }

  List<TextSpan> _colorfulKey(String key, Color green, Color white) {
    final prefixLength = key.startsWith(CLISecretKey.prefix)
        ? CLISecretKey.prefix.length
        : 0;
    final spans = <TextSpan>[
      if (prefixLength > 0)
        TextSpan(
          text: key.substring(0, prefixLength),
          style: TextStyle(color: green, fontWeight: FontWeight.bold),
        ),
    ];
    for (var i = prefixLength; i < key.length; i += 3) {
      final isGreen = ((i - prefixLength) ~/ 3).isOdd;
      spans.add(
        TextSpan(
          text: key.substring(i, min(i + 3, key.length)),
          style: TextStyle(
            color: isGreen ? green : white,
            fontWeight: isGreen ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      );
    }
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    final prefixLength = widget.secretKey.startsWith(CLISecretKey.prefix)
        ? CLISecretKey.prefix.length
        : 0;
    final visibleLength = min(widget.secretKey.length, prefixLength + 3);
    final maskedKey =
        widget.secretKey.substring(0, visibleLength) +
        List.filled(widget.secretKey.length - visibleLength, '*').join();
    return Material(
      color: theme.cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.translate('secret_key'),
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        children: _colorfulKey(
                          _revealed ? widget.secretKey : maskedKey,
                          theme.primaryColor,
                          theme.textTheme.bodyLarge?.color ?? Colors.white,
                        ),
                      ),
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      semanticsLabel: _revealed
                          ? null
                          : l10n.translate('secret_key'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    tooltip: l10n.translate('secret_key'),
                    isSelected: _revealed,
                    onPressed: widget.busy
                        ? null
                        : () => setState(() => _revealed = !_revealed),
                    icon: Icon(
                      _revealed
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 20,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                FilledButton.icon(
                  onPressed: widget.busy || widget.copied
                      ? null
                      : widget.onCopy,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(112, 48),
                  ),
                  icon: Icon(
                    widget.copied ? Icons.check_rounded : Icons.copy_outlined,
                    size: 18,
                  ),
                  label: Text(
                    l10n.translate(widget.copied ? 'copied' : 'copy'),
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: widget.busy || !widget.canRenew
                      ? null
                      : widget.onRenew,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(112, 48),
                  ),
                  icon: widget.busy
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.autorenew_rounded, size: 18),
                  label: Text(
                    l10n.translate(widget.busy ? 'renewing_key' : 'renew_key'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
