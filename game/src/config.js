// config.js — levels, the differences of each set, timings and the colour palettes.
// Everything the rest of the game needs to know about a level lives here.

export const PANEL_W = 600;
export const PANEL_H = 560;

// Each difference is one deliberate change between the two panels, with the spot
// (in panel coordinates) a player must click to claim it.
const DIFF = {
  gull:      { x: 252, y: 206, r: 34, name: 'a gull that has flown away' },
  window:    { x: 118, y: 326, r: 27, name: 'a cottage window, dark or lit' },
  rope:      { x: 206, y: 400, r: 29, name: 'the dock rope, coiled or straight' },
  flag:      { x: 337, y: 392, r: 25, name: 'the sailboat flag' },
  star:      { x: 470, y: 44, r: 27, name: 'a star in the sky' },
  crate:     { x: 150, y: 406, r: 31, name: 'a crate on the dock' },
  smoke:     { x: 152, y: 268, r: 31, name: 'the cottage chimney smoke' },
  buoy:      { x: 500, y: 470, r: 27, name: 'the buoy stripe' },
  cloud:     { x: 330, y: 66, r: 41, name: 'the shape of a cloud' },
  lamp:      { x: 512, y: 132, r: 31, name: 'the lighthouse lamp' },
  piling:    { x: 236, y: 436, r: 26, name: 'a post on the pier' },
  net:       { x: 58, y: 402, r: 31, name: 'the holes in a fishing net' },
};

function diffs(ids) {
  return ids.map((id) => Object.assign({ id }, DIFF[id]));
}

export const LEVELS = [
  {
    key: 'dusk',
    title: 'Dusk',
    blurb: 'The cove at sunset. Ten changes, a long evening.',
    mood: 'dusk',
    seconds: 180,
    hints: 3,
    diffs: diffs(['gull', 'window', 'rope', 'flag', 'star', 'crate', 'smoke', 'buoy', 'cloud', 'lamp']),
  },
  {
    key: 'night',
    title: 'Night',
    blurb: 'Lanterns and stars. Twelve subtler changes.',
    mood: 'night',
    seconds: 165,
    hints: 3,
    diffs: diffs(['gull', 'window', 'rope', 'flag', 'star', 'crate', 'smoke', 'buoy', 'cloud', 'lamp', 'piling', 'net']),
  },
  {
    key: 'storm',
    title: 'Storm',
    blurb: 'Rain on the rocks. Twelve changes, little time.',
    mood: 'storm',
    seconds: 120,
    hints: 2,
    diffs: diffs(['gull', 'window', 'rope', 'flag', 'star', 'crate', 'smoke', 'buoy', 'cloud', 'lamp', 'piling', 'net']),
  },
];

// One palette per mood, read by world.js when it paints the sky, sea and lights.
export const PALETTES = {
  dusk: {
    skyTop: '#2a2350', skyMid: '#7a4a72', skyLow: '#e08a54', skyHorizon: '#f7c36a',
    seaFar: '#c9835c', seaNear: '#243a55', seaDeep: '#16233a',
    rock: '#4b4656', rockLit: '#6d6270', rockDark: '#2c2a38',
    lamp: '#ffe9a8', lampGlow: 0.95, starAlpha: 0.25, starCount: 5,
    glow: 'rgba(255,214,130,0.55)', sun: '#ffd27a', rain: 0, wave: 0.35,
    wall: '#e7d3b6', wallShade: '#c2a98c', roof: '#8d4b45',
  },
  night: {
    skyTop: '#070d22', skyMid: '#12203f', skyLow: '#243b60', skyHorizon: '#4c6a86',
    seaFar: '#22374d', seaNear: '#101c2e', seaDeep: '#080f1c',
    rock: '#2c3040', rockLit: '#434959', rockDark: '#1a1d28',
    lamp: '#fff2c4', lampGlow: 1, starAlpha: 0.9, starCount: 14,
    glow: 'rgba(255,226,150,0.62)', sun: '#dfe7f5', rain: 0, wave: 0.22,
    wall: '#8f8a86', wallShade: '#6b6764', roof: '#4a3a3c',
  },
  storm: {
    skyTop: '#1d2530', skyMid: '#2e3c4b', skyLow: '#4a5a66', skyHorizon: '#6c7a80',
    seaFar: '#41606c', seaNear: '#1c2c38', seaDeep: '#0f1a22',
    rock: '#3a4048', rockLit: '#59616a', rockDark: '#20252b',
    lamp: '#ffeeb0', lampGlow: 1, starAlpha: 0.05, starCount: 2,
    glow: 'rgba(255,224,150,0.5)', sun: '#aab6bd', rain: 0.85, wave: 0.9,
    wall: '#b6b3ac', wallShade: '#8d8a84', roof: '#5b3f3c',
  },
};

// Screen layout: two panels side by side under the top bar.
export const LAYOUT = {
  width: 1280,
  height: 780,
  topBar: 92,
  panel: 600,
  panelW2: 600,
  panelH: 560,
  gap: 40,
  leftX: 20,
  rightX: 660,
  panelY: 100,
};

export const MARK = { ring: '#7dfcc4', hint: '#ffd166', wrong: '#ff6b6b' };
