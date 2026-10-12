const readline = require('node:readline');

function createPairingControls(input = process.stdin) {
  const queued = [];
  let waiter;
  const interactive = Boolean(input.isTTY && input.setRawMode);
  const wasRaw = input.isRaw;
  const wasFlowing = input.readableFlowing;
  function onKey(_text, key = {}) {
    const action = key.name === 'q' || (key.ctrl && key.name === 'c') ? 'cancel' : key.name === 'r' ? 'refresh' : null;
    if (!action) return;
    if (waiter) waiter(action);
    else if (!queued.includes(action)) queued.push(action);
  }
  if (interactive) {
    readline.emitKeypressEvents(input);
    input.setRawMode(true);
    input.on('keypress', onKey);
    input.resume();
  }
  return {
    interactive,
    take: () => queued.shift(),
    next(ms) {
      if (queued.length) return Promise.resolve(queued.shift());
      return new Promise(resolve => {
        const timer = setTimeout(() => finish(null), ms);
        function finish(action) {
          clearTimeout(timer);
          waiter = null;
          resolve(action);
        }
        waiter = finish;
      });
    },
    close() {
      if (waiter) waiter('cancel');
      if (!interactive) return;
      input.removeListener('keypress', onKey);
      input.setRawMode(Boolean(wasRaw));
      // A previously untouched stdin has readableFlowing === null. Leaving it
      // resumed would keep Node alive after Q or successful pairing.
      if (wasFlowing !== true) input.pause();
    },
  };
}

module.exports = { createPairingControls };
