// timing.js — the countdown and the score. One small class each, so the
// rules of the game live in exactly one place: finds pay for speed,
// wrong clicks cost points, hints cost points, and whatever time is left
// when a round is cleared turns into a bonus.

export class RoundTimer {
  constructor(seconds) {
    this.total = seconds;
    this.left = seconds;
    this.running = false;
    this._last = 0;
  }

  start() {
    this.running = true;
    this._last = performance.now();
  }

  pause() {
    this.running = false;
  }

  // Advance by real elapsed time; called once per animation frame.
  // Returns true the moment the timer hits zero.
  tick(now) {
    if (!this.running) return false;
    const dt = (now - this._last) / 1000;
    this._last = now;
    this.left = Math.max(0, this.left - dt);
    return this.left <= 0;
  }

  set(seconds) {
    this.left = seconds;
    this._last = performance.now();
  }

  get wholeSeconds() {
    return Math.ceil(this.left);
  }

  get text() {
    const s = this.wholeSeconds;
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  get low() {
    return this.left <= 30;
  }
}

export class Score {
  constructor() {
    this.total = 0;
    this.finds = 0;
    this.wrongs = 0;
    this.hintsUsed = 0;
  }

  // A find pays a base 100 plus up to 50 for speed: the faster the
  // find within the round, the closer to the full 150.
  addFind(timeLeft, timeTotal) {
    const speedBonus = Math.round(50 * (timeLeft / timeTotal));
    const gained = 100 + speedBonus;
    this.total += gained;
    this.finds += 1;
    return gained;
  }

  wrongClick() {
    this.total = Math.max(0, this.total - 15);
    this.wrongs += 1;
  }

  hintCost() {
    this.total = Math.max(0, this.total - 25);
    this.hintsUsed += 1;
  }

  // Clearing a round pays 2 points per second still on the clock.
  timeBonus(timeLeft) {
    const bonus = Math.round(timeLeft) * 2;
    this.total += bonus;
    return bonus;
  }
}
