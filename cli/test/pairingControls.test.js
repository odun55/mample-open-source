const test = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('node:stream');
const { createPairingControls } = require('../lib/pairingControls');

function input() {
  const stream = new PassThrough();
  stream.isTTY = true;
  stream.isRaw = false;
  stream.setRawMode = value => { stream.isRaw = value; };
  return stream;
}

test('R and Q work without Enter, and terminal input is restored', async () => {
  const stream = input();
  stream.pause();
  const controls = createPairingControls(stream);
  assert.equal(stream.isRaw, true);
  stream.emit('keypress', 'r', { name: 'r' });
  assert.equal(await controls.next(2000), 'refresh');
  const next = controls.next(2000);
  stream.emit('keypress', 'q', { name: 'q' });
  assert.equal(await next, 'cancel');
  controls.close();
  assert.equal(stream.isRaw, false);
  assert.equal(stream.isPaused(), true);
  assert.equal(stream.listenerCount('keypress'), 0);
});

test('Ctrl+C remains an emergency cancel and closing clears pending timers', async () => {
  const stream = input();
  const controls = createPairingControls(stream);
  stream.emit('keypress', '\u0003', { name: 'c', ctrl: true });
  assert.equal(controls.take(), 'cancel');
  const pending = controls.next(2000);
  controls.close();
  assert.equal(await pending, 'cancel');
  assert.equal(stream.isPaused(), true);
});
