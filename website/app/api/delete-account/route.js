// Keep the credential on the same-origin HTTPS path. No analytics events,
// request-body logging, URL parameters or persistence contain the Secret Key.
export async function POST(request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) {
    return Response.json({ error: 'origin' }, { status: 403 });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  const body = await request.text();
  if (body.length > 2048) return Response.json({ error: 'invalid' }, { status: 400 });
  try {
    const data = JSON.parse(body);
    if (data.confirm !== true || typeof data.cli_secret_key !== 'string' ||
      !/^mample-[A-Za-z0-9_-]{6,249}$/.test(data.cli_secret_key)) {
      return Response.json({ error: 'invalid' }, { status: 400 });
    }
    const upstream = await fetch('https://europe-west1-mample-fca3c.cloudfunctions.net/deleteAccountWithKey', {
      method: 'POST', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cli_secret_key: data.cli_secret_key, confirm: true }),
      signal: AbortSignal.timeout(125000),
    });
    return Response.json(await upstream.json(), {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'retry' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
export const maxDuration = 150;
