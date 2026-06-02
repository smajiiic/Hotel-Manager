// Static floor-plan geometry for the Isa Begov Hamam hotel (15 rooms, 101–115).
//
// Physical layout is NOT backend data — only room *status* comes from the API.
// This module is the single source of truth for where things sit on the plan,
// owned by the frontend. Coordinates are in SVG user units against VIEWBOX.
//
// Shape: an L. A long top arm holds a north row (101–107) above a corridor and
// a south row (108–111) below it; the building then returns down a shorter
// right-hand wing (112–115) with Stairs anchoring its foot. Reception sits by
// the entrance with a distinct Hamam & spa zone beside it.
//
// Each room carries a `door` = { side, at }: which wall the doorway is cut into
// (N/S/E/W, the side facing a corridor) and `at` = fraction along that wall
// (0–1). FloorPlan derives the doorway gap + swing arc from this.

export const VIEWBOX = { width: 980, height: 620 };

// Outer wall outline of the L-shaped building, as an SVG polygon point string.
export const BUILDING_OUTLINE =
  '40,40 940,40 940,580 520,580 520,300 40,300';

// Corridor floors (drawn as a subtle fill so the circulation reads clearly).
export const CORRIDORS = [
  { id: 'corridor-h', x: 40, y: 154, w: 900, h: 56 }, // top arm hallway
  { id: 'corridor-v', x: 695, y: 300, w: 70, h: 280 }, // right wing hallway
];

// Non-room zones.
export const ZONES = [
  { key: 'reception', label: 'Reception', type: 'reception', x: 450, y: 215, w: 160, h: 85 },
  { key: 'hamam', label: 'Hamam & spa', type: 'hamam', x: 630, y: 222, w: 300, h: 70 },
  { key: 'stairs', label: 'Stairs', type: 'stairs', x: 700, y: 455, w: 60, h: 110 },
];

// Main entrance — a doorway cut into the south wall, just below Reception.
export const ENTRANCE = { x: 480, y: 300, side: 'S', label: 'Entrance' };

// roomNumber → geometry + door. Keyed by Number to match the backend roomNumber.
export const ROOM_LAYOUT = {
  // North row of the top arm — doors open south onto the top hallway.
  101: { x: 60, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  102: { x: 181, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  103: { x: 302, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  104: { x: 423, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  105: { x: 544, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  106: { x: 665, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },
  107: { x: 786, y: 58, w: 105, h: 96, door: { side: 'S', at: 0.5 } },

  // South row of the top arm — doors open north onto the top hallway.
  108: { x: 60, y: 210, w: 85, h: 88, door: { side: 'N', at: 0.5 } },
  109: { x: 155, y: 210, w: 85, h: 88, door: { side: 'N', at: 0.5 } },
  110: { x: 250, y: 210, w: 85, h: 88, door: { side: 'N', at: 0.5 } },
  111: { x: 345, y: 210, w: 85, h: 88, door: { side: 'N', at: 0.5 } },

  // Right wing — west column doors open east, east column doors open west,
  // both onto the vertical hallway.
  112: { x: 545, y: 330, w: 150, h: 110, door: { side: 'E', at: 0.5 } },
  114: { x: 545, y: 455, w: 150, h: 110, door: { side: 'E', at: 0.5 } },
  113: { x: 765, y: 330, w: 150, h: 110, door: { side: 'W', at: 0.5 } },
  115: { x: 765, y: 455, w: 150, h: 110, door: { side: 'W', at: 0.5 } },
};

// Room numbers in display order (101–115).
export const ROOM_NUMBERS = Object.keys(ROOM_LAYOUT)
  .map(Number)
  .sort((a, b) => a - b);

export function getRoomLayout(roomNumber) {
  return ROOM_LAYOUT[Number(roomNumber)] ?? null;
}
