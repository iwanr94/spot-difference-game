// Harbor at Dusk — input: mouse clicks on the panels and keyboard shortcuts.
// One file, one job: turn browser events into game actions, nothing else.

import { PANEL_W, PANEL_H } from './config.js';

// Convert a mouse event on a canvas into panel coordinates.
// The canvas is shown scaled by CSS, so scale from its box to its pixels.
function panelPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  return { x, y };
}

// Wire the two canvases and the keyboard to the game's handlers.
// handlers: onGuess(panel, x, y), onHint(), onStart(), onRestart(), onSet(id).
export function attachInput(leftCanvas, rightCanvas, handlers) {
  leftCanvas.addEventListener('click', (event) => {
    const { x, y } = panelPoint(leftCanvas, event);
    handlers.onGuess('left', x, y);
  });
  rightCanvas.addEventListener('click', (event) => {
    const { x, y } = panelPoint(rightCanvas, event);
    handlers.onGuess('right', x, y);
  });

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onHint();
    else if (key === 'r') handlers.onRestart();
    else if (key === 'enter') handlers.onStart();
    else if (key === '1') handlers.onSet('dusk');
    else if (key === '2') handlers.onSet('night');
    else if (key === '3') handlers.onSet('storm');
  });
}
