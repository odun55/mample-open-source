#!/usr/bin/env node

/**
 * Mample CLI - Komut Satırı Ayrıştırıcı
 */

const { program } = require('commander');
const { disconnect } = require('../lib/disconnect');
const { getConfig } = require('../lib/config');
const { triggerNotification } = require('../lib/notify');

function formatHelp(command) {
  if (command.name() === 'auth') {
    return [
      'Connect your phone', '',
      '  mample auth qr',
      '    Scan the QR code with the Mample app on your phone.',
      '    Press R for a new QR or Q to cancel.', '',
      '  mample auth "YOUR_SECRET_KEY"',
      '    Replace YOUR_SECRET_KEY with the Secret Key shown in the app.',
      '    Use this if you prefer to connect without scanning a QR.', '',
      '  mample auth',
      '    Also opens QR pairing.', '',
      'After connecting, try: mample "Test notification"', '',
    ].join('\n');
  }
  if (command.name() === 'disconnect') {
    return [
      'Disconnect this terminal', '',
      '  mample disconnect',
      '    Disconnects this terminal from your phone.',
      '    Removes its saved login after the server confirms disconnection.',
      '    Your other devices stay connected.', '',
      'To reconnect: mample auth qr', '',
    ].join('\n');
  }
  return [
    'Mample - Send notifications to your phone', '',
    'Connect your phone:',
    '  mample auth qr',
    '    Scan the QR code with the Mample app.', '',
    'Send a notification:',
    '  mample "Test notification"',
    '    Put your notification message inside double quotes.',
    '    Sends the message in quotes to your phone.', '',
    'Use your default message:',
    '  mample ""',
    '    Empty quotes send the default notification message set in the app.', '',
    'Connect without a QR:',
    '  mample auth "YOUR_SECRET_KEY"',
    '    Replace YOUR_SECRET_KEY with the Secret Key shown in the app.', '',
    'Disconnect:',
    '  mample disconnect',
    '    Disconnects this terminal from your phone.', '',
    'Version:',
    '  mample --version',
    '    Shows the installed version.', '',
  ].join('\n');
}

program
  .name('mample')
  .description('Mample CLI - Sends notification messages to your phone when invoked.')
  .addHelpCommand('help [command]', 'Show this guide')
  .configureHelp({ formatHelp })
  .version(require('../package.json').version);

// Auth komutu
program
  .command('auth')
  .description('Connect using a mobile Secret Key or a terminal QR code')
  .argument('[secret_key]', 'CLI Secret Key from the mobile app, or qr to scan a QR code')
  .option('--qr', 'Alias for mample auth qr')
  .action(async (secret_key, options) => {
    try {
      if (options.qr && secret_key && secret_key !== 'qr') throw new Error('Choose either a Secret Key or QR pairing (mample auth qr).');
      if (!secret_key || secret_key === 'qr') {
        const paired = await require('../lib/pair').pairTerminal();
        if (paired === false) {
          console.log('Pairing cancelled.');
          return;
        }
        console.log('✅ Success: Your computer is now connected to your Mample account!');
        return;
      }
      await require('../lib/auth').authenticateTerminal(secret_key);
      console.log("✅ Success: Your computer is now connected to your Mample account!");
    } catch (err) {
      console.error("❌ Error:", err.message);
      process.exit(1);
    }
  });

// Ana kullanım: mample "mesaj"
program
  .argument('[task_name...]', 'Text to be sent as a notification')
  .action(async (task_name_arr) => {
    // Sadece 'mample' yazılmışsa (veya mample "") taskName boş kalır.
    // Eğer --help kullanıldıysa commander onu otomatik yakalar.

    const taskName = task_name_arr.join(' ');
    const config = getConfig();

    if (!config || !config.cli_secret_key) {
      console.error("❌ Error: Connect your device using 'mample auth <secret_key>' or 'mample auth qr'.");
      process.exit(1);
    }

    try {
      await triggerNotification(config.cli_secret_key, taskName, config.connection_id);
      console.log("✅ Success: Notification sent!");
    } catch (err) {
      if (err.message.includes("Invalid connection") || err.message.includes("401") || err.message.includes("expired") || err.message.includes("Geçersiz bağlantı") || err.message.includes("süresi dolmuş")) {
        console.error("❌ Error: Your connection has been revoked from the phone or is invalid. Please reconnect your device.");
        try {
          const fs = require('fs');
          const os = require('os');
          const path = require('path');
          fs.unlinkSync(path.join(os.homedir(), '.mample', 'config.json'));
        } catch(e) {}
      } else {
        console.error("❌ Error:", err.message);
      }
      process.exit(1);
    }
  });

program
  .command('disconnect')
  .description('Revokes this terminal connection and removes the saved local credentials')
  .action(async () => {
    try {
      await disconnect();
      console.log("Success: This terminal is disconnected and local credentials have been removed.");
    } catch (err) {
      console.error("Error:", err.message);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((error) => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});
