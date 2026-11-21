# Playtest log — Spot the Difference

Automated Playwright play-test: `node tests/playtest.mjs`
(serves `game/` on http://localhost:8080 via `node serve.ts`,
drives the cached Playwright Chromium, clicks real differences
through the mouse, and re-takes the four staged screenshots.)

## Latest run — 2026-11-21 ~13:00 WIB

22/22 checks passed, zero console errors.

- Boot: title screen shows, round 1 is Harbour at Dusk, no console errors.
- Start: Start button enters play; round 1 holds 7 differences.
- First find: counter 0 → 1, score 0 → 150 (100 + speed bonus).
- Wrong click: clicking empty sea marks a wrong, score 150 → 135 (−15).
- Hint: button use drops hints 3 → 2 and score by 25; cooldown path exercised by the H key.
- Timer: counts down 150s → 148s over ~2s of real play.
- Round 1: all 7 found by clicking their panel positions; score 1298;
  round-complete screen appears with time bonus.
- Round 2: Next round starts Night Market with 7 differences; 2 found, counter tracks.
- Restart: reload + Start gives a fresh round 1, score 0, 0 found.
- Keyboard: arrow keys move the crosshair (290,260) → (314,272); H uses a hint.
- Game over: clock forced to 1s → game-over screen; Try again restarts at score 0.
- Screenshots: 4 staged shots retaken (cover, title, round 2, round-complete).

## Earlier runs

- First run 18 checks: 14/18 — two failures were a favicon 404
  (fixed with a `data:,` icon link) and a test-side assertion on the
  wrong-click penalty at score 0 (fixed by earning points first).
  The game itself was correct in both cases.
- Second run: 18/18 after the favicon fix.
- Market polish pass (bigger glowing lanterns, counter plank lines,
  foreground fruit baskets) re-tested 18/18; screenshots re-verified
  by viewing the image files directly.
