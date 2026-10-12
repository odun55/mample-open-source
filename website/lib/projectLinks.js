export const githubUrl = 'https://github.com/odun55/mample-open-source';

// Activate the badge only when a real Google Play listing is configured.
const configuredGooglePlayUrl = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ?? '';
let googlePlayUrl = null;
try {
  const url = new URL(configuredGooglePlayUrl);
  if (url.protocol === 'https:' && url.hostname === 'play.google.com' &&
      url.pathname === '/store/apps/details' && url.searchParams.get('id') &&
      !url.username && !url.password && !url.port) {
    googlePlayUrl = url.href;
  }
} catch {}

export { googlePlayUrl };
