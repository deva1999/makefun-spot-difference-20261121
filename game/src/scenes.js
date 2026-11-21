// scenes.js — every picture in the game, drawn in code. Three original
// scenes (harbour, night market, garden), each painted by one function
// that takes a set of "mods": the difference kinds to apply. The left
// panel is painted with an empty set, the right panel with every kind
// from levels.js, so the two pictures are near-identical by construction
// and differ only where a difference is meant to be. No image files,
// no borrowed art: every shape below is drawn by these functions.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 3, y - 7, x, y);
  ctx.quadraticCurveTo(x + 3, y - 7, x + 9, y);
  ctx.stroke();
}

function star(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- harbour

export function drawHarbour(ctx, mods) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#241a4d');
  sky.addColorStop(0.55, '#7a3b6e');
  sky.addColorStop(1, '#e8734a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 580, 300);

  // Stars, low in the darkening sky. One more appears on the right panel.
  for (const [x, y] of [[60, 40], [180, 30], [330, 45], [480, 30], [90, 90], [540, 80]]) {
    star(ctx, x, y, 3.5, '#ffe9b0');
  }
  if (mods.has('extra-star')) star(ctx, 250, 62, 4.5, '#ffe9b0');

  // Low sun, half sunk behind the sea.
  circle(ctx, 470, 96, 34, '#ffd27a');
  circle(ctx, 470, 96, 26, '#ff9d5c');

  // Drifting clouds.
  ellipse(ctx, 120, 70, 52, 14, 'rgba(255,190,170,0.55)');
  ellipse(ctx, 300, 50, 44, 12, 'rgba(255,190,170,0.45)');
  ellipse(ctx, 430, 130, 40, 11, 'rgba(255,190,170,0.4)');

  // Gulls. One extra joins them on the right panel.
  gull(ctx, 150, 120, '#2b2140');
  gull(ctx, 250, 90, '#2b2140');
  gull(ctx, 350, 140, '#2b2140');
  if (mods.has('extra-bird')) gull(ctx, 420, 95, '#2b2140');

  // The sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 520);
  sea.addColorStop(0, '#3a6a8c');
  sea.addColorStop(1, '#1d3a5c');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 580, 220);
  ctx.strokeStyle = 'rgba(255,220,180,0.35)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of [[40, 330, 90], [220, 350, 120], [420, 335, 100], [90, 400, 110], [330, 420, 130], [480, 470, 80]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  // Harbour houses on the far shore.
  rect(ctx, 60, 252, 120, 48, '#b98a5e');
  poly(ctx, [[55, 252], [120, 222], [185, 252]], '#6e2f2f');
  rect(ctx, 210, 258, 100, 42, '#a5764f');
  poly(ctx, [[205, 258], [260, 232], [315, 258]], '#5d2a2a');
  // Lit windows — one goes dark on the right panel.
  rect(ctx, 84, 268, 18, 22, '#ffd97a');
  if (!mods.has('missing-window')) rect(ctx, 132, 268, 18, 22, '#ffd97a');
  rect(ctx, 240, 272, 16, 20, '#ffd97a');
  rect(ctx, 280, 272, 16, 20, '#ffd97a');

  // Lighthouse on the point.
  rect(ctx, 508, 180, 26, 120, '#f2ead8');
  rect(ctx, 505, 172, 32, 12, '#c94f3d');
  rect(ctx, 512, 158, 18, 16, '#ffd97a');
  if (!mods.has('no-beam')) {
    ctx.fillStyle = 'rgba(255,217,122,0.35)';
    ctx.beginPath();
    ctx.moveTo(512, 166);
    ctx.lineTo(430, 130);
    ctx.lineTo(430, 200);
    ctx.closePath();
    ctx.fill();
  }

  // Wooden pier with posts. One post is missing on the right panel.
  rect(ctx, 30, 380, 400, 14, '#7a5230');
  rect(ctx, 30, 394, 400, 6, '#5d3c22');
  for (const px of [48, 95, 142, 189, 236, 283, 330, 377, 410]) {
    if (mods.has('missing-post') && px === 95) continue;
    rect(ctx, px, 394, 10, 58, '#5d3c22');
  }

  // Moored boats. The big one's sail changes colour on the right panel.
  poly(ctx, [[360, 385], [385, 320], [410, 385]], mods.has('sail-colour') ? '#3d7bd9' : '#d94f3d');
  poly(ctx, [[340, 385], [380, 385], [380, 350]], '#e8dcc8');
  poly(ctx, [[330, 385], [435, 385], [415, 408], [350, 408]], '#4a2f1e');
  poly(ctx, [[110, 425], [128, 385], [146, 425]], '#e8dcc8');
  poly(ctx, [[100, 425], [160, 425], [148, 442], [112, 442]], '#6e2f2f');

  // A red-and-white buoy, bobbing. Gone on the right panel.
  if (!mods.has('missing-buoy')) {
    circle(ctx, 180, 452, 12, '#d94f3d');
    rect(ctx, 168, 448, 24, 7, '#f2ead8');
    rect(ctx, 177, 436, 6, 12, '#d94f3d');
  }
}

