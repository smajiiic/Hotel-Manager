import './RoomDetailPanel.css';
import { useState } from 'react';
import DetailPanelShell from './DetailPanelShell.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { statusMeta } from '../lib/statusColors.js';
import { formatRelative } from '../../utils/formatRelative.js';
import {
  IconPerson, IconBed, IconBroom, IconChevronRight, IconStar,
  IconExit, IconEnter, IconClipboard, IconChat, IconBookings,
} from './icons.jsx';

const ALL_STATUSES = ['available', 'occupied', 'needs-cleaning'];
const STATUS_ICON = { available: IconBed, occupied: IconPerson, 'needs-cleaning': IconBroom };

const DEFAULT_CAPS = {
  setStatus: true,
  checkout: true,
  checkin: true,
  createTask: true,
  createNote: true,
  showGuest: true,
  bookings: true,
};

// Local date as 'YYYY-MM-DD' (matches the backend's date-string format).
function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Inline check-in form for an available room. Local controlled state, validated
// on submit; pre-fills from a confirmed reservation when one exists. Mirrors
// QuickAdd's contract: empty catch keeps the form + values open so the parent
// can surface a server failure via `actionError`.
function CheckInForm({ busy, reservation, onSubmit, onCancel }) {
  // Only pre-fill from a reservation that's actually due (arriving today or
  // earlier); a far-future booking for this room shouldn't hijack a walk-in.
  const due = reservation && reservation.checkIn <= todayStr() ? reservation : null;
  const [guestName, setGuestName] = useState(due?.guestName ?? '');
  const [checkIn, setCheckIn] = useState(due?.checkIn ?? todayStr());
  const [checkOut, setCheckOut] = useState(due?.checkOut ?? '');
  const [touched, setTouched] = useState(false);

  const nameOk = guestName.trim().length > 0;
  const datesOk = Boolean(checkIn && checkOut && checkOut > checkIn);
  const valid = nameOk && datesOk;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    try {
      await onSubmit({ guestName: guestName.trim(), checkIn, checkOut });
    } catch {
      // Parent surfaces the failure via actionError; keep the form + values.
    }
  };

  return (
    <form className="ibh-checkin-form" onSubmit={submit}>
      <p className="ibh-panel-section-title">Check in guest</p>
      {due && (
        <div className="ibh-checkin-resv">
          <IconBookings size={15} />
          <span>Reservation: <strong>{due.guestName}</strong> · {due.checkIn} → {due.checkOut}</span>
        </div>
      )}
      <label className="ibh-field">
        <span>Guest name</span>
        <input type="text" value={guestName} placeholder="Full name" autoFocus
          onChange={(e) => setGuestName(e.target.value)} disabled={busy} />
      </label>
      <div className="ibh-field-row">
        <label className="ibh-field">
          <span>Check-in</span>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={busy} />
        </label>
        <label className="ibh-field">
          <span>Check-out</span>
          <input type="date" value={checkOut} min={checkIn || undefined} onChange={(e) => setCheckOut(e.target.value)} disabled={busy} />
        </label>
      </div>
      {touched && !nameOk && <p className="ibh-field-err" role="alert">Guest name is required.</p>}
      {touched && nameOk && !datesOk && <p className="ibh-field-err" role="alert">Check-out must be after check-in.</p>}
      <div className="ibh-quickadd-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || !valid}>{busy ? 'Checking in…' : 'Check in'}</button>
      </div>
    </form>
  );
}

function QuickAdd({ label, placeholder, busy, onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const submit = async (e) => {
    e.preventDefault();
    if (!trimmed) return;
    try {
      await onSubmit(trimmed);
      setValue('');
    } catch {
      // Parent surfaces the failure via actionError; keep the form open + text.
    }
  };
  return (
    <form className="ibh-quickadd" onSubmit={submit}>
      <textarea aria-label={label} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} disabled={busy} />
      <div className="ibh-quickadd-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || !trimmed}>{busy ? 'Saving…' : label}</button>
      </div>
    </form>
  );
}

/**
 * Shared room detail / action panel, docked in the right rail (bottom sheet on
 * mobile). Capability-driven so each role shows only what it may do.
 */
