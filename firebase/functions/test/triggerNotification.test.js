const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function harness({ disabled = false, allowed = true } = {}) {
  const calls = { queued: [], limits: [], checked: 0, reads: 0 };
  const user = { id: "alice", exists: true, data: () => ({
    fcm_token: "token", notifications_disabled: disabled,
    cli_secret_key_hash: require("node:crypto").createHash("sha256").update("secret").digest("hex"),
  }) };
  const db = { collection: (name) => ({
    doc: () => ({ get: async () => {
      calls.reads++;
      return name === "users" ? user :
        { exists: true, data: () => ({ uid: "alice", platform: "Chrome" }) };
    } }),
    where: () => ({ limit: () => ({ get: async () => {
      calls.reads++; return { empty: false, docs: [user] };
    } }) }),
    add: async (data) => calls.queued.push(data),
  }) };
  const sandbox = {
    exports: {}, Buffer, console,
    require: (name) => {
      if (name === "firebase-functions/v2/https") return { onRequest: (options, handler) => handler };
      if (name === "firebase-admin/firestore") return {
        getFirestore: () => db, FieldValue: { serverTimestamp: () => 123 },
      };
      if (name === "firebase-admin/app-check") return {
        getAppCheck: () => ({ verifyToken: async () => { calls.checked++; } }),
      };
      if (name === "./rateLimit") return { checkRateLimits: async (...args) => {
        calls.limits.push(args.slice(1)); return { allowed, retryAfter: allowed ? 0 : 42 };
      } };
      return require(name.startsWith("./") ? "../src/" + name.slice(2) : name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/triggerNotification"), "utf8"), sandbox);
  async function send(body, token) {
    const response = { code: 200, headers: {}, status(code) { this.code = code; return this; },
      json(value) { this.body = value; return this; },
      set(key, value) { this.headers[key] = value; return this; } };
    await sandbox.exports.triggerNotification({ method: "POST", body, header: () => token }, response);
    return response;
  }
  return { calls, send };
}

test("CLI and extension requests use the same owner's limiter before queueing", async () => {
  const { calls, send } = harness();
  assert.equal((await send({ cli_secret_key: "secret", task_name: "Build" })).code, 200);
  assert.equal((await send({ connection_id: "uuid" }, "app-check")).code, 200);
  assert.equal(calls.checked, 1);
  assert.equal(calls.queued.length, 2);
  assert.equal(calls.limits[0][0], "alice");
  assert.equal(calls.limits[1][0], "alice");
});

test("adding a CLI key cannot bypass App Check for a connection", async () => {
  const { calls, send } = harness();
  assert.equal((await send({ connection_id: "uuid", cli_secret_key: "fake" })).code, 401);
  assert.equal((await send({ connection_id: "uuid" })).code, 401);
  assert.equal(calls.checked, 0);
  assert.equal(calls.queued.length, 0);
});

test("rate rejection reports retry time and never queues a notification", async () => {
  const { calls, send } = harness({ allowed: false });
  const response = await send({ cli_secret_key: "secret" });
  assert.equal(response.code, 429);
  assert.equal(response.headers["Retry-After"], "42");
  assert.equal(response.body.retry_after, 42);
  assert.equal(calls.queued.length, 0);
});

test("server moderation blocks delivery before limiting or queueing", async () => {
  const { calls, send } = harness({ disabled: true });
  assert.equal((await send({ cli_secret_key: "secret" })).code, 403);
  assert.equal(calls.limits.length, 0);
  assert.equal(calls.queued.length, 0);
});

test("multi-byte message cannot create an oversized FCM payload", async () => {
  const { calls, send } = harness();
  assert.equal((await send({ cli_secret_key: "secret", task_name: "😀".repeat(400) })).code, 400);
  assert.equal(calls.queued.length, 0);
});

test("existing CLI clients may send connection ID with the matching owner key", async () => {
  const { calls, send } = harness();
  assert.equal((await send({ connection_id: "uuid", cli_secret_key: "secret", task_name: "Done" })).code, 200);
  assert.equal(calls.checked, 0);
  assert.equal(calls.queued.length, 1);
  assert.equal(calls.limits[0][0], "alice");
});

test("a key belonging to another owner cannot authorize a connection", async () => {
  const { calls, send } = harness();
  assert.equal((await send({ connection_id: "uuid", cli_secret_key: "different-owner-key" })).code, 401);
  assert.equal(calls.limits.length, 0);
  assert.equal(calls.queued.length, 0);
});
