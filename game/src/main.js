// main.js — the game itself: state, the counting clock, what a click or a key
// does, scoring and the switch between start, play, win and time-up.

import { LEVELS, LAYOUT, PANEL_W, PANEL_H } from './config.js';
import { buildPanels, render } from './render.js';
import { attachInput } from './input.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const state = {
  mode: 'start',
  level: LEVELS[0],
  levelIndex: 0,
  menuIndex: 0,
  panels: null,
  found: new Set(),
  foundAt: {},
  hintsLeft: 3,
  hint: null,
  wrongs: [],
  wrongCount: 0,
  time: LEVELS[0].seconds,
  totalTime: LEVELS[0].seconds,
  cursor: { x: 300, y: 280 },
  cursorOn: false,
  score: 0,
  message: null,
  shakeAt: -999,
  hoverSet: -1,
  hoverHint: false,
  mousePanel: -1,
  reveal: false,
  endAt: 0,
};

function say(text, color, ms = 1800) {
  state.message = { text, color, until: performance.now() + ms };
}

function dist2(ax, ay, bx, by) {
  return (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
}

function reset(level, keepMode) {
  state.level = level;
  state.levelIndex = LEVELS.indexOf(level);
  state.menuIndex = state.levelIndex;
  state.panels = buildPanels(level);
  state.found = new Set();
  state.foundAt = {};
  state.hintsLeft = level.hints;
  state.hint = null;
  state.wrongs = [];
  state.wrongCount = 0;
  state.time = level.seconds;
  state.totalTime = level.seconds;
  state.score = 0;
  state.reveal = false;
  state.cursor = { x: PANEL_W / 2, y: PANEL_H / 2 };
  state.cursorOn = false;
  state.message = null;
  state.endAt = performance.now() + level.seconds * 1000;
  if (!keepMode) state.mode = 'play';
}

const api = {
  state,

  chooseSet(i) {
    const lv = LEVELS[i];
    if (!lv) return;
    if (state.mode === 'play' || state.mode === 'win' || state.mode === 'timeup') {
      if (lv.key === state.level.key) return;
      reset(lv, false);
      say(`${lv.title} \u2014 ${lv.diffs.length} changes, ${lv.seconds}s`, '#9dffd4', 2200);
    } else {
      state.menuIndex = i;
      state.level = lv;
      state.panels = state.panels || null;
      state.totalTime = lv.seconds;
      state.time = lv.seconds;
      state.levelIndex = i;
    }
  },

  start() {
    reset(LEVELS[state.menuIndex] || LEVELS[0], false);
    say('Find every change \u2014 click a difference in either picture', '#9dffd4', 2600);
  },

  restart() {
    if (state.mode === 'start') { api.start(); return; }
    reset(state.level, false);
    say('Fresh pictures \u2014 same changes', '#9dffd4', 1600);
  },

  menu() {
    state.mode = 'start';
    state.reveal = false;
    state.menuIndex = state.levelIndex;
  },

  hint() {
    if (state.mode === 'play') {
      if (state.hintsLeft <= 0) { say('No hints left \u2014 trust your eye', '#ff8a7a', 1600); return; }
      const left = state.level.diffs.filter((d) => !state.found.has(d.id));
      if (!left.length) return;
      const pick = left[Math.floor(Math.random() * left.length)];
      state.hintsLeft -= 1;
      state.hint = { id: pick.id, until: performance.now() + 2300 };
      say('A change is pulsing \u2014 look close', '#ffd166', 2000);
      return;
    }
    if (state.mode === 'start') api.start();
  },

  moveCursor(dx, dy) {
    state.cursor.x = Math.max(6, Math.min(PANEL_W - 6, state.cursor.x + dx));
    state.cursor.y = Math.max(6, Math.min(PANEL_H - 6, state.cursor.y + dy));
  },

  markCursor() {
    if (state.mode !== 'play') return;
    api.mark(0, state.cursor.x, state.cursor.y);
  },

  mark(side, x, y) {
    if (state.mode !== 'play') return;
    let hit = null;
    let best = Infinity;
    for (const d of state.level.diffs) {
      const dd = dist2(x, y, d.x, d.y);
      if (dd <= d.r * d.r && dd < best) { best = dd; hit = d; }
    }

    if (!hit) {
      state.wrongs.push({ side, x, y, t0: performance.now() });
      state.wrongCount += 1;
      state.shakeAt = performance.now();
      say('Nothing changed there', '#ff8a7a', 1100);
      return;
    }
    if (state.found.has(hit.id)) {
      say('Already found that one', 'rgba(200,214,228,0.8)', 900);
      return;
    }

    state.found.add(hit.id);
    state.foundAt[hit.id] = performance.now();
    state.hint = null;
    const left = state.level.diffs.length - state.found.size;
    say(left === 0 ? 'That is all of them!' : `Found it \u2014 ${left} to go`, '#9dffd4', 1400);

    if (left === 0) {
      state.time = Math.max(0, (state.endAt - performance.now()) / 1000);
      const hintsUsed = state.level.hints - state.hintsLeft;
      state.score = Math.max(0,
        state.found.size * 100 +
        Math.floor(state.time) * 5 +
        (state.wrongCount === 0 ? 250 : 0) -
        hintsUsed * 50);
      state.mode = 'win';
      state.reveal = false;
    }
  },
};

attachInput(canvas, api);

// The clock is read from the wall time so a slow frame never buys extra seconds.
function tick(now) {
  if (state.mode === 'play') {
    state.time = Math.max(0, (state.endAt - now) / 1000);
    if (state.time <= 0) {
      state.mode = 'timeup';
      state.reveal = true;
      state.hint = null;
    }
  }
  state.wrongs = state.wrongs.filter((w) => now - w.t0 < 700);
  render(ctx, state, now);

  // Keep the tab title honest while playing, so the hunt is readable at a glance
  // even when the window sits behind something else.
  const label = state.mode === 'play'
    ? `Found ${state.found.size}/${state.level.diffs.length} · Harbor at Dusk`
    : `Harbor at Dusk — ${state.mode === 'win' ? 'cove cleared' : state.mode === 'timeup' ? "time's up" : 'spot the difference'}`;
  if (document.title !== label) document.title = label;

  requestAnimationFrame(tick);
}

function fit() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = LAYOUT.width * dpr;
  canvas.height = LAYOUT.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

fit();
window.addEventListener('resize', () => { fit(); });
state.panels = buildPanels(state.level);
requestAnimationFrame(tick);

// Exposed for the screenshot helper: play deterministically without a mouse.
window.harborGame = { state, api };
