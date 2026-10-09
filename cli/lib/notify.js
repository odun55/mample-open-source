/**
 * Firebase Cloud Function Tetikleyici
 */

const FIREBASE_FUNCTION_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/triggerNotification";

async function triggerNotification(secretKey, taskName, connectionId) {
  // Node.js 18+ ile gelen yerleşik fetch kullanılır.
  const response = await fetch(FIREBASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cli_secret_key: secretKey,
      task_name: taskName,
      connection_id: connectionId
    })
  });

  if (!response.ok) {
    let errMsg = `Server Error: HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errMsg = data.error;
    } catch (e) {}
    
    throw new Error(errMsg);
  }

  return await response.json();
}

const REGISTER_FUNCTION_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/registerCLIConnection";

async function registerConnection(secretKey, pcName, terminalId, previousConnectionId) {
  const response = await fetch(REGISTER_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cli_secret_key: secretKey,
      pc_name: pcName,
      terminal_id: terminalId,
      connection_id: previousConnectionId
    })
  });

  if (!response.ok) {
    let errMsg = `Connection Registration Failed: HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errMsg = data.error;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return await response.json();
}

async function disconnectConnection(secretKey, connectionId) {
  const response = await fetch("https://europe-west1-mample-fca3c.cloudfunctions.net/disconnectCLIConnection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cli_secret_key: secretKey, connection_id: connectionId })
  });
  if (!response.ok) {
    let message = `Disconnection failed: HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) message = data.error;
    } catch (error) {}
    throw new Error(message);
  }
  const result = await response.json();
  if (result.success !== true) throw new Error("Disconnection was not confirmed by the server.");
  return result;
}

module.exports = {
  disconnectConnection,
  triggerNotification,
  registerConnection
};

