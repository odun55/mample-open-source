const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const configDir = path.join(os.homedir(), '.mample');
const configFile = path.join(configDir, 'config.json');

function protectConfig(file) {
  if (os.platform() !== 'win32') {
    fs.chmodSync(file, 0o600);
    return;
  }

  // Account names can resolve to a machine/domain rather than the user.
  // Use the SID from the current access token and pass arguments without a shell.
  const identity = execFileSync('whoami.exe', ['/user', '/fo', 'csv', '/nh'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  const match = identity.match(/"(S-\d+(?:-\d+)+)"\s*$/m);
  if (!match) throw new Error('Unable to determine the current Windows user SID.');
  execFileSync('icacls.exe', [
    file, '/grant:r', '*' + match[1] + ':(M)', '/inheritance:r', '/q',
  ], { stdio: 'ignore', windowsHide: true });
}

function getConfig() {
  let data;
  try {
    data = fs.readFileSync(configFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error('Cannot read Mample credentials at ' + configFile +
      ' (' + error.code + '). Check the file permissions; the saved connection was preserved.');
  }

  let config;
  try {
    config = JSON.parse(data);
  } catch (error) {
    throw new Error('Saved Mample credentials are invalid JSON at ' + configFile +
      '. The file was preserved.');
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Saved Mample credentials must be a JSON object at ' + configFile + '.');
  }
  return config;
}

function saveConfig(configData, { quiet = false } = {}) {
  fs.mkdirSync(configDir, { recursive: true });
  const current = getConfig() || {};
  const data = JSON.stringify({ ...current, ...configData }, null, 2);
  const temporaryFile = path.join(configDir, 'config.' + crypto.randomUUID() + '.tmp');
  try {
    // Secure the new file before replacing existing credentials.
    fs.writeFileSync(temporaryFile, data, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
    protectConfig(temporaryFile);
    fs.renameSync(temporaryFile, configFile);
  } finally {
    try {
      fs.unlinkSync(temporaryFile);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  if (quiet) return;
  console.log('Secret Key saved successfully!');
  console.log('Key location: ' + configFile);
}

function clearConfig() {
  try {
    fs.unlinkSync(configFile);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { clearConfig, saveConfig, getConfig };
