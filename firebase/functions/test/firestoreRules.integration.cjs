const assert = require("node:assert/strict");
const host = process.env.FIRESTORE_EMULATOR_HOST;
const project = process.env.GCLOUD_PROJECT || "demo-mample";
assert.ok(host && /^(127\.0\.0\.1|localhost):\d+$/.test(host), "Local Firestore emulator required");
assert.equal(project, "demo-mample", "Tests must use the demo project");
const base = "http://" + host + "/v1/projects/" + project + "/databases/(default)/documents/";
function token(uid) {
  const now = Math.floor(Date.now() / 1000);
  return Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url") + "." +
    Buffer.from(JSON.stringify({ sub: uid, user_id: uid, aud: project, iss: "https://securetoken.google.com/" + project,
      iat: now, exp: now + 3600, firebase: { sign_in_provider: "anonymous" } })).toString("base64url") + ".";
}
async function request(method, path, fields, identity, expected) {
  const response = await fetch(base + path, {
    method, headers: { "Content-Type": "application/json",
      ...(identity ? { Authorization: "Bearer " + (identity === "admin" ? "owner" : token(identity)) } : {}) },
    ...(fields ? { body: JSON.stringify({ fields }) } : {}),
  });
  const body = await response.text();
  assert.equal(response.status, expected, method + " " + path + ": " + body);
}
(async () => {
  await request("PATCH", "users/alice", { fcm_token: { stringValue: "token" }, cli_secret_key_hash: { stringValue: "hash" } }, "alice", 200);
  await request("GET", "users/alice", null, "bob", 403);
  await request("GET", "users/alice", null, null, 403);
  await request("PATCH", "users/alice?updateMask.fieldPaths=notifications_disabled", { notifications_disabled: { booleanValue: false } }, "alice", 403);
  await request("PATCH", "users/alice?updateMask.fieldPaths=notifications_disabled", { notifications_disabled: { booleanValue: true } }, "admin", 200);
  await request("PATCH", "users/alice?updateMask.fieldPaths=fcm_token", { fcm_token: { stringValue: "new-token" } }, "alice", 200);
  await request("DELETE", "users/alice", null, "alice", 403);
  await request("PATCH", "users/bob", { notifications_disabled: { booleanValue: false } }, "bob", 403);
  await request("PATCH", "rateLimits/secret", { value: { integerValue: "5" } }, "alice", 403);
  await request("PATCH", "pending_notifications/job", { title: { stringValue: "Fake" } }, "alice", 403);
  await request("PATCH", "connections/terminal", { uid: { stringValue: "alice" }, platform: { stringValue: "Terminal" },
    created_at: { timestampValue: new Date().toISOString() },
    expires_at: { timestampValue: new Date(Date.now() + 23 * 3600000).toISOString() } }, "alice", 200);
  await request("PATCH", "connections/terminal?updateMask.fieldPaths=uid", { uid: { stringValue: "bob" } }, "alice", 403);
  await request("PATCH", "connections/terminal?updateMask.fieldPaths=platform", { platform: { stringValue: "My PC" } }, "alice", 200);
  await request("DELETE", "connections/terminal", null, "bob", 403);
  await request("DELETE", "connections/terminal", null, "alice", 200);
  console.log("15 Firestore emulator checks passed: ownership, moderation, settings, server-only data and connections.");
})().catch(error => { console.error(error); process.exitCode = 1; });
