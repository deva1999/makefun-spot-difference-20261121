// levels.js — the data for every round: scene name, time limit, and the
// seven differences hidden in that round. A difference is a point on the
// panel (panel-local coordinates, panels are 580 x 520), a click radius,
// and a kind that the scene painter in scenes.js knows how to draw two
// ways: the plain way on the left panel, the changed way on the right.
// Nothing here is random: the same level always hides the same seven
// differences in the same places, so a screenshot can be staged exactly.

export const PANEL_W = 580;
export const PANEL_H = 520;

export const LEVELS = [
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    scene: 'harbour',
    timeLimit: 150,
    blurb: 'Fishing boats come home as the lamps come on.',
    diffs: [
      { id: 'h-window', kind: 'missing-window', x: 140, y: 278, r: 16, label: 'a lit window that vanished' },
      { id: 'h-bird', kind: 'extra-bird', x: 420, y: 95, r: 18, label: 'a gull that was not there before' },
      { id: 'h-sail', kind: 'sail-colour', x: 385, y: 358, r: 22, label: 'a sail repainted blue' },
      { id: 'h-beam', kind: 'no-beam', x: 520, y: 205, r: 20, label: 'the lighthouse beam switched off' },
      { id: 'h-buoy', kind: 'missing-buoy', x: 180, y: 452, r: 16, label: 'a buoy that sank from view' },
      { id: 'h-star', kind: 'extra-star', x: 250, y: 62, r: 14, label: 'a new star in the dusk sky' },
      { id: 'h-post', kind: 'missing-post', x: 95, y: 445, r: 16, label: 'a pier post that went missing' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    scene: 'market',
    timeLimit: 135,
    blurb: 'Lanterns, tea stalls and one very busy cat.',
    diffs: [
      { id: 'm-lantern', kind: 'lantern-colour', x: 300, y: 150, r: 16, label: 'a lantern that changed colour' },
      { id: 'm-sign', kind: 'sign-change', x: 305, y: 235, r: 18, label: 'a stall sign that says something else' },
      { id: 'm-cat', kind: 'extra-cat', x: 360, y: 400, r: 20, label: 'a second cat on the crates' },
      { id: 'm-stripe', kind: 'awning-stripe', x: 120, y: 130, r: 16, label: 'an awning stripe that disappeared' },
      { id: 'm-crate', kind: 'missing-crate', x: 80, y: 428, r: 18, label: 'the top crate of the stack' },
      { id: 'm-bulb', kind: 'bulb-out', x: 200, y: 58, r: 12, label: 'a fairy-light bulb gone dark' },
      { id: 'm-flag', kind: 'flag-colour', x: 500, y: 120, r: 16, label: 'a stall flag in a different colour' },
    ],
  },
  {
    id: 'garden',
    name: 'Secret Garden',
    scene: 'garden',
    timeLimit: 120,
    blurb: 'Quiet lawns, loud flowers — look closely.',
    diffs: [
      { id: 'g-flower', kind: 'flower-colour', x: 200, y: 420, r: 14, label: 'one tulip turned white' },
      { id: 'g-butterfly', kind: 'missing-butterfly', x: 400, y: 180, r: 16, label: 'a butterfly that flew away' },
      { id: 'g-slat', kind: 'bench-slat', x: 150, y: 382, r: 16, label: 'a bench slat that fell out' },
      { id: 'g-duck', kind: 'missing-duck', x: 470, y: 460, r: 18, label: 'the duck that left the pond' },
      { id: 'g-branch', kind: 'extra-branch', x: 120, y: 200, r: 18, label: 'an extra branch on the old tree' },
      { id: 'g-post', kind: 'fence-post', x: 350, y: 300, r: 14, label: 'a fence post that is gone' },
      { id: 'g-cloud', kind: 'missing-cloud', x: 150, y: 60, r: 18, label: 'a small cloud that drifted off' },
    ],
  },
];

// The right panel is drawn with every kind in this set applied; the left
// panel is drawn with none of them. That is the whole trick of the game:
// one painter, two mod sets, seven honest differences.
export function modsForLevel(level) {
  return new Set(level.diffs.map((d) => d.kind));
}
