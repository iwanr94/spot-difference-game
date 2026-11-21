// Harbor at Dusk — render: paints both panels and every mark on them.
// One file, one job: turn game state into pixels on the two canvases.

import { PANEL_W, PANEL_H, COLORS } from './config.js';
import { drawScene } from './world.js';

// Draw a satisfying ring + tick on a found difference, on one panel.
function drawFoundMark(ctx, diff, now) {
  const age = (now - diff.foundAt) / 1000;
  const pop = age < 0.25 ? 0.7 + age * 1.6 : 1.3;
  const r = diff.r * pop;
  ctx.strokeStyle = COLORS.mark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = COLORS.markRing;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  // Tick inside the ring.
  ctx.strokeStyle = COLORS.mark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(diff.x - 8, diff.y);
  ctx.lineTo(diff.x - 2, diff.y + 7);
  ctx.lineTo(diff.x + 10, diff.y - 7);
  ctx.stroke();
}

// A pulsing gold ring on the hinted difference, on both panels.
function drawHintMark(ctx, diff, now) {
  const pulse = 0.6 + 0.4 * Math.sin(now / 180);
  ctx.strokeStyle = `rgba(241, 196, 15, ${pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r + 4, 0, Math.PI * 2);
  ctx.stroke();
}

// A brief red cross where a wrong click landed.
function drawWrongMark(ctx, wrong, now) {
  if (!wrong) return;
  const age = now - wrong.at;
  if (age > 600) return;
  const alpha = 1 - age / 600;
  ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`;
  ctx.lineWidth = 4;
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(wrong.x - s, wrong.y - s);
  ctx.lineTo(wrong.x + s, wrong.y + s);
  ctx.moveTo(wrong.x + s, wrong.y - s);
  ctx.lineTo(wrong.x - s, wrong.y + s);
  ctx.stroke();
}

// Paint one frame: both panels, then marks on top of each.
export function renderFrame(leftCtx, rightCtx, state, now) {
  const { set } = state;
  drawScene(leftCtx, set, 'left');
  drawScene(rightCtx, set, 'right');

  for (const diff of set.diffs) {
    if (!state.found.has(diff.id)) continue;
    const marked = { ...diff, foundAt: state.foundAt[diff.id] };
    drawFoundMark(leftCtx, marked, now);
    drawFoundMark(rightCtx, marked, now);
  }

  if (state.hintDiff && now - state.hintAt < 2500) {
    drawHintMark(leftCtx, state.hintDiff, now);
    drawHintMark(rightCtx, state.hintDiff, now);
  }

  if (state.wrongLeft) drawWrongMark(leftCtx, state.wrongLeft, now);
  if (state.wrongRight) drawWrongMark(rightCtx, state.wrongRight, now);
}

// Size the two canvases to the panel size (with device-pixel scaling).
export function setupCanvases(leftCanvas, rightCanvas) {
  for (const canvas of [leftCanvas, rightCanvas]) {
    canvas.width = PANEL_W;
    canvas.height = PANEL_H;
  }
}
