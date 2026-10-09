// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../providers/locale_provider.dart';
import '../l10n/app_localizations.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SettingsScreen extends StatefulWidget {
  final VoidCallback? onBack;
  final Future<bool> Function()? onResetData;
  
  const SettingsScreen({super.key, this.onBack, this.onResetData});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
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
          l10n.translate('settings'),
          style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
        ),
        iconTheme: IconThemeData(color: textColor),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 100), 
        children: [
          const SizedBox(height: 8),

          // 1. Language Settings
          ValueListenableBuilder<Locale>(
            valueListenable: localeNotifier,
            builder: (context, currentLocale, child) {
              final langName = currentLocale.languageCode == 'tr' ? 'Türkçe' : 'English';
              return _buildListTile(
                context: context,
                icon: Icons.language,
                title: l10n.translate('language'),
                subtitle: langName,
                onTap: () {
                  _showLanguageDialog(context, currentLocale);
                },
              );
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 2. Notification Settings
          _buildListTile(
            context: context,
            icon: Icons.message,
            title: l10n.translate('default_notif_message'),
            subtitle: l10n.translate('default_notif_message_desc'),
            onTap: () {
              _showDefaultMessageDialog(context);
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 4. Help & Support: How it works
          _buildListTile(
            context: context,
            icon: Icons.help_outline_rounded,
            title: l10n.translate('how_it_works'),
            subtitle: 'mample.vercel.app',
            onTap: () {
              launchUrl(Uri.parse('https://mample.vercel.app'));
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 5. Help & Support: Contact
          _buildListTile(
            context: context,
            icon: Icons.feedback_outlined,
            title: l10n.translate('contact_us'),
            subtitle: l10n.translate('feedback_and_support'),
            onTap: () {
              _showContactDialog(context);
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 6. Help & Support: Bug Report
          _buildListTile(
            context: context,
            icon: Icons.bug_report_outlined,
            title: l10n.translate('bug_report'),
            subtitle: l10n.translate('report_a_bug'),
            onTap: () {
              final Uri emailLaunchUri = Uri(
                scheme: 'mailto',
                path: 'odun.coop@gmail.com',
                queryParameters: {
                  'subject': 'Mample Bug Report',
                },
              );
              launchUrl(emailLaunchUri);
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 7. Danger Zone
          _buildListTile(
            context: context,
            icon: Icons.delete_forever,
            title: l10n.translate('reset_data'),
            subtitle: l10n.translate('reset_data_desc'),
            iconColor: Colors.redAccent,
            titleColor: Colors.redAccent,
            onTap: () {
              _showResetWarningDialog(context);
            },
          ),
          Divider(color: theme.dividerColor, height: 1),

          // 8. About
          _buildListTile(
            context: context,
            icon: Icons.info_outline,
            title: l10n.translate('mample_version'),
            subtitle: 'v1.0.0',
            onTap: () {
              _showSimpleDialog(context, l10n.translate('about'), l10n.translate('mample_up_to_date'));
            },
          ),
          Divider(color: theme.dividerColor, height: 1),
        ],
      ),
    );
  }

  void _showSimpleDialog(BuildContext context, String title, String content) {
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(title, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color)),
        content: Text(content, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color?.withValues(alpha: 0.7))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.translate('ok'), style: const TextStyle(color: Color(0xFF4CAF50))),
          ),
        ],
      ),
    );
  }

  void _showDefaultMessageDialog(BuildContext context) async {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);
    final uid = FirebaseAuth.instance.currentUser?.uid;
    
    if (uid == null) return;
    
    String defaultMessage = 'Task completed!';
    bool showConnectionName = true;
    
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
      if (doc.exists) {
        final data = doc.data() as Map<String, dynamic>;
        if (data.containsKey('default_message')) defaultMessage = data['default_message'];
        if (data.containsKey('show_connection_name')) showConnectionName = data['show_connection_name'];
      }
    } catch (e) {
      debugPrint("Error fetching user settings: $e");
    }

    if (!context.mounted) return;

    final controller = TextEditingController(text: defaultMessage);

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            backgroundColor: theme.cardColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Text(l10n.translate('default_notif_message'), style: TextStyle(color: textColor)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller,
                  style: TextStyle(color: textColor),
                  decoration: InputDecoration(
                    hintText: l10n.translate('default_message_placeholder'),
                    hintStyle: TextStyle(color: textColor.withValues(alpha: 0.5)),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: textColor.withValues(alpha: 0.3))),
                    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: theme.primaryColor)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(l10n.translate('show_connection_name'), style: TextStyle(color: textColor)),
                    Switch(
                      value: showConnectionName,
                      activeThumbColor: theme.primaryColor,
                      onChanged: (val) {
                        setState(() {
                          showConnectionName = val;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(l10n.translate('cancel'), style: TextStyle(color: textColor.withValues(alpha: 0.54))),
              ),
              TextButton(
                onPressed: () async {
                  try {
                    await FirebaseFirestore.instance.collection('users').doc(uid).set({
                      'default_message': controller.text.trim(),
                      'show_connection_name': showConnectionName,
                    }, SetOptions(merge: true));
                  } catch (e) {
                    debugPrint("Error saving settings: $e");
                  }
                  if (ctx.mounted) Navigator.pop(ctx);
                },
                child: Text(l10n.translate('ok'), style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        }
      ),
    );
  }



  void _showLanguageDialog(BuildContext context, Locale currentLocale) {
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(l10n.translate('language_selection'), style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: Text('English', style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color)),
              value: 'en',
              groupValue: currentLocale.languageCode,
              activeColor: Theme.of(context).primaryColor,
              onChanged: (val) {
                if (val != null) LocaleProvider.setLocale(val);
                Navigator.pop(ctx);
              },
            ),
            RadioListTile<String>(
              title: Text('Türkçe', style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color)),
              value: 'tr',
              groupValue: currentLocale.languageCode,
              activeColor: Theme.of(context).primaryColor,
              onChanged: (val) {
                if (val != null) LocaleProvider.setLocale(val);
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }



  void _showContactDialog(BuildContext context) {
    final theme = Theme.of(context);
    final textColor = theme.textTheme.bodyLarge?.color ?? Colors.white;
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(l10n.translate('contact_us'), style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.email, color: textColor),
              title: Text(l10n.translate('email'), style: TextStyle(color: textColor)),
              onTap: () async {
                final uid = FirebaseAuth.instance.currentUser?.uid ?? 'Unknown';
                final Uri emailLaunchUri = Uri(
                  scheme: 'mailto',
                  path: 'odun.coop@gmail.com',
                  query: 'subject=Mample Support (ID: $uid)',
                );
                launchUrl(emailLaunchUri);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: Icon(Icons.link, color: textColor),
              title: Text(l10n.translate('website'), style: TextStyle(color: textColor)),
              onTap: () async {
                final Uri url = Uri.parse('https://mample.vercel.app');
                launchUrl(url, mode: LaunchMode.externalApplication);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: FaIcon(FontAwesomeIcons.xTwitter, color: textColor, size: 22),
              title: Text(l10n.translate('twitter'), style: TextStyle(color: textColor)),
              onTap: () async {
                final Uri url = Uri.parse('https://twitter.com/mampleapp');
                launchUrl(url, mode: LaunchMode.externalApplication);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: FaIcon(FontAwesomeIcons.linkedinIn, color: textColor, size: 22),
              title: Text(l10n.translate('linkedin'), style: TextStyle(color: textColor)),
              onTap: () async {
                final Uri url = Uri.parse('https://linkedin.com/company/mample');
                launchUrl(url, mode: LaunchMode.externalApplication);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: FaIcon(FontAwesomeIcons.threads, color: textColor, size: 22),
              title: Text('Threads', style: TextStyle(color: textColor)),
              onTap: () {}, // Şimdilik hiçbir işe yaramıyor
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(AppLocalizations.of(context).translate('close'), style: TextStyle(color: textColor.withValues(alpha: 0.5))),
          ),
        ],
      ),
    );
  }

  void _showResetWarningDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(l10n.translate('reset_data'), style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
        content: Text(
          l10n.translate('reset_warning'),
          style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.translate('cancel'), style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color?.withValues(alpha: 0.5))),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                final uid = FirebaseAuth.instance.currentUser?.uid;
                if (uid != null) {
                  final snapshot = await FirebaseFirestore.instance.collection('connections').where('uid', isEqualTo: uid).get();
                  for (final doc in snapshot.docs) {
                    await doc.reference.delete();
                  }
                }
                final resetKey = widget.onResetData;
                if (resetKey == null || !await resetKey()) return;
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('mample_notifications');
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.translate('data_reset_success'))));
              } catch (error) {
                debugPrint('Data reset failed: $error');
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.translate('connection_error'))));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
            ),
            child: Text(l10n.translate('yes_reset')),
          ),
        ],
      ),
    );
  }

  Widget _buildListTile({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    Color? iconColor,
    Color? titleColor,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    final defaultColor = theme.textTheme.bodyLarge?.color ?? Colors.white;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 4.0),
      leading: Icon(icon, color: iconColor ?? defaultColor.withValues(alpha: 0.7), size: 28),
      title: Text(
        title,
        style: TextStyle(color: titleColor ?? defaultColor, fontSize: 16, fontWeight: FontWeight.w500),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(
          subtitle,
          style: TextStyle(color: defaultColor.withValues(alpha: 0.4), fontSize: 13),
        ),
      ),
      onTap: onTap,
    );
  }
}

