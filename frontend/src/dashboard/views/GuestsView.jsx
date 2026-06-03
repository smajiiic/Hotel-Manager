import './sectionView.css';
import './GuestsView.css';
import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { IconPerson, IconEnter, IconExit, IconBookings, IconClose } from '../components/icons.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useRooms } from '../hooks/useRooms.js';
import { useBookings } from '../hooks/useBookings.js';
import { checkinRoom, checkoutRoom } from '../../api/roomsApi.js';
import { createBooking, deleteBooking } from '../../api/bookingsApi.js';

// Local date as 'YYYY-MM-DD' (matches the backend's date-string format).
function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Inline "add reservation" form. Local controlled state; validated on submit.
function ReservationForm({ rooms, busy, onSubmit, onCancel }) {
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.roomNumber ?? '');
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState('');
  const [touched, setTouched] = useState(false);

  const nameOk = guestName.trim().length > 0;
  const datesOk = Boolean(checkIn && checkOut && checkOut > checkIn);
  const valid = nameOk && datesOk && roomNumber;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    try {
      await onSubmit({ guestName: guestName.trim(), roomId: Number(roomNumber), checkIn, checkOut });
    } catch {
      // Parent surfaces the failure via the error banner; keep the form + values.
    }
  };

  return (
    <form className="ibh-resv-form" onSubmit={submit}>
      <div className="ibh-resv-form-head">
        <h2>New reservation</h2>
        <button type="button" className="ibh-icon-btn" onClick={onCancel} aria-label="Close form"><IconClose size={18} /></button>
      </div>
      <div className="ibh-resv-grid">
        <label className="ibh-field">
          <span>Guest name</span>
          <input type="text" value={guestName} placeholder="Full name" autoFocus
            onChange={(e) => setGuestName(e.target.value)} disabled={busy} />
        </label>
        <label className="ibh-field">
          <span>Room</span>
          <select value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} disabled={busy}>
            {rooms.map((r) => (
              <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} — {r.status}</option>
            ))}
          </select>
        </label>
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
      <div className="ibh-resv-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || !valid}>{busy ? 'Saving…' : 'Add reservation'}</button>
      </div>
    </form>
  );
}

