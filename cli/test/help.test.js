const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Command } = require('commander');

async function run(args) {
  const program = new Command();
  let output = '';
  program.exitOverride().configureOutput({
    writeOut: text => { output += text; },
    writeErr: text => { output += text; },
  });
  const parse = program.parseAsync.bind(program);
  let parsed;
  program.parseAsync = (...values) => { parsed = parse(...values); return parsed; };
  const notifications = [];
  let configReads = 0;
  const sandbox = {
    console: { log(text) { output += text; }, error() {} },
    process: { argv: ['node', 'mample', ...args], exit() { throw new Error('Unexpected exit'); } },
    require(name) {
      if (name === 'commander') return { program };
      if (name === '../package.json') return require('../package.json');
      if (name === '../lib/disconnect') return {};
      if (name === '../lib/config') return { getConfig() {
        configReads++;
        return { cli_secret_key: 'test-key', connection_id: 'test-connection' };
      } };
      if (name === '../lib/notify') return { triggerNotification: async (_key, text) => notifications.push(text) };
      throw new Error('Unexpected dependency ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../bin/mample'), 'utf8'), sandbox);
  let error;
  await parsed.catch(value => { error = value; });
  return { output, notifications, configReads, error };
}

test('help commands never read credentials or send a notification', async () => {
  for (const args of [['help'], ['help', 'auth'], ['help', 'disconnect'], ['--help'], ['-h'], ['auth', '--help'], ['disconnect', '--help']]) {
    const result = await run(args);
    assert.match(result.output, /mample/);
    assert.doesNotMatch(result.output, /\[options\]|\[command\]|\[secret_key\]|\[task_name/);
    assert.deepEqual(result.notifications, []);
    assert.equal(result.configReads, 0);
    assert.equal(result.error.exitCode, 0);
    if (args.includes('auth')) assert.match(result.output, /mample auth qr/);
  }
});

test('main help has ready-to-use commands and needs no argument', async () => {
  const result = await run(['help']);
  for (const example of ['mample auth qr', 'mample "Test notification"',
    'mample auth "YOUR_SECRET_KEY"', 'mample disconnect', 'mample --version']) {
    assert.ok(result.output.includes(example));
  }
  assert.doesNotMatch(result.output, /Help:|mample help|mample --help/);
  assert.match(result.output, /Replace YOUR_SECRET_KEY/);
  assert.equal((await run(['--help'])).output, result.output);
});

test('installed version is read from the package release version', async () => {
  const result = await run(['--version']);
  assert.equal(result.output.trim(), require('../package.json').version);
  assert.equal(result.configReads, 0);
  assert.deepEqual(result.notifications, []);
});

test('help for an unknown command fails without sending a notification', async () => {
  const result = await run(['help', 'missing-command']);
  assert.equal(result.error.exitCode, 1);
  assert.deepEqual(result.notifications, []);
  assert.equal(result.configReads, 0);
});

test('ordinary notification text starting with help remains supported', async () => {
  const result = await run(['help me review the build']);
  assert.deepEqual(result.notifications, ['help me review the build']);
  assert.equal(result.error, undefined);
});

test('quoted and unquoted messages are parsed as notification text', async () => {
  for (const [args, message] of [
    [['done'], 'done'],
    [['Task completed'], 'Task completed'],
    [['Task', 'completed'], 'Task completed'],
  ]) {
    const result = await run(args);
    assert.deepEqual(result.notifications, [message]);
    assert.equal(result.error, undefined);
    assert.match(result.output, /Success: Notification sent!/);
  }
});


test('bare command and empty message select the default', async () => {
  for (const args of [[], ['']]) {
    const result = await run(args);
    assert.deepEqual(result.notifications, ['']);
    assert.equal(result.error, undefined);
    assert.match(result.output, /Success: Notification sent!/);
  }
});
