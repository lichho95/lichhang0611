# The Living Ribbon V9.1 — Dual Envelope Opening & Mobile Side Switch

## Root cause in V9

When a user selected a side, `onSelect` updated the parent `side` state immediately. The opening component used `if (!side && phase === 'sealed') return chooser`, causing React to replace both envelopes with the large envelope **before the chooser selection animation could play**.

## Updated opening choreography

The opening component freezes whether the session originally entered through a shared link (`startsWithChooser`). This local state is NOT switched off when the selected side is written to the URL. All timings are from the **single click** selecting a side.

| Moment | Visual action |
| --- | --- |
| Initial mount | Two envelopes fly in from left/right with a gentle spring and settle side by side |
| 0–950 ms | Chosen envelope moves to the measured centre of the large envelope and grows; other envelope recedes and fades |
| 950–1430 ms | Focused envelope cross-fades to the full-sized envelope without a hard scene replacement |
| 1430 ms | Wax seal lifts |
| 1900 ms | Envelope flap folds back and the letter slides out |
| 2660 ms | Burgundy silk traces the transition, Hero starts revealing behind the opening |
| 3670 ms | Opening disappears and Hero remains visible |

**Direct links** `?side=groom` and `?side=bride` retain the original one-envelope, one-tap sequence. `prefers-reduced-motion` skips the decorative choreography but still chooses the correct invitation. Replay returns to the selected side's one-envelope opening.

## Small mobile-side switch

A compact pill in the fixed header shows `Thiệp nhà trai ↻` or `Thiệp nhà gái ↻`. The pill is displayed at viewport widths <=920px; tapping it immediately toggles the side and updates the URL, Wedding Invitation, Hero date and RSVP side. The existing mobile menu entry is left available too. The desktop selector remains unchanged. No new fixed bottom control was added, so it cannot clash with Floating RSVP.

## Files changed

- `src/App.tsx` — stable opening choreography, measured animation destination, compact mobile switch
- `src/styles.css` — chooser overlay, mobile chip and focus overflow protections

**No changes** to `wedding.config.ts`, images, Cloudflare Pages Functions, D1 schema, RSVP/Wishes APIs or admin moderation/filter code.

## Testing

- Local TS/TSX syntax validation (transpilation): pass
- CSS top-level parsing: pass
- API contract tests for side and admin filtering: 4/4 pass
- Static Chromium layout check of opening: 320, 360, 390, 430, 768 and 1280 px; no horizontal overflow
- Static Chromium mobile header test: 320, 360, 390, 430 and 768 px; no horizontal overflow

These tests do **not** verify Motion frame-by-frame: npm dependencies are not populated in the available runtime, so Vite build / fully mounted React browser tests remain unverified. Run `npm ci`, `npm run build`, `npm run dev` and check the animation on a real mobile device before deploying to production.
