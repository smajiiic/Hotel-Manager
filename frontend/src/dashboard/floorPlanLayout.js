// Static floor-plan geometry for the 15-room single-floor hotel (101–115).
// Physical layout is frontend-owned; only room status comes from the API.
//
// Wide landscape plan so it fills the content zone with little wasted space: a
// circulation spine off the main entrance past Reception, the Hamam & spa, and
// the Stairs, branching into a horizontal corridor serving a double-loaded room
// block — north row 101–108 (doors south) and south row 109–115 (doors north).
// Every room door opens onto a corridor; no floating rooms.

// Wide aspect (~2.4:1) to match the on-page content area.
export const VIEWBOX = { width: 1680, height: 700 };

// Rectangular building shell.
export const BUILDING_OUTLINE = '36,36 1644,36 1644,644 36,644';

// Corridor floors (the circulation system).
export const CORRIDORS = [
  { id: 'corridor-spine', x: 330, y: 60, w: 140, h: 584 }, // vertical spine off the entrance
  { id: 'corridor-main', x: 470, y: 280, w: 1150, h: 80 }, // horizontal, serves the room block
];

export const ZONES = [
  { key: 'hamam', label: 'Hamam & spa', type: 'hamam', x: 60, y: 60, w: 270, h: 300 },
  { key: 'reception', label: 'Reception', type: 'reception', x: 60, y: 380, w: 270, h: 264 },
  { key: 'stairs', label: 'Stairs', type: 'stairs', x: 345, y: 70, w: 110, h: 150 },
];

// Main entrance — doorway cut into the south wall below Reception.
export const ENTRANCE = { x: 195, y: 644, side: 'S', label: 'Main entrance' };

export const ROOM_LAYOUT = {
  // North row — doors open south onto the horizontal corridor.
  101: { x: 478, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  102: { x: 622, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  103: { x: 766, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  104: { x: 910, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  105: { x: 1054, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  106: { x: 1198, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  107: { x: 1342, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },
  108: { x: 1486, y: 60, w: 128, h: 220, door: { side: 'S', at: 0.5 } },

  // South row — doors open north onto the horizontal corridor.
  109: { x: 478, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  110: { x: 642, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  111: { x: 806, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  112: { x: 970, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  113: { x: 1134, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  114: { x: 1298, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
  115: { x: 1462, y: 360, w: 148, h: 240, door: { side: 'N', at: 0.5 } },
};

// Zone doors onto the vertical spine.
export const ZONE_DOORS = [
  { x: 60, y: 60, w: 270, h: 300, door: { side: 'E', at: 0.6 } }, // Hamam → spine
  { x: 60, y: 380, w: 270, h: 264, door: { side: 'E', at: 0.4 } }, // Reception → spine
];

export const ROOM_NUMBERS = Object.keys(ROOM_LAYOUT)
  .map(Number)
  .sort((a, b) => a - b);

export function getRoomLayout(roomNumber) {
  return ROOM_LAYOUT[Number(roomNumber)] ?? null;
}
