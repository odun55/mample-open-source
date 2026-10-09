# Website content updates — 2026-10-08

## Purpose

Document QR as an alternative to manual CLI Secret Key entry in the website guide
and homepage demo. Lead the hero description with the benefit of stepping away
from the screen; place the free-product message at the end.

## Files changed

- `website/dictionaries/tr.json` and `website/dictionaries/en.json`: replaced the
  hero description that opened with the free-product claim. The new copy starts
  with finishing work without waiting at the screen and ends with “%100 ücretsiz”
  / “100% free.” Added matching translations for QR and Secret Key setup options,
  scanning instructions, and the difference between QR invitation expiry and
  permanent terminal connections. Replaced the old Secret-Key-only demo copy.
- `website/app/[lang]/page.js`: the terminal connection explanation beside the
  existing GIF now shows both `mample auth --qr` and `mample auth "secret_key"`.
  Both methods lead to the same connection flow; existing media and playback
  behavior are preserved.
- `website/app/[lang]/guide/page.js`: added clearly labeled QR and manual key
  methods inside CLI Setup and Connection, reusing existing heading and code-block
  styles. The guide explains single-use invitations, 90-second refresh, and
  permanent terminal connections. Manual key entry remains documented.
- `docs/website-content-updates.md`: records the scope, purpose and removed copy.

## Removed or preserved

Removed the hero's opening “Mample is 100% free” / “Mample tamamen ücretsiz” and
the implication that manual Secret Key entry is the only CLI connection option.
No commands, GIF assets, animation behavior, routes or product features were removed.
The animated HeroTitle itself remains unchanged; its description was rewritten.

## Verification

`npm run build` completed successfully. The generated `/tr`, `/en`, `/tr/guide`
and `/en/guide` HTML was checked for both connection commands, the new hero copy,
and the QR invitation / permanent connection explanation. `git diff --check`
passed for this change. These website edits have not been deployed.

## Support layout and release preparation

The old central coffee-themed support block was replaced with a compact panel
after the FAQ and before the footer. Desktop uses copy on the left and actions on
the right; mobile stacks them. `website/app/[lang]/page.js` contains the new
semantic section and footer link; `website/app/page.module.css` adds its responsive
layout and removes the unused coffee illustration/steam animation and old support
styles. `website/components/SiteNav.js` and its CSS module add an outlined Support
link alongside existing navigation. `website/dictionaries/tr.json` and `en.json`
replace coffee wording with project support and optional contribution copy.

The user requested that payment addresses remain empty. No placeholder payment
URL was added; without `NEXT_PUBLIC_SUPPORT_URL`, the payment button is absent
and the card shows a plain status message. The feedback action remains available.
Contributions do not purchase features or usage privileges. The former `#free`
anchor is retained so existing links still work; extension navigation remains in
the main menu rather than inside the support card.

Layout references: the separation of navigation actions, clear primary/secondary
CTAs and footer navigation on [Vercel](https://vercel.com/) and
[Linear](https://linear.app/). This is a Mample adaptation, not a copied template
or a claim that those companies use Buy Me a Coffee.

`docs/marketing-capture-plan.md` specifies the four missing web media sequences,
raw screenshots, timing and MP4/GIF outputs. `docs/store_listings/google_play_free_release_plan.md`
defines the six phone screenshots, Console settings and release checks, with
official Google sources. `docs/store_listings/google_play_store_listing.md` now
documents QR alongside manual Secret Key entry. `ROADMAP.md` links these plans
and records completed preparation separately from captures and Console changes
that are still pending. No Play Console settings were changed.

Validation: production build passed. Desktop support layout was inspected in the
browser at 1440×900; at 390×844 the grid switches to a single column and its width
stays inside the viewport. Payment links remain absent with empty configuration.
