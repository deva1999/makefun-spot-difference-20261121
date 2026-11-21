// shots.js — deterministic staging for screenshots. A shot is chosen
// by the ?shot= query parameter and renders one fixed game state, so
// every screenshot can be retaken byte-for-byte identical:
//   ?shot=cover    round 1 mid-play, 3 differences found and marked
//   ?shot=title    the title screen over the harbour panels
//   ?shot=round2   round 2 mid-play, 5 differences found and marked
//   ?shot=complete the round-complete screen after round 1
// Without a shot parameter the game starts normally on the title
// screen. Shot states freeze the timer and the clock so nothing moves
// between the page load and the screenshot.

import { LEVELS } from './levels.js';

export const SHOTS = {
  cover: { level: 0, found: 3, timeLeft: 96, score: 315 },
  title: { level: 0, found: 0, timeLeft: 150, score: 0, screen: 'title' },
  round2: { level: 1, found: 5, timeLeft: 48, score: 1040 },
  complete: { level: 0, found: 7, timeLeft: 61, score: 812, screen: 'round-complete' },
};

export function shotFromUrl() {
  const name = new URLSearchParams(window.location.search).get('shot');
  if (!name || !SHOTS[name]) return null;
  return { name, ...SHOTS[name] };
}

// Build the frozen state a shot describes: the first N differences of
// the level, marked as found long enough ago that their pop animation
// has settled, plus a fixed score and a frozen timer.
export function stageShot(game, shot) {
  const level = LEVELS[shot.level];
  game.startLevel(shot.level, { silent: true });
  const now = performance.now() / 1000;
  game.state.found = level.diffs.slice(0, shot.found).map((diff, i) => ({
    diff,
    at: now - 1 - i * 0.1,
  }));
  game.score.total = shot.score;
  game.score.finds = shot.found;
  game.timer.set(shot.timeLeft);
  game.timer.pause();
  game.frozen = true;
  if (shot.screen === 'title') game.showTitle();
  else if (shot.screen === 'round-complete') game.showRoundComplete(89);
  else game.setScreen('playing');
  game.updateHud();
}
