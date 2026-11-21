// input.js — turns mouse moves, clicks and key presses into calls on the game.
// It owns no rules: it only converts screen positions into panel positions and
// forwards them, so main.js stays the one place that knows what a click means.

import { LAYOUT, LEVELS } from './config.js';

const SET_RECTS = LEVELS.map((lv, i) => ({
  x: 356 + i * 114, y: 18, w: 104, h: 32,
}));
const HINT_RECT = { x: 904, y: 22, w: 128, h: 44 };

export function toCanvas(canvas, ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - r.left) / r.width) * LAYOUT.width,
    y: ((ev.clientY - r.top) / r.height) * LAYOUT.height,
  };
}

export function hitPanel(x, y) {
  const y0 = LAYOUT.panelY, y1 = LAYOUT.panelY + LAYOUT.panelH;
  if (y < y0 || y > y1) return null;
  if (x >= LAYOUT.leftX && x <= LAYOUT.leftX + LAYOUT.panelW2) {
    return { side: 0, x: x - LAYOUT.leftX, y: y - y0 };
  }
  if (x >= LAYOUT.rightX && x <= LAYOUT.rightX + LAYOUT.panelW2) {
    return { side: 1, x: x - LAYOUT.rightX, y: y - y0 };
  }
  return null;
}

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function levelCardRect(i) {
  const cw = 324, gap = 26;
  const totalW = cw * 3 + gap * 2;
  const x0 = (LAYOUT.width - totalW) / 2;
  return { x: x0 + i * (cw + gap), y: 296, w: cw, h: 218 };
}

export function attachInput(canvas, api) {
  const state = api.state;

  canvas.addEventListener('mousemove', (ev) => {
    const p = toCanvas(canvas, ev);
    state.hoverSet = SET_RECTS.findIndex((r) => inside(r, p.x, p.y));
    state.hoverHint = inside(HINT_RECT, p.x, p.y);
    const hit = hitPanel(p.x, p.y);
    state.mousePanel = hit ? hit.side : -1;
    canvas.style.cursor = hit || state.hoverHint || state.hoverSet >= 0 ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    state.hoverSet = -1;
    state.hoverHint = false;
    state.mousePanel = -1;
  });

  canvas.addEventListener('click', (ev) => {
    const p = toCanvas(canvas, ev);
    if (state.mode === 'start') {
      const i = LEVELS.findIndex((_, k) => inside(levelCardRect(k), p.x, p.y));
      if (i >= 0) { api.chooseSet(i); api.start(); return; }
    }
    if (inside(HINT_RECT, p.x, p.y)) { api.hint(); return; }
    const si = SET_RECTS.findIndex((r) => inside(r, p.x, p.y));
    if (si >= 0) { api.chooseSet(si); return; }

    const hit = hitPanel(p.x, p.y);
    if (hit && state.mode === 'play') {
      state.cursor.x = hit.x;
      state.cursor.y = hit.y;
      api.mark(hit.side, hit.x, hit.y);
    }
  });

  window.addEventListener('keydown', (ev) => {
    const k = ev.key;
    if (k === ' ' || k === 'Enter') ev.preventDefault();

    if (state.mode === 'start') {
      if (k === 'Enter' || k === ' ') { api.start(); return; }
      if (k === 'ArrowRight' || k === 'ArrowDown') { api.chooseSet((state.menuIndex + 1) % LEVELS.length); return; }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { api.chooseSet((state.menuIndex + LEVELS.length - 1) % LEVELS.length); return; }
      if (k >= '1' && k <= '3') { api.chooseSet(Number(k) - 1); return; }
      return;
    }

    if (k === 'Enter' || k === ' ') {
      if (state.mode === 'play') api.markCursor();
      else api.restart();
      return;
    }
    if (k === 'Escape') { api.menu(); return; }
    if (k === 'r' || k === 'R') { api.restart(); return; }
    if (k === 'h' || k === 'H') { api.hint(); return; }
    if (state.mode !== 'play') return;

    const step = ev.shiftKey ? 40 : 12;
    let dx = 0, dy = 0;
    if (k === 'ArrowLeft') dx = -step;
    if (k === 'ArrowRight') dx = step;
    if (k === 'ArrowUp') dy = -step;
    if (k === 'ArrowDown') dy = step;
    if (dx || dy) {
      ev.preventDefault();
      state.cursorOn = true;
      api.moveCursor(dx, dy);
    }
  });
}
