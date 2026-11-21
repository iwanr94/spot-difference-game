// world.js — paints one panel of the cove: sky, headland, cottage, dock, boats,
// buoy and lighthouse. Pass a Set of changed ids to paint panel B, or an empty
// Set to paint panel A. Every difference in config.js has its drawing here.

import { PANEL_W, PANEL_H, PALETTES } from './config.js';

const HORIZON = 300;

function ridge(ctx, pts, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function sky(ctx, p, ch) {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
  g.addColorStop(0, p.skyTop);
  g.addColorStop(0.45, p.skyMid);
  g.addColorStop(0.78, p.skyLow);
  g.addColorStop(1, p.skyHorizon);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, HORIZON);

  // Stars: a fixed sprinkle, denser with each palette. One of them belongs to
  // the "star" difference and only panel A keeps it.
  const stars = [[70, 36], [120, 22], [182, 52], [540, 28], [566, 96], [38, 104],
    [300, 26], [410, 70], [496, 96], [92, 74], [246, 58], [352, 104], [556, 58], [14, 60]];
  ctx.fillStyle = '#fff';
  for (let i = 0; i < Math.min(p.starCount, stars.length); i++) {
    const [sx, sy] = stars[i];
    ctx.globalAlpha = p.starAlpha * (0.55 + 0.45 * Math.sin(i * 2.7));
    ctx.beginPath();
    ctx.arc(sx, sy, i % 3 === 0 ? 1.7 : 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (!ch.has('star')) {
    ctx.fillStyle = '#fffbe8';
    ctx.globalAlpha = 0.55 + 0.45 * p.starAlpha;
    star4(ctx, 470, 44, 7);
    ctx.globalAlpha = 1;
  }

  // Sun or moon low over the water.
  ctx.fillStyle = p.sun;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.arc(420, 232, p.mood === 'night' ? 20 : 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  cloud(ctx, 140, 96, 1.0, p);
  cloud(ctx, 330, 66, 1.2, p, ch.has('cloud'));
  cloud(ctx, 486, 156, 0.78, p);
}

function star4(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.34 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s, p, changed) {
  ctx.globalAlpha = p.mood === 'storm' ? 0.55 : 0.42;
  ctx.fillStyle = p.mood === 'storm' ? '#8b98a3' : '#f4cfae';
  ctx.beginPath();
  const puffs = changed
    ? [[-26, 4, 20], [4, -8, 26], [34, 4, 18], [60, 8, 13]]
    : [[-30, 6, 18], [-6, -8, 26], [26, -2, 22], [56, 8, 15]];
  for (const [dx, dy, r] of puffs) {
    ctx.moveTo(x + dx * s + r * s, y + dy * s);
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

function gull(ctx, x, y, s, tone) {
  ctx.strokeStyle = tone;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 6 * s, x, y - 1 * s);
  ctx.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 11 * s, y);
  ctx.stroke();
}

function sea(ctx, p, ch) {
  const g = ctx.createLinearGradient(0, HORIZON, 0, PANEL_H);
  g.addColorStop(0, p.seaFar);
  g.addColorStop(0.18, p.seaNear);
  g.addColorStop(1, p.seaDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON, PANEL_W, PANEL_H - HORIZON);

  // Sun path on the water.
  ctx.strokeStyle = p.glow;
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const y = HORIZON + 8 + i * 15;
    const w = 26 + i * 7;
    const a = 0.08 + 0.5 * (1 - i / 14);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.moveTo(420 - w * 0.35, y);
    ctx.lineTo(420 + w * 0.35, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Long swell lines; the storm raises them.
  const amp = 2 + p.wave * 7;
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  for (let row = 0; row < 9; row++) {
    const y = HORIZON + 22 + row * 29;
    ctx.lineWidth = 0.8 + row * 0.18;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 12) {
      const yy = y + Math.sin((x / 46) + row * 1.7) * amp * (0.4 + row * 0.09);
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.globalAlpha = 0.5 - row * 0.04;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function headland(ctx, p) {
  const rock = p.rock, lit = p.rockLit, dark = p.rockDark;
  // near point, left
  ridge(ctx, [[0, 560], [0, 358], [34, 350], [64, 366], [98, 348], [132, 364],
    [168, 350], [196, 378], [214, 410], [206, 450], [178, 486], [150, 520],
    [128, 560]], rock, dark);
  ridge(ctx, [[0, 560], [0, 372], [30, 366], [62, 378], [96, 362], [130, 376],
    [166, 364], [190, 388], [204, 414], [196, 448], [168, 480], [140, 514],
    [118, 560]], lit, null);
  ridge(ctx, [[0, 560], [0, 392], [40, 386], [74, 396], [110, 382], [148, 394],
    [176, 410], [184, 440], [160, 470], [130, 506], [108, 560]], rock, null);

  // far point on the right, under the lighthouse
  ridge(ctx, [[600, 560], [600, 330], [566, 326], [532, 334], [500, 338],
    [472, 352], [452, 374], [432, 400], [434, 452], [452, 505], [474, 560]], dark, null);
  ridge(ctx, [[600, 560], [600, 342], [568, 336], [536, 344], [506, 348],
    [478, 360], [458, 380], [440, 404], [442, 452], [460, 502], [482, 560]], rock, null);
  ridge(ctx, [[600, 560], [600, 360], [572, 354], [540, 362], [512, 364],
    [486, 374], [466, 392], [452, 412], [456, 452], [472, 498], [492, 560]], lit, null);

  // spray at the waterline
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(150 + i * 46, 512 + (i % 3) * 9, 30, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function cottage(ctx, p, ch) {
  // body
  ctx.fillStyle = p.wall;
  ctx.fillRect(62, 300, 114, 62);
  ctx.fillStyle = p.wallShade;
  ctx.fillRect(62, 344, 114, 18);

  // roof
  ctx.fillStyle = p.roof;
  ctx.beginPath();
  ctx.moveTo(52, 302);
  ctx.lineTo(119, 262);
  ctx.lineTo(186, 302);
  ctx.closePath();
  ctx.fill();

  // chimney, and the smoke that is its own difference
  ctx.fillStyle = p.wallShade;
  ctx.fillRect(148, 268, 14, 26);
  ctx.fillStyle = 'rgba(236,236,240,0.5)';
  const puffs = ch.has('smoke')
    ? [[152, 258, 9], [156, 242, 11], [166, 228, 9]]
    : [[152, 258, 7], [150, 244, 10], [158, 228, 13], [146, 210, 9]];
  for (const [sx, sy, r] of puffs) {
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // the window: warm in panel A, cold and dark when changed
  const lit = !ch.has('window');
  ctx.fillStyle = lit ? '#ffd88a' : '#39404c';
  ctx.fillRect(106, 314, 26, 24);
  ctx.strokeStyle = lit ? '#8a5c34' : '#262c36';
  ctx.lineWidth = 2;
  ctx.strokeRect(106, 314, 26, 24);
  ctx.beginPath();
  ctx.moveTo(119, 314); ctx.lineTo(119, 338);
  ctx.moveTo(106, 326); ctx.lineTo(132, 326);
  ctx.stroke();
  if (lit) {
    ctx.fillStyle = 'rgba(255,214,130,0.22)';
    ctx.beginPath();
    ctx.arc(119, 326, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // door
  ctx.fillStyle = '#5d3c31';
  ctx.fillRect(74, 330, 20, 32);
  ctx.fillStyle = '#c9a86a';
  ctx.beginPath();
  ctx.arc(89, 348, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function dock(ctx, p, ch) {
  ctx.fillStyle = '#5a4636';
  ctx.beginPath();
  ctx.moveTo(0, 438);
  ctx.lineTo(252, 424);
  ctx.lineTo(252, 446);
  ctx.lineTo(0, 460);
  ctx.closePath();
  ctx.fill();

  // plank seams
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1;
  for (let x = 12; x < 252; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 440 - x * 0.05);
    ctx.lineTo(x, 458 - x * 0.05);
    ctx.stroke();
  }

  // pilings below the deck
  for (const x of [92, 172, 240]) {
    ctx.fillStyle = '#3d3125';
    ctx.fillRect(x, 444, 9, 52 + (x % 7));
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, 444, 3, 52);
  }

  // the marked piling: a rope band when changed
  if (ch.has('piling')) {
    ctx.strokeStyle = '#e8c987';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(236, 452);
    ctx.lineTo(249, 452);
    ctx.moveTo(236, 458);
    ctx.lineTo(249, 458);
    ctx.stroke();
  }

  // rope on the deck: a coil, or a straight run to the bollard
  ctx.lineCap = 'round';
  if (ch.has('rope')) {
    ctx.strokeStyle = '#d9b678';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(176, 404);
    ctx.quadraticCurveTo(206, 396, 236, 410);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#e5c084';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(206, 401, 15 - i * 4, 6 - i * 1.6, 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // crates: two on the deck, one once the difference is applied
  crate(ctx, 140, 398, 26);
  if (!ch.has('crate')) crate(ctx, 168, 404, 20);
}

function crate(ctx, x, y, s) {
  ctx.fillStyle = '#a9763f';
  ctx.fillRect(x, y, s, s * 0.8);
  ctx.strokeStyle = '#6d4626';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, s, s * 0.8);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + s, y + s * 0.8);
  ctx.moveTo(x + s, y);
  ctx.lineTo(x, y + s * 0.8);
  ctx.stroke();
}

function net(ctx, p, ch) {
  const x0 = 34, y0 = 382, w = 50, h = 44;
  ctx.fillStyle = 'rgba(20,24,30,0.35)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#cfd8cf';
  ctx.lineWidth = 1.4;
  const step = ch.has('net') ? 22 : 12;
  for (let x = x0; x <= x0 + w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x + h * 0.5, y0 + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x - h * 0.5, y0 + h);
    ctx.stroke();
  }
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(x0 - 4, y0);
  ctx.lineTo(x0 + w + 4, y0 + 2);
  ctx.stroke();
  // float beads
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#d76b56' : '#e6d7a8';
    ctx.beginPath();
    ctx.arc(x0 + 6 + i * 12, y0 + h + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function sailboat(ctx, p, ch) {
  const x = 330, y = 452;
  // mast and sail
  ctx.strokeStyle = '#453226';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, 388);
  ctx.stroke();
  ctx.fillStyle = 'rgba(246,240,226,0.94)';
  ctx.beginPath();
  ctx.moveTo(x + 3, 392);
  ctx.lineTo(x + 46, 432);
  ctx.lineTo(x + 3, 432);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(232,224,208,0.85)';
  ctx.beginPath();
  ctx.moveTo(x - 3, 398);
  ctx.lineTo(x - 32, 432);
  ctx.lineTo(x - 3, 432);
  ctx.closePath();
  ctx.fill();

  // flag: red in panel A, teal once the difference is applied
  ctx.fillStyle = ch.has('flag') ? '#4ec3c0' : '#e2564a';
  ctx.beginPath();
  ctx.moveTo(x, 388);
  ctx.lineTo(x + 20, 392);
  ctx.lineTo(x, 398);
  ctx.closePath();
  ctx.fill();

  // hull
  ctx.fillStyle = '#2f4a5c';
  ctx.beginPath();
  ctx.moveTo(x - 36, y);
  ctx.lineTo(x + 36, y);
  ctx.quadraticCurveTo(x + 26, y + 22, x, y + 24);
  ctx.quadraticCurveTo(x - 26, y + 22, x - 36, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 34, y + 2);
  ctx.lineTo(x + 34, y + 2);
  ctx.stroke();

  // reflection
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.ellipse(x, y + 34, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rowboat(ctx, p) {
  const x = 268, y = 508;
  ctx.fillStyle = '#7c5a3b';
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.quadraticCurveTo(x, y + 18, x + 26, y);
  ctx.quadraticCurveTo(x, y + 6, x - 26, y);
  ctx.fill();
  ctx.strokeStyle = '#4a3423';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 1);
  ctx.quadraticCurveTo(x, y + 14, x + 24, y + 1);
  ctx.stroke();
}

function buoy(ctx, p, ch) {
  const x = 500, y = 470;
  ctx.fillStyle = '#e6e2d6';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 14);
  ctx.lineTo(x + 9, y - 14);
  ctx.lineTo(x + 7, y + 12);
  ctx.lineTo(x - 7, y + 12);
  ctx.closePath();
  ctx.fill();
  // the stripe: white in A, signal red once changed
  ctx.fillStyle = ch.has('buoy') ? '#d94a3d' : '#f2efe4';
  ctx.fillRect(x - 9, y - 3, 18, 8);
  ctx.fillStyle = '#c8452f';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 14);
  ctx.lineTo(x, y - 26);
  ctx.lineTo(x + 10, y - 14);
  ctx.closePath();
  ctx.fill();
  // waterline ripple
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(x, y + 13, 16, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function lighthouse(ctx, p, ch) {
  const cx = 512;
  // tower
  ctx.fillStyle = '#efe9dd';
  ctx.beginPath();
  ctx.moveTo(cx - 27, 332);
  ctx.lineTo(cx - 19, 158);
  ctx.lineTo(cx + 19, 158);
  ctx.lineTo(cx + 27, 332);
  ctx.closePath();
  ctx.fill();

  // red bands, clipped to the tower
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 27, 332);
  ctx.lineTo(cx - 19, 158);
  ctx.lineTo(cx + 19, 158);
  ctx.lineTo(cx + 27, 332);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#b8443c';
  ctx.fillRect(cx - 30, 186, 60, 26);
  ctx.fillRect(cx - 30, 238, 60, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.fillRect(cx + 8, 150, 24, 200);
  ctx.restore();

  // door and windows
  ctx.fillStyle = '#4b3a30';
  ctx.fillRect(cx - 6, 306, 12, 26);

  // gallery
  ctx.fillStyle = '#3f3a36';
  ctx.fillRect(cx - 25, 154, 50, 6);
  ctx.strokeStyle = '#3f3a36';
  ctx.lineWidth = 2;
  for (let i = -20; i <= 20; i += 8) {
    ctx.beginPath();
    ctx.moveTo(cx + i, 154);
    ctx.lineTo(cx + i, 144);
    ctx.stroke();
  }

  // lantern room
  const on = !ch.has('lamp');
  ctx.fillStyle = on ? p.lamp : '#26303c';
  ctx.fillRect(cx - 13, 120, 26, 24);
  ctx.strokeStyle = '#3f3a36';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 13, 120, 26, 24);
  ctx.beginPath();
  ctx.moveTo(cx - 4, 120);
  ctx.lineTo(cx - 4, 144);
  ctx.moveTo(cx + 4, 120);
  ctx.lineTo(cx + 4, 144);
  ctx.stroke();

  // roof
  ctx.fillStyle = '#3f3a36';
  ctx.beginPath();
  ctx.moveTo(cx - 17, 120);
  ctx.lineTo(cx, 100);
  ctx.lineTo(cx + 17, 120);
  ctx.closePath();
  ctx.fill();

  if (on) {
    const g = ctx.createRadialGradient(cx, 132, 2, cx, 132, 78);
    g.addColorStop(0, 'rgba(255,236,170,0.85)');
    g.addColorStop(0.35, 'rgba(255,220,140,0.24)');
    g.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, 132, 78, 0, Math.PI * 2);
    ctx.fill();
  }
}

function rain(ctx, p) {
  if (!p.rain) return;
  ctx.strokeStyle = 'rgba(210,226,236,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 130; i++) {
    const x = (i * 97) % PANEL_W;
    const y = (i * 53) % PANEL_H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 13);
    ctx.stroke();
  }
}

function vignette(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, 'rgba(10,8,20,0.16)');
  g.addColorStop(0.5, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(6,10,18,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

// Paint one whole panel. `changes` holds the ids of the differences this panel
// shows; pass an empty set for the left picture.
export function drawScene(ctx, changes, mood) {
  const p = PALETTES[mood];
  p.mood = mood;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  sky(ctx, p, changes);
  sea(ctx, p, changes);
  headland(ctx, p);
  net(ctx, p, changes);
  dock(ctx, p, changes);
  cottage(ctx, p, changes);
  rowboat(ctx, p);
  sailboat(ctx, p, changes);
  buoy(ctx, p, changes);
  lighthouse(ctx, p, changes);

  // gulls: the middle one only stays in panel A
  const tone = mood === 'storm' ? 'rgba(240,244,250,0.75)' : 'rgba(255,250,240,0.9)';
  gull(ctx, 110, 150, 1.1, tone);
  gull(ctx, 196, 118, 0.85, tone);
  if (!changes.has('gull')) gull(ctx, 252, 206, 1.3, tone);

  rain(ctx, p);
  vignette(ctx);
  ctx.restore();
}
