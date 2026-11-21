// Harbor at Dusk — main: game loop, state, scoring and the HUD.
// One file, one job: own the state machine and drive render + input.

import { SETS, SET_ORDER } from './config.js';
import { renderFrame, setupCanvases } from './render.js';
import { attachInput } from './input.js';

const $ = (id) => document.getElementById(id);

const state = {
  set: SETS.dusk,
  phase: 'start', // 'start' | 'playing' | 'won' | 'lost'
  found: new Set(),
  foundAt: {},
  hintsLeft: 3,
  timeLeft: 180,
  hintDiff: null,
  hintAt: 0,
  wrongLeft: null,
  wrongRight: null,
  lastTick: 0,
  message: '',
};

let leftCtx;
let rightCtx;

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateHud() {
  const total = state.set.diffs.length;
  const found = state.found.size;
  $('found-count').textContent = `Found ${found} / ${total}`;
  $('remaining-count').textContent = `Remaining ${total - found}`;
  $('timer').textContent = fmtTime(state.timeLeft);
  $('timer').classList.toggle('urgent', state.timeLeft <= 30 && state.phase === 'playing');
  $('timer-bar').style.width = `${(state.timeLeft / state.set.timeLimit) * 100}%`;
  $('hints-left').textContent = `Hints left: ${state.hintsLeft}`;
  $('hint-btn').disabled = state.hintsLeft <= 0 || state.phase !== 'playing';
  $('message').textContent = state.message;
}

function showOverlay(title, text, buttonLabel) {
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  $('overlay-btn').textContent = buttonLabel;
  $('overlay').classList.remove('hidden');
}

function hideOverlay() {
  $('overlay').classList.add('hidden');
}

function startGame(setId) {
  state.set = SETS[setId];
  state.phase = 'playing';
  state.found = new Set();
  state.foundAt = {};
  state.hintsLeft = state.set.hints;
  state.timeLeft = state.set.timeLimit;
  state.hintDiff = null;
  state.wrongLeft = null;
  state.wrongRight = null;
  state.lastTick = performance.now();
  state.message = `Find ${state.set.diffs.length} differences in the ${state.set.name} harbor!`;
  document.querySelectorAll('.set-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.set === setId);
  });
  hideOverlay();
  updateHud();
}

function endGame(won) {
  state.phase = won ? 'won' : 'lost';
  if (won) {
    const score = state.found.size * 100 + Math.ceil(state.timeLeft) * 10;
    showOverlay(
      'Harbor Found!',
      `You found all ${state.set.diffs.length} differences with ${fmtTime(state.timeLeft)} to spare. Score: ${score}.`,
      'Play again',
    );
    state.message = `You win! Score ${score}.`;
  } else {
    const left = state.set.diffs.length - state.found.size;
    showOverlay(
      'Time is up!',
      `The sun set on the harbor. ${left} difference${left === 1 ? '' : 's'} still hiding.`,
      'Try again',
    );
    state.message = 'Time is up!';
  }
  updateHud();
}

function onGuess(panel, x, y) {
  if (state.phase !== 'playing') return;
  const now = performance.now();
  const hit = state.set.diffs.find((d) => {
    if (state.found.has(d.id)) return false;
    const dx = x - d.x;
    const dy = y - d.y;
    return dx * dx + dy * dy <= d.r * d.r;
  });
  if (hit) {
    state.found.add(hit.id);
    state.foundAt[hit.id] = now;
    state.message = `Found it — ${hit.label}!`;
    if (state.found.size === state.set.diffs.length) {
      updateHud();
      endGame(true);
      return;
    }
  } else {
    // A gentle miss: a red cross where the click landed, no harsh penalty.
    const mark = { x, y, at: now };
    if (panel === 'left') state.wrongLeft = mark;
    else state.wrongRight = mark;
    state.message = 'Not quite — look closer.';
  }
  updateHud();
}

function onHint() {
  if (state.phase !== 'playing' || state.hintsLeft <= 0) return;
  const remaining = state.set.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  state.hintDiff = remaining[0];
  state.hintAt = performance.now();
  state.message = 'Hint: a gold ring marks one hiding spot.';
  updateHud();
}

// Demo presets for screenshots: ?demo=start | play | win renders a real
// game state (start screen, mid-play with 5 found, or the win screen).
// An optional ?set=dusk|night|storm picks the set for the preset.
function applyDemo() {
  const params = new URLSearchParams(location.search);
  const setParam = params.get('set');
  if (setParam && SETS[setParam]) state.set = SETS[setParam];
  const demo = params.get('demo');
  if (demo === 'play') {
    startGame(state.set.id);
    const now = performance.now();
    for (const d of state.set.diffs.slice(0, 5)) {
      state.found.add(d.id);
      state.foundAt[d.id] = now - 400;
    }
    state.timeLeft = 95;
    state.message = 'Found it — the crate moved!';
    updateHud();
  } else if (demo === 'win') {
    startGame(state.set.id);
    const now = performance.now();
    for (const d of state.set.diffs) {
      state.found.add(d.id);
      state.foundAt[d.id] = now - 400;
    }
    state.timeLeft = 64;
    endGame(true);
  }
}

function loop(now) {
  if (state.phase === 'playing') {
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame(false);
    }
    updateHud();
  }
  renderFrame(leftCtx, rightCtx, state, now);
  requestAnimationFrame(loop);
}

function init() {
  const leftCanvas = $('left-canvas');
  const rightCanvas = $('right-canvas');
  setupCanvases(leftCanvas, rightCanvas);
  leftCtx = leftCanvas.getContext('2d');
  rightCtx = rightCanvas.getContext('2d');

  attachInput(leftCanvas, rightCanvas, {
    onGuess,
    onHint,
    onStart: () => {
      if (state.phase !== 'playing') startGame(state.set.id);
    },
    onRestart: () => startGame(state.set.id),
    onSet: (id) => startGame(id),
  });

  document.querySelectorAll('.set-btn').forEach((btn) => {
    btn.addEventListener('click', () => startGame(btn.dataset.set));
  });
  $('hint-btn').addEventListener('click', onHint);
  $('overlay-btn').addEventListener('click', () => startGame(state.set.id));

  showOverlay(
    'Harbor at Dusk',
    'Two pictures of the same lighthouse cove — but ten details differ. Click a difference on either picture to mark it. Pick a set, then hunt!',
    'Start hunting',
  );
  updateHud();
  applyDemo();
  state.lastTick = performance.now();
  requestAnimationFrame(loop);
}

init();
