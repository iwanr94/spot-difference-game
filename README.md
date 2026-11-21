# Harbor at Dusk

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iwanr94/spot-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iwanr94/spot-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A spot-the-difference hunt in an original lighthouse cove. Two pictures of the same
harbour are drawn side by side in code — same boats, same rocks, same sunset — with up
to twelve deliberate little changes hidden between them. Find them all before the light
goes out.

## How to play

- **Mouse:** click a change in either picture. A ring snaps onto both panels when you are right.
- **Keyboard:** arrow keys move a crosshair shown on both pictures (`Shift` for bigger steps),
  `Enter` / `Space` marks the spot, `H` spends a hint, `R` restarts, `Esc` returns to the set list.
- **Sets:** `1` Dusk (10 changes, 3:00), `2` Night (12 changes, 2:45), `3` Storm (12 changes, 2:00, two hints).
- A wrong click only shakes the frame and flashes red — no life lost, no penalty. Hints ring an
  unfound change in amber for a few seconds and are limited per set.
- Score: 100 per change, 5 per second left, 250 for a clean run, minus 50 per hint. Clear all
  changes for the win screen; run out of time and the missed changes are revealed.

Every frame is drawn procedurally on a single canvas: no images, no fonts, no network request.

## Run it

```sh
node serve.ts            # serves game/ on http://localhost:8080
```

or open `game/index.html` from any static server. The game itself is plain ES modules under
`game/src/` with no build step.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Copies `game/` and `screenshots/` into the output directory and writes `dossier.json` with
`buildDossier` from `vendor/makefun-game.ts`.

## Source layout

| file | job |
| --- | --- |
| `game/src/config.js` | palettes, the difference catalogue, the three sets, layout |
| `game/src/world.js` | paints one panel of the cove, with or without the changes |
| `game/src/render.js` | frame composition: panels, marks, HUD, overlays |
| `game/src/input.js` | mouse and keyboard → game calls |
| `game/src/main.js` | state, clock, scoring, screens |

Original work: art, names, layout and code are written for this entry. MIT licensed.
