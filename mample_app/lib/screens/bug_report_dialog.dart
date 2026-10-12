import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../l10n/app_localizations.dart';
import '../services/diagnostics_service.dart';

const supportEmail = 'odun.coop@gmail.com';

Uri supportEmailUri({String subject = 'Mample Support', String? body}) => Uri(
  scheme: 'mailto',
  path: supportEmail,
  query: {'subject': subject, if (body != null) 'body': body}.entries
      .map(
        (entry) =>
            '${Uri.encodeComponent(entry.key)}=${Uri.encodeComponent(entry.value)}',
      )
      .join('&'),
);

Future<void> openSupportLink(BuildContext context, Uri uri) async {
  var opened = false;
  try {
    opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {}
  if (!opened && context.mounted) {
    final l10n = AppLocalizations.of(context);
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        content: Text(
          l10n.translate(
            uri.scheme == 'mailto' ? 'email_unavailable' : 'link_unavailable',
          ),
        ),
        actions: [
          TextButton(
            child: Text(l10n.translate('copy')),
            onPressed: () async {
              await Clipboard.setData(
                ClipboardData(
                  text: uri.scheme == 'mailto' ? supportEmail : uri.toString(),
                ),
              );
              if (dialogContext.mounted) Navigator.pop(dialogContext);
            },
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(l10n.translate('close')),
          ),
        ],
      ),
    );
  }
}

Future<void> showBugReportDialog(BuildContext context) async {
  final report = await DiagnosticsService.latestReport();
  if (!context.mounted) return;
  final l10n = AppLocalizations.of(context);
  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(l10n.translate('bug_report')),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: SelectableText(report ?? l10n.translate('no_error_report')),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(dialogContext),
          child: Text(l10n.translate('close')),
        ),
        if (report != null)
          TextButton(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: report));
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.translate('copied'))),
                );
              }
            },
            child: Text(l10n.translate('copy')),
          ),
        TextButton(
          onPressed: () => openSupportLink(
            context,
            supportEmailUri(subject: 'Mample Bug Report', body: report),
          ),
          child: Text(l10n.translate('email')),
        ),
      ],
    ),
  );
}
