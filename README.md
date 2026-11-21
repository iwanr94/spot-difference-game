# Harbor at Dusk — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iwanr94/spot-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iwanr94/spot-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Two pictures of the same lighthouse cove — but some details differ. Find them all before the sun sets.

## How to play

- Click a difference on either picture to mark it. A green ring appears on both panels and the counter drops.
- A wrong click only leaves a brief red cross — no harsh penalty.
- **Hint (H):** a gold ring briefly marks one hiding spot. Limited per set.
- **Sets:** Dusk (10 differences, 180 s), Night (12 subtler differences, 180 s), Storm (12 differences, 150 s). Switch with the buttons or keys 1 / 2 / 3.
- **R** restarts the current set. Find them all to win; the win screen shows your time left and score.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Or open `game/index.html` directly — the game needs no network and no build step.

## Structure

- `game/src/config.js` — sets, differences, timer, palette.
- `game/src/world.js` — draws the harbor scene, both panels.
- `game/src/render.js` — canvas rendering, found/hint/wrong marks.
- `game/src/input.js` — mouse + keyboard handling.
- `game/src/main.js` — game loop, state, scoring, HUD.

All art is drawn procedurally on canvas — an original lighthouse cove, no borrowed assets.
