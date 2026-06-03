import './RoomDetailPanel.css';
import { useEffect, useRef, useState } from 'react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { statusMeta } from '../lib/statusColors.js';
import { formatRelative } from '../../utils/formatRelative.js';

const ALL_STATUSES = ['available', 'occupied', 'needs-cleaning'];

const DEFAULT_CAPS = {
  setStatus: true,
  checkout: true,
  createTask: true,
  createNote: true,
  showGuest: true,
};

// Small DRY quick-add used for both +Task and +Note (room is fixed by context,
// so unlike the page-level forms there's no room dropdown).
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
      // Parent surfaces the failure via actionError; keep the form open with the
      // typed text so the user can retry. (Also avoids an unhandled rejection.)
    }
  };

  return (
    <form className="ibh-quickadd" onSubmit={submit}>
      <textarea
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={busy}
      />
      <div className="ibh-quickadd-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="primary" disabled={busy || !trimmed}>
          {busy ? 'Saving…' : label}
        </button>
      </div>
    </form>
  );
}

/**
 * Shared room detail / action panel (side rail on desktop, bottom sheet on
 * mobile). Capability-driven so each role composes the controls it's allowed:
 * reception gets all of them; cleaning (Stage 4) will pass a reduced set with
 * showGuest=false and no checkout/create.
 */
export default function RoomDetailPanel({
  room,
  onClose,
  onSetStatus,
  onCheckout,
  onAddTask,
  onAddNote,
  busy = false,
  actionError = null,
  capabilities = DEFAULT_CAPS,
  allowedStatuses = ALL_STATUSES,
}) {
  const caps = { ...DEFAULT_CAPS, ...capabilities };
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [adding, setAdding] = useState(null); // null | 'task' | 'note'

  // Keep the latest onClose in a ref so the key listener (mount-only) stays current.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mount-only: remember the triggering element, focus the close button, and lock
  // body scroll. On unmount, restore scroll and return focus to the trigger (the
  // room that opened the panel). Empty deps so it never re-fires mid-interaction.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Escape closes; Tab is trapped within the dialog (aria-modal promise).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const root = panelRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.disabled);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!room) return null;

  const titleId = 'ibh-panel-title';
  const hasCheckedInGuest = Boolean(room.booking);

  return (
    <div
      className="ibh-panel-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="ibh-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="room-detail-panel"
        ref={panelRef}
      >
        <header className="ibh-panel-header">
          <h2 id={titleId} className="ibh-panel-title">Room {room.roomNumber}</h2>
          <button
            type="button"
            className="ibh-panel-close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close panel"
          >
            ✕
          </button>
        </header>

        <div className="ibh-panel-body">
          <div className="ibh-panel-section">
            <StatusBadge status={room.status} />
          </div>

          {/* Guest + checkout date — reception only */}
          {caps.showGuest && hasCheckedInGuest && (
            <div className="ibh-panel-section">
              <p className="ibh-panel-section-title">Guest</p>
              <div className="ibh-guest-card">
                <div className="ibh-guest-name">{room.guestName}</div>
                {room.checkOut && (
                  <div className="ibh-guest-meta">Checkout {room.checkOut}</div>
                )}
              </div>
            </div>
          )}

          {/* Open tasks */}
          <div className="ibh-panel-section">
            <p className="ibh-panel-section-title">Open tasks</p>
            {room.openTasks?.length ? (
              <ul className="ibh-item-list">
                {room.openTasks.map((t) => (
                  <li key={t._id} className="ibh-item">
                    {t.description}
                    {t.createdAt && <div className="ibh-item-meta">{formatRelative(t.createdAt)}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ibh-empty-line">No open tasks.</span>
            )}
          </div>

          {/* Notes */}
          <div className="ibh-panel-section">
            <p className="ibh-panel-section-title">Notes</p>
            {room.openNotes?.length ? (
              <ul className="ibh-item-list">
                {room.openNotes.map((n) => (
                  <li key={n._id} className="ibh-item">
                    {n.note}
                    {n.createdAt && <div className="ibh-item-meta">{formatRelative(n.createdAt)}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ibh-empty-line">No notes.</span>
            )}
          </div>

          {actionError && <div className="ibh-panel-error" role="alert">{actionError}</div>}

          {/* Actions */}
          {caps.setStatus && (
            <div className="ibh-panel-section">
              <p className="ibh-panel-section-title">Set status</p>
              <div className="ibh-segmented" role="group" aria-label="Set room status">
                {allowedStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={room.status === s}
                    disabled={busy || room.status === s}
                    onClick={() => onSetStatus(s)}
                  >
                    {statusMeta(s).label}
                  </button>
                ))}
              </div>
              {hasCheckedInGuest && (
                <div className="ibh-panel-hint">
                  Guest is checked in — use “Check out room” to turn it over.
                </div>
              )}
            </div>
          )}

          {caps.checkout && (
            <div className="ibh-panel-section">
              <button
                type="button"
                className="ibh-checkout-btn"
                onClick={onCheckout}
                disabled={busy}
                data-testid="checkout-button"
              >
                Check out room
              </button>
            </div>
          )}

          {(caps.createTask || caps.createNote) && (
            <div className="ibh-panel-section">
              {adding === null && (
                <div className="ibh-segmented">
                  {caps.createTask && (
                    <button type="button" onClick={() => setAdding('task')} disabled={busy}>
                      + Task
                    </button>
                  )}
                  {caps.createNote && (
                    <button type="button" onClick={() => setAdding('note')} disabled={busy}>
                      + Note
                    </button>
                  )}
                </div>
              )}

              {adding === 'task' && (
                <QuickAdd
                  label="Add task"
                  placeholder="e.g. Replace towels, fix shower head…"
                  busy={busy}
                  onSubmit={async (text) => {
                    await onAddTask(text);
                    setAdding(null);
                  }}
                  onCancel={() => setAdding(null)}
                />
              )}

              {adding === 'note' && (
                <QuickAdd
                  label="Add note"
                  placeholder="What does the next shift need to know?"
                  busy={busy}
                  onSubmit={async (text) => {
                    await onAddNote(text);
                    setAdding(null);
                  }}
                  onCancel={() => setAdding(null)}
                />
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
