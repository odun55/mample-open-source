const test = require("node:test");
const assert = require("node:assert/strict");
const { checkRateLimits } = require("../src/rateLimit");
const { validateNotificationRequest } = require("../src/notificationValidation");

function fakeDb() {
  const documents = new Map();
  let queue = Promise.resolve();
  return {
    documents,
    collection: () => ({ doc: (id) => ({ id }) }),
    // Serial transactions model Firestore's retry/serialization contract.
    runTransaction(callback) {
      const run = queue.then(async () => {
        const writes = [];
        const result = await callback({
          getAll: async (...refs) => refs.map(ref => ({
            exists: documents.has(ref.id), data: () => documents.get(ref.id),
          })),
          set: (ref, data) => writes.push([ref.id, data]),
        });
        writes.forEach(([id, data]) => documents.set(id, data));
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}

test("one connection admits five concurrent requests and rejects the rest", async () => {
  const db = fakeDb();
  const results = await Promise.all(Array.from({ length: 15 },
    () => checkRateLimits(db, "alice", "conn_a", () => 100000)));
  assert.equal(results.filter(r => r.allowed).length, 5);
  assert.equal(db.documents.get("user_alice").timestamps.length, 5);
  assert.equal(results.find(r => !r.allowed).retryAfter, 60);
});

test("new connections and rotated keys share the user limit", async () => {
  const db = fakeDb();
  for (let i = 0; i < 20; i++) {
    assert.equal((await checkRateLimits(db, "alice", `conn_${i}`, () => 100000)).allowed, true);
  }
  assert.equal((await checkRateLimits(db, "alice", "cli_rotated", () => 100000)).allowed, false);
  assert.equal(db.documents.has("cli_rotated"), false);
  assert.equal((await checkRateLimits(db, "bob", "conn_bob", () => 100000)).allowed, true);
});

test("sliding window recovers at the boundary and returns remaining wait", async () => {
  const db = fakeDb();
  for (let i = 0; i < 5; i++) await checkRateLimits(db, "alice", "conn_a", () => 100000);
  assert.deepEqual(await checkRateLimits(db, "alice", "conn_a", () => 159000),
    { allowed: false, retryAfter: 1 });
  assert.equal((await checkRateLimits(db, "alice", "conn_a", () => 160000)).allowed, true);
  assert.equal(db.documents.get("user_alice").timestamps.length, 1);
});

test("no monthly quota: hundreds of requests across windows remain allowed", async () => {
  const db = fakeDb();
  for (let i = 0; i < 600; i++) {
    assert.equal((await checkRateLimits(db, "alice", "conn_a", () => 100000 + i * 60000)).allowed, true);
  }
  assert.equal(db.documents.get("user_alice").timestamps.length, 1);
});

test("invalid credentials and payloads are rejected", () => {
  for (const body of [null, [], {}, { cli_secret_key: {} }, { connection_id: "" },
    { connection_id: "a/b" }, 
    { cli_secret_key: "a", task_name: "a".repeat(1001) },
    { cli_secret_key: "a", source: 42 }]) {
    assert.ok(validateNotificationRequest(body));
  }
  assert.equal(validateNotificationRequest({ cli_secret_key: "mample-old-key", task_name: "Done" }), null);
  assert.equal(validateNotificationRequest({ connection_id: "uuid", source: "CLI" }), null);
  assert.equal(validateNotificationRequest({ connection_id: "uuid", cli_secret_key: "secret" }), null);
});
