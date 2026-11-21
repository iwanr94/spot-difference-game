// Harbor at Dusk — world: draws the lighthouse-cove scene on a canvas.
// One file, one job: given a set and a panel variant ('left' / 'right') it
// paints the scene. The right panel applies the set's differences, so the
// two pictures are near-identical but not the same.

import { PANEL_W, PANEL_H, PALETTES, COLORS } from './config.js';

// Fixed star positions (night sky + the one evening star of the dusk set).
const STARS = [
  [60, 40], [130, 90], [180, 40], [240, 70], [330, 35],
  [410, 80], [470, 45], [560, 110], [600, 50], [90, 130],
];

// Fixed gull positions. The gull at index 1 is the 'gull' difference.
const GULLS = [
  [180, 80],
  [300, 60],
  [450, 90],
];

// Cloud puffs: [x, y, scale]. The cloud at index 1 is the 'cloud' difference.
const CLOUDS = [
  [120, 60, 1.0],
  [350, 100, 1.2],
  [520, 70, 0.8],
];

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function star4(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function drawSky(ctx, set, changed) {
  const pal = PALETTES[set.id];
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, pal.skyTop);
  g.addColorStop(1, pal.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, 300);

  // Sun (dusk/storm) or moon (night) low over the water.
  ctx.fillStyle = pal.sunGlow;
  ellipse(ctx, 520, 180, 52, 52);
  ctx.fillStyle = pal.sun;
  ellipse(ctx, 520, 180, 30, 30);
  if (set.id === 'night') {
    ctx.fillStyle = pal.skyTop;
    ellipse(ctx, 530, 172, 24, 24);
  }

  // Stars: night shows them all; dusk shows one bright evening star.
  if (set.id === 'night') {
    for (const [x, y] of STARS) {
      if (changed('star') && x === 180 && y === 40) continue;
      star4(ctx, x, y, 4, '#ffffff');
    }
  } else if (!changed('star')) {
    star4(ctx, 180, 40, 7, '#fff7cc');
  }

  // Clouds drift across the sky.
  ctx.fillStyle = pal.cloud;
  for (let i = 0; i < CLOUDS.length; i++) {
    const [x, y, s] = CLOUDS[i];
    if (changed('cloud') && i === 1) continue;
    ellipse(ctx, x, y, 34 * s, 12 * s);
    ellipse(ctx, x - 22 * s, y + 4 * s, 22 * s, 9 * s);
    ellipse(ctx, x + 24 * s, y + 4 * s, 24 * s, 10 * s);
  }
}

function drawSea(ctx, set, changed) {
  const pal = PALETTES[set.id];
  const g = ctx.createLinearGradient(0, 300, 0, PANEL_H);
  g.addColorStop(0, pal.seaTop);
  g.addColorStop(1, pal.seaBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 300, PANEL_W, PANEL_H - 300);

  // Sun path shimmering on the water.
  ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
  for (let i = 0; i < 6; i++) {
    const y = 316 + i * 24;
    const w = 60 + i * 26;
    ctx.fillRect(520 - w / 2, y, w, 5);
  }

  // Wave crests. The crest at (200, 380) is the storm set's 'wave' difference.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  const crests = [[120, 340], [200, 380], [290, 420], [430, 350], [520, 410], [580, 360]];
  for (const [x, y] of crests) {
    if (changed('wave') && x === 200 && y === 380) continue;
    ctx.beginPath();
    ctx.arc(x, y, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Storm rain streaks slanting over the water.
  if (set.id === 'storm') {
    ctx.strokeStyle = 'rgba(200, 220, 235, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const x = (i * 53) % PANEL_W;
      const y = 300 + ((i * 37) % 170);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 14);
      ctx.stroke();
    }
  }
}