function GuestCard({ booking, room, canManage, busy, today, onCheckin, onCheckout, onCancel }) {
  const checkOutToday = booking.checkOut === today;
  const roomAvailable = room?.status === 'available';

  return (
    <article className="ibh-guest-card">
      <span className="ibh-guest-avatar" aria-hidden="true"><IconPerson size={18} /></span>
      <div className="ibh-guest-main">
        <p className="ibh-guest-card-name">{booking.guestName}</p>
        <p className="ibh-guest-card-sub">
          Room {room?.roomNumber ?? booking.roomId}
          <span className="ibh-guest-dot" aria-hidden="true">·</span>
          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
          {checkOutToday && <span className="ibh-guest-flag">Departing today</span>}
        </p>
      </div>
      {room?.status && <StatusBadge status={room.status} />}
      {canManage && (
        <div className="ibh-guest-card-actions">
          {booking.occupancyStatus === 'checked-in' ? (
            <button type="button" className="ibh-mini-btn is-checkout" disabled={busy || !room} onClick={() => onCheckout(booking, room)}>
              <IconExit size={15} /> Check out
            </button>
          ) : (
            <>
              <button type="button" className="ibh-mini-btn is-checkin" disabled={busy || !roomAvailable}
                title={roomAvailable ? 'Check in this guest' : `Room ${room?.roomNumber ?? ''} is ${room?.status ?? 'unavailable'}`}
                onClick={() => onCheckin(booking, room)}>
                <IconEnter size={15} /> Check in
              </button>
              <button type="button" className="ibh-mini-btn is-ghost" disabled={busy} onClick={() => onCancel(booking)}>Cancel</button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function Section({ title, count, hint, children }) {
  return (
    <section className="ibh-guest-section">
      <header className="ibh-guest-section-head">
        <h2>{title}</h2>
        <span className="ibh-guest-count">{count}</span>
        {hint && <span className="ibh-guest-section-hint">{hint}</span>}
      </header>
      {count === 0 ? <p className="ibh-guest-empty">None right now.</p> : <div className="ibh-guest-list">{children}</div>}
    </section>
  );
}

// Guest roster for the dashboard — reception + manager. Reception can check guests
// in/out and add reservations; manager sees a read-only roster (mutations are
// reception-only on the backend too).
export default function GuestsView() {
  const { role } = useAuth();
  const canManage = role === 'reception';

  const { rooms, loading: lr, error: er, refetch: rr } = useRooms();
  const { bookings, loading: lb, error: eb, refetch: rb } = useBookings();

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const loading = lr || lb;
  const error = er || eb;
  const today = todayStr();
  const refetch = () => { rr(); rb(); };

  const roomByNumber = Object.fromEntries((rooms || []).map((r) => [Number(r.roomNumber), r]));

  const byCheckIn = (a, b) => String(a.checkIn).localeCompare(String(b.checkIn));
  const inHouse = (bookings || []).filter((b) => b.occupancyStatus === 'checked-in')
    .sort((a, b) => String(a.checkOut).localeCompare(String(b.checkOut)));
  const arriving = (bookings || []).filter((b) => b.occupancyStatus === 'confirmed' && b.checkIn === today).sort(byCheckIn);
  const upcoming = (bookings || []).filter((b) => b.occupancyStatus === 'confirmed' && b.checkIn > today).sort(byCheckIn);

  const run = async (id, fn, onDone) => {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
      refetch();
      if (onDone) onDone();
    } catch (err) {
      setActionError(err?.message || 'Action failed. Please try again.');
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckin = (booking, room) => {
    if (!room) return;
    run(booking._id, () => checkinRoom(room._id, {
      guestName: booking.guestName, checkIn: booking.checkIn, checkOut: booking.checkOut,
    })).catch(() => {});
  };

  const doCheckout = () => {
    if (!confirmCheckout || !confirmCheckout.room) { setConfirmCheckout(null); return; }
    const { booking, room } = confirmCheckout;
    run(booking._id, () => checkoutRoom(room._id), () => setConfirmCheckout(null)).catch(() => setConfirmCheckout(null));
  };

  const doCancel = () => {
    const booking = confirmCancel;
    run(booking._id, () => deleteBooking(booking._id), () => setConfirmCancel(null)).catch(() => setConfirmCancel(null));
  };

  const handleCreate = (data) => run('new', () => createBooking(data), () => setShowForm(false));

  const cardProps = (booking) => ({
    booking,
    room: roomByNumber[Number(booking.roomId)],
    canManage,
    busy: busyId === booking._id,
    today,
    onCheckin: handleCheckin,
    onCheckout: (b, room) => setConfirmCheckout({ booking: b, room }),
    onCancel: (b) => setConfirmCancel(b),
  });

  return (
    <section className="ibh-role-view ibh-guests-view" data-testid="guests-view" aria-labelledby="guests-heading">
      <header className="ibh-guests-head">
        <div>
          <h1 id="guests-heading">Bookings</h1>
          <p className="muted">Who's in-house, arriving, and booked ahead.</p>
        </div>
        {canManage && !showForm && (
          <button type="button" className="ibh-checkin-btn ibh-guests-add" onClick={() => setShowForm(true)}>
            <IconBookings size={16} /> Add reservation
          </button>
        )}
      </header>

      {showForm && canManage && (
        <ReservationForm rooms={rooms || []} busy={busyId === 'new'} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {actionError && <div className="ibh-panel-error" role="alert">{actionError}</div>}

      {error && <ErrorState message={`Could not load guests: ${error}`} onRetry={refetch} />}

      {loading ? (
        <LoadingState message="Loading guests…" />
      ) : (
        <>
          <Section title="In-house" count={inHouse.length} hint="currently staying">
            {inHouse.map((b) => <GuestCard key={b._id} {...cardProps(b)} />)}
          </Section>
          <Section title="Arriving today" count={arriving.length} hint="ready to check in">
            {arriving.map((b) => <GuestCard key={b._id} {...cardProps(b)} />)}
          </Section>
          <Section title="Upcoming" count={upcoming.length} hint="booked ahead">
            {upcoming.map((b) => <GuestCard key={b._id} {...cardProps(b)} />)}
          </Section>
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmCheckout)}
        title="Check out room?"
        message={confirmCheckout
          ? `Check out ${confirmCheckout.booking.guestName} from Room ${confirmCheckout.room?.roomNumber ?? ''}? This closes the booking and marks the room for cleaning.`
          : ''}
        confirmLabel="Check out"
        cancelLabel="Cancel"
        onConfirm={doCheckout}
        onCancel={() => setConfirmCheckout(null)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmCancel)}
        title="Cancel reservation?"
        message={confirmCancel ? `Cancel the reservation for ${confirmCancel.guestName}? This cannot be undone.` : ''}
        confirmLabel="Cancel reservation"
        cancelLabel="Keep"
        onConfirm={doCancel}
        onCancel={() => setConfirmCancel(null)}
      />
    </section>
  );
}
