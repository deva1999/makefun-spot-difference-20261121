// audio.js — every sound in the game is synthesized live with the
// Web Audio API. No audio files, no network: a pop for a find, a low
// buzz for a wrong click, a soft chime for a hint, and a little
// arpeggio when a round is cleared. Created lazily on the first user
// gesture so browsers never block it.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, start, dur, type = 'sine', vol = 0.16) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.02);
  }

  // Two quick rising blips: the satisfying pop of a found difference.
  pop() {
    this.tone(660, 0, 0.09);
    this.tone(990, 0.07, 0.14);
  }

  // A dull low buzz: that click was not a difference.
  wrong() {
    this.tone(140, 0, 0.18, 'square', 0.08);
  }

  // A soft chime when a hint lights up.
  hint() {
    this.tone(880, 0, 0.2, 'sine', 0.1);
    this.tone(1174, 0.1, 0.25, 'sine', 0.08);
  }

  // A short rising arpeggio when a round is cleared.
  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.09, 0.22, 'triangle', 0.12));
  }

  click() {
    this.tone(440, 0, 0.05, 'sine', 0.06);
  }
}
