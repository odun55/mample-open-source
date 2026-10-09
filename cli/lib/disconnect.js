const { getConfig, clearConfig } = require("./config");
const { disconnectConnection } = require("./notify");

async function disconnect() {
  const config = getConfig();
  if (!config) {
    clearConfig();
    return;
  }
  if (!config.cli_secret_key || !config.connection_id) {
    throw new Error("The saved connection is incomplete. Revoke this terminal from the mobile app.");
  }
  await disconnectConnection(config.cli_secret_key, config.connection_id);
  clearConfig();
}

module.exports = { disconnect };
