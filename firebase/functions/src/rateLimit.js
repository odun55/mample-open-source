const WINDOW_MS = 60 * 1000;
const CONNECTION_LIMIT = 5;
const USER_LIMIT = 20;

// Both counters are consumed atomically, including under concurrent requests.
// UID stays the same when connections or CLI credentials are replaced.
async function checkRateLimits(db, userId, connectionKey, clock = Date.now) {
  const limits = [
    { ref: db.collection("rateLimits").doc(connectionKey), max: CONNECTION_LIMIT },
    { ref: db.collection("rateLimits").doc(`user_${userId}`), max: USER_LIMIT },
  ];
  return db.runTransaction(async (transaction) => {
    const now = clock();
    const snapshots = await transaction.getAll(...limits.map((limit) => limit.ref));
    const windows = snapshots.map((doc) => {
      const timestamps = doc.exists ? doc.data().timestamps : [];
      return (Array.isArray(timestamps) ? timestamps : [])
        .filter((ts) => Number.isFinite(ts) && ts > now - WINDOW_MS)
        .sort((a, b) => a - b);
    });
    let retryAfter = 0;
    for (let i = 0; i < limits.length; i++) {
      if (windows[i].length >= limits[i].max) {
        retryAfter = Math.max(retryAfter,
          Math.ceil((windows[i][windows[i].length - limits[i].max] + WINDOW_MS - now) / 1000));
      }
    }
    if (retryAfter > 0) return { allowed: false, retryAfter };
    limits.forEach((limit, i) => {
      transaction.set(limit.ref, { timestamps: [...windows[i], now] });
    });
    return { allowed: true, retryAfter: 0 };
  });
}

module.exports = { checkRateLimits, WINDOW_MS, CONNECTION_LIMIT, USER_LIMIT };
