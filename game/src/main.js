// main.js — the entry wiring: game state machine, HUD, overlays, and
// the loop that ties scenes, input, timing, score, sound and rendering
// together. Screens: title → playing → round-complete → (next round)
// → game-complete, or playing → game-over when the clock runs out.
// Restart always returns to round 1 with a fresh score.

import { LEVELS } from './levels.js';
import { renderFrame } from './render.js';
import { canvasPoint, panelAt, diffAt } from './input.js';
import { RoundTimer, Score } from './timing.js';
import { SoundFX } from './audio.js';
import { shotFromUrl, stageShot } from './shots.js';

const HINTS_PER_ROUND = 3;
const HINT_COOLDOWN_S = 8;

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.levelIndex = 0;
    this.screen = 'title';
    this.frozen = false;
    this.sounds = new SoundFX();
    this.score = new Score();
    this.timer = new RoundTimer(LEVELS[0].timeLimit);
    this.state = { found: [], wrongs: [], hint: null };
    this.hintsLeft = HINTS_PER_ROUND;
    this.lastHintAt = -99;
    this.level = LEVELS[0];
    this.bindDom();
    this.canvas.addEventListener('pointerdown', (e) => this.onClick(e));
    requestAnimationFrame((now) => this.frame(now));
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  set level(v) {
    this.levelIndex = LEVELS.indexOf(v);
  }

  bindDom() {
    this.el = {
      round: document.getElementById('round-label'),
      counter: document.getElementById('counter'),
      timer: document.getElementById('timer'),
      score: document.getElementById('score'),
      hint: document.getElementById('hint-btn'),
      mute: document.getElementById('mute-btn'),
      status: document.getElementById('status'),
      overlay: document.getElementById('overlay'),
    };
    this.el.hint.addEventListener('click', () => this.useHint());
    this.el.mute.addEventListener('click', () => {
      this.sounds.muted = !this.sounds.muted;
      this.el.mute.textContent = this.sounds.muted ? 'Sound: off' : 'Sound: on';
    });
    this.el.overlay.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      this.sounds.click();
      if (action.dataset.action === 'start') this.startGame();
      if (action.dataset.action === 'next') this.nextRound();
      if (action.dataset.action === 'restart') this.startGame();
    });
    // Keyboard play: arrow keys move a crosshair, Enter/Space clicks
    // where it stands, H asks for a hint.
    this.cursor = { x: 290, y: 260, visible: false };
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  onKey(e) {
    if (this.screen !== 'playing') return;
    const step = e.shiftKey ? 40 : 12;
    const c = this.cursor;
    if (e.key === 'ArrowLeft') { c.x = Math.max(10, c.x - step); c.visible = true; e.preventDefault(); }
    else if (e.key === 'ArrowRight') { c.x = Math.min(1190, c.x + step); c.visible = true; e.preventDefault(); }
    else if (e.key === 'ArrowUp') { c.y = Math.max(0, c.y - step); c.visible = true; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { c.y = Math.min(520, c.y + step); c.visible = true; e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') {
      c.visible = true;
      this.clickAt(c.x, c.y);
      e.preventDefault();
    } else if (e.key === 'h' || e.key === 'H') {
      this.useHint();
    }
  }

  // ---- screens -------------------------------------------------------

  setScreen(screen) {
    this.screen = screen;
    this.el.overlay.classList.toggle('hidden', screen === 'playing');
  }

  showTitle() {
    this.setScreen('title');
    this.el.overlay.innerHTML = `
      <div class="card">
        <h1>Spot the Difference</h1>
        <p class="tag">Three hand-drawn scenes. Seven differences hiding in each.<br>
        Harbour at dusk &middot; Night market &middot; Secret garden.</p>
        <p class="how">Two pictures, side by side — almost the same.<br>
        Click a difference on either picture to mark it.<br>
        Mouse or arrow keys + Enter — H asks for a hint.<br>
        Wrong clicks cost 15 points. Hints cost 25. Beat the clock.</p>
        <button class="big" data-action="start">Start hunting</button>
        <p class="fine">21 differences in all &middot; 3 rounds &middot; best played with a mouse</p>
      </div>`;
  }

  showRoundComplete(timeBonus) {
    this.setScreen('round-complete');
    const last = this.levelIndex === LEVELS.length - 1;
    this.el.overlay.innerHTML = `
      <div class="card">
        <h1>${last ? 'All rounds clear!' : 'Round clear!'}</h1>
        <p class="tag">${this.level.name} — all 7 differences found.</p>
        <p class="how">Time bonus: <b>+${timeBonus}</b> &middot; Score: <b>${this.score.total}</b></p>
        <button class="big" data-action="${last ? 'restart' : 'next'}">
          ${last ? 'Play again' : 'Next round: ' + LEVELS[this.levelIndex + 1].name}</button>
        <p class="fine">Found ${this.score.finds} &middot; wrong clicks ${this.score.wrongs} &middot; hints ${this.score.hintsUsed}</p>
      </div>`;
  }

  showGameOver() {
    this.setScreen('game-over');
    this.el.overlay.innerHTML = `
      <div class="card">
        <h1>Time&rsquo;s up!</h1>
        <p class="tag">The clock ran out on ${this.level.name} with
        ${this.level.diffs.length - this.state.found.length} difference(s) still hiding.</p>
        <p class="how">Score: <b>${this.score.total}</b> &middot; Found ${this.score.finds} of 21</p>
        <button class="big" data-action="restart">Try again</button>
      </div>`;
  }

  // ---- round flow ----------------------------------------------------

  startLevel(index, { silent = false } = {}) {
    this.levelIndex = index;
    this.state = { found: [], wrongs: [], hint: null };
    this.hintsLeft = HINTS_PER_ROUND;
    this.lastHintAt = -99;
    this.timer = new RoundTimer(this.level.timeLimit);
    if (!silent) this.timer.start();
    this.updateHud();
  }

  startGame() {
    this.score = new Score();
    this.frozen = false;
    this.startLevel(0);
    this.setScreen('playing');
    this.setStatus('Find all 7 differences before the clock runs out.');
  }

  nextRound() {
    this.startLevel(this.levelIndex + 1);
    this.setScreen('playing');
    this.setStatus(`${this.level.name} — 7 new differences. Look closely.`);
  }

  completeRound() {
    this.timer.pause();
    const bonus = this.score.timeBonus(this.timer.left);
    this.sounds.win();
    this.showRoundComplete(bonus);
  }

  // ---- play ----------------------------------------------------------

  onClick(event) {
    if (this.screen !== 'playing' || this.frozen) return;
    this.sounds.ensure();
    const p = canvasPoint(this.canvas, event);
    this.clickAt(p.x, p.y);
  }

  // One click decision, shared by mouse and keyboard: map the canvas
  // point onto a panel, test it against the unfound differences.
  clickAt(x, y) {
    if (this.screen !== 'playing' || this.frozen) return;
    const panel = panelAt(x, y);
    if (!panel) return;
    const foundIds = new Set(this.state.found.map((f) => f.diff.id));
    const diff = diffAt(this.level, foundIds, panel.x, panel.y);
    const now = performance.now() / 1000;
    if (diff) {
      const gained = this.score.addFind(this.timer.left, this.timer.total);
      this.state.found.push({ diff, at: now });
      this.sounds.pop();
      this.setStatus(`Found: ${diff.label} — +${gained} points.`);
      if (this.state.found.length === this.level.diffs.length) {
        this.completeRound();
      }
    } else {
      this.score.wrongClick();
      this.state.wrongs.push({ x, y, at: now });
      this.sounds.wrong();
      this.setStatus('Not a difference — 15 points. Look again.');
    }
    this.updateHud();
  }

  useHint() {
    if (this.screen !== 'playing' || this.frozen) return;
    if (this.hintsLeft <= 0) {
      this.setStatus('No hints left this round.');
      return;
    }
    const now = performance.now() / 1000;
    if (now - this.lastHintAt < HINT_COOLDOWN_S) {
      const wait = Math.ceil(HINT_COOLDOWN_S - (now - this.lastHintAt));
      this.setStatus(`Hint is cooling down — ${wait}s.`);
      return;
    }
    const foundIds = new Set(this.state.found.map((f) => f.diff.id));
    const remaining = this.level.diffs.filter((d) => !foundIds.has(d.id));
    if (remaining.length === 0) return;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    this.state.hint = { diff, at: now };
    this.lastHintAt = now;
    this.hintsLeft -= 1;
    this.score.hintCost();
    this.sounds.hint();
    this.setStatus('Hint: look at the pulsing ring — 25 points.');
    this.updateHud();
  }

  // ---- HUD -----------------------------------------------------------

  setStatus(text) {
    this.el.status.textContent = text;
  }

  updateHud() {
    this.el.round.textContent = `Round ${this.levelIndex + 1} of ${LEVELS.length} · ${this.level.name}`;
    this.el.counter.textContent = `Found ${this.state.found.length} / ${this.level.diffs.length}`;
    this.el.timer.textContent = this.timer.text;
    this.el.timer.classList.toggle('low', this.timer.low);
    this.el.score.textContent = `Score ${this.score.total}`;
    this.el.hint.textContent = `Hint (${this.hintsLeft})`;
    this.el.hint.disabled = this.hintsLeft <= 0 || this.screen !== 'playing';
  }

  // ---- loop ----------------------------------------------------------

  frame(now) {
    if (!this.frozen && this.screen === 'playing') {
      if (this.timer.tick(now)) {
        this.showGameOver();
      }
      this.updateHud();
    }
    renderFrame(this.ctx, this.level, this.state, now, this.cursor);
    requestAnimationFrame((t) => this.frame(t));
  }
}

const game = new Game();
const shot = shotFromUrl();
if (shot) {
  stageShot(game, shot);
} else {
  game.startLevel(0, { silent: true });
  game.showTitle();
}

// Test seam for the automated play-test: a read-only snapshot of the
// game state plus the panel coordinates of every difference, so the
// test can click real differences and assert on real outcomes.
window.__TEST__ = {
  ready: true,
  state: () => ({
    screen: game.screen,
    round: game.levelIndex + 1,
    roundName: game.level.name,
    found: game.state.found.length,
    total: game.level.diffs.length,
    score: game.score.total,
    timeLeft: Math.round(game.timer.left),
    hintsLeft: game.hintsLeft,
    wrongs: game.score.wrongs,
    cursor: { x: game.cursor.x, y: game.cursor.y, visible: game.cursor.visible },
  }),
  diffs: () => game.level.diffs.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r })),
};
