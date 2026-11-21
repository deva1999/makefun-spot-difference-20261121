// input.js — turn a pointer event on the canvas into a game decision.
// The canvas holds two panels: left at x 10..590, right at x 610..1190,
// each 580 wide and 520 tall. A click is mapped into panel-local
// coordinates, then tested against the round's unfound differences.
// Clicking either panel counts — the pictures are the same hunt.

import { PANEL_W, PANEL_H } from './levels.js';

export const LEFT_X = 10;
export const RIGHT_X = 610;
export const PANEL_Y = 0;

export function canvasPoint(canvas, event) {
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  const scaleY = canvas.height / r.height;
  return {
    x: (event.clientX - r.left) * scaleX,
    y: (event.clientY - r.top) * scaleY,
  };
}

// Which panel (if any) a canvas point falls on, and where inside it.
export function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= LEFT_X && x < LEFT_X + PANEL_W) return { side: 'left', x: x - LEFT_X, y: y - PANEL_Y };
  if (x >= RIGHT_X && x < RIGHT_X + PANEL_W) return { side: 'right', x: x - RIGHT_X, y: y - PANEL_Y };
  return null;
}

// The first unfound difference within reach of a panel-local point,
// or null. The radius is generous on purpose: a hunt should forgive a
// finger that lands just beside the thing it found.
export function diffAt(level, foundIds, x, y) {
  for (const d of level.diffs) {
    if (foundIds.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= (d.r + 8) * (d.r + 8)) return d;
  }
  return null;
}
