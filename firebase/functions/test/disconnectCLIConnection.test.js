const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");

function harness({ owner = "alice", exists = true, validKey = true, rotated = false, fails = false } = {}) {
  const hash = crypto.createHash("sha256").update("secret").digest("hex");
  const calls = { deleted: [], queries: 0 };
  const userRef = { id: "alice" };
  const connectionRef = { id: "terminal" };
  const db = {
    collection: (name) => name === "users" ? {
      where: (field, op, value) => ({ limit: () => ({ get: async () => {
        calls.queries++;
        assert.equal(value, hash);
        return { empty: !validKey, docs: [{ id: "alice", ref: userRef }] };
      } }) }),
    } : { doc: () => connectionRef },
    runTransaction: async (callback) => {
      if (fails) throw new Error("offline");
      return callback({
        getAll: async () => [
          { exists: true, data: () => ({ cli_secret_key_hash: rotated ? "new-key" : hash }) },
          { exists, data: () => ({ uid: owner }) },
        ],
        delete: (ref) => calls.deleted.push(ref),
      });
    },
  };
  const sandbox = { exports: {}, console: { error() {} }, require: (name) => {
    if (name === "firebase-functions/v2/https") return { onRequest: (options, handler) => handler };
    if (name === "firebase-admin/firestore") return { getFirestore: () => db };
    return require(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/disconnectCLIConnection"), "utf8"), sandbox);
  async function send(body = { cli_secret_key: "secret", connection_id: "terminal" }, method = "POST") {
    const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await sandbox.exports.disconnectCLIConnection({ method, body }, response);
    return response;
  }
  return { calls, send };
}

test("valid owner revokes only the requested connection", async () => {
  const { calls, send } = harness();
  assert.equal((await send()).code, 200);
  assert.deepEqual(calls.deleted, [{ id: "terminal" }]);
});
test("another owner's connection and invalid key cannot delete anything", async () => {
  for (const options of [{ owner: "bob" }, { validKey: false }, { rotated: true }]) {
    const { calls, send } = harness(options);
    assert.equal((await send()).code, 401);
    assert.equal(calls.deleted.length, 0);
  }
});
test("already revoked connection succeeds for an authenticated owner", async () => {
  const { calls, send } = harness({ exists: false });
  assert.equal((await send()).body.success, true);
  assert.equal(calls.deleted.length, 0);
});
test("invalid types, paths and methods fail before database access", async () => {
  const { calls, send } = harness();
  for (const body of [{}, { cli_secret_key: {}, connection_id: "terminal" },
    { cli_secret_key: "secret", connection_id: "a/b" }]) {
    assert.equal((await send(body)).code, 400);
  }
  assert.equal((await send(undefined, "GET")).code, 405);
  assert.equal(calls.queries, 0);
});
test("database failure reports failure without successful revocation", async () => {
  const { calls, send } = harness({ fails: true });
  assert.equal((await send()).code, 500);
  assert.equal(calls.deleted.length, 0);
});
