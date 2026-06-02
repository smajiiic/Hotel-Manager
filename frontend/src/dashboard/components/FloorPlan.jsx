import './FloorPlan.css';
import {
  VIEWBOX,
  BUILDING_OUTLINE,
  CORRIDORS,
  ZONES,
  ENTRANCE,
  ROOM_LAYOUT,
  ROOM_NUMBERS,
} from '../floorPlanLayout.js';
import { statusMeta } from '../lib/statusColors.js';

const DOOR = 26;

// Resolve a room's doorway into drawable geometry: a gap painted over the wall,
// the open door leaf, and the swing arc — derived from { side, at }.
function doorGeometry({ x, y, w, h, door }) {
  const { side, at } = door;
  if (side === 'S') {
    const cx = x + at * w;
    const wy = y + h;
    const j1 = cx - DOOR / 2;
    const j2 = cx + DOOR / 2;
    return {
      gap: { x1: j1, y1: wy, x2: j2, y2: wy },
      leaf: { x1: j1, y1: wy, x2: j1, y2: wy + DOOR },
      arc: `M ${j1} ${wy + DOOR} A ${DOOR} ${DOOR} 0 0 1 ${j2} ${wy}`,
    };
  }
  if (side === 'N') {
    const cx = x + at * w;
    const wy = y;
    const j1 = cx - DOOR / 2;
    const j2 = cx + DOOR / 2;
    return {
      gap: { x1: j1, y1: wy, x2: j2, y2: wy },
      leaf: { x1: j1, y1: wy, x2: j1, y2: wy - DOOR },
      arc: `M ${j1} ${wy - DOOR} A ${DOOR} ${DOOR} 0 0 0 ${j2} ${wy}`,
    };
  }
  if (side === 'E') {
    const cy = y + at * h;
    const wx = x + w;
    const j1 = cy - DOOR / 2;
    const j2 = cy + DOOR / 2;
    return {
      gap: { x1: wx, y1: j1, x2: wx, y2: j2 },
      leaf: { x1: wx, y1: j1, x2: wx + DOOR, y2: j1 },
      arc: `M ${wx + DOOR} ${j1} A ${DOOR} ${DOOR} 0 0 1 ${wx} ${j2}`,
    };
  }
  // 'W'
  const cy = y + at * h;
  const wx = x;
  const j1 = cy - DOOR / 2;
  const j2 = cy + DOOR / 2;
  return {
    gap: { x1: wx, y1: j1, x2: wx, y2: j2 },
    leaf: { x1: wx, y1: j1, x2: wx - DOOR, y2: j1 },
    arc: `M ${wx - DOOR} ${j1} A ${DOOR} ${DOOR} 0 0 0 ${wx} ${j2}`,
  };
}

function DoorSwing({ layout }) {
  const { gap, leaf, arc } = doorGeometry(layout);
  return (
    <g aria-hidden="true">
      <line className="ibh-door-gap" {...gap} />
      <line className="ibh-door-leaf" {...leaf} />
      <path className="ibh-door-arc" d={arc} />
    </g>
  );
}

function flagLabel(room) {
  const parts = [];
  if (room?.hasTask) parts.push('open task');
  if (room?.hasNote) parts.push('note');
  return parts.join(' and ');
}

function ariaLabel(roomNumber, room) {
  const status = statusMeta(room?.status).label;
  const flags = flagLabel(room);
  return `Room ${roomNumber}, ${status}${flags ? `, has ${flags}` : ''}`;
}

/**
 * Shared top-down floor plan.
 *
 * Props:
 *  - rooms: array of room view-models ({ roomNumber, status, hasTask, hasNote, ... })
 *  - mode: 'interactive' | 'readonly' (affects affordance/cursor, not whether a
 *          room can be selected — manager's read-only plan still opens detail)
 *  - onRoomSelect(room): called when a room is activated (click / Enter / Space)
 *  - selectedRoomNumber: highlights the active room
 *  - title: accessible name for the plan
 */