// ----------------------------------------------------------------- market

function stall(ctx, x, awning, sign, mods) {
  // Awning with stripes; one stripe vanishes on the right panel.
  for (let i = 0; i < 6; i++) {
    if (mods.has('awning-stripe') && x === 40 && i === 2) continue;
    rect(ctx, x + i * 26, 110, 26, 34, i % 2 === 0 ? awning : '#f2ead8');
  }
  rect(ctx, x - 6, 144, 168, 8, '#5d3c22');
  // Counter and goods.
  rect(ctx, x, 250, 156, 90, '#6e4a2a');
  rect(ctx, x, 250, 156, 10, '#8a5f38');
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (const ly of [278, 306]) {
    ctx.beginPath();
    ctx.moveTo(x + 6, ly);
    ctx.lineTo(x + 150, ly);
    ctx.stroke();
  }
  circle(ctx, x + 30, 240, 12, '#e8734a');
  circle(ctx, x + 52, 240, 12, '#e8a13d');
  circle(ctx, x + 74, 240, 12, '#7ab648');
  rect(ctx, x + 100, 222, 22, 28, '#3d7bd9');
  rect(ctx, x + 126, 222, 22, 28, '#c94f8a');
  // Sign board; the middle stall's wording changes on the right panel.
  rect(ctx, x + 28, 165, 100, 44, '#2b2140');
  ctx.fillStyle = '#ffd97a';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = sign === 'TEH' && mods.has('sign-change') ? 'KOPI' : sign;
  ctx.fillText(label, x + 78, 188);
  // Stall posts.
  rect(ctx, x + 4, 144, 8, 110, '#5d3c22');
  rect(ctx, x + 144, 144, 8, 110, '#5d3c22');
}

