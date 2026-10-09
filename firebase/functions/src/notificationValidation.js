function validateNotificationRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Invalid request body";
  const { connection_id, cli_secret_key } = body;
  if (connection_id === undefined && cli_secret_key === undefined) {
    return "Provide connection_id or cli_secret_key";
  }
  for (const [field, max] of [["connection_id", 256], ["cli_secret_key", 256],
    ["task_name", 1000], ["source", 100]]) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string" || body[field].length > max) {
      return `Invalid ${field} (maximum ${max} characters)`;
    }
    if ((field === "connection_id" || field === "cli_secret_key") && !body[field].trim()) {
      return `Invalid ${field}`;
    }
  }
  if (connection_id && connection_id.includes("/")) return "Invalid connection_id";
  return null;
}
module.exports = { validateNotificationRequest };