function drawRocks(ctx) {
  ctx.fillStyle = COLORS.rock;
  ctx.beginPath();
  ctx.moveTo(30, 320);
  ctx.lineTo(55, 288);
  ctx.lineTo(90, 296);
  ctx.lineTo(125, 284);
  ctx.lineTo(160, 318);
  ctx.lineTo(150, 330);
  ctx.lineTo(40, 330);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.rockDark;
  ctx.beginPath();
  ctx.moveTo(55, 320);
  ctx.lineTo(80, 300);
  ctx.lineTo(105, 318);
  ctx.lineTo(90, 330);
  ctx.lineTo(60, 330);
  ctx.closePath();
  ctx.fill();
}

function drawLighthouse(ctx, set, changed) {
  const lampOn = !changed('lamp');
  // Tower with red stripes.
  ctx.fillStyle = COLORS.tower;
  ctx.fillRect(67, 130, 46, 170);
  ctx.fillStyle = COLORS.towerStripe;
  ctx.fillRect(67, 170, 46, 18);
  ctx.fillRect(67, 230, 46, 18);
  // Gallery and lamp room.
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(60, 118, 60, 12);
  ctx.fillStyle = lampOn ? '#ffd166' : '#3a3f4a';
  ctx.fillRect(72, 96, 36, 22);
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(66, 92, 48, 6);
  // Light beam sweeping right when the lamp is on.
  if (lampOn) {
    ctx.fillStyle = 'rgba(255, 209, 102, 0.28)';
    ctx.beginPath();
    ctx.moveTo(108, 107);
    ctx.lineTo(320, 70);
    ctx.lineTo(320, 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
    ellipse(ctx, 90, 107, 26, 26);
  }
}

function drawCottage(ctx, set, changed) {
  // Walls, roof, chimney.
  ctx.fillStyle = COLORS.cottageWall;
  ctx.fillRect(470, 252, 120, 48);
  ctx.fillStyle = COLORS.roof;
  ctx.beginPath();
  ctx.moveTo(462, 252);
  ctx.lineTo(530, 222);
  ctx.lineTo(598, 252);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(556, 224, 12, 30);
  // Door.
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(540, 272, 18, 28);
  // Door lamp: on in the left panel, out in the right (night/storm sets).
  if (!changed('door')) {
    ctx.fillStyle = '#ffd166';
    ellipse(ctx, 549, 266, 4, 4);
  }
  // Window: lit warm in the left panel, dark in the right.
  ctx.fillStyle = changed('window') ? '#2c3550' : '#ffd166';
  ctx.fillRect(496, 264, 20, 18);
  ctx.strokeStyle = COLORS.woodDark;
  ctx.lineWidth = 2;
  ctx.strokeRect(496, 264, 20, 18);
  ctx.beginPath();
  ctx.moveTo(506, 264);
  ctx.lineTo(506, 282);
  ctx.moveTo(496, 273);
  ctx.lineTo(516, 273);
  ctx.stroke();
  // Chimney smoke: a curl in the left panel, a straight column in the right.
  ctx.fillStyle = 'rgba(230, 230, 230, 0.75)';
  if (changed('smoke')) {
    ellipse(ctx, 562, 214, 8, 6);
    ellipse(ctx, 562, 202, 7, 6);
    ellipse(ctx, 562, 190, 6, 5);
  } else {
    ellipse(ctx, 566, 214, 8, 6);
    ellipse(ctx, 574, 202, 7, 6);
    ellipse(ctx, 584, 192, 6, 5);
  }
}

function drawBoat(ctx, set, changed, x, y, scale, isSecond) {
  // Hull.
  ctx.fillStyle = COLORS.hull;
  ctx.beginPath();
  ctx.moveTo(x - 34 * scale, y);
  ctx.lineTo(x + 34 * scale, y);
  ctx.lineTo(x + 24 * scale, y + 12 * scale);
  ctx.lineTo(x - 24 * scale, y + 12 * scale);
  ctx.closePath();
  ctx.fill();
  // Mast.
  ctx.strokeStyle = COLORS.woodDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 62 * scale);
  ctx.stroke();
  // Sail: the second boat's sail changes shade in the night set.
  const sailColor = isSecond && changed('sail') ? COLORS.sailShade : COLORS.sailWhite;
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 60 * scale);
  ctx.lineTo(x, y - 4 * scale);
  ctx.lineTo(x + 26 * scale, y - 4 * scale);
  ctx.closePath();
  ctx.fill();
  // Flag on the first boat: red left, blue right.
  if (!isSecond) {
    ctx.fillStyle = changed('flag') ? '#2e6fd8' : '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x, y - 62 * scale);
    ctx.lineTo(x + 18 * scale, y - 56 * scale);
    ctx.lineTo(x, y - 50 * scale);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDock(ctx, set, changed) {
  // Wooden dock planks reaching from the cottage side.
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(380, 308, 260, 14);
  ctx.fillStyle = COLORS.woodDark;
  for (let x = 396; x < 640; x += 32) {
    ctx.fillRect(x, 308, 2, 14);
  }
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(392, 322, 8, 26);
  ctx.fillRect(600, 322, 8, 26);

  // Crate on the dock: left spot in the left panel, shifted right in the right.
  const crateX = changed('crate') ? 470 : 430;
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(crateX - 13, 272, 26, 26);
  ctx.strokeStyle = COLORS.woodDark;
  ctx.lineWidth = 2;
  ctx.strokeRect(crateX - 13, 272, 26, 26);
  ctx.beginPath();
  ctx.moveTo(crateX - 13, 272);
  ctx.lineTo(crateX + 13, 298);
  ctx.moveTo(crateX + 13, 272);
  ctx.lineTo(crateX - 13, 298);
  ctx.stroke();

  // Rope: a neat coil in the left panel, a straight loose line in the right.
  ctx.strokeStyle = '#d9c08a';
  ctx.lineWidth = 3;
  if (changed('rope')) {
    ctx.beginPath();
    ctx.moveTo(540, 316);
    ctx.lineTo(596, 316);
    ctx.stroke();
  } else {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(566, 312, 12 - i * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawBuoy(ctx, set, changed) {
  // A red buoy bobbing near the boats; its white band is the difference.
  ctx.fillStyle = COLORS.buoyRed;
  ctx.beginPath();
  ctx.moveTo(318, 352);
  ctx.lineTo(342, 352);
  ctx.lineTo(338, 372);
  ctx.lineTo(322, 372);
  ctx.closePath();
  ctx.fill();
  if (!changed('buoy')) {
    ctx.fillStyle = '#f5efe0';
    ctx.fillRect(319, 359, 22, 6);
  }
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(328, 344, 4, 8);
}

function drawGulls(ctx, set, changed) {
  ctx.strokeStyle = '#2c2c34';
  ctx.lineWidth = 2;
  for (let i = 0; i < GULLS.length; i++) {
    const [x, y] = GULLS[i];
    if (changed('gull') && i === 1) continue;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 4, y - 6, x, y);
    ctx.quadraticCurveTo(x + 4, y - 6, x + 9, y);
    ctx.stroke();
  }
}

// Paint the whole scene for one panel. variant 'left' is the reference;
// variant 'right' applies every difference of the set.
export function drawScene(ctx, set, variant) {
  const right = variant === 'right';
  const changed = (key) => right && set.diffs.some((d) => d.key === key);
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  drawSky(ctx, set, changed);
  drawSea(ctx, set, changed);
  drawRocks(ctx);
  drawLighthouse(ctx, set, changed);
  drawCottage(ctx, set, changed);
  drawDock(ctx, set, changed);
  drawBoat(ctx, set, changed, 250, 330, 1.0, false);
  drawBoat(ctx, set, changed, 420, 360, 0.85, true);
  drawBuoy(ctx, set, changed);
  drawGulls(ctx, set, changed);
  // A thin fog wash ties both panels together.
  ctx.fillStyle = PALETTES[set.id].fog;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}
