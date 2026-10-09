const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');
const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 3072,
  publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const terminalKey = 'a'.repeat(64), claimToken = 'b'.repeat(64), inviteId = hash(terminalKey);

function harness({ disabled = false, allowed = true } = {}) {
  let time = 1000;
  const docs = new Map([['users/alice', { cli_secret_key_hash: hash('phone-secret'), notifications_disabled: disabled }]]);
  let queue = Promise.resolve();
  const snapshot = (ref) => ({ exists: docs.has(ref.path), data: () => docs.get(ref.path) });
  const db = {
    collection: (name) => ({ doc: (id) => ({ id, path: `${name}/${id}` }) }),
    runTransaction: (callback) => {
      const run = queue.then(async () => {
        const writes = [];
        const result = await callback({
          get: async (ref) => snapshot(ref), getAll: async (...refs) => refs.map(snapshot),
          create: (ref, value) => writes.push(() => { assert.equal(docs.has(ref.path), false); docs.set(ref.path, value); }),
          update: (ref, value) => writes.push(() => docs.set(ref.path, { ...docs.get(ref.path), ...value })),
        });
        writes.forEach((write) => write());
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  let callableOptions;
  const sandbox = { exports: {}, Buffer, Date: { now: () => time }, console: { error() {} }, require(name) {
    if (name === 'firebase-functions/v2/https') return {
      onRequest: (opts, fn) => fn, onCall: (opts, fn) => { callableOptions = opts; return fn; }, HttpsError,
    };
    if (name === 'firebase-admin/firestore') return { getFirestore: () => db,
      Timestamp: { fromMillis: (value) => ({ toMillis: () => value }) }, FieldValue: { delete: () => null } };
    if (name === './rateLimit') return { checkRateLimits: async () => ({ allowed, retryAfter: 10 }) };
    return require(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/cliPairing'), 'utf8'), sandbox);
  const startBody = { action: 'start', terminal_key: terminalKey, claim_token: claimToken, public_key: keys.publicKey };
  async function send(body = startBody) {
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, set() {} };
    await sandbox.exports.cliPairing({ method: 'POST', body, ip: '127.0.0.1' }, res);
    return res;
  }
  const complete = (data = {}, auth = { uid: 'alice' }) => sandbox.exports.completeCLIPairing({ auth,
    data: { invite_id: inviteId, claim_token: claimToken, cli_secret_key: 'phone-secret', ...data } });
  return { docs, send, complete, startBody, callableOptions, advance: (ms) => { time += ms; } };
}

test('phone hands off its actual key encrypted for this terminal; no connection schema changes', async () => {
  const h = harness();
  assert.equal(h.callableOptions.enforceAppCheck, true);
  assert.equal((await h.send()).body.expires_at, 91000);
  await h.complete();
  const response = await h.send({ action: 'poll', terminal_key: terminalKey });
  assert.equal(response.body.status, 'paired');
  assert.equal(crypto.privateDecrypt({ key: keys.privateKey, oaepHash: 'sha256' },
    Buffer.from(response.body.encrypted_key, 'base64')).toString(), 'phone-secret');
  assert.ok(!JSON.stringify([...h.docs]).includes('phone-secret'));
  assert.equal([...h.docs.keys()].some((id) => id.startsWith('connections/')), false);
});

test('QR is single use even with concurrent phone claims', async () => {
  const h = harness();
  await h.send();
  const results = await Promise.allSettled([h.complete(), h.complete()]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'failed-precondition');
});

test('expiry rejects claims and retries never extend old QR lifetime', async () => {
  const h = harness();
  await h.send();
  h.advance(90_000);
  assert.equal((await h.send()).body.status, 'expired');
  await assert.rejects(h.complete(), { code: 'failed-precondition' });
});

test('QR does not grant polling access or reveal the key', async () => {
  const h = harness();
  await h.send();
  await h.complete();
  assert.equal((await h.send({ action: 'poll', terminal_key: claimToken })).body.status, 'expired');
  assert.equal((await h.send({ action: 'poll', terminal_key: inviteId })).body.status, 'expired');
});

test('invalid claims, unauthenticated users and wrong account keys are rejected without consuming invite', async () => {
  const h = harness();
  await h.send();
  await assert.rejects(h.complete({}, null), { code: 'unauthenticated' });
  await assert.rejects(h.complete({ claim_token: 'c'.repeat(64) }), { code: 'failed-precondition' });
  await assert.rejects(h.complete({ cli_secret_key: 'another-account-key' }), { code: 'permission-denied' });
  assert.equal(h.docs.get('cli_pairing_invites/' + inviteId).status, 'pending');
});

test('moderation, malformed public keys and rate limits prevent handoff', async () => {
  const disabled = harness({ disabled: true });
  await disabled.send();
  await assert.rejects(disabled.complete(), { code: 'permission-denied' });
  const h = harness();
  assert.equal((await h.send({ ...h.startBody, public_key: 'invalid' })).code, 400);
  const limited = harness({ allowed: false });
  assert.equal((await limited.send()).code, 429);
  await assert.rejects(limited.complete(), { code: 'resource-exhausted' });
});