export default function RoomDetailPanel({
  room,
  onClose,
  onSetStatus,
  onCheckout,
  onCheckin,
  onAddTask,
  onAddNote,
  busy = false,
  actionError = null,
  capabilities = DEFAULT_CAPS,
  allowedStatuses = ALL_STATUSES,
}) {
  const caps = { ...DEFAULT_CAPS, ...capabilities };
  const [adding, setAdding] = useState(null);

  if (!room) return null;

  const hasCheckedInGuest = Boolean(room.booking);
  const openTaskCount = room.openTasks?.length ?? 0;

  return (
    <DetailPanelShell title={`Room ${room.roomNumber}`} subtitle="Ground floor" onClose={onClose} testId="room-detail-panel">
      <div className="ibh-panel-section">
        <StatusBadge status={room.status} />
      </div>

      {/* Guest row — reception only; drills into the bookings module */}
      {caps.showGuest && hasCheckedInGuest && (
        <a className="ibh-guest-row" href="/bookings" title="View booking">
          <IconPerson size={18} />
          <span className="ibh-guest-name">{room.guestName}</span>
          {room.checkOut && <span className="ibh-guest-meta">· out {room.checkOut}</span>}
          <IconChevronRight size={16} />
        </a>
      )}

      {/* Notes as highlighted callouts */}
      {room.openNotes?.map((n) => (
        <div key={n._id} className="ibh-note-callout">
          <IconStar size={16} />
          <span>{n.note}</span>
        </div>
      ))}

      {actionError && <div className="ibh-panel-error" role="alert">{actionError}</div>}

      {/* Set status */}
      {caps.setStatus && (
        <div className="ibh-panel-section">
          <p className="ibh-panel-section-title">Set status</p>
          <div className="ibh-segmented" role="group" aria-label="Set room status">
            {allowedStatuses.map((s) => {
              const Icon = STATUS_ICON[s];
              return (
                <button key={s} type="button" data-status={s} aria-pressed={room.status === s} disabled={busy || room.status === s} onClick={() => onSetStatus(s)}>
                  {Icon && <Icon size={18} />}
                  <span>{statusMeta(s).label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary turnover action — status-aware. Occupied → check out;
          available → check in (expands the inline form); needs-cleaning → neither. */}
      {room.status === 'occupied' && caps.checkout && (
        <button type="button" className="ibh-checkout-btn" onClick={onCheckout} disabled={busy} data-testid="checkout-button">
          <IconExit size={18} /> Check out room
        </button>
      )}

      {room.status === 'available' && caps.checkin && (
        adding === 'checkin' ? (
          <CheckInForm
            busy={busy}
            reservation={room.reservation}
            onSubmit={async (payload) => { await onCheckin(payload); setAdding(null); }}
            onCancel={() => setAdding(null)}
          />
        ) : (
          <button type="button" className="ibh-checkin-btn" onClick={() => setAdding('checkin')} disabled={busy} data-testid="checkin-button">
            <IconEnter size={18} /> Check in guest
          </button>
        )
      )}

      {(caps.createTask || caps.createNote) && adding !== 'checkin' && (
        <div className="ibh-panel-section">
          {adding === null && (
            <div className="ibh-action-row">
              {caps.createTask && (
                <button type="button" className="ibh-outline-btn" onClick={() => setAdding('task')} disabled={busy}>
                  <IconClipboard size={16} /> + Task
                </button>
              )}
              {caps.createNote && (
                <button type="button" className="ibh-outline-btn" onClick={() => setAdding('note')} disabled={busy}>
                  <IconChat size={16} /> + Note
                </button>
              )}
            </div>
          )}
          {adding === 'task' && (
            <QuickAdd label="Add task" placeholder="e.g. Replace towels, fix shower head…" busy={busy}
              onSubmit={async (t) => { await onAddTask(t); setAdding(null); }} onCancel={() => setAdding(null)} />
          )}
          {adding === 'note' && (
            <QuickAdd label="Add note" placeholder="What does the next shift need to know?" busy={busy}
              onSubmit={async (t) => { await onAddNote(t); setAdding(null); }} onCancel={() => setAdding(null)} />
          )}
        </div>
      )}

      {/* Room quick info — real per-room data we actually have. */}
      <div className="ibh-panel-section">
        <p className="ibh-panel-section-title">Room quick info</p>
        <dl className="ibh-quickinfo">
          <div><dt><IconClipboard size={15} /> Open tasks</dt><dd>{openTaskCount}</dd></div>
          <div><dt><IconChat size={15} /> Notes</dt><dd>{room.openNotes?.length ?? 0}</dd></div>
          {caps.bookings && room.booking?.checkIn && room.booking?.checkOut && (
            <div><dt><IconBookings size={15} /> Booking</dt><dd>{room.booking.checkIn} → {room.booking.checkOut}</dd></div>
          )}
          <div><dt><IconBed size={15} /> Last updated</dt><dd>{room.updatedAt ? formatRelative(room.updatedAt) : '—'}</dd></div>
        </dl>
      </div>

      {/* Drill-in cards (plain anchors so the panel is router-independent) */}
      <div className="ibh-drillins">
        <a className="ibh-drillin" href="/tasks">
          <span className="ibh-drillin-icon"><IconClipboard size={18} /></span>
          <span className="ibh-drillin-text"><strong>Tasks</strong><span>{openTaskCount} open {openTaskCount === 1 ? 'task' : 'tasks'}</span></span>
          <IconChevronRight size={16} />
        </a>
        {caps.bookings && (
          <a className="ibh-drillin" href="/bookings">
            <span className="ibh-drillin-icon"><IconBookings size={18} /></span>
            <span className="ibh-drillin-text"><strong>Bookings</strong><span>View today &amp; upcoming</span></span>
            <IconChevronRight size={16} />
          </a>
        )}
      </div>
    </DetailPanelShell>
  );
}