export default function FloorPlan({
  rooms = [],
  mode = 'interactive',
  onRoomSelect,
  selectedRoomNumber = null,
  title = 'Hotel floor plan',
}) {
  const byNumber = new Map(rooms.map((r) => [Number(r.roomNumber), r]));
  const selectable = typeof onRoomSelect === 'function';
  const isInteractive = mode === 'interactive';

  const handleActivate = (room) => {
    if (selectable && room) onRoomSelect(room);
  };

  const handleKeyDown = (e, room) => {
    if (!selectable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate(room);
    }
  };

  return (
    <div className="ibh-floorplan-wrap" data-testid="floorplan">
      <svg
        className="ibh-floorplan-svg"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="group"
        aria-label={title}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Building shell (thin wall outline) */}
        <polygon className="ibh-wall" points={BUILDING_OUTLINE} />

        {/* Corridor floors */}
        {CORRIDORS.map((c) => (
          <rect key={c.id} className="ibh-corridor" x={c.x} y={c.y} width={c.w} height={c.h} />
        ))}

        {/* Non-room zones */}
        {ZONES.map((z) => (
          <g key={z.key} aria-hidden="true">
            <rect className="ibh-zone-rect" x={z.x} y={z.y} width={z.w} height={z.h} rx="6" />
            <text className="ibh-zone-label" x={z.x + z.w / 2} y={z.y + z.h / 2} fontSize="15">
              {z.label}
            </text>
          </g>
        ))}

        {/* Main entrance doorway */}
        <DoorSwing layout={{ x: ENTRANCE.x - 15, y: ENTRANCE.y - 30, w: 30, h: 30, door: { side: ENTRANCE.side, at: 0.5 } }} />

        {/* Door swings for every room */}
        {ROOM_NUMBERS.map((n) => (
          <DoorSwing key={`door-${n}`} layout={ROOM_LAYOUT[n]} />
        ))}

        {/* Rooms */}
        {ROOM_NUMBERS.map((n) => {
          const layout = ROOM_LAYOUT[n];
          const room = byNumber.get(n);
          const meta = statusMeta(room?.status);
          const selected = Number(selectedRoomNumber) === n;
          const hasFlag = Boolean(room?.hasTask || room?.hasNote);
          const cx = layout.x + layout.w / 2;
          const cy = layout.y + layout.h / 2;

          return (
            <g
              key={n}
              className={[
                'ibh-room',
                isInteractive ? 'is-interactive' : '',
                selected ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              data-testid={`room-${n}`}
              data-status={room?.status ?? 'unknown'}
              role={selectable ? 'button' : 'img'}
              aria-label={ariaLabel(n, room)}
              aria-pressed={selectable ? selected : undefined}
              tabIndex={selectable ? 0 : undefined}
              onClick={() => handleActivate(room ?? { roomNumber: n })}
              onKeyDown={(e) => handleKeyDown(e, room ?? { roomNumber: n })}
            >
              <rect
                className="ibh-room-rect"
                data-testid={`room-rect-${n}`}
                x={layout.x}
                y={layout.y}
                width={layout.w}
                height={layout.h}
                rx="4"
                fill={meta.fill}
              />
              <text className="ibh-room-number" x={cx} y={cy - 8} fontSize="20">
                {n}
              </text>
              <text className="ibh-room-label" x={cx} y={cy + 14} fontSize="11" fill={meta.text}>
                {meta.label}
              </text>
              {/* status dot */}
              <circle cx={layout.x + 14} cy={layout.y + 14} r="6" fill={meta.dot} />
              {/* task / note flag */}
              {hasFlag && (
                <g data-testid={`room-flag-${n}`}>
                  <circle className="ibh-flag-badge" cx={layout.x + layout.w - 15} cy={layout.y + 15} r="11" />
                  <text className="ibh-flag-glyph" x={layout.x + layout.w - 15} y={layout.y + 15} fontSize="13">
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Text-equivalent for screen readers — an SVG map can't be read aloud, so
          expose the same rooms + statuses as an operable list. */}
      <ul className="ibh-sr-only" aria-label={`${title} — room list`}>
        {ROOM_NUMBERS.map((n) => {
          const room = byNumber.get(n);
          const label = ariaLabel(n, room);
          return (
            <li key={n}>
              {selectable ? (
                <button type="button" onClick={() => handleActivate(room ?? { roomNumber: n })}>
                  {label}
                </button>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
