// Keep canonical metadata, structured data and crawler files on the same origin.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mample.app'
).origin;
