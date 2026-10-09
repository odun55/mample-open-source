# Mample website

This Next.js project contains the bilingual Mample site at [mample.vercel.app](https://mample.vercel.app).

## Content

- `/en`, `/tr`: free Mample, focused on the mobile app and CLI.
- `/en/guide`, `/tr/guide`: mobile pairing, terminal usage and AI coding workflows.
- `/en/extension`, `/tr/extension`: existing browser extension implementation and planned browser integration.
- Localized privacy and terms pages reflect the free product and actual Firebase data flow.

`/guide` and `/extension` redirect to their English versions. The Google Play / coming-soon section is intentionally preserved until the mobile release is ready.

There are no premium pricing cards or monthly notification allowances. Short-term anti-spam limits are explained separately.

## Work on the website

Use Node.js supported by the installed Next.js version.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To check a production build:

```bash
npm run build
npm start
```

The current layout uses Google Fonts, so a first build may need network access.

## Editing content

Translations live in `dictionaries/en.json` and `dictionaries/tr.json`. Keep both languages aligned. Shared navigation is in `components/SiteNav.js`.

Existing browser guides and animated demos are preserved in `ExtensionGuide.js` and `ExtensionDemo.js`. The CLI guide documents QR and manual Secret Key pairing; explain compatible release requirements without presenting pending physical-device tests as completed.

Sitemap, page metadata and `public/llms.txt` should be updated when the release scope or routes change.

See the [root README](../README.md) for product setup and backend requirements.

## Optional support link

Set NEXT_PUBLIC_SUPPORT_URL in Vercel to your verified HTTPS Buy Me a Coffee or Patreon creator page, then redeploy. Until configured, no payment button is rendered; the section shows a status message and feedback link. No account URL is invented.

## Demo media

Add gif_1 through gif_3 for extension demos, gif_4 through gif_6 for CLI demos, and gif_7 for the AI demo under public/images. MP4 takes priority and transitions at the actual end of each clip; GIF is a fallback. The shared player keeps a single card frame and preloads the media.
