// Harbor at Dusk — configuration: level sets, differences, timer, palette.
// One file, one job: all tunable data lives here, no drawing, no input.

export const PANEL_W = 640;
export const PANEL_H = 480;

// A difference: an id, the key world.js uses to render the changed variant,
// the click zone (x, y, radius) in panel coordinates, and a short label.
function diff(id, key, x, y, r, label) {
  return { id, key, x, y, r, label };
}

// Dusk set: 10 differences, 180 seconds, 3 hints.
const DUSK_DIFFS = [
  diff('gull', 'gull', 300, 60, 26, 'A gull is missing'),
  diff('window', 'window', 505, 272, 24, 'Cottage window dark'),
  diff('rope', 'rope', 560, 312, 26, 'Rope uncoiled'),
  diff('flag', 'flag', 250, 150, 24, 'Boat flag changed colour'),
  diff('star', 'star', 180, 40, 22, 'An evening star is gone'),
  diff('crate', 'crate', 430, 298, 26, 'The crate moved'),
  diff('smoke', 'smoke', 560, 225, 26, 'Chimney smoke changed'),
  diff('buoy', 'buoy', 330, 365, 24, 'Buoy stripe missing'),
  diff('cloud', 'cloud', 350, 100, 28, 'A cloud vanished'),
  diff('lamp', 'lamp', 90, 115, 26, 'Lighthouse lamp is off'),
];

// Night set: 12 differences, harder (subtler changes), 180 seconds, 3 hints.
const NIGHT_DIFFS = [
  diff('gull', 'gull', 300, 60, 26, 'A gull is missing'),
  diff('window', 'window', 505, 272, 24, 'Cottage window dark'),
  diff('rope', 'rope', 560, 312, 26, 'Rope uncoiled'),
  diff('flag', 'flag', 250, 150, 24, 'Boat flag changed colour'),
  diff('star', 'star', 180, 40, 22, 'A star is gone'),
  diff('crate', 'crate', 430, 298, 26, 'The crate moved'),
  diff('smoke', 'smoke', 560, 225, 26, 'Chimney smoke changed'),
  diff('buoy', 'buoy', 330, 365, 24, 'Buoy stripe missing'),
  diff('cloud', 'cloud', 350, 100, 28, 'A cloud vanished'),
  diff('lamp', 'lamp', 90, 115, 26, 'Lighthouse lamp is off'),
  diff('door', 'door', 545, 285, 22, 'Door lamp is out'),
  diff('sail', 'sail', 420, 200, 26, 'Second sail changed shade'),
];

// Storm set: 12 differences, shorter timer, 150 seconds, 2 hints.
const STORM_DIFFS = [
  diff('gull', 'gull', 300, 60, 26, 'A gull is missing'),
  diff('window', 'window', 505, 272, 24, 'Cottage window dark'),
  diff('rope', 'rope', 560, 312, 26, 'Rope uncoiled'),
  diff('flag', 'flag', 250, 150, 24, 'Boat flag changed colour'),
  diff('star', 'star', 180, 40, 22, 'A beacon light is gone'),
  diff('crate', 'crate', 430, 298, 26, 'The crate moved'),
  diff('smoke', 'smoke', 560, 225, 26, 'Chimney smoke changed'),
  diff('buoy', 'buoy', 330, 365, 24, 'Buoy stripe missing'),
  diff('cloud', 'cloud', 350, 100, 28, 'A cloud vanished'),
  diff('lamp', 'lamp', 90, 115, 26, 'Lighthouse lamp is off'),
  diff('door', 'door', 545, 285, 22, 'Door lamp is out'),
  diff('wave', 'wave', 200, 380, 26, 'A wave crest is missing'),
];

export const SETS = {
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    blurb: 'Golden hour over the harbor. 10 differences.',
    timeLimit: 180,
    hints: 3,
    diffs: DUSK_DIFFS,
  },
  night: {
    id: 'night',
    name: 'Night',
    blurb: 'The harbor sleeps. 12 subtler differences.',
    timeLimit: 180,
    hints: 3,
    diffs: NIGHT_DIFFS,
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    blurb: 'Rain on the cove. 12 differences, less time.',
    timeLimit: 150,
    hints: 2,
    diffs: STORM_DIFFS,
  },
};

export const SET_ORDER = ['dusk', 'night', 'storm'];

// Look a set up by id; falls back to Dusk so a bad key never breaks a run.
export function getSet(id) {
  return SETS[id] ?? SETS.dusk;
}

// Palettes per set: sky top/bottom, sun, sea top/bottom, fog tint.
export const PALETTES = {
  dusk: {
    skyTop: '#2b2a6b', skyBottom: '#f08a4b',
    sun: '#ffd166', sunGlow: 'rgba(255, 209, 102, 0.55)',
    seaTop: '#3d6f8e', seaBottom: '#1d3a52',
    cloud: 'rgba(255, 214, 178, 0.85)',
    fog: 'rgba(240, 138, 75, 0.10)',
  },
  night: {
    skyTop: '#050914', skyBottom: '#1b2a52',
    sun: '#e8ecff', sunGlow: 'rgba(232, 236, 255, 0.35)',
    seaTop: '#16283f', seaBottom: '#0a1526',
    cloud: 'rgba(150, 170, 220, 0.35)',
    fog: 'rgba(27, 42, 82, 0.15)',
  },
  storm: {
    skyTop: '#3a4148', skyBottom: '#7d8894',
    sun: '#cfd6da', sunGlow: 'rgba(207, 214, 218, 0.25)',
    seaTop: '#4a5a63', seaBottom: '#26333b',
    cloud: 'rgba(60, 66, 72, 0.9)',
    fog: 'rgba(125, 136, 148, 0.18)',
  },
};

export const COLORS = {
  rock: '#4a4038',
  rockDark: '#332c26',
  tower: '#f5efe0',
  towerStripe: '#c0392b',
  roof: '#8a3b2e',
  cottageWall: '#e8dcc0',
  wood: '#6b4a2f',
  woodDark: '#4e3421',
  sailWhite: '#f7f3e8',
  sailShade: '#c9d4de',
  hull: '#5a2e22',
  buoyRed: '#c0392b',
  mark: '#2ecc71',
  markRing: '#27ae60',
  wrong: '#e74c3c',
  hint: '#f1c40f',
};
