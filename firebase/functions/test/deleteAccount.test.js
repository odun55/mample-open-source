const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function harness() {
  const records = new Map([
    ["users/alice", { cli_secret_key_hash: "hash", fcm_token: "token" }],
    ["users/bob", { fcm_token: "other" }],
    ["connections/pc", { uid: "alice" }],
    ["connections/other", { uid: "bob" }],
    ["pending_notifications/job", { userId: "alice", body: "private" }],
    ["pending_notifications/other", { userId: "bob" }],
    ["cli_pairing_invites/invite", { uid: "alice", encrypted_key: "ciphertext" }],
    ["rateLimits/conn_pc", { timestamps: [1] }],
    ["rateLimits/cli_hash", { timestamps: [1] }],
    ["rateLimits/user_alice", { timestamps: [1] }],
    ["rateLimits/old_key", { owner_uid: "alice" }],
    ["rateLimits/other", { owner_uid: "bob" }],
  ]);
  let failCleanup = false, failAuth = false, rateAllowed = true, rotated = false;
  const authUsers = new Set(["alice", "bob"]);
  const ref = (path) => ({ path, id: path.split("/").pop(), get: async () => snapshot(ref(path)) });
  const snapshot = (r) => {
    const value = records.get(r.path);
    return { ref: r, id: r.id, exists: records.has(r.path), data: () => value };
  };
  const batch = () => {
    const deletes = [];
    return { delete: (r) => deletes.push(r.path), commit: async () => {
      if (failCleanup) throw new Error("storage offline");
      deletes.forEach((path) => records.delete(path));
    } };
  };
  const db = {
    batch,
    collection: (name) => ({
      doc: (id) => ref(`${name}/${id}`),
      where: (field, _op, value) => ({ limit: (size) => ({ get: async () => {
        const docs = [...records].filter(([path, data]) => path.startsWith(name + "/") && data[field] === value)
          .slice(0, size).map(([path]) => snapshot(ref(path)));
        return { docs, empty: docs.length === 0 };
      } }) }),
    }),
    runTransaction: async (callback) => callback({
      get: async (r) => snapshot(r),
      getAll: async (...refs) => refs.map(snapshot),
      set: (r, value) => records.set(r.path, value),
      update: (r, value) => records.set(r.path, { ...records.get(r.path), ...value }),
    }),
    recursiveDelete: async (r) => {
      records.delete(r.path);
      for (const path of records.keys()) if (path.startsWith(r.path + "/")) records.delete(path);
    },
  };
  const auth = { getUser: async (uid) => {
    if (!authUsers.has(uid)) throw Object.assign(new Error("missing"), { code: "auth/user-not-found" });
    return { uid };
  }, deleteUser: async (uid) => {
    if (failAuth) throw Object.assign(new Error("Auth unavailable"), { code: "auth/internal-error" });
    if (!authUsers.delete(uid)) throw Object.assign(new Error("missing"), { code: "auth/user-not-found" });
  } };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  let options;
  const sandbox = { exports: {}, Date, console: { error() {} }, require: (name) => {
    if (name === "firebase-functions/v2/https") return { HttpsError,
      onCall: (opts, handler) => { options = opts; return handler; }, onRequest: (_opts, handler) => handler };
    if (name === "firebase-admin/app-check") return { getAppCheck: () => ({
      verifyToken: async (token) => { if (token !== 'valid') throw new Error('invalid'); },
    }) };
    if (name === "firebase-admin/firestore") return { getFirestore: () => db,
      FieldValue: { delete: () => null }, Timestamp: { fromMillis: (n) => n } };
    if (name === "firebase-admin/auth") return { getAuth: () => auth };
    if (name === "node:crypto") return require(name);
    if (name === "./rateLimit") return { checkRateLimits: async () => {
      if (rotated) records.get('users/alice').cli_secret_key_hash = 'rotated';
      return { allowed: rateAllowed, retryAfter: 60 };
    } };
    throw new Error(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/deleteAccount"), "utf8"), sandbox);
  const call = (data = { confirm: true, deletion_token: 'a'.repeat(64) }, identity = { uid: "alice" }) =>
    sandbox.exports.deleteAccount({ data, auth: identity });
  async function resume(uid = 'alice', receipt = 'a'.repeat(64), appCheck = 'valid') {
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await sandbox.exports.resumeAccountDeletion({ method: 'POST', body: { uid, deletion_token: receipt },
      header: () => appCheck }, res);
    return res;
  }
  async function web(body = { cli_secret_key: 'mample-testcredential', confirm: true }) {
    const res = { set() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await sandbox.exports.deleteAccountWithKey({ method: 'POST', body }, res);
    return res;
  }
  return { records, authUsers, call, resume, web, options,
    rateAllowed: (value) => { rateAllowed = value; }, rotate: () => { rotated = true; },
    failCleanup: (value) => { failCleanup = value; }, failAuth: (value) => { failAuth = value; } };
}

function webHarness() {
  const h = harness();
  h.records.get('users/alice').cli_secret_key_hash = require('node:crypto')
    .createHash('sha256').update('mample-testcredential').digest('hex');
  return h;
}

test('web deletion derives ownership from the key, never a supplied UID', async () => {
  const h = webHarness();
  const res = await h.web({ cli_secret_key: 'mample-testcredential', confirm: true, uid: 'bob' });
  assert.equal(res.code, 200);
  assert.equal(h.authUsers.has('alice'), false);
  assert.equal(h.authUsers.has('bob'), true);
  assert.equal(h.records.has('connections/other'), true);
  assert.equal((await h.web()).code, 200);
});

test('invalid key or missing consent cannot start web deletion', async () => {
  const h = webHarness();
  assert.equal((await h.web({ cli_secret_key: 'mample-wrongcredential', confirm: true })).code, 401);
  assert.equal((await h.web({ cli_secret_key: 'mample-testcredential' })).code, 400);
  assert.equal(h.records.has('account_deletion_guards/alice'), false);
  assert.equal(h.authUsers.size, 2);
});

test('web deletion handles cleanup failure and response loss with the same key', async () => {
  const h = webHarness();
  h.failCleanup(true);
  assert.equal((await h.web()).code, 500);
  assert.equal(h.authUsers.has('alice'), true);
  h.failCleanup(false);
  h.failAuth(true);
  assert.equal((await h.web()).code, 500);
  assert.equal(h.records.has('users/alice'), false);
  h.failAuth(false);
  assert.equal((await h.web()).code, 200);
  assert.equal(h.authUsers.has('alice'), false);
});

test('rate limiting, rotated keys and another pending receipt block web deletion', async () => {
  let h = webHarness();
  h.rateAllowed(false);
  assert.equal((await h.web()).code, 429);
  assert.equal(h.authUsers.size, 2);
  h = webHarness();
  h.rotate();
  assert.equal((await h.web()).code, 409);
  assert.equal(h.records.has('account_deletion_guards/alice'), false);
  h = webHarness();
  h.records.set('account_deletion_guards/alice', { receipt_hash: 'another-request' });
  assert.equal((await h.web()).code, 409);
  assert.equal(h.authUsers.size, 2);
});

test("authenticated account is erased without touching another owner's data", async () => {
  const h = harness();
  assert.equal(h.options.enforceAppCheck, true);
  await h.call({ confirm: true, uid: "bob", deletion_token: 'a'.repeat(64) });
  assert.deepEqual([...h.authUsers], ["bob"]);
  assert.deepEqual([...h.records.keys()].sort(), ["account_deletion_guards/alice", "connections/other",
    "pending_notifications/other", "rateLimits/other", "users/bob"].sort());
  assert.deepEqual(Object.keys(h.records.get("account_deletion_guards/alice")), ["cleanup_at", "receipt_hash"]);
});

test("missing identity or explicit confirmation cannot delete an account", async () => {
  const h = harness();
  await assert.rejects(h.call({ confirm: true }, null), { code: "unauthenticated" });
  await assert.rejects(h.call({}), { code: "invalid-argument" });
  assert.equal(h.authUsers.has("alice"), true);
  assert.equal(h.records.has("connections/pc"), true);
});

test("more than 500 owned records are erased through bounded batches", async () => {
  const h = harness();
  for (let i = 0; i < 701; i++) {
    h.records.set(`connections/pc_${i}`, { uid: "alice" });
    h.records.set(`rateLimits/conn_pc_${i}`, { timestamps: [1] });
  }
  await h.call();
  assert.equal([...h.records.keys()].some((path) => path.includes("pc_")), false);
});

test("cleanup failure disables account but preserves authentication for retry", async () => {
  const h = harness();
  h.failCleanup(true);
  await assert.rejects(h.call(), { code: "internal" });
  assert.equal(h.authUsers.has("alice"), true);
  assert.equal(h.records.get("users/alice").notifications_disabled, true);
  assert.equal(h.records.get("users/alice").fcm_token, null);
  h.failCleanup(false);
  await h.call();
  assert.equal(h.authUsers.has("alice"), false);
  assert.equal(h.records.has("rateLimits/cli_hash"), false);
});

test("Auth deletion failure can be retried after Firestore cleanup", async () => {
  const h = harness();
  h.failAuth(true);
  await assert.rejects(h.call(), { code: "internal" });
  assert.equal(h.authUsers.has("alice"), true);
  assert.equal(h.records.has("users/alice"), false);
  h.failAuth(false);
  await h.call();
  assert.equal(h.authUsers.has("alice"), false);
});

test("repeated delivery of the same deletion request succeeds without recreation", async () => {
  const h = harness();
  await h.call();
  await h.call();
  assert.equal(h.records.has("users/alice"), false);
  assert.equal(h.records.has("connections/pc"), false);
});

test("lost response can finish without Auth using only the original receipt and App Check", async () => {
  const h = harness();
  await h.call();
  assert.equal(h.authUsers.has('alice'), false);
  assert.equal((await h.resume()).code, 200);
  assert.equal((await h.resume('bob')).code, 404);
  assert.equal(h.authUsers.has('bob'), true);
  assert.equal((await h.resume('alice', 'b'.repeat(64))).code, 404);
  assert.equal((await h.resume('alice', 'a'.repeat(64), 'invalid')).code, 401);
});

test("receipt resumes a partial cleanup but cannot initiate deletion", async () => {
  const h = harness();
  assert.equal((await h.resume()).code, 404);
  h.failCleanup(true);
  await assert.rejects(h.call(), { code: 'internal' });
  h.failCleanup(false);
  assert.equal((await h.resume()).code, 200);
  assert.equal(h.records.has('users/alice'), false);
});

test("after receipt TTL, an absent account is confirmed without creating or deleting records", async () => {
  const h = harness();
  await h.call();
  h.records.delete('account_deletion_guards/alice');
  const before = [...h.records];
  assert.equal((await h.resume()).code, 200);
  assert.deepEqual([...h.records], before);
  assert.equal((await h.resume('bob')).code, 404);
  assert.equal(h.authUsers.has('bob'), true);
});
