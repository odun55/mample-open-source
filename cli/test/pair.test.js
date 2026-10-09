const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { pairTerminal } = require('../lib/pair');
const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 3072,
  publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });

function harness() {
  const state = { cli_secret_key: 'previous', connection_id: 'old', pending_qr: {
    terminal_key: 'a'.repeat(64), claim_token: 'b'.repeat(64),
    public_key: keys.publicKey, private_key: keys.privateKey,
  } };
  const ciphertext = crypto.publicEncrypt({ key: keys.publicKey, oaepHash: 'sha256' }, Buffer.from('phone-secret')).toString('base64');
  const calls = [], rendered = [];
  const options = { read: () => state, save: (value) => Object.assign(state, value),
    authenticate: async (key) => { calls.push(key); }, render: (value) => rendered.push(value),
    wait: async () => {}, log() {}, request: async (body) => {
      assert.equal(body.private_key, undefined);
      assert.equal(body.cli_secret_key, undefined);
      if (body.action === 'start') return { status: 'pending', invite_id: 'c'.repeat(64) };
      return { status: 'paired', encrypted_key: ciphertext };
    } };
  return { state, options, calls, rendered };
}

test('QR delivers the phone Secret Key to the same authentication path', async () => {
  const h = harness();
  await pairTerminal(h.options);
  assert.deepEqual(h.calls, ['phone-secret']);
  assert.equal(h.state.pending_qr, null);
  assert.equal(h.rendered.length, 1);
  assert.ok(h.rendered[0].startsWith('mample://cli-pair?v=1&'));
  assert.ok(!h.rendered[0].includes('phone-secret'));
  assert.ok(!h.rendered[0].includes('a'.repeat(64)));
});

test('failed authentication preserves the previous connection and recovery material', async () => {
  const h = harness();
  h.options.authenticate = async () => { throw new Error('offline'); };
  await assert.rejects(pairTerminal(h.options), /offline/);
  assert.equal(h.state.cli_secret_key, 'previous');
  assert.equal(h.state.connection_id, 'old');
  assert.ok(h.state.pending_qr.private_key);
});

test('a response lost after scanning is recovered without a second scan', async () => {
  const h = harness();
  const original = h.options.request;
  h.options.request = () => original({ action: 'poll' });
  await pairTerminal(h.options);
  assert.equal(h.rendered.length, 0);
  assert.deepEqual(h.calls, ['phone-secret']);
});

test('expired invites rotate both QR and terminal recovery credentials', async () => {
  const h = harness();
  let count = 0;
  const oldKey = h.state.pending_qr.terminal_key;
  h.options.request = async (body) => {
    if (++count === 1) return { status: 'expired' };
    assert.notEqual(body.terminal_key, oldKey);
    throw new Error('rotation checked');
  };
  await assert.rejects(pairTerminal(h.options), /rotation checked/);
  assert.notEqual(h.state.pending_qr.terminal_key, oldKey);
  assert.equal(h.state.cli_secret_key, 'previous');
});

test('installed QR renderer produces terminal output for the versioned payload', () => {
  let output;
  require('qrcode-terminal').generate('mample://cli-pair?v=1&id=' + 'a'.repeat(64) + '&token=' + 'b'.repeat(64),
    { small: true }, (value) => { output = value; });
  assert.ok(output.includes('█'));
  assert.ok(output.split('\n').length > 20);
});
