const crypto = require('node:crypto');
const os = require('node:os');
const { getConfig, saveConfig } = require('./config');
const { registerConnection } = require('./notify');

// QR and manual entry converge here, with identical credentials and retry identity.
async function authenticateTerminal(secretKey) {
  const current = getConfig();
  const terminalId = current?.terminal_id || crypto.randomUUID();
  saveConfig({ terminal_id: terminalId }, { quiet: true });
  console.log('Connecting to Firebase...');
  const previousId = current?.cli_secret_key === secretKey ? current.connection_id : undefined;
  const result = await registerConnection(secretKey, os.hostname(), terminalId, previousId);
  saveConfig({ cli_secret_key: secretKey, connection_id: result.connection_id, terminal_id: terminalId, pending_qr: null }, { quiet: true });
}

module.exports = { authenticateTerminal };
