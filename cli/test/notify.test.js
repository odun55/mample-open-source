const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function harness(result, ok = true) {
  const requests = [];
  const sandbox = { module: { exports: {} }, fetch: async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok, status: 429, json: async () => result };
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/notify'), 'utf8'), sandbox);
  return { notify: sandbox.module.exports.triggerNotification, requests };
}
test('empty and custom messages use the same endpoint and credentials', async () => {
  const { notify, requests } = harness({ success: true });
  for (const message of ['', 'Task completed', 'Görev tamamlandı!']) {
    await notify('secret', message, 'connection');
    assert.deepEqual(requests.at(-1).body, { cli_secret_key: 'secret', task_name: message, connection_id: 'connection' });
    assert.match(requests.at(-1).url, /triggerNotification$/);
  }
});
test('HTTP success without explicit confirmation is rejected', async () => {
  for (const result of [{}, { success: false }, null]) {
    await assert.rejects(harness(result).notify('secret', '', 'connection'), /not confirmed/);
  }
});
test('server errors are preserved', async () => {
  await assert.rejects(harness({ error: 'Rate limited' }, false).notify('secret', '', 'connection'), /Rate limited/);
});
