import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ?? AppLocalizations(const Locale('en'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      // Genel
      'cancel': 'Cancel',
      'close': 'Close',
      'copy': 'Copy',
      'copied': 'Copied!',
      'error_occurred': 'An error occurred.',
      'ok': 'OK',
      'copied_secret_key': 'Secret Key copied!',
      
      // Home Screen
      'connected_devices': 'Connected Devices',
      'terminal_tool': 'Terminal Tool (CLI)',
      'manage_browser_notifs': 'Manage browser notifications via Mample CLI',
      'refresh_terminal': 'Refresh Terminal',
      'refresh_terminal_desc': 'This will generate a new secret key. Old connections might drop. Are you sure?',
      'confirm': 'Confirm',
      'full_secret_key': 'Full Secret Key',
      'browser_with_mample': 'Browser with Mample CLI',
      'disconnect': 'Disconnect',
      'disconnect_desc': 'You will no longer receive notifications from this browser. Do you confirm?',
      'disconnect_confirm': 'Disconnect',

      // Settings Screen
      'settings': 'Settings',
      'notification_sound': 'Notification Sound',
      'default_notif_message': 'Notification message',
      'default_notif_message_desc': 'Configure your default message and settings',
      'theme': 'Theme',
      'dark_theme': 'Dark Theme',
      'light_theme': 'Light Theme',
      'font_size': 'Font Size',
      'reset_data': 'Reset Data',
      'reset_data_desc': 'Clears device history and assigns a new connection key.',
      'mample_version': 'Mample Version',
      'language': 'Language',
      'theme_selection': 'Theme Selection',
      'language_selection': 'Language Selection',
      'reset_warning': 'Are you sure? All your notification history and connected devices will be lost.',
      'yes_reset': 'Yes, Reset',
      
      // Guide Sheet
      'how_it_works': 'How Does It Work?',
      'guide_step1': 'Install the Mample CLI tool from npm.',
      'guide_step2': 'Run "mample login" in your terminal and scan the QR code.',
      'guide_step3': 'Use "mample run <command>" to get mobile notifications when a long-running process finishes.',
      
      // Notifications Sheet
      'notifications': 'Notifications',
      'clear_all': 'Clear All',
      'no_notifications': 'No notifications yet.',
      'just_now': 'Just now',
      'minutes_ago': 'm ago',
      'hours_ago': 'h ago',
      'days_ago': 'd ago',
      
      // QR Scanner Screen
      'connection_error': 'Connection error: ',
      'scan_code': 'Scan Code',
      'align_qr_code': 'Align the code from your terminal or Chrome extension in this area.',
      'pairing_successful': 'Pairing Successful!',
      
      'change_connection_name': 'Change Connection Name',
      'new_name': 'New name...',
      'unknown_device': 'Unknown Device',
      'no_active_devices': 'No active connected devices.',
      'web_mode_disabled': 'Device connections are disabled in web mode.',
      'hr_short': 'h',
      'min_short': 'm',
      'sec_short': 's',

      'task_completed': 'Task completed!',
      'default_message_placeholder': 'Default message...',
      'show_connection_name': 'Show connection name',
      'contact_us': 'Contact Us',
      'feedback_and_support': 'Feedback and support',
      'email': 'E-Mail',
      'website': 'Website',
      'twitter': 'Twitter / X',
      'linkedin': 'LinkedIn',
      'about': 'About',
      'mample_up_to_date': 'Mample is up to date.',
      'data_reset_success': 'All data reset and connections dropped.',
      'bug_report': 'Bug Report',
      'report_a_bug': 'Report a bug or problem',

      'user_session_not_found': 'User session not found.',
      'chrome_extension': 'Chrome Extension',
      'loading': 'Loading...',



      'guide_what_is_mample': 'What is Mample?',
      'guide_mample_desc': 'Mample is a simple notification system that allows you to track the completion of long-running processes on your computer or browser. Its purpose is to notify you by sending customizable notifications from a single place to your phone when tasks are finished, so you don\'t have to wait in front of the screen.',
      'guide_how_it_works_desc': 'Mample can be used in two main ways:',
      'guide_chrome_title': '1. Chrome Extension',
      'guide_chrome_desc': 'Works by detecting the disappearance of an element on web pages where you wait in queues or download files.',
      'guide_cli_title': '2. Terminal (CLI) Tool',
      'guide_cli_desc': 'Notifies you when long-running commands or builds in your computer terminal finish.',
      'guide_next_pages_desc': 'In the following pages, you will learn how to set up these two tools and integrate them with AI assistants.',
      
      'guide_chrome_main_title': 'Chrome Extension',
      'guide_chrome_step1_title': '1. Pairing and Connection',
      'guide_chrome_step1_desc1': 'Scan the QR code of the Mample extension in your browser using the green QR reader button in the bottom right corner of the home screen, or enter your terminal code in its place in the extension to connect instantly.',
      'guide_chrome_step1_desc2': 'For your security, all extension connections are automatically disconnected after 23 hours. You can also manually disconnect instantly by clicking the \'Disconnect\' icon (broken chain) on your phone or from your extension.',
      'guide_chrome_step2_title': '2. Receiving Notifications by Selecting a Key (/mample)',
      'guide_chrome_step2_desc': 'After establishing the connection, type \'/mample\' at the end of your prompt on any site. Mample\'s \'Key Selection Screen\' will activate automatically. Here, select the key that appears when the process starts but will disappear when the process ends. When the key disappears, you will receive a notification. You can also select a key using the \'Select Key\' button in your extension. If you confirm the pop-up appearing at the bottom right using \'Use Custom Key Selection\', you will receive a notification when your selected key disappears.',
      'guide_chrome_step3_title': '3. Detailed Key Selection (IMPORTANT)',
      'guide_chrome_step3_desc': 'For Mample to correctly understand when your process is done, select the specific inner element indicating the active status, not the outer frame.',
      'guide_chrome_example_gpt': 'Example: ChatGPT Generation Screen',
      'guide_wrong': 'WRONG',
      'guide_wrong_desc': 'Selecting the large outer circular button.',
      'guide_correct': 'CORRECT',
      'guide_correct_desc': 'Selecting only the small inner black square indicating the \'Stop\' action.',
      'guide_chrome_step4_title': '4. Notifications without Key Selection (/mamplen)',
      'guide_chrome_step4_desc': 'On system pre-selected popular websites (ChatGPT, Claude, Gemini, Perplexity, Grok, Poe, Kimi, Z-AI), no element selection is required. If you type \'/mamplen\' directly at the end of your prompt, a notification will be automatically sent to you when your process finishes. If you press the \'Use System Key\' button in your extension, a pop-up will appear at the bottom right, and when you confirm it, you will receive an instant notification when the process ends.',
      'guide_chrome_step5_title': '5. Notifications from File Downloads',
      'guide_chrome_step5_desc': 'Get notified when a file larger than your customized MB limit finishes downloading by enabling the \'Get Notifications for Downloads\' option.',
      
      'guide_cli_main_title': 'Terminal (CLI) Tool',
      'guide_cli_step1_title': '1. CLI Setup and Connection',
      'guide_cli_step1_desc1': 'First, install the Mample CLI tool globally on your computer:',
      'guide_cli_step1_desc2': 'After installation, enter the connection command using the Secret Key shown on your Home Screen:',
      'guide_cli_step2_title': '2. Sending Notifications',
      'guide_cli_step2_desc1': 'If you want to chain it to a command, you can use \'&& mample\'. To send a custom message: ',
      'guide_cli_step2_code_snippet': 'mample "<notification message>"',
      'guide_cli_step2_desc2': ' format can be used.',
      'guide_cli_step3_title': '3. Disconnecting',
      'guide_cli_step3_desc': 'You can use the connected devices section on your home screen in the mobile app to disconnect the connection between the terminal and your phone. If you want to do it via terminal, you can use the following command:',
      'guide_cli_step4_title': '4. Terminal Help',
      'guide_cli_step4_desc': 'To see all available commands and details, run the help command:',
      
      'guide_ai_main_title': 'AI Assistants',
      'guide_ai_step1_title': '1. Using with Desktop Apps',
      'guide_ai_step1_desc1': 'If you use AI assistants that can run terminal commands (e.g., VS Code, Antigravity, GitHub Copilot, Cursor, Cline, Roo Code), you can integrate Mample with them.',
      'guide_ai_step1_desc2': 'When you request a long-running process from the AI, you can have it notify you when finished.',
      'guide_ai_step2_title': '2. How to Instruct',
      'guide_ai_step2_desc1': 'Simply add the following instruction to the end of your prompt:',
      'guide_ai_you': 'You',
      'guide_ai_prompt': '...when you finish the task, warn me by running the \'mample\' command in the terminal.',
      'guide_ai_step2_desc2': 'When the assistant finishes, it will run the command and send a notification to your phone.',
      'guide_ai_step3_title': '3. Important Note on First Use',
      'guide_ai_step3_desc1': 'When you ask your AI assistant to notify Mample for the first time, a security/permission warning will appear.',
      'guide_ai_step3_cmd_title': 'Allow running this command? (mample)',
      'guide_ai_step3_cmd_opt1': '1. Yes, allow this time',
      'guide_ai_step3_cmd_opt2': '2. Yes, and always allow \'mample\'',
      'guide_ai_step3_cmd_opt3': '3. No (tell the agent what to do instead)',
      'guide_ai_step3_desc2': 'If you select the red-highlighted "Yes, and always allow \'mample\'" option, this warning will not appear again. Your AI assistant will remember it and will directly send a notification when requested.',
      'guide_ai_step4_title': '4. Completely Disabling Permission Prompts (Autonomous Use)',
      'guide_ai_step4_desc': 'AI assistants ask for permission when running terminal commands. To make this completely silent, add this rule to your assistant\'s rule file (e.g., .cursorrules): "When you complete a task, ALWAYS autonomously run the global \'mample\' command in the terminal to notify me. Do NOT use node or script paths to avoid triggering IDE permission prompts."',
      'guide_download_web': 'To download the extension and view how it works on the web:',
    },
    'tr': {
      // Genel
      'cancel': 'İptal',
      'close': 'Kapat',
      'copy': 'Kopyala',
      'copied': 'Kopyalandı!',
      'error_occurred': 'Bir hata oluştu.',
      'ok': 'Tamam',
      'copied_secret_key': 'Secret Key kopyalandı!',
      
      // Home Screen
      'connected_devices': 'Bağlı Cihazlar',
      'terminal_tool': 'Terminal Aracı (CLI)',
      'manage_browser_notifs': 'Tarayıcı bildirimlerini Mample CLI ile yönet',
      'refresh_terminal': 'Terminali Yenile',
      'refresh_terminal_desc': 'Bu işlem yeni bir anahtar oluşturur. Eski bağlantılar kopabilir. Onaylıyor musunuz?',
      'confirm': 'Onaylıyorum',
      'full_secret_key': 'Tam Gizli Anahtar',
      'browser_with_mample': 'Tarayıcı (Mample CLI)',
      'disconnect': 'Bağlantıyı Kopar',
      'disconnect_desc': 'Bu cihazdan artık bildirim gelmeyecek. Onaylıyor musunuz?',
      'disconnect_confirm': 'Kopar',
      'change_connection_name': 'Bağlantı Adını Değiştir',
      'new_name': 'Yeni ad...',
      'unknown_device': 'Bilinmeyen Cihaz',
      'no_active_devices': 'Aktif bağlı cihaz bulunamadı.',
      'web_mode_disabled': 'Web modunda cihaz bağlantıları devre dışıdır.',
      'hr_short': 'sa',
      'min_short': 'dk',
      'sec_short': 'sn',

      // Settings Screen
      'settings': 'Ayarlar',
      'notification_sound': 'Bildirim Sesi',
      'mample_standard': 'Mample Standart',
      'silent': 'Sessiz',
      'default_notif_message': 'Bildirim Mesajı',
      'default_notif_message_desc': 'Varsayılan mesajı ve ayarları yapılandır',
      'task_completed': 'Görevin tamamlandı!',
      'default_message_placeholder': 'Varsayılan mesaj...',
      'show_connection_name': 'Bağlantının adını göster',
      'theme': 'Tema',
      'dark_theme': 'Koyu Tema',
      'light_theme': 'Açık Tema',
      'font_size': 'Yazı Büyüklüğü',
      'reset_data': 'Verileri Sıfırla',
      'reset_data_desc': 'Cihaz geçmişini temizler ve yeni bir bağlantı anahtarı atar.',
      'contact_us': 'Bize Ulaşın',
      'feedback_and_support': 'Geri bildirim ve destek',
      'email': 'E-Mail',
      'website': 'Web Sitemiz',
      'twitter': 'Twitter / X',
      'linkedin': 'LinkedIn',
      'mample_version': 'Mample Sürümü',
      'about': 'Hakkında',
      'mample_up_to_date': 'Mample güncel.',
      'language': 'Dil / Language',
      'theme_selection': 'Tema Seçimi',
      'language_selection': 'Dil Seçimi',
      'reset_warning': 'Emin misiniz? Bütün bildirim geçmişiniz ve bağlı cihazlarınız kaybolacak.',
      'yes_reset': 'Evet, Sıfırla',
      'data_reset_success': 'Tüm veriler sıfırlandı ve bağlantılar koptu.',
      'bug_report': 'Hata Bildir',
      'report_a_bug': 'Bize hata veya sorun bildirin',
      'user_session_not_found': 'Kullanıcı oturumu bulunamadı.',
      'chrome_extension': 'Chrome Eklentisi',
      'loading': 'Yükleniyor...',

      // Guide Sheet
      'how_it_works': 'Nasıl Çalışır?',
      'guide_what_is_mample': 'Mample Nedir?',
      'guide_mample_desc': 'Mample, bilgisayarınızda veya tarayıcınızda uzun süren işlemlerin bittiğini takip etmenizi sağlayan basit bir bildirim sistemidir. Amacı, ekran başında beklemenize gerek kalmadan, işlemler tamamlandığında telefonunuza tek bir yerden özelleştirilebilen bildirimler göndererek sizi haberdar etmektir.',
      'guide_how_it_works_desc': 'Mample genel olarak iki farklı şekilde kullanılabilir:',
      'guide_chrome_title': '1. Chrome Eklentisi',
      'guide_chrome_desc': 'Tarayıcı üzerinden yaptığınız indirmelerde veya işlem sırası beklediğiniz web sayfalarında, bir öğenin kaybolmasını algılayarak çalışır.',
      'guide_cli_title': '2. Terminal (CLI) Aracı',
      'guide_cli_desc': 'Bilgisayarınızın terminalinde çalışan uzun soluklu komutların veya derlemelerin sonuna eklenerek, işlem bittiğinde sizi uyarır.',
      'guide_next_pages_desc': 'Sonraki sayfalarda bu iki aracın ve yapay zeka asistanlarıyla entegrasyonun nasıl yapılacağını görebilirsiniz.',
      'guide_chrome_main_title': 'Chrome Eklentisi',
      'guide_chrome_step1_title': '1. Eşleşme ve Bağlantı Yönetimi',
      'guide_chrome_step1_desc1': 'Ana ekranda sağ alt köşede bulunan yeşil QR okuyucu butonuna basarak tarayıcınızdaki Mample eklentisinin QR kodunu okutarak veya terminal kodunuzu eklentideki yerine girererek anında bağlanın. Bağlantıyı mobil uygulamanızdaki \'Bağlı Cihazlar\' kısmında görebilirsiniz.',
      'guide_chrome_step1_desc2': 'Güvenliğiniz için tüm eklenti bağlantıları 23 saat sonra otomatik olarak kesilir. İsterseniz telefonunuzdaki \'Bağlantıyı Kes\' ikonuna (kırık zincir) tıklayarak veya eklentinizden bağlantıyı anında manuel olarak da koparabilirsiniz.',
      'guide_chrome_step2_title': '2. Tuş Seçimi Yaparak Bildirim Alma (/mample)',
      'guide_chrome_step2_desc': 'Bağlantıyı kurduktan sonra, tarayıcınızda işlem yaptığınız herhangi bir sitedeyken promptunuzun sonuna \'/mample\' yazın. Mample\'ın \'Tuş Seçim Ekranı\' otomatik olarak aktifleşecektir. Burada işlem başladığında beliren ama işlem bittiğinde kaybolacak olan tuşu seçiniz. Seçtiğiniz tuş kaybolduğunda bildirim alacaksınız. İsterseniz eklentinizdeki \'Tuş Seç\' butonu ile de tuş seçebilirsiniz. Tuş seçili olan web sitesinde, eklentinizdeki \'Özel Tuş Seçimini Kullan\' butonu ile sağ altta çıkan pop-up\'ı onaylarsanız seçtiğiniz tuş kaybolduğunda bildirim alacaksınız.',
      'guide_chrome_step3_title': '3. Detaylı Tuş Seçimi (ÖNEMLİ)',
      'guide_chrome_step3_desc': 'Mample\'ın işleminizin bittiğini doğru anlayabilmesi için, seçtiğiniz öğenin işlem boyunca ekranda kalıp, işlem bitince kaybolan bir öğe olması gerekir. İşlemi temsil eden dış çerçeveyi değil, sadece içindeki asıl durumu gösteren minik nesneyi seçmelisiniz.',
      'guide_chrome_example_gpt': 'Örnek: ChatGPT Üretim Ekranı',
      'guide_wrong': 'YANLIŞ',
      'guide_wrong_desc': 'Geniş ve dış çerçeve olan yuvarlak butonu seçmek.',
      'guide_correct': 'DOĞRU',
      'guide_correct_desc': 'Sadece iç kısımdaki asıl \'Durdurma\' işlemi olan minik siyah kareyi seçmek.',
      'guide_chrome_step4_title': '4. Tuş Seçimi Yapmadan Bildirim Alma (/mamplen)',
      'guide_chrome_step4_desc': 'Sistemde tuş belirlenmiş popüler web sitelerinde (ChatGPT, Claude, Gemini, Perplexity, Grok, Poe, Kimi, Z-AI) hiçbir öğe seçimi yapmanıza gerek yoktur. Promptunuzun sonuna \'/mamplen\' yazarsanız, sizin için önceden seçmiş olduğumuz tuş sayesinde işleminiz bittiğinde otomatik bildirim gönderilir. Eklentinizdeki \'Sistem Tuşunu Kullan\' butonuna basarsanız, işleme başladığınızda sağ altta çıkan pop-up\'ı onayladığınızda işlem bittiğinde anında bildirim alırsınız.',
      'guide_chrome_step5_title': '5. Dosya İndirmelerinden Bildirim Alma',
      'guide_chrome_step5_desc': 'Eklentinizdeki \'İndirmelerden Bildirim Al\' seçeneği ile tarayıcınızda belirlediğiniz MB limitinden büyük dosyaların indirilme işlemi tamamlandığında bildirim alabilirsiniz.',
      'guide_cli_main_title': 'Terminal (CLI) Aracı',
      'guide_cli_step1_title': '1. CLI Kurulumu ve Bağlantı',
      'guide_cli_step1_desc1': 'Öncelikle bilgisayarınıza Mample CLI aracını global olarak kurmanız gerekir:',
      'guide_cli_step1_desc2': 'Kurulum tamamlandıktan sonra, Ana Ekrandaki Terminal Aracınızda görünen Secret Key (Gizli Anahtar) bilgisini kullanarak terminale bağlantı komutunu girin:',
      'guide_cli_step2_title': '2. Bildirim Gönderme',
      'guide_cli_step2_desc1': 'Eğer bir komutun peşine zincirleme bağlamak istiyorsanız \'&& mample\' kullanabilirsiniz. Sadece özel mesaj göndermek isterseniz; ',
      'guide_cli_step2_code_snippet': 'mample "<bildirim mesajı>"',
      'guide_cli_step2_desc2': ' formatını kullanabilirsiniz. Mesaj kısmını boş bırakmanız durumunda ayarlar menüsündeki varsayılan (default) mesaj yollanacaktır.',
      'guide_cli_step3_title': '3. Bağlantıyı Koparma',
      'guide_cli_step3_desc': 'Terminal ve telefon arasındaki Bağlantıyı kopartmak için mobil uygulamanızda ana ekranınızdaki bağlı cihazlar kısmını kullanabilirsiniz. Eğer bunu terminal üzerinden yapmak isterseniz aşağıdaki komutu kullanabilirsiniz:',
      'guide_cli_step4_title': '4. Terminal İçi Yardım',
      'guide_cli_step4_desc': 'Kullanabileceğiniz tüm komutları ve detaylarını görmek için aşağıdaki yardım komutunu çalıştırabilirsiniz:',
      'guide_ai_main_title': 'Yapay Zeka Asistanları',
      'guide_ai_step1_title': '1. Bilgisayar Uygulamalarında Kullanımı',
      'guide_ai_step1_desc1': 'Eğer süreçlerinizde terminal komutlarını çalıştırabilen yapay zeka asistanları kullanıyorsanız (örneğin VS Code, Antigravity, GitHub Copilot, Cursor, Cline, Roo Code gibi araçlar), Mample\'ı onlarla entegre edebilirsiniz. Bunun için öncelikle \'Terminal (CLI) Aracı\' başlığındaki \'1. CLI Kurulumu ve Bağlantı\' adımını tamamlamış olmalısınız.',
      'guide_ai_step1_desc2': 'Yapay zeka asistanından uzun sürecek bir işlem talep ettiğinizde (örneğin büyük bir kod analizi, test senaryosu çalıştırma veya dosya düzenlemeleri), asistanın işlemi bitirdiğinde sizi bilgilendirmesini sağlayabilirsiniz.',
      'guide_ai_step2_title': '2. Nasıl Talimat Verilir?',
      'guide_ai_step2_desc1': 'Promptunuzun sonuna aşağıdaki talimatı eklemeniz yeterlidir:',
      'guide_ai_you': 'Siz',
      'guide_ai_prompt': '...işlemi bitirdiğinde terminalden \'mample\' komutunu çalıştırarak beni uyar.',
      'guide_ai_step2_desc2': 'Asistan işlemini bitirdiğinde terminal üzerinden \'mample\' komutunu çalıştırarak size bildirim gelmesini sağlayacaktır.',
      'guide_ai_step3_title': '3. İlk Kullanımda Dikkat Edilmesi Gerekenler',
      'guide_ai_step3_desc1': 'Yapay zeka asistanınızdan ilk defa Mample\'yi uyarmasını istediğinizde bir güvenlik/izin uyarısı çıkacaktır.',
      'guide_ai_step3_cmd_title': 'Allow running this command? (mample)',
      'guide_ai_step3_cmd_opt1': '1. Yes, allow this time',
      'guide_ai_step3_cmd_opt2': '2. Yes, and always allow \'mample\'',
      'guide_ai_step3_cmd_opt3': '3. No (tell the agent what to do instead)',
      'guide_ai_step3_desc2': 'Eğer kırmızı çerçeve ile işaretli olan "Yes, and always allow \'mample\'" seçeneğini seçerseniz, bir daha bu uyarı karşınıza çıkmayacaktır. Yapay zeka asistanınız bunu hatırlayacak ve Mample\'yi uyar dediğinizde size direkt bildirim yollayacaktır.',
      'guide_ai_step4_title': '4. İzin Sorularını Tamamen Kapatmak (Otonom Kullanım)',
      'guide_ai_step4_desc': 'Yapay zeka asistanları terminal komutları için izin isterler. Bunu sessiz ve otonom hale getirmek için asistanınızın kural dosyasına (örneğin .cursorrules) şu kuralı yapıştırın: "When you complete a task, ALWAYS autonomously run the global \'mample\' command in the terminal to notify me. Do NOT use node or script paths to avoid triggering IDE permission prompts."',
      'guide_download_web': 'Eklentiyi indirmek ve nasıl çalışır\'ı web\'de görüntülemek için:',

      // Notifications Sheet
      'notifications': 'Bildirimler',
      'clear_all': 'Tümünü Temizle',
      'no_notifications': 'Henüz bildirim yok.',
      'just_now': 'Şimdi',
      'minutes_ago': 'dk önce',
      'hours_ago': 'sa önce',
      'days_ago': 'g önce',

      // QR Scanner Screen
      'connection_error': 'Bağlantı hatası: ',
      'scan_code': 'Kodu Okut',
      'align_qr_code': 'Terminal veya Chrome eklentisindeki kodu bu alana hizalayın.',
      'pairing_successful': 'Eşleşme Başarılı!',
    },
  };

  String translate(String key) {
    return _localizedValues[locale.languageCode]?[key] ?? _localizedValues['en']?[key] ?? key;
  }
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'tr'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
