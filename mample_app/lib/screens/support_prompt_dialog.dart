import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/engagement_prompt_service.dart';
import 'bug_report_dialog.dart';

Future<void> showSupportPrompt(
  BuildContext context,
  Uri uri,
  EngagementPromptService policy,
) async {
  final l10n = AppLocalizations.of(context);
  final choice = await showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      icon: const Icon(Icons.favorite_border, color: Color(0xFFFFD54F)),
      title: Text(l10n.translate('support_us')),
      content: Text(l10n.translate('support_prompt_description')),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, 'never'),
          child: Text(l10n.translate('dont_ask_again')),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(l10n.translate('not_now')),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, 'support'),
          child: Text(
            l10n.translate('buy_me_coffee'),
            style: const TextStyle(color: Color(0xFFFFD54F)),
          ),
        ),
      ],
    ),
  );
  if (choice == 'never' || choice == 'support') {
    await policy.disableSupportRequests();
  }
  if (choice == 'support' && context.mounted) {
    await openSupportLink(context, uri);
  }
}
