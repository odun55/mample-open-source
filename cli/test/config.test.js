const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const childProcess = require('node:child_process');

function loadConfig(home, overrides = {}) {
  const dependencies = {
    fs, path, crypto: require('node:crypto'),
    os: { homedir: () => home, platform: () => os.platform() },
    child_process: childProcess,
    ...overrides,
  };
  const sandbox = {
    module: { exports: {} }, require: (name) => dependencies[name],
    console: { log() {} },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/config'), 'utf8'), sandbox);
  return sandbox.module.exports;
}

function fixture(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'mample config test '));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return { home, file: path.join(home, '.mample', 'config.json') };
}

test('credentials can be saved, replaced, read and deleted with private permissions', (t) => {
  const { home, file } = fixture(t);
  const config = loadConfig(home);
  assert.equal(config.getConfig(), null);
  config.saveConfig({ cli_secret_key: 'test-secret', connection_id: 'first' });
  config.saveConfig({ connection_id: 'second' });
  assert.equal(config.getConfig().cli_secret_key, 'test-secret');
  assert.equal(config.getConfig().connection_id, 'second');
  if (os.platform() === 'win32') {
    const identity = childProcess.execFileSync('whoami.exe', ['/user', '/fo', 'csv', '/nh'], { encoding: 'utf8' });
    const expectedSid = identity.match(/"(S-\d+(?:-\d+)+)"\s*$/m)[1];
    const script = "$a=Get-Acl -LiteralPath $env:MAMPLE_TEST_CONFIG_PATH; $a.Access | ForEach-Object { $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value }";
    const allowedSids = childProcess.execFileSync('powershell.exe', ['-NoProfile', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], { encoding: 'utf8', env: { ...process.env, MAMPLE_TEST_CONFIG_PATH: file } }).trim().split(/\r?\n/);
    assert.deepEqual(allowedSids, [expectedSid]);
  } else {
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  }
  config.clearConfig();
  assert.equal(config.getConfig(), null);
  config.clearConfig();
});

test('permission failure keeps the previous credentials and removes temporary files', (t) => {
  const { home, file } = fixture(t);
  const normal = loadConfig(home);
  normal.saveConfig({ cli_secret_key: 'previous-secret', connection_id: 'first' });
  const failing = loadConfig(home, {
    os: { homedir: () => home, platform: () => 'win32' },
    child_process: { execFileSync: (command) => {
      if (command === 'whoami.exe') return '"user","S-1-5-21-1-2-3-1001"\r\n';
      throw new Error('ACL update failed');
    } },
  });
  assert.throws(() => failing.saveConfig({ cli_secret_key: 'new-secret' }), /ACL update failed/);
  assert.equal(normal.getConfig().cli_secret_key, 'previous-secret');
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['config.json']);
});

test('unreadable credentials report an access error instead of pretending to be disconnected', () => {
  const config = loadConfig('test-home', {
    fs: { readFileSync() { throw Object.assign(new Error('denied'), { code: 'EPERM' }); } },
  });
  assert.throws(() => config.getConfig(), /Cannot read Mample credentials.*EPERM/);
});

test('malformed credentials are preserved and cannot be overwritten silently', (t) => {
  const { home, file } = fixture(t);
  fs.mkdirSync(path.dirname(file));
  fs.writeFileSync(file, '{invalid-json');
  const config = loadConfig(home);
  assert.throws(() => config.saveConfig({ cli_secret_key: 'new-secret' }), /invalid JSON/);
  assert.equal(fs.readFileSync(file, 'utf8'), '{invalid-json');
});
