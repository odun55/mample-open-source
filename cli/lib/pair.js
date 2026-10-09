const crypto = require('node:crypto');
const { getConfig, saveConfig } = require('./config');
const { authenticateTerminal } = require('./auth');

async function pairingRequest(body) {
  const response = await fetch('https://europe-west1-mample-fca3c.cloudfunctions.net/cliPairing', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Pairing failed: HTTP ${response.status}`);
  return data;
}

async function pairTerminal({ request = pairingRequest, render = (value) =>
  require('qrcode-terminal').generate(value, { small: true }),
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  read = getConfig, save = saveConfig, authenticate = authenticateTerminal,
  log = console.log, now = Date.now } = {}) {
  let pending = read()?.pending_qr;
  const deadline = now() + 5 * 60_000;
  while (now() < deadline) {
    if (!pending) {
      const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 3072,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
      pending = { terminal_key: crypto.randomBytes(32).toString('hex'),
        claim_token: crypto.randomBytes(32).toString('hex'), public_key: keys.publicKey, private_key: keys.privateKey };
      // Keep the previous working connection until pairing succeeds. Persist recovery
      // credentials before contacting the server so a failed final save is retryable.
      save({ pending_qr: pending }, { quiet: true });
    }
    let result = await request({ action: 'start', terminal_key: pending.terminal_key,
      claim_token: pending.claim_token, public_key: pending.public_key });
    if (result.status === 'pending') {
      const payload = `mample://cli-pair?v=1&id=${result.invite_id}&token=${pending.claim_token}`;
      log('Scan this QR with Mample on your phone. It refreshes every 90 seconds. Press Ctrl+C to cancel.');
      render(payload);
      while (result.status === 'pending' && now() < deadline) {
        await wait(2000);
        result = await request({ action: 'poll', terminal_key: pending.terminal_key });
      }
    }
    if (result.status === 'paired') {
      const secretKey = crypto.privateDecrypt({ key: pending.private_key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(result.encrypted_key, 'base64')).toString('utf8');
      await authenticate(secretKey);
      save({ pending_qr: null }, { quiet: true });
      return;
    }
    if (result.status !== 'expired' && result.status !== 'pending') throw new Error('Invalid pairing status.');
    pending = null;
  }
  throw new Error('Pairing timed out. Run mample auth --qr to try again.');
}

module.exports = { pairTerminal };
