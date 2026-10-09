#!/usr/bin/env node

/**
 * Mample CLI - Komut Satırı Ayrıştırıcı
 */

const { program } = require('commander');
const { disconnect } = require('../lib/disconnect');
const { getConfig } = require('../lib/config');
const { triggerNotification } = require('../lib/notify');

program
  .name('mample')
  .description('Mample CLI - Sends notification messages to your phone when invoked.')
  .version('1.0.2');

// Auth komutu
program
  .command('auth')
  .description('Connect using a mobile Secret Key or a terminal QR code')
  .argument('[secret_key]', 'CLI Secret Key from the mobile app')
  .option('--qr', 'Show a QR code to scan with the mobile app')
  .action(async (secret_key, options) => {
    try {
      if (options.qr && secret_key) throw new Error('Choose either a Secret Key or --qr.');
      if (!secret_key) {
        await require('../lib/pair').pairTerminal();
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
      console.error("❌ Error: Connect your device using 'mample auth <secret_key>' or 'mample auth --qr'.");
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
