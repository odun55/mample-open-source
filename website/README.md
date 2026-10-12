# Mample website

This Next.js project contains the bilingual Mample site at [mample.app](https://mample.app).

## Content

- `/en`, `/tr`: free Mample, focused on the mobile app and CLI.
- `/en/guide`, `/tr/guide`: mobile pairing, terminal usage and AI coding workflows.
- `/en/extension`, `/tr/extension`: browser extension preview and planned integration. Extension source is maintained separately from this public release.
- Localized privacy and terms pages reflect the free product and actual Firebase data flow.

`/guide` and `/extension` redirect to their English versions. The homepage hero has an official localized black Google Play badge and an official GitHub logo lockup on a white source button. Set `NEXT_PUBLIC_GOOGLE_PLAY_URL` to the real Google Play listing URL to activate the download button; it stays inactive while the URL is empty. The former coming-soon store panel and release-email CTA have been removed.

The Mample Extension link appears within the development preview below the support panel and in the footer. Its two words stay together when text wraps. The footer provides Guide, Mample Extension, FAQ, GitHub, privacy, terms and contact links. The main navigation contains Guide, Support and the language switcher, sharing a compact row on mobile.

The rotating hero has a separate task-name line, and its description states that
Mample is open source, free and has no subscription or monthly notification quota.
Google Play and GitHub actions both have a visible height of 60px; their official
assets retain their aspect ratios. Asset provenance is in `public/brand/README.md`.

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

The support button links to [Mample on Buy Me a Coffee](https://buymeacoffee.com/mample) by default in both languages. No environment variable is required. `NEXT_PUBLIC_SUPPORT_URL` can override the address with an HTTPS Buy Me a Coffee or Patreon creator page; explicitly setting it to an empty value hides the payment button. Changes require a rebuild and redeploy.

The support panel uses a warm amber surface, a yellow heart-and-arrow button and
the already bundled Geist font. The button reads “Support Mample” / “Mample’ı
destekle” and is rendered on the server as a regular link. The old Buy Me a Coffee
embed, Comic font and external-script/font CSP allowances have been removed.
There is no script loading state, provider logo or “Buy me a coffee” label.
Support does not unlock features, subscriptions or usage privileges.

`components/SupportButton.js` holds the link markup; `app/page.module.css`
contains the panel and button styling. Keep visible copy in both dictionaries.

## Demo media

The terminal section uses one continuous `public/images/terminal-demo.mp4` clip
through `components/TerminalDemo.js`. Clicking the video (or pressing Enter/Space
on its button) pauses/resumes at the current position. It loops and pauses when
offscreen or the tab is hidden. The three explanation cards are informational;
they do not seek or change the video. All descriptions remain visible on mobile.

After editing the final clip, set the three chapter start times in seconds in
`lib/terminalDemo.js` (`chapterStarts`, starting at zero). Until then, keep it null:
there are no estimated progress bars. Valid timings follow the video's current
time, so pausing also pauses progress. The MP4 is required for actual pause/resume;
an animated GIF is not a fallback for this section. Missing media shows a placeholder.

The AI section reuses the same pauseable player with `lib/aiDemo.js`. Its two
informational cards cover terminal setup/pairing and the assistant instruction.
`ai-demo.mp4` is a standalone Antigravity recording edited to 38.4 seconds,
1280x720 at 30 fps. It shows Always Proceed, prompt typing, assistant work and
the real CLI acceptance response. It contains no installation or pairing clip.
`lib/aiDemo.js` keeps `chapterStarts: null` and `activeCard: 1`; both cards are
noninteractive and the prerequisite installation/pairing card has no progress
bar. Clicking the video pauses/resumes it. The production clip is bundled in
`public/images/ai-demo.mp4`.
The instruction card states terminal access and persistent Mample command
permission directly, using “Send me a mobile notification using Mample.”
The Guide explains these requirements in a short setup note. The IDE FAQ
lists terminal-capable coding assistants; permission illustrations, video,
asterisks and separate permission sections are no longer part of this flow.

The Guide offers one shared `public/setup.md` download containing a single
Mample rule, ready to copy in full into existing project rules or custom
instructions. Usage instructions and example destinations live in the Guide;
saving a file named setup.md does not automatically activate it.
`cli/ai-templates/setup.md` contains the same template. The existing CLAUDE.md
download URL remains available for compatibility but is no longer advertised.

Extension demo assets are optional; the shared player shows a placeholder when
media is absent.
