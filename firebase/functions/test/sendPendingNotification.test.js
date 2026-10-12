const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function harness({ userExists = true, queueExists = true, disabled = false, token = "token" } = {}) {
  const calls = { sent: 0, deleted: 0 };
  const user = { exists: userExists, data: () => ({ fcm_token: token, notifications_disabled: disabled }) };
  const snapshot = {
    data: () => ({ userId: "alice", fcmToken: "token", title: "Build", body: "Done" }),
    ref: { get: async () => ({ exists: queueExists }), delete: async () => { calls.deleted++; } },
  };
  const sandbox = { exports: {}, console, Date, require: (name) => {
    if (name === "firebase-functions/v2/firestore") return { onDocumentCreated: (_options, handler) => handler };
    if (name === "firebase-admin/firestore") return { getFirestore: () => ({
      collection: () => ({ doc: () => ({ get: async () => user }) }),
    }) };
    if (name === "firebase-admin/messaging") return { getMessaging: () => ({ send: async () => { calls.sent++; } }) };
    throw new Error(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve("../src/sendPendingNotification"), "utf8"), sandbox);
  return { calls, run: () => sandbox.exports.sendPendingNotification({ data: snapshot }) };
}

test("active account receives its queued notification", async () => {
  const h = harness();
  await h.run();
  assert.equal(h.calls.sent, 1);
  assert.equal(h.calls.deleted, 1);
});

test("deleted or disabled accounts and stale queue events are dropped without FCM delivery", async () => {
  for (const options of [{ userExists: false }, { disabled: true }, { queueExists: false }, { token: "new-token" }]) {
    const h = harness(options);
    await h.run();
    assert.equal(h.calls.sent, 0);
    assert.equal(h.calls.deleted, 1);
  }
});
