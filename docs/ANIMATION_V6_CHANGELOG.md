# Animation V6 — Hero, Dove Formation & Event Cards

## 1. Hero

- Removed the absolute 3px `.hero-silk-reveal` stripe that crossed the wedding date at some viewport heights.
- Kept `hero-divider`, which is in the layout below the date (not overlaid).
- Mobile date tracking is slightly reduced so the line and text remain clear.

## 2. Love Messengers

- Redrew `DoveCourier.tsx` with a round dove head, full chest, wider wing feathers, fanned tail, peach beak and a small olive twig. No external image required.
- For the **last card**, both doves fly **left → right** as a pair, same start time, same duration and same timeline; the companion is 82px behind and 24px above its partner.
- First two cards retain one dove each with alternating directions.
- To tune formation spacing, edit `formationX` and `formationY` in `src/components/DoveCourier.tsx`.

## 3. Wedding events

- The two cards use mirror translations `x: -125` / `x: +125`, no stagger (`delay: 0`).
- On desktop they intersect the viewport together, so both enter simultaneously. On narrow mobile they are vertically stacked and trigger individually when visible.
- No layout changes to the event cards.

## Checks

Check at 360, 390, 430, 768 and 1280px; test Safari/iOS and Chrome/Android for smoothness.
