// Read-only diagnostics. Never print credentials, FCM tokens or user documents.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const auth = require(path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/auth'));
const project = 'mample-fca3c';
const base = 'https://firestore.googleapis.com/v1/projects/' + project + '/databases/(default)/documents';
async function main() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase login is required');
  const tokens = account.tokens.expires_at > Date.now() ? account.tokens :
    await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  async function api(url, body) {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: 'Bearer ' + tokens.access_token, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error('API request failed: HTTP ' + response.status + ' (' + (data.error?.status || 'unknown') + ')');
    return data;
  }
  const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.mample/config.json'), 'utf8'));
  const connection = await api(base + '/connections/' + encodeURIComponent(config.connection_id));
  const uid = connection.fields.uid.stringValue;
  const user = await api(base + '/users/' + uid);
  try {
    const { execFileSync } = require('node:child_process');
    const adb = path.join(process.env.LOCALAPPDATA, 'Android/Sdk/platform-tools/adb.exe');
    const xml = execFileSync(adb, ['-s', 'emulator-5554', 'shell', 'run-as', 'com.odunco.mample',
      'cat', 'shared_prefs/com.google.android.gms.appid.xml'], { encoding: 'utf8' });
    const decode = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    try {
      const prefs = execFileSync(adb, ['-s', 'emulator-5554', 'shell', 'run-as', 'com.odunco.mample',
        'cat', 'shared_prefs/FlutterSharedPreferences.xml'], { encoding: 'utf8' });
      const match = prefs.match(/name="flutter.mample_notifications"[^>]*>([\s\S]*?)<\/string>/);
      const encoded = match ? decode(match[1]) : '';
      const prefix = 'VGhpcyBpcyB0aGUgcHJlZml4IGZvciBhIGxpc3Qu';
      const history = encoded.startsWith(prefix + '!') ?
        JSON.parse(encoded.slice(prefix.length + 1)).join('\n') :
        Buffer.from(encoded.slice(prefix.length), 'base64').toString('utf8');
      console.log('Notification history test markers:', {
        foreground: history.includes('Mample tanilama'),
        background: history.includes('Mample arka plan testi'),
        channel: history.includes('Mample kanal testi'),
      });
    } catch { console.log('Notification history comparison unavailable'); }
    const deviceTokens = [...xml.matchAll(/<string[^>]*>([\s\S]*?)<\/string>/g)].flatMap((match) => {
      try { const item = JSON.parse(decode(match[1])); return item.token ? [item.token] : []; } catch { return []; }
    });
    console.log('Android FCM token match:', { tokenCount: deviceTokens.length,
      matchesUser: deviceTokens.includes(user.fields.fcm_token?.stringValue) });
  } catch { console.log('Android token comparison unavailable'); }
  console.log('User delivery fields:', {
    hasFcmToken: !!user.fields.fcm_token?.stringValue,
    updatedAt: user.fields.updated_at?.timestampValue,
    notificationsDisabled: user.fields.notifications_disabled?.booleanValue || false,
  });
  async function query(collection, field) {
    return (await api(base + ':runQuery', { structuredQuery: {
      from: [{ collectionId: collection }],
      where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: uid } } },
    } })).filter((row) => row.document).map((row) => row.document);
  }
  const connections = await query('connections', 'uid');
  console.log('Connection summary:', connections.map((doc) => ({
    currentTerminal: doc.name.endsWith('/' + config.connection_id),
    platform: doc.fields.platform?.stringValue,
    createdAt: doc.fields.created_at?.timestampValue,
    expiring: !!doc.fields.expires_at,
  })));
  const queued = await query('pending_notifications', 'userId');
  console.log('Pending notifications:', queued.map((doc) => ({
    status: doc.fields.status?.stringValue,
    createdAt: doc.fields.createdAt?.timestampValue,
    sameTokenAsUser: doc.fields.fcmToken?.stringValue === user.fields.fcm_token?.stringValue,
  })));
  const fn = await api('https://cloudfunctions.googleapis.com/v2/projects/' + project + '/locations/europe-west1/functions/sendPendingNotification');
  console.log('Delivery function:', {
    state: fn.state,
    eventRegion: fn.eventTrigger?.triggerRegion,
    eventServiceAccount: fn.eventTrigger?.serviceAccountEmail,
    retryPolicy: fn.eventTrigger?.retryPolicy,
  });
  const policy = await api('https://run.googleapis.com/v2/projects/' + project + '/locations/europe-west1/services/sendpendingnotification:getIamPolicy');
  console.log('Delivery invokers:', (policy.bindings || []).filter((b) => b.role === 'roles/run.invoker'));
  if (!process.argv.includes('--logs')) return;
  const logs = await api('https://logging.googleapis.com/v2/entries:list', {
    resourceNames: ['projects/' + project],
    filter: 'resource.type="cloud_run_revision" AND resource.labels.service_name="sendpendingnotification" AND timestamp>="' + new Date(Date.now() - 30 * 60 * 1000).toISOString() + '"',
    orderBy: 'timestamp desc', pageSize: 25,
  });
  console.log('Delivery request status:', (logs.entries || []).map((entry) => ({
    timestamp: entry.timestamp, severity: entry.severity,
    httpStatus: entry.httpRequest?.status,
    message: entry.textPayload && /not authenticated|STARTUP|new instance/.test(entry.textPayload) ?
      entry.textPayload.slice(0, 120) : undefined,
    errorCode: entry.jsonPayload?.errorInfo?.code,
  })));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
