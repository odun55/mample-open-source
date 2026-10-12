const crypto = require('node:crypto');
const { getConfig, saveConfig } = require('./config');
const { authenticateTerminal } = require('./auth');
const { createPairingControls } = require('./pairingControls');

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
  log = console.log, now = Date.now, controls = createPairingControls() } = {}) {
  let pending;
  const deadline = now() + 5 * 60_000;
  let action;
  try {
    pending = read()?.pending_qr;
    while (now() < deadline) {
      action = action || controls.take();
      if (action) {
        if (pending) await request({ action: 'cancel', terminal_key: pending.terminal_key });
        save({ pending_qr: null }, { quiet: true });
        pending = null;
        if (action === 'cancel') return false;
        action = null;
      }
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
        log(controls.interactive ? 'Scan with Mample. Q: cancel | R: generate a new QR.' : 'Scan with Mample. If this QR expires, run mample auth qr again.');
        render(payload);
        while (result.status === 'pending' && now() < deadline) {
          action = controls.interactive ? await controls.next(2000) : await wait(2000);
          action = action || controls.take();
          if (action) break;
          result = await request({ action: 'poll', terminal_key: pending.terminal_key });
        }
      }
      action = action || controls.take();
      if (action) continue;
      if (result.status === 'paired') {
        const secretKey = crypto.privateDecrypt({ key: pending.private_key,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(result.encrypted_key, 'base64')).toString('utf8');
        await authenticate(secretKey);
        save({ pending_qr: null }, { quiet: true });
        return;
      }
      if (result.status !== 'expired' && result.status !== 'pending') throw new Error('Invalid pairing status.');
      if (!controls.interactive) throw new Error('This QR has expired. Run mample auth qr to generate a new one.');
      log('This QR has expired. Press R for a new QR or Q to cancel.');
      action = await controls.next(Math.max(0, deadline - now()));
      if (!action) break;
    }
    throw new Error('Pairing timed out. Run mample auth qr to try again.');
  } finally {
    controls.close();
  }
}

module.exports = { pairTerminal };
