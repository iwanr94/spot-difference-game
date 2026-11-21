// render.js — draws every frame: the two cached panel pictures, the found marks,
// the hint pulse, the top HUD with counter and clock, and the start / win / time-up
// overlays. It reads a plain state object and never changes it.

import { PANEL_W, PANEL_H, LAYOUT, MARK, LEVELS } from './config.js';
import { drawScene } from './world.js';

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function spaced(ctx, text, x, y, gap) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + gap;
  }
}

// Cache both pictures once per level: painting the cove is expensive and the
// scene itself never moves, so only marks and HUD are redrawn each frame.
export function buildPanels(level) {
  const make = (changes) => {
    const c = document.createElement('canvas');
    c.width = PANEL_W * 2;
    c.height = PANEL_H * 2;
    const g = c.getContext('2d');
    g.scale(2, 2);
    drawScene(g, changes, level.mood);
    return c;
  };
  return {
    a: make(new Set()),
    b: make(new Set(level.diffs.map((d) => d.id))),
    level,
  };
}

function background(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, LAYOUT.height);
  g.addColorStop(0, '#0b1220');
  g.addColorStop(0.55, '#101a2b');
  g.addColorStop(1, '#070d18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LAYOUT.width, LAYOUT.height);
  // faint depth wash behind the panels
  const r = ctx.createRadialGradient(640, 380, 60, 640, 380, 760);
  r.addColorStop(0, 'rgba(90,130,170,0.10)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, LAYOUT.width, LAYOUT.height);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  roundRect(ctx, x, y, w, h, h / 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function drawTopBar(ctx, s, now) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // title
  ctx.fillStyle = '#f3e6cf';
  ctx.font = `600 21px ${SERIF}`;
  ctx.letterSpacing = '3px';
  ctx.fillText('HARBOR AT DUSK', 26, 40);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(190,205,220,0.62)';
  ctx.font = `13px ${SANS}`;
  ctx.fillText('a spot-the-difference hunt on the cove', 26, 60);

  // set selector
  const bx = 356, bw = 104, gap = 10;
  LEVELS.forEach((lv, i) => {
    const x = bx + i * (bw + gap);
    const active = s.level.key === lv.key;
    const hover = s.hoverSet === i;
    pill(ctx, x, 18, bw, 32,
      active ? 'rgba(125,252,196,0.16)' : hover ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
      active ? 'rgba(125,252,196,0.75)' : 'rgba(255,255,255,0.16)');
    ctx.fillStyle = active ? '#9dffd4' : 'rgba(226,234,244,0.78)';
    ctx.font = `600 13px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(lv.title.toUpperCase(), x + bw / 2, 39);
    ctx.textAlign = 'left';
  });

  // counter block
  const found = s.found.size;
  const total = s.level.diffs.length;
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  roundRect(ctx, 704, 14, 186, 60, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,205,220,0.6)';
  ctx.font = `600 11px ${SANS}`;
  ctx.fillText('FOUND', 720, 34);
  ctx.fillText('REMAINING', 820, 34);
  ctx.fillStyle = '#9dffd4';
  ctx.font = `700 26px ${MONO}`;
  ctx.fillText(String(found), 720, 64);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('/ ' + total, 742, 64);
  const left = total - found;
  ctx.fillStyle = left === 0 ? '#9dffd4' : left <= 3 ? '#ffd166' : '#e8eef6';
  ctx.font = `700 26px ${MONO}`;
  ctx.fillText(String(left), 848, 64);

  // hint button
  const hx = 904, hy = 22, hw = 128, hh = 44;
  const canHint = s.hintsLeft > 0 && s.mode === 'play';
  const hoverHint = s.hoverHint;
  pill(ctx, hx, hy, hw, hh,
    canHint ? (hoverHint ? 'rgba(255,209,102,0.24)' : 'rgba(255,209,102,0.12)') : 'rgba(255,255,255,0.04)',
    canHint ? 'rgba(255,209,102,0.7)' : 'rgba(255,255,255,0.12)');
  ctx.fillStyle = canHint ? '#ffd166' : 'rgba(255,255,255,0.28)';
  ctx.font = `600 13px ${SANS}`;
  ctx.fillText('HINT  [H]', hx + 16, hy + 27);
  ctx.font = `700 15px ${MONO}`;
  ctx.fillText('\u00d7' + s.hintsLeft, hx + 96, hy + 28);

  // clock
  const t = Math.max(0, s.time);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(Math.floor(t % 60)).padStart(2, '0');
  const urgent = t <= 15;
  const low = t <= 40;
  const pulse = urgent ? 0.72 + 0.28 * Math.abs(Math.sin(now / 220)) : 1;
  ctx.fillStyle = urgent ? `rgba(255,107,107,${pulse})` : low ? '#ffb347' : '#e8eef6';
  ctx.font = `700 30px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, 1256, 46);
  ctx.textAlign = 'left';

  // time bar
  const frac = Math.max(0, Math.min(1, t / s.totalTime));
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  roundRect(ctx, 1064, 58, 192, 7, 3.5);
  ctx.fill();
  const bwid = 192 * frac;
  const barColor = urgent ? '#ff6b6b' : low ? '#ffb347' : '#7dfcc4';
  if (bwid > 1) {
    ctx.fillStyle = barColor;
    roundRect(ctx, 1064, 58, Math.max(bwid, 3), 7, 3.5);
    ctx.fill();
  }
  ctx.restore();
}

function drawPanelFrame(ctx, x, y, label, s) {
  ctx.save();
  // drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#0c1420';
  roundRect(ctx, x - 6, y - 6, PANEL_W + 12, PANEL_H + 12, 10);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, PANEL_W, PANEL_H, 6);
  ctx.clip();
  const img = label === 'A' ? s.panels.a : s.panels.b;
  ctx.drawImage(img, x, y, PANEL_W, PANEL_H);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, PANEL_W, PANEL_H, 6);
  ctx.stroke();

  // letter badge
  pill(ctx, x + 10, y + 10, 26, 26, 'rgba(6,12,20,0.6)', 'rgba(255,255,255,0.22)');
  ctx.fillStyle = 'rgba(230,240,250,0.8)';
  ctx.font = `700 13px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 23, y + 27);
  ctx.textAlign = 'left';
}

function drawMark(ctx, cx, cy, r, age, color) {
  const grow = Math.max(0, 1 - age / 0.45);
  const rad = r + grow * 16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.95 * (1 - grow * 0.4);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, rad + 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // little ticks at the four compass points, so the ring reads as a "found" stamp
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (rad - 5), Math.sin(a) * (rad - 5));
    ctx.lineTo(Math.cos(a) * (rad + 5), Math.sin(a) * (rad + 5));
    ctx.stroke();
  }
  ctx.restore();
}

function drawMarks(ctx, s, now) {
  const panels = [
    { x: LAYOUT.leftX, y: LAYOUT.panelY },
    { x: LAYOUT.rightX, y: LAYOUT.panelY },
  ];
  for (const d of s.level.diffs) {
    if (!s.found.has(d.id)) continue;
    const t0 = s.foundAt[d.id] || 0;
    const age = (now - t0) / 1000;
    for (const p of panels) {
      drawMark(ctx, p.x + d.x, p.y + d.y, d.r * 0.72, age, MARK.ring);
    }
  }

  // hint: an amber pulse that swells and fades on both panels
  if (s.hint && s.hint.until > now) {
    const d = s.level.diffs.find((dd) => dd.id === s.hint.id);
    if (d) {
      const k = 0.5 + 0.5 * Math.sin(now / 180);
      for (const p of panels) {
        ctx.save();
        ctx.strokeStyle = MARK.hint;
        ctx.globalAlpha = 0.35 + 0.45 * k;
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.arc(p.x + d.x, p.y + d.y, d.r + 10 + k * 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  // wrong clicks: a short red burst that fades
  for (const w of s.wrongs) {
    const age = (now - w.t0) / 1000;
    if (age > 0.6) continue;
    const p = w.side === 0 ? { x: LAYOUT.leftX, y: LAYOUT.panelY } : { x: LAYOUT.rightX, y: LAYOUT.panelY };
    const a = 1 - age / 0.6;
    ctx.save();
    ctx.strokeStyle = MARK.wrong;
    ctx.globalAlpha = a;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p.x + w.x, p.y + w.y, 12 + age * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x + w.x - 7, p.y + w.y - 7);
    ctx.lineTo(p.x + w.x + 7, p.y + w.y + 7);
    ctx.moveTo(p.x + w.x + 7, p.y + w.y - 7);
    ctx.lineTo(p.x + w.x - 7, p.y + w.y + 7);
    ctx.stroke();
    ctx.restore();
  }

  // keyboard reticle, drawn on both panels so the player sees where it aims
  if (s.cursorOn) {
    const k = 0.6 + 0.4 * Math.sin(now / 260);
    for (const p of panels) {
      const cx = p.x + s.cursor.x;
      const cy = p.y + s.cursor.y;
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * k})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy); ctx.lineTo(cx - 5, cy);
      ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 5);
      ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawBottomBar(ctx, s) {
  const y = LAYOUT.panelY + PANEL_H + 16;
  ctx.fillStyle = 'rgba(190,205,220,0.5)';
  ctx.font = `12px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('CLICK a difference \u00b7 ARROWS move the crosshair \u00b7 SPACE marks \u00b7 H hint \u00b7 R restart', 26, y + 26);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(190,205,220,0.38)';
  ctx.fillText(s.level.blurb, 1254, y + 26);
  ctx.textAlign = 'left';

  // live status message
  if (s.message && s.message.until > performance.now()) {
    const a = Math.min(1, (s.message.until - performance.now()) / 500);
    ctx.globalAlpha = a;
    ctx.fillStyle = s.message.color || '#9dffd4';
    ctx.font = `600 15px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(s.message.text, LAYOUT.width / 2, y + 58);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(4,8,14,${alpha})`;
  ctx.fillRect(0, 0, LAYOUT.width, LAYOUT.height);
}

function card(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, 'rgba(20,31,46,0.97)');
  g.addColorStop(1, 'rgba(12,20,32,0.97)');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(125,252,196,0.28)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawStart(ctx, s, now) {
  dim(ctx, 0.78);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f3e6cf';
  ctx.font = `700 54px ${SERIF}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('HARBOR AT DUSK', LAYOUT.width / 2, 190);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(200,214,228,0.72)';
  ctx.font = `17px ${SANS}`;
  ctx.fillText('Two pictures of the same cove. Ten or twelve small things are not the same.', LAYOUT.width / 2, 226);
  ctx.fillText('Find them all before the light goes out.', LAYOUT.width / 2, 252);

  const cw = 324, gap = 26;
  const totalW = cw * 3 + gap * 2;
  const x0 = (LAYOUT.width - totalW) / 2;
  LEVELS.forEach((lv, i) => {
    const x = x0 + i * (cw + gap);
    const y = 296;
    const sel = s.menuIndex === i;
    card(ctx, x, y, cw, 218);
    if (sel) {
      ctx.strokeStyle = 'rgba(125,252,196,0.8)';
      ctx.lineWidth = 2.5;
      roundRect(ctx, x, y, cw, 218, 18);
      ctx.stroke();
    }
    // little mood swatch
    const g = ctx.createLinearGradient(x + 24, y + 24, x + 24, y + 96);
    const mood = { dusk: ['#3a2b57', '#f0a05a', '#22364f'], night: ['#0a1430', '#2a4a70', '#0b1424'], storm: ['#2b3742', '#7b8b92', '#19242e'] }[lv.mood];
    g.addColorStop(0, mood[0]);
    g.addColorStop(0.6, mood[1]);
    g.addColorStop(1, mood[2]);
    ctx.fillStyle = g;
    roundRect(ctx, x + 24, y + 24, cw - 48, 66, 8);
    ctx.fill();

    ctx.fillStyle = sel ? '#9dffd4' : '#eef4fb';
    ctx.font = `700 24px ${SERIF}`;
    ctx.textAlign = 'left';
    ctx.fillText(lv.title, x + 26, y + 128);
    ctx.fillStyle = 'rgba(200,214,228,0.66)';
    ctx.font = `13px ${SANS}`;
    ctx.fillText(lv.blurb, x + 26, y + 152);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, x + 26, y + 166, cw - 52, 1, 0.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,209,102,0.85)';
    ctx.font = `600 12px ${MONO}`;
    ctx.fillText(`${lv.diffs.length} CHANGES`, x + 26, y + 192);
    ctx.fillStyle = 'rgba(200,214,228,0.62)';
    ctx.fillText(`${lv.seconds}s \u00b7 ${lv.hints} HINTS`, x + 140, y + 192);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = `rgba(157,255,212,${0.7 + 0.3 * Math.sin(now / 420)})`;
  ctx.font = `600 16px ${SANS}`;
  ctx.fillText('Press ENTER to begin  \u00b7  or click a set', LAYOUT.width / 2, 566);
  ctx.fillStyle = 'rgba(180,196,212,0.5)';
  ctx.font = `12px ${SANS}`;
  ctx.fillText('1 / 2 / 3 choose a set  \u00b7  \u2190 \u2192 change it', LAYOUT.width / 2, 592);
  ctx.restore();
}

function drawWin(ctx, s, now) {
  dim(ctx, 0.7);
  const w = 560, h = 356;
  const x = (LAYOUT.width - w) / 2, y = 208;
  card(ctx, x, y, w, h);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9dffd4';
  ctx.font = `700 40px ${SERIF}`;
  ctx.fillText('Every change found', LAYOUT.width / 2, y + 70);
  ctx.fillStyle = 'rgba(200,214,228,0.7)';
  ctx.font = `15px ${SANS}`;
  ctx.fillText(`${s.level.title} \u00b7 ${s.found.size} of ${s.level.diffs.length} differences`, LAYOUT.width / 2, y + 102);

  const rows = [
    ['Time left', `${Math.floor(s.time)}s`],
    ['Hints used', String(s.level.hints - s.hintsLeft)],
    ['Wrong clicks', String(s.wrongCount)],
    ['Score', String(s.score)],
  ];
  ctx.textAlign = 'left';
  rows.forEach(([k, v], i) => {
    const yy = y + 148 + i * 34;
    ctx.fillStyle = 'rgba(200,214,228,0.62)';
    ctx.font = `13px ${SANS}`;
    ctx.fillText(k, x + 90, yy);
    ctx.fillStyle = i === 3 ? '#ffd166' : '#eef4fb';
    ctx.font = `700 ${i === 3 ? 20 : 16}px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(v, x + w - 90, yy);
    ctx.textAlign = 'left';
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = `rgba(157,255,212,${0.72 + 0.28 * Math.sin(now / 400)})`;
  ctx.font = `600 15px ${SANS}`;
  ctx.fillText('ENTER play again  \u00b7  ESC choose a set', LAYOUT.width / 2, y + h - 26);
  ctx.restore();
}

function drawTimeUp(ctx, s, now) {
  dim(ctx, 0.72);
  const w = 560, h = 320;
  const x = (LAYOUT.width - w) / 2, y = 216;
  card(ctx, x, y, w, h);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff8a7a';
  ctx.font = `700 40px ${SERIF}`;
  ctx.fillText('The light went out', LAYOUT.width / 2, y + 70);
  ctx.fillStyle = 'rgba(200,214,228,0.72)';
  ctx.font = `15px ${SANS}`;
  ctx.fillText(`${s.found.size} of ${s.level.diffs.length} found \u00b7 the unfound ones are ringed in amber`, LAYOUT.width / 2, y + 102);
  ctx.fillStyle = '#ffd166';
  ctx.font = `600 15px ${SANS}`;
  const missed = s.level.diffs.filter((d) => !s.found.has(d.id)).slice(0, 3).map((d) => d.name);
  if (missed.length) ctx.fillText('Missed: ' + missed.join(' \u00b7 '), LAYOUT.width / 2, y + 140);
  ctx.fillStyle = `rgba(157,255,212,${0.72 + 0.28 * Math.sin(now / 400)})`;
  ctx.font = `600 15px ${SANS}`;
  ctx.fillText('ENTER try again  \u00b7  ESC choose a set', LAYOUT.width / 2, y + h - 28);
  ctx.restore();
}

function drawReveal(ctx, s, now) {
  if (!s.reveal) return;
  const panels = [{ x: LAYOUT.leftX, y: LAYOUT.panelY }, { x: LAYOUT.rightX, y: LAYOUT.panelY }];
  for (const d of s.level.diffs) {
    if (s.found.has(d.id)) continue;
    for (const p of panels) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,209,102,0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(p.x + d.x, p.y + d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function render(ctx, s, now) {
  background(ctx);

  // a gentle shake when a wrong click lands
  const shakeAge = (now - (s.shakeAt || -999)) / 1000;
  const shake = shakeAge < 0.3 ? Math.sin(shakeAge * 90) * 6 * (1 - shakeAge / 0.3) : 0;

  ctx.save();
  ctx.translate(shake, 0);

  if (s.panels) {
    drawPanelFrame(ctx, LAYOUT.leftX, LAYOUT.panelY, 'A', s);
    drawPanelFrame(ctx, LAYOUT.rightX, LAYOUT.panelY, 'B', s);
    drawReveal(ctx, s, now);
    drawMarks(ctx, s, now);
  }
  drawTopBar(ctx, s, now);
  drawBottomBar(ctx, s);
  ctx.restore();

  if (s.mode === 'start') drawStart(ctx, s, now);
  else if (s.mode === 'win') drawWin(ctx, s, now);
  else if (s.mode === 'timeup') drawTimeUp(ctx, s, now);
}
