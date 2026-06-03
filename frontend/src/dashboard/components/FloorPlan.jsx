import './FloorPlan.css';
import {
  VIEWBOX, BUILDING_OUTLINE, CORRIDORS, ZONES, ENTRANCE,
  ROOM_LAYOUT, ROOM_NUMBERS, ZONE_DOORS,
} from '../floorPlanLayout.js';
import { statusMeta } from '../lib/statusColors.js';
import { IconExpand, IconClose, IconClipboard, IconChat, IconTap } from './icons.jsx';

const DOOR = 30;

function doorGeometry({ x, y, w, h, door }) {
  const { side, at } = door;
  if (side === 'S') {
    const cx = x + at * w, wy = y + h, j1 = cx - DOOR / 2, j2 = cx + DOOR / 2;
    return { gap: { x1: j1, y1: wy, x2: j2, y2: wy }, leaf: { x1: j1, y1: wy, x2: j1, y2: wy + DOOR }, arc: `M ${j1} ${wy + DOOR} A ${DOOR} ${DOOR} 0 0 1 ${j2} ${wy}` };
  }
  if (side === 'N') {
    const cx = x + at * w, wy = y, j1 = cx - DOOR / 2, j2 = cx + DOOR / 2;
    return { gap: { x1: j1, y1: wy, x2: j2, y2: wy }, leaf: { x1: j1, y1: wy, x2: j1, y2: wy - DOOR }, arc: `M ${j1} ${wy - DOOR} A ${DOOR} ${DOOR} 0 0 0 ${j2} ${wy}` };
  }
  if (side === 'E') {
    const cy = y + at * h, wx = x + w, j1 = cy - DOOR / 2, j2 = cy + DOOR / 2;
    return { gap: { x1: wx, y1: j1, x2: wx, y2: j2 }, leaf: { x1: wx, y1: j1, x2: wx + DOOR, y2: j1 }, arc: `M ${wx + DOOR} ${j1} A ${DOOR} ${DOOR} 0 0 1 ${wx} ${j2}` };
  }
  const cy = y + at * h, wx = x, j1 = cy - DOOR / 2, j2 = cy + DOOR / 2;
  return { gap: { x1: wx, y1: j1, x2: wx, y2: j2 }, leaf: { x1: wx, y1: j1, x2: wx - DOOR, y2: j1 }, arc: `M ${wx - DOOR} ${j1} A ${DOOR} ${DOOR} 0 0 0 ${wx} ${j2}` };
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

function RoomGlyphs({ layout, room }) {
  const baseX = layout.x + 16;
  const y = layout.y + layout.h - 24;
  const glyphs = [];
  if (room?.guestName) glyphs.push('guest');
  if (room?.hasTask) glyphs.push('task');
  if (room?.hasNote) glyphs.push('note');
  return (
    <g aria-hidden="true">
      {glyphs.map((g, i) => {
        const gx = baseX + i * 26;
        if (g === 'guest') {
          return (
            <g key={g} className="ibh-room-glyph">
              <circle cx={gx + 6} cy={y + 3} r="4" />
              <path d={`M ${gx} ${y + 16} a 6 6 0 0 1 12 0`} fill="none" />
            </g>
          );
        }
        if (g === 'task') {
          return (
            <g key={g} className="ibh-room-glyph">
              <rect x={gx} y={y - 2} width="12" height="15" rx="2" fill="none" />
              <path d={`M ${gx + 3} ${y + 5} l 2 2 l 4 -4`} fill="none" />
            </g>
          );
        }
        return (
          <g key={g} className="ibh-room-glyph">
            <path d={`M ${gx} ${y - 2} h 12 v 9 h -7 l -3 3 v -3 h -2 z`} fill="none" />
          </g>
        );
      })}
    </g>
  );
}

function ZoneShapes() {
  return (
    <>
      {ZONES.map((z) => {
        if (z.type === 'hamam') {
          return (
            <g key={z.key} aria-hidden="true">
              <rect className="ibh-zone-hamam" x={z.x} y={z.y} width={z.w} height={z.h} rx="4" />
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="4" fill="url(#ibh-tile)" />
              <g className="ibh-hamam-mark" transform={`translate(${z.x + z.w / 2 - 16}, ${z.y + z.h / 2 - 36})`}>
                <path d="M16 2s14 16 14 26a14 14 0 0 1-28 0C2 18 16 2 16 2z" />
              </g>
              <text className="ibh-zone-label" x={z.x + z.w / 2} y={z.y + z.h / 2 + 24} fontSize="20">{z.label}</text>
            </g>
          );
        }
        if (z.type === 'stairs') {
          const steps = 6;
          return (
            <g key={z.key} aria-hidden="true">
              <rect className="ibh-zone-solid" x={z.x} y={z.y} width={z.w} height={z.h} rx="2" />
              {Array.from({ length: steps }).map((_, i) => (
                <line key={i} className="ibh-stair-tread" x1={z.x + 6} x2={z.x + z.w - 6} y1={z.y + 24 + i * 18} y2={z.y + 24 + i * 18} />
              ))}
              <path className="ibh-stair-arrow" d={`M ${z.x + z.w / 2} ${z.y + 20} v 96 M ${z.x + z.w / 2 - 6} ${z.y + 28} l 6 -8 l 6 8`} />
              <text className="ibh-zone-label" x={z.x + z.w / 2} y={z.y + z.h - 12} fontSize="13">{z.label}</text>
            </g>
          );
        }
        // reception — solid zone with a built-in counter
        return (
          <g key={z.key} aria-hidden="true">
            <rect className="ibh-zone-solid" x={z.x} y={z.y} width={z.w} height={z.h} rx="2" />
            <rect className="ibh-reception-desk" x={z.x + 26} y={z.y + 40} width={z.w - 52} height="30" rx="4" />
            <text className="ibh-zone-label" x={z.x + z.w / 2} y={z.y + z.h - 26} fontSize="17">{z.label}</text>
          </g>
        );
      })}
    </>
  );
}

/**
 * Shared top-down floor plan, rendered as a self-contained plan card. Scales to
 * fit its container (no internal scroll). `mode` interactive|readonly;
 * `onRoomSelect(room)` fires on click/Enter/Space. `onFullscreen` toggles the
 * focused booking-mode view.
 */
export default function FloorPlan({
  rooms = [],
  mode = 'interactive',
  onRoomSelect,
  selectedRoomNumber = null,
  title = 'Hotel floor plan',
  fullscreen = false,
  onFullscreen,
}) {
  const byNumber = new Map(rooms.map((r) => [Number(r.roomNumber), r]));
  const selectable = typeof onRoomSelect === 'function';
  const isInteractive = mode === 'interactive';

  const handleActivate = (room) => { if (selectable && room) onRoomSelect(room); };
  const handleKeyDown = (e, room) => {
    if (!selectable) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(room); }
  };

  return (
    <div className="ibh-plan-card">
      <div className="ibh-plan-head">
        <span className="ibh-floor-label">Ground Floor</span>
        {typeof onFullscreen === 'function' && (
          <button
            type="button"
            className="ibh-fs-btn"
            onClick={() => onFullscreen()}
            aria-label={fullscreen ? 'Exit booking mode' : 'Open booking mode (fullscreen)'}
          >
            {fullscreen ? <IconClose size={18} /> : <IconExpand size={18} />}
            <span>{fullscreen ? 'Exit' : 'Booking mode'}</span>
          </button>
        )}
      </div>

      <div className="ibh-floorplan-wrap" data-testid="floorplan">
        <svg
          className="ibh-floorplan-svg"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          role="group"
          aria-label={title}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="ibh-floor" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="rgba(15,110,86,0.05)" strokeWidth="1" />
            </pattern>
            <pattern id="ibh-tile" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="rgba(31,90,120,0.12)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Building shell */}
          <polygon className="ibh-wall-fill" points={BUILDING_OUTLINE} />
          <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#ibh-floor)" opacity="0.7" pointerEvents="none" />

          {/* Corridors */}
          {CORRIDORS.map((c) => (
            <rect key={c.id} className="ibh-corridor" x={c.x} y={c.y} width={c.w} height={c.h} />
          ))}

          <ZoneShapes />

          {/* Outer wall on top of fills */}
          <polygon className="ibh-wall" points={BUILDING_OUTLINE} />

          {/* Doors */}
          <DoorSwing layout={{ x: ENTRANCE.x - 18, y: ENTRANCE.y - 36, w: 36, h: 36, door: { side: ENTRANCE.side, at: 0.5 } }} />
          {ZONE_DOORS.map((z, i) => <DoorSwing key={`zd-${i}`} layout={z} />)}
          {ROOM_NUMBERS.map((n) => <DoorSwing key={`door-${n}`} layout={ROOM_LAYOUT[n]} />)}

          {/* Main entrance marker */}
          <g aria-hidden="true">
            <path className="ibh-entrance-arrow" d={`M ${ENTRANCE.x} ${ENTRANCE.y + 32} v -24 M ${ENTRANCE.x - 8} ${ENTRANCE.y + 16} l 8 -8 l 8 8`} />
            <text className="ibh-entrance-label" x={ENTRANCE.x} y={ENTRANCE.y + 50} fontSize="14" textAnchor="middle">Main entrance</text>
          </g>

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
                className={['ibh-room', isInteractive ? 'is-interactive' : '', selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
                data-testid={`room-${n}`}
                data-status={room?.status ?? 'unknown'}
                role={selectable ? 'button' : 'img'}
                aria-label={ariaLabel(n, room)}
                aria-pressed={selectable ? selected : undefined}
                tabIndex={selectable ? 0 : undefined}
                onClick={() => handleActivate(room ?? { roomNumber: n })}
                onKeyDown={(e) => handleKeyDown(e, room ?? { roomNumber: n })}
              >
                <rect className="ibh-room-rect" data-testid={`room-rect-${n}`} x={layout.x} y={layout.y} width={layout.w} height={layout.h} rx="2" fill={meta.fill} />
                <rect className="ibh-room-rich" x={layout.x + 2.5} y={layout.y + 2.5} width={layout.w - 5} height={layout.h - 5} rx="1.5" fill={meta.rich} />
                <rect x={layout.x + 2.5} y={layout.y + 2.5} width={layout.w - 5} height={layout.h - 5} rx="1.5" fill="url(#ibh-floor)" pointerEvents="none" />
                <text className="ibh-room-number" x={cx} y={cy} fontSize="26" fill={meta.text}>{n}</text>
                <circle className="ibh-room-dot" cx={layout.x + 16} cy={layout.y + 16} r="6" fill={meta.dot} />
                {hasFlag && (
                  <g data-testid={`room-flag-${n}`}><RoomGlyphs layout={layout} room={room} /></g>
                )}
                {!hasFlag && room?.guestName && <RoomGlyphs layout={layout} room={room} />}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="ibh-legend">
        {[
          { s: 'available', label: 'Available' },
          { s: 'occupied', label: 'Occupied' },
          { s: 'needs-cleaning', label: 'Needs cleaning' },
        ].map(({ s, label }) => {
          const m = statusMeta(s);
          return (
            <span className="ibh-legend-item" key={s}>
              <span className="ibh-legend-dot" style={{ background: m.rich, borderColor: m.dot }} /> {label}
            </span>
          );
        })}
        <span className="ibh-legend-divider" aria-hidden="true" />
        <span className="ibh-legend-item"><IconClipboard size={15} /> Open task</span>
        <span className="ibh-legend-item"><IconChat size={15} /> Note</span>
        <span className="ibh-legend-item ibh-legend-hint"><IconTap size={15} /> Tap a room for details</span>
      </div>

      <ul className="ibh-sr-only" aria-label={`${title} — room list`}>
        {ROOM_NUMBERS.map((n) => {
          const room = byNumber.get(n);
          const label = ariaLabel(n, room);
          return (
            <li key={n}>
              {selectable ? (
                <button type="button" onClick={() => handleActivate(room ?? { roomNumber: n })}>{label}</button>
              ) : label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