export function drawMarket(ctx, mods) {
  // Night sky and cobbled ground.
  ctx.fillStyle = '#1a1440';
  ctx.fillRect(0, 0, 580, 520);
  ctx.fillStyle = '#241b52';
  ctx.fillRect(0, 430, 580, 90);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let y = 450; y < 520; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(580, y);
    ctx.stroke();
  }

  // String lights across the top. One bulb is dark on the right panel.
  ctx.strokeStyle = '#3a2f6e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(290, 95, 580, 40);
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const x = 20 + i * 45;
    const y = 40 + Math.sin((i / 12) * Math.PI) * 42;
    const dark = mods.has('bulb-out') && i === 4;
    circle(ctx, x, y + 8, 6, dark ? '#3a3450' : '#ffd97a');
    if (!dark) {
      ctx.fillStyle = 'rgba(255,217,122,0.25)';
      ctx.beginPath();
      ctx.arc(x, y + 8, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Paper lanterns, glowing. The middle one changes colour on the right panel.
  const lantern = (x, y, colour) => {
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ellipse(ctx, x, y, 20, 25, colour);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 25, 0, 0, Math.PI * 2);
    ctx.stroke();
    rect(ctx, x - 7, y - 29, 14, 6, '#d9a13d');
    rect(ctx, x - 7, y + 23, 14, 6, '#d9a13d');
  };
  lantern(90, 190, '#d94f3d');
  lantern(300, 150, mods.has('lantern-colour') ? '#3da85c' : '#d94f3d');
  lantern(500, 185, '#e8a13d');

  // Three stalls.
  stall(ctx, 40, '#c94f3d', 'BUAH', mods);
  stall(ctx, 220, '#3da85c', 'TEH', mods);
  stall(ctx, 410, '#e8734a', 'ROTI', mods);

  // Flag on the right stall. Blue on the left panel, yellow on the right.
  ctx.strokeStyle = '#5d3c22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(500, 60);
  ctx.lineTo(500, 110);
  ctx.stroke();
  poly(ctx, [[500, 60], [536, 70], [500, 82]], mods.has('flag-colour') ? '#ffd97a' : '#3d7bd9');

  // Crates by the left stall. The top one is missing on the right panel.
  rect(ctx, 52, 440, 56, 40, '#8a5f38');
  rect(ctx, 112, 440, 56, 40, '#7a5230');
  if (!mods.has('missing-crate')) rect(ctx, 82, 400, 56, 40, '#a5764f');

  // A cat on the crates; a second cat appears on the right panel.
  const cat = (x, y) => {
    ellipse(ctx, x, y, 16, 12, '#2b2b2b');
    circle(ctx, x + 12, y - 12, 9, '#2b2b2b');
    poly(ctx, [[x + 5, y - 18], [x + 8, y - 26], [x + 11, y - 18]], '#2b2b2b');
    poly(ctx, [[x + 13, y - 18], [x + 16, y - 26], [x + 19, y - 18]], '#2b2b2b');
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 6);
    ctx.quadraticCurveTo(x - 26, y - 4, x - 20, y - 16);
    ctx.stroke();
  };
  cat(140, 428);
  if (mods.has('extra-cat')) cat(360, 400);

  // Baskets of fruit along the front, so the foreground is worth
  // studying too — and so a difference can hide down here as well.
  const basket = (x, y, fruit) => {
    ellipse(ctx, x, y + 14, 30, 12, '#8a5f38');
    rect(ctx, x - 30, y, 60, 16, '#a5764f');
    for (let i = 0; i < 4; i++) circle(ctx, x - 20 + i * 13, y - 4, 8, fruit[i % fruit.length]);
  };
  basket(300, 478, ['#e8734a', '#e8a13d', '#7ab648', '#c94f8a']);
  basket(470, 482, ['#e8a13d', '#d94f3d', '#7ab648', '#e8a13d']);
  basket(130, 484, ['#7ab648', '#c94f8a', '#e8734a', '#e8a13d']);
}

// ----------------------------------------------------------------- garden

function tulip(ctx, x, y, colour) {
  ctx.strokeStyle = '#3da85c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
  poly(ctx, [[x - 8, y], [x, y - 16], [x + 8, y], [x + 5, y + 6], [x, y + 2], [x - 5, y + 6]], colour);
}

function butterfly(ctx, x, y) {
  ctx.fillStyle = '#c94f8a';
  ellipse(ctx, x - 7, y - 4, 8, 6, '#c94f8a');
  ellipse(ctx, x + 7, y - 4, 8, 6, '#c94f8a');
  ellipse(ctx, x - 6, y + 5, 6, 5, '#e8734a');
  ellipse(ctx, x + 6, y + 5, 6, 5, '#e8734a');
  ctx.strokeStyle = '#2b2140';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 8);
  ctx.stroke();
}

