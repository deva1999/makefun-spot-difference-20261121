// render.js — draws one frame: both panels, the marks on the
// differences already found, the burst that celebrates each find, the
// pulsing ring of an active hint, and the fading red X of a wrong
// click. The scene painters in scenes.js do the pictures; this file
// owns everything that moves on top of them.

import { drawScene } from './scenes.js';
import { LEFT_X, RIGHT_X, PANEL_Y } from './input.js';
import { PANEL_W, PANEL_H, modsForLevel } from './levels.js';

const MARK_GOLD = '#ffd94a';
const MARK_RING = '#ff9d2e';

function drawPanelFrame(ctx, x) {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, PANEL_Y + 1, PANEL_W - 2, PANEL_H - 2);
}

// A found difference gets a gold ring and a star on both panels. The
// ring is drawn with a pop: it overshoots, then settles.
function drawMark(ctx, panelX, diff, age) {
  const pop = age < 0.18 ? 1 + (0.18 - age) * 2.2 : 1;
  const r = diff.r * pop;
  const cx = panelX + diff.x;
  const cy = PANEL_Y + diff.y;
  ctx.strokeStyle = MARK_GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = MARK_RING;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 11, 0, Math.PI * 2);
  ctx.stroke();
  // Four small star ticks around the ring.
  ctx.fillStyle = MARK_GOLD;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const px = cx + Math.cos(a) * (r + 11);
    const py = cy + Math.sin(a) * (r + 11);
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The burst: a ring that expands and fades in the first half-second
// after a find, on both panels at once.
function drawBurst(ctx, panelX, diff, age) {
  if (age > 0.6) return;
  const t = age / 0.6;
  const cx = panelX + diff.x;
  const cy = PANEL_Y + diff.y;
  ctx.strokeStyle = `rgba(255,217,74,${1 - t})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, diff.r + 6 + t * 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - t)})`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = cx + Math.cos(a) * (diff.r + 14 + t * 30);
    const py = cy + Math.sin(a) * (diff.r + 14 + t * 30);
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A wrong click leaves a small red X that fades over half a second.
function drawWrong(ctx, mark, age) {
  if (age > 0.6) return;
  const t = age / 0.6;
  ctx.strokeStyle = `rgba(255,80,80,${1 - t})`;
  ctx.lineWidth = 4;
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(mark.x - s, mark.y - s);
  ctx.lineTo(mark.x + s, mark.y + s);
  ctx.moveTo(mark.x + s, mark.y - s);
  ctx.lineTo(mark.x - s, mark.y + s);
  ctx.stroke();
}

// The hint: a pulsing gold ring around one unfound difference, shown
// on both panels while the hint is alive.
function drawHint(ctx, diff, age) {
  const pulse = 1 + 0.18 * Math.sin(age * 9);
  const r = (diff.r + 10) * pulse;
  const alpha = 0.55 + 0.35 * Math.sin(age * 9);
  for (const panelX of [LEFT_X, RIGHT_X]) {
    const cx = panelX + diff.x;
    const cy = PANEL_Y + diff.y;
    ctx.strokeStyle = `rgba(255,217,74,${Math.max(0, alpha)})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function renderFrame(ctx, level, state, now, cursor) {
  ctx.clearRect(0, 0, 1200, 520);

  // Left panel: the plain scene. Right panel: the same scene with
  // every difference applied.
  ctx.save();
  ctx.translate(LEFT_X, PANEL_Y);
  drawScene(ctx, level.scene, new Set());
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_X, PANEL_Y);
  drawScene(ctx, level.scene, modsForLevel(level));
  ctx.restore();
  drawPanelFrame(ctx, LEFT_X);
  drawPanelFrame(ctx, RIGHT_X);

  const t = now / 1000;
  for (const found of state.found) {
    const age = t - found.at;
    for (const panelX of [LEFT_X, RIGHT_X]) {
      drawMark(ctx, panelX, found.diff, age);
      drawBurst(ctx, panelX, found.diff, age);
    }
  }
  for (const wrong of state.wrongs) {
    drawWrong(ctx, wrong, t - wrong.at);
  }
  if (state.hint && t - state.hint.at < 1.4) {
    drawHint(ctx, state.hint.diff, t - state.hint.at);
  }
  if (cursor && cursor.visible) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cursor.x - 18, cursor.y);
    ctx.lineTo(cursor.x - 6, cursor.y);
    ctx.moveTo(cursor.x + 6, cursor.y);
    ctx.lineTo(cursor.x + 18, cursor.y);
    ctx.moveTo(cursor.x, cursor.y - 18);
    ctx.lineTo(cursor.x, cursor.y - 6);
    ctx.moveTo(cursor.x, cursor.y + 6);
    ctx.lineTo(cursor.x, cursor.y + 18);
    ctx.stroke();
  }
}
