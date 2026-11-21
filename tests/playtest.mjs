// playtest.mjs — automated Playwright play-test for the spot-the-
// difference game. Boots the game from the local static server,
// plays it for real (clicks actual differences through the mouse),
// and asserts the contract: counter decrements, markers appear,
// wrong clicks cost points, hints behave, the timer runs, rounds
// complete, and restart works. Then it takes the four staged
// screenshots into screenshots/.
//
// Run: node tests/playtest.mjs   (serve.ts must be running on :8080)

import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:8080';
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const state = () => page.evaluate(() => window.__TEST__.state());
const diffs = () => page.evaluate(() => window.__TEST__.diffs());

async function clickPanelDiff(d) {
  const box = await page.locator('#game').boundingBox();
  // Left panel: canvas x = 10 + d.x, canvas y = d.y (panel starts at 0).
  await page.mouse.click(box.x + 10 + d.x, box.y + d.y);
}

// ---- boot ------------------------------------------------------------
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__TEST__?.ready, null, { timeout: 10000 });
let s = await state();
check('boot: title screen', s.screen === 'title', `screen=${s.screen}`);
check('boot: round 1 harbour', s.round === 1 && s.roundName === 'Harbour at Dusk');
check('boot: no console errors', errors.length === 0, errors.join(' | '));

// ---- start and play round 1 ------------------------------------------
await page.click('[data-action="start"]');
s = await state();
check('start: playing', s.screen === 'playing', `screen=${s.screen}`);

const r1 = await diffs();
check('round 1 has 7 differences', r1.length === 7, `n=${r1.length}`);

// Earn points first so the wrong-click penalty is measurable.
await clickPanelDiff(r1[0]);
const afterFind = await state();
check('first find: counter 1, score up', afterFind.found === 1 && afterFind.score > 0,
  `found=${afterFind.found} score=${afterFind.score}`);

// Wrong click: empty corner of the left panel, far from any diff.
const before = await state();
const box = await page.locator('#game').boundingBox();
await page.mouse.click(box.x + 10 + 560, box.y + 500);
s = await state();
check('wrong click: penalty applied', s.wrongs === before.wrongs + 1 && s.score === before.score - 15,
  `wrongs ${before.wrongs}->${s.wrongs}, score ${before.score}->${s.score}`);

// Hint: one use, hintsLeft drops, score drops by 25.
const hintBefore = await state();
await page.click('#hint-btn');
s = await state();
check('hint: charge used', s.hintsLeft === hintBefore.hintsLeft - 1,
  `hints ${hintBefore.hintsLeft}->${s.hintsLeft}`);
check('hint: costs 25 points', s.score === Math.max(0, hintBefore.score - 25),
  `score ${hintBefore.score}->${s.score}`);

// Timer runs.
const t1 = (await state()).timeLeft;
await page.waitForTimeout(2100);
const t2 = (await state()).timeLeft;
check('timer: counts down', t2 < t1, `${t1}s -> ${t2}s`);

// Find the remaining 6 differences by clicking their real positions.
for (const d of r1.slice(1)) {
  await clickPanelDiff(d);
  await page.waitForTimeout(120);
}
s = await state();
check('round 1: all 7 found', s.found === 7, `found=${s.found}`);
check('round 1: score grew', s.score > 700, `score=${s.score}`);
check('round 1: round-complete screen', s.screen === 'round-complete', `screen=${s.screen}`);

// ---- round 2 ----------------------------------------------------------
await page.click('[data-action="next"]');
s = await state();
check('round 2: playing night market', s.screen === 'playing' && s.roundName === 'Night Market',
  `screen=${s.screen} round=${s.roundName}`);
const r2 = await diffs();
check('round 2 has 7 differences', r2.length === 7);
for (const d of r2.slice(0, 2)) await clickPanelDiff(d);
s = await state();
check('round 2: 2 found, counter tracks', s.found === 2, `found=${s.found}`);

// ---- restart ----------------------------------------------------------
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__TEST__?.ready);
await page.click('[data-action="start"]');
s = await state();
check('restart: fresh round 1, score 0', s.screen === 'playing' && s.round === 1 && s.score === 0 && s.found === 0,
  JSON.stringify(s));
// ---- keyboard play --------------------------------------------------
const curBefore = (await state()).cursor;
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowDown');
const curAfter = (await state()).cursor;
check('keyboard: crosshair moves', curAfter.visible && curAfter.x > curBefore.x && curAfter.y > curBefore.y,
  `cursor (${curBefore.x},${curBefore.y}) -> (${curAfter.x},${curAfter.y})`);
const hBefore = await state();
await page.keyboard.press('h');
s = await state();
check('keyboard: H uses a hint', s.hintsLeft === hBefore.hintsLeft - 1,
  `hints ${hBefore.hintsLeft}->${s.hintsLeft}`);

// ---- game over --------------------------------------------------------
await page.evaluate(() => window.__TEST__.commands.setTime(1));
await page.waitForTimeout(1800);
s = await state();
check('game over: timer expiry ends the round', s.screen === 'game-over', `screen=${s.screen}`);
await page.click('[data-action="restart"]');
s = await state();
check('game over: restart plays again', s.screen === 'playing' && s.round === 1 && s.score === 0,
  `screen=${s.screen} score=${s.score}`);
check('final: no console errors', errors.length === 0, errors.join(' | '));

// ---- screenshots ------------------------------------------------------
const shots = [
  ['cover', '1-cover.jpg'],
  ['title', '2-title.jpg'],
  ['round2', '3-round2.jpg'],
  ['complete', '4-complete.jpg'],
];
for (const [shot, file] of shots) {
  await page.goto(`${BASE}/?shot=${shot}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__TEST__?.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/${file}`, type: 'jpeg', quality: 82 });
  console.log(`SHOT  ${file} (shot=${shot})`);
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
writeFileSync('tests/playtest-results.json', JSON.stringify({ results, errors }, null, 2));
process.exit(failed ? 1 : 0);