export function drawGarden(ctx, mods) {
  // Morning sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#8ec8ee');
  sky.addColorStop(1, '#d8f0e0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 580, 300);
  circle(ctx, 480, 80, 36, '#ffd94a');
  circle(ctx, 480, 80, 28, '#ffe98a');

  // Clouds. The small one drifts away on the right panel.
  ellipse(ctx, 90, 70, 46, 15, '#ffffff');
  ellipse(ctx, 320, 50, 56, 17, '#ffffff');
  if (!mods.has('missing-cloud')) ellipse(ctx, 150, 60, 26, 10, '#ffffff');

  // Lawn.
  const lawn = ctx.createLinearGradient(0, 300, 0, 520);
  lawn.addColorStop(0, '#7ab648');
  lawn.addColorStop(1, '#4f8a2e');
  ctx.fillStyle = lawn;
  ctx.fillRect(0, 300, 580, 220);

  // Picket fence along the back. One post is gone on the right panel.
  rect(ctx, 0, 296, 580, 8, '#f2ead8');
  for (let x = 20; x < 580; x += 34) {
    if (mods.has('fence-post') && x === 326) continue;
    rect(ctx, x, 268, 10, 36, '#e8dcc8');
  }

  // The old tree, left. An extra branch grows on the right panel.
  rect(ctx, 88, 210, 26, 95, '#6e4a2a');
  ctx.strokeStyle = '#6e4a2a';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(100, 240);
  ctx.lineTo(70, 205);
  ctx.stroke();
  if (mods.has('extra-branch')) {
    ctx.beginPath();
    ctx.moveTo(105, 225);
    ctx.lineTo(140, 195);
    ctx.stroke();
  }
  circle(ctx, 100, 180, 62, '#3da85c');
  circle(ctx, 55, 205, 42, '#4fbf6e');
  circle(ctx, 148, 205, 44, '#35914e');

  // Bush, right.
  circle(ctx, 510, 300, 40, '#35914e');
  circle(ctx, 545, 315, 30, '#3da85c');

  // Flower bed. One tulip turns white on the right panel.
  for (let i = 0; i < 8; i++) {
    const x = 180 + i * 32;
    const colours = ['#d94f3d', '#e8a13d', '#c94f8a', '#d94f3d', '#e8a13d', '#c94f8a', '#d94f3d', '#e8a13d'];
    let c = colours[i];
    if (mods.has('flower-colour') && i === 1) c = '#ffffff';
    tulip(ctx, x, 420, c);
  }
  for (let i = 0; i < 6; i++) {
    tulip(ctx, 210 + i * 34, 470, ['#c94f8a', '#e8a13d', '#d94f3d', '#c94f8a', '#e8a13d', '#d94f3d'][i]);
  }

  // Bench. The middle slat falls out on the right panel.
  rect(ctx, 120, 360, 8, 60, '#5d3c22');
  rect(ctx, 190, 360, 8, 60, '#5d3c22');
  rect(ctx, 112, 352, 94, 10, '#8a5f38');
  if (!mods.has('bench-slat')) rect(ctx, 112, 368, 94, 10, '#8a5f38');
  rect(ctx, 112, 384, 94, 10, '#8a5f38');

  // Butterflies. One flies away on the right panel.
  butterfly(ctx, 300, 150);
  butterfly(ctx, 240, 210);
  if (!mods.has('missing-butterfly')) butterfly(ctx, 400, 180);

  // Pond with a duck. The duck leaves on the right panel.
  ellipse(ctx, 460, 460, 95, 42, '#5aa8d9');
  ellipse(ctx, 460, 460, 80, 32, '#7ab8e0');
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(440, 455, 30, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (!mods.has('missing-duck')) {
    ellipse(ctx, 470, 460, 16, 11, '#f2ead8');
    circle(ctx, 482, 448, 8, '#f2ead8');
    poly(ctx, [[489, 448], [497, 451], [489, 454]], '#e8a13d');
    circle(ctx, 484, 446, 1.5, '#2b2140');
  }

  // Stepping stones.
  ellipse(ctx, 300, 500, 26, 10, '#d8d0c0');
  ellipse(ctx, 350, 512, 26, 10, '#c8c0b0');
}

// Paint one scene by name with a mod set. Unknown names paint nothing.
export const PAINTERS = { harbour: drawHarbour, market: drawMarket, garden: drawGarden };

export function drawScene(ctx, scene, mods) {
  const paint = PAINTERS[scene];
  if (paint) paint(ctx, mods);
}
