const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function authenticate(state, { saveFailure = false, networkFailure = false } = {}) {
  const calls = [];
  const sandbox = {
    module: { exports: {} },
    console: { log() {}, error() {} },
    process: { argv: ['node', 'mample', 'auth', 'secret'], exit() { throw new Error('auth failed'); } },
    require(name) {
      if (name === 'node:crypto') return { randomUUID: () => '00000000-0000-4000-8000-000000000001' };
      if (name === 'node:os') return { hostname: () => 'My PC' };
      if (name === './config') return {
        getConfig: () => ({ ...state }),
        saveConfig: (value) => {
          calls.push('save');
          if (saveFailure) throw new Error('EPERM');
          Object.assign(state, value);
        },
      };
      if (name === './notify') return {
        registerConnection: async (key, name, terminal, previous) => {
          calls.push({ key, name, terminal, previous });
          if (networkFailure) throw new Error('offline');
          return { connection_id: 'connection' };
        },
      };
      throw new Error('Unexpected dependency ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/auth'), 'utf8'), sandbox);
  await sandbox.module.exports.authenticateTerminal('secret').catch(() => {});
  return calls;
}

test('auth persists retry identity before network access and reuses it on retry', async () => {
  const state = {};
  const failed = await authenticate(state, { networkFailure: true });
  assert.equal(failed[0], 'save');
  const identity = state.terminal_id;
  assert.ok(identity);
  const retry = await authenticate(state);
  assert.equal(retry[1].terminal, identity);
  assert.equal(state.connection_id, 'connection');
});

test('local save failure prevents orphan connections on the server', async () => {
  const calls = await authenticate({}, { saveFailure: true });
  assert.deepEqual(calls, ['save']);
});

test('auth reuses only the connection belonging to the same saved key', async () => {
  const same = await authenticate({ cli_secret_key: 'secret', connection_id: 'existing' });
  assert.equal(same[1].previous, 'existing');
  assert.equal(same[1].name, 'My PC');
  const different = await authenticate({ cli_secret_key: 'other-secret', connection_id: 'other-account' });
  assert.equal(different[1].previous, undefined);
});

test('successful manual auth discards pending QR recovery from another attempt', async () => {
  const state = { pending_qr: { old: true } };
  await authenticate(state);
  assert.equal(state.pending_qr, null);
});

test('auth routes explicit QR and no-key usage to pairing; manual keys to shared auth', async () => {
  for (const args of [[], ['--qr'], ['phone-secret'], ['phone-secret', '--qr']]) {
    const { Command } = require('commander');
    const program = new Command();
    const parse = program.parseAsync.bind(program);
    let finished;
    program.parseAsync = (...values) => { finished = parse(...values); return finished; };
    const calls = [];
    const sandbox = { console: { log() {}, error() {} },
      process: { argv: ['node', 'mample', 'auth', ...args], exit: () => { throw new Error('invalid options'); } },
      require(name) {
        if (name === 'commander') return { program };
        if (name === '../lib/config') return {};
        if (name === '../lib/notify') return {};
        if (name === '../lib/disconnect') return {};
        if (name === '../lib/auth') return { authenticateTerminal: async (key) => calls.push(key) };
        if (name === '../lib/pair') return { pairTerminal: async () => calls.push('QR') };
        throw new Error('Unexpected dependency ' + name);
      },
    };
    vm.runInNewContext(fs.readFileSync(require.resolve('../bin/mample'), 'utf8'), sandbox);
    await finished.catch(() => {});
    assert.deepEqual(calls, args.length === 2 ? [] : args[0] === 'phone-secret' ? ['phone-secret'] : ['QR']);
  }
});
