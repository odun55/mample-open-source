const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");
const terminalId = "00000000-0000-4000-8000-000000000001";

function harness({ validKey = true, rotated = false, disabled = false, existing = [] } = {}) {
  const hash = crypto.createHash("sha256").update("secret").digest("hex");
  const docs = new Map(existing);
  const userRef = { id: "alice", type: "user" };
  let queries = 0, autoId = 0;
  const db = {
    collection(name) {
      if (name === "users") return { where: () => ({ limit: () => ({ get: async () => {
        queries++;
        return { empty: !validKey, docs: [{ id: "alice", ref: userRef }] };
      } }) }) };
      return { doc: (id) => ({ id: id || "auto-" + (++autoId) }) };
    },
    runTransaction: async (callback) => callback({
      getAll: async (...refs) => refs.map((ref) => ref.type === "user" ?
        { exists: true, data: () => ({ cli_secret_key_hash: rotated ? "rotated" : hash, notifications_disabled: disabled }) } :
        { id: ref.id, ref, exists: docs.has(ref.id), data: () => docs.get(ref.id) }),
      create: (ref, value) => { assert.equal(docs.has(ref.id), false); docs.set(ref.id, value); },
      update: (ref, value) => docs.set(ref.id, { ...docs.get(ref.id), ...value }),
    }),
  };
  const sandbox = { exports: {}, console: { error() {} }, require(name) {
    if (name === "firebase-functions/v2/https") return { onRequest: (options, handler) => handler };
    if (name === "firebase-admin/firestore") return { getFirestore: () => db, FieldValue: { serverTimestamp: () => "created" } };
    return require(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/registerCLIConnection"), "utf8"), sandbox);
  async function send(body = { cli_secret_key: "secret", pc_name: "My PC", terminal_id: terminalId }) {
    const response = { status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
    await sandbox.exports.registerCLIConnection({ method: "POST", body }, response);
    return response;
  }
  return { send, docs, queries: () => queries };
}

test("retrying the same terminal after a lost response reuses one connection", async () => {
  const h = harness();
  const first = await h.send();
  const second = await h.send();
  assert.equal(first.code, 200);
  assert.equal(first.body.created, true);
  assert.equal(second.body.created, false);
  assert.equal(first.body.connection_id, second.body.connection_id);
  assert.equal(h.docs.size, 1);
});

test("different installations retain separate terminal connections", async () => {
  const h = harness();
  await h.send();
  await h.send({ cli_secret_key: "secret", terminal_id: "00000000-0000-4000-8000-000000000002" });
  assert.equal(h.docs.size, 2);
});

test("migration preserves legacy connection IDs and custom names", async () => {
  const h = harness({ existing: [["legacy", { uid: "alice", platform: "My renamed terminal", created_at: "original" }]] });
  const response = await h.send({ cli_secret_key: "secret", pc_name: "My PC", terminal_id: terminalId, connection_id: "legacy" });
  assert.equal(response.body.connection_id, "legacy");
  assert.equal(h.docs.size, 1);
  assert.equal(h.docs.get("legacy").platform, "My renamed terminal");
  assert.equal(h.docs.get("legacy").created_at, "original");
  assert.equal(h.docs.get("legacy").terminal_id, terminalId);
});

test("another owner's connection and rotated credentials cannot be reused", async () => {
  const h = harness({ existing: [["legacy", { uid: "bob", platform: "Private PC" }]] });
  assert.equal((await h.send({ cli_secret_key: "secret", terminal_id: terminalId, connection_id: "legacy" })).code, 401);
  assert.equal(h.docs.size, 1);
  for (const options of [{ validKey: false }, { rotated: true }]) {
    const blocked = harness(options);
    assert.equal((await blocked.send()).code, 401);
    assert.equal(blocked.docs.size, 0);
  }
});

test("invalid registration input is rejected before querying Firestore", async () => {
  for (const values of [{ cli_secret_key: {} }, { terminal_id: "../invalid" }, { pc_name: "x".repeat(101) }, { connection_id: "../other" }]) {
    const h = harness();
    assert.equal((await h.send({ cli_secret_key: "secret", ...values })).code, 400);
    assert.equal(h.queries(), 0);
  }
});

test("moderated accounts cannot create terminal connections", async () => {
  const h = harness({ disabled: true });
  assert.equal((await h.send()).code, 403);
  assert.equal(h.docs.size, 0);
});
