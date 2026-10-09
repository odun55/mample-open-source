const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function loadModule(path, dependencies) {
  const sandbox = { module: { exports: {} }, require: (name) => dependencies[name] };
  vm.runInNewContext(fs.readFileSync(require.resolve(path), "utf8"), sandbox);
  return sandbox.module.exports;
}
function harness(config, failure) {
  const calls = [];
  const { disconnect } = loadModule("../lib/disconnect", {
    "./config": { getConfig: () => config, clearConfig: () => calls.push("clear") },
    "./notify": { disconnectConnection: async (key, id) => {
      calls.push([key, id]);
      if (failure) throw new Error(failure);
    } },
  });
  return { disconnect, calls };
}
test("disconnect revokes remotely before removing local credentials", async () => {
  const { disconnect, calls } = harness({ cli_secret_key: "secret", connection_id: "terminal" });
  await disconnect();
  assert.deepEqual(calls, [["secret", "terminal"], "clear"]);
});
test("server failure keeps credentials available for retry", async () => {
  const { disconnect, calls } = harness({ cli_secret_key: "secret", connection_id: "terminal" }, "offline");
  await assert.rejects(disconnect(), /offline/);
  assert.deepEqual(calls, [["secret", "terminal"]]);
});
test("already disconnected is safe and incomplete credentials are retained", async () => {
  const empty = harness(null);
  await empty.disconnect();
  assert.deepEqual(empty.calls, ["clear"]);
  const incomplete = harness({ cli_secret_key: "secret" });
  await assert.rejects(incomplete.disconnect(), /incomplete/);
  assert.deepEqual(incomplete.calls, []);
});
test("transport sends owner credentials and rejects unconfirmed responses", async () => {
  const source = fs.readFileSync(require.resolve("../lib/notify"), "utf8");
  let response = { ok: true, json: async () => ({ success: true }) };
  const requests = [];
  const sandbox = { module: { exports: {} }, fetch: async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return response;
  } };
  vm.runInNewContext(source, sandbox);
  const { disconnectConnection } = sandbox.module.exports;
  await disconnectConnection("secret", "terminal");
  assert.match(requests[0].url, /disconnectCLIConnection$/);
  assert.deepEqual(requests[0].body, { cli_secret_key: "secret", connection_id: "terminal" });
  response = { ok: false, status: 401, json: async () => ({ error: "Invalid key" }) };
  await assert.rejects(disconnectConnection("secret", "terminal"), /Invalid key/);
  response = { ok: true, json: async () => ({}) };
  await assert.rejects(disconnectConnection("secret", "terminal"), /not confirmed/);
});

test("disconnect is routed as a command rather than notification text", async () => {
  const { Command } = require("commander");
  const program = new Command();
  const parse = program.parseAsync.bind(program);
  let parsed;
  program.parseAsync = (...args) => { parsed = parse(...args); return parsed; };
  let disconnected = 0;
  let notified = 0;
  const sandbox = {
    console: { log() {}, error() {} },
    process: { argv: ["node", "mample", "disconnect"], exit() { throw new Error("Unexpected exit"); } },
    require: (name) => {
      if (name === "commander") return { program };
      if (name === "../lib/disconnect") return { disconnect: async () => { disconnected++; } };
      if (name === "../lib/config") return { getConfig: () => ({}), saveConfig() {} };
      if (name === "../lib/notify") return { triggerNotification: async () => { notified++; } };
      throw new Error("Unexpected dependency: " + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../bin/mample"), "utf8"), sandbox);
  await parsed;
  assert.equal(disconnected, 1);
  assert.equal(notified, 0);
});
