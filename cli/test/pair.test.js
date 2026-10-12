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
  const calls = [], rendered = [];
  const options = { read: () => state, save: (value) => Object.assign(state, value),
    authenticate: async (key) => { calls.push(key); }, render: (value) => rendered.push(value),
    wait: async () => {}, log() {}, request: async (body) => {
      assert.equal(body.private_key, undefined);
      assert.equal(body.cli_secret_key, undefined);
      if (body.action === 'start') return { status: 'pending', invite_id: 'c'.repeat(64) };
      return { status: 'paired', encrypted_key: crypto.publicEncrypt({ key: state.pending_qr.public_key,
        oaepHash: 'sha256' }, Buffer.from('phone-secret')).toString('base64') };
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

test('expired invites do not automatically generate a new QR', async () => {
  const h = harness();
  let count = 0;
  const oldKey = h.state.pending_qr.terminal_key;
  h.options.request = async (body) => {
    count++;
    return { status: 'expired' };
  };
  await assert.rejects(pairTerminal(h.options), /expired/);
  assert.equal(count, 1);
  assert.equal(h.state.pending_qr.terminal_key, oldKey);
  assert.equal(h.state.cli_secret_key, 'previous');
});

test('Q cancels the invite without replacing a working connection', async () => {
  const h = harness();
  const requests = [];
  h.options.controls = { interactive: true, take() {}, next: async () => 'cancel', close() {} };
  h.options.request = async body => {
    requests.push(body.action);
    return { status: body.action === 'cancel' ? 'cancelled' : 'pending', invite_id: 'c'.repeat(64) };
  };
  assert.equal(await pairTerminal(h.options), false);
  assert.deepEqual(requests, ['start', 'cancel']);
  assert.equal(h.state.pending_qr, null);
  assert.equal(h.state.connection_id, 'old');
  assert.deepEqual(h.calls, []);
});

test('R revokes the old QR before creating a fresh invite', async () => {
  const h = harness();
  const actions = ['refresh', null];
  const requests = [];
  const oldKey = h.state.pending_qr.terminal_key;
  const request = h.options.request;
  h.options.controls = { interactive: true, take() {}, next: async () => actions.shift(), close() {} };
  h.options.request = async body => {
    requests.push(body);
    if (body.action === 'cancel') return { status: 'cancelled' };
    return request(body);
  };
  await pairTerminal(h.options);
  assert.deepEqual(requests.map(r => r.action), ['start', 'cancel', 'start', 'poll']);
  assert.equal(requests[1].terminal_key, oldKey);
  assert.notEqual(requests[2].terminal_key, oldKey);
  assert.equal(h.rendered.length, 2);
  assert.deepEqual(h.calls, ['phone-secret']);
});

test('expired interactive QR waits for an explicit refresh command', async () => {
  const h = harness();
  const actions = ['refresh', null];
  let starts = 0;
  const request = h.options.request;
  h.options.controls = { interactive: true, take() {}, next: async () => {
    assert.equal(starts, 1);
    h.options.controls.next = async () => null;
    return actions.shift();
  }, close() {} };
  h.options.request = async body => {
    if (body.action === 'cancel') return { status: 'cancelled' };
    if (body.action === 'start' && ++starts === 1) return { status: 'expired' };
    return request(body);
  };
  await pairTerminal(h.options);
  assert.equal(starts, 2);
});

test('installed QR renderer produces terminal output for the versioned payload', () => {
  let output;
  require('qrcode-terminal').generate('mample://cli-pair?v=1&id=' + 'a'.repeat(64) + '&token=' + 'b'.repeat(64),
    { small: true }, (value) => { output = value; });
  assert.ok(output.includes('█'));
  assert.ok(output.split('\n').length > 20);
});
