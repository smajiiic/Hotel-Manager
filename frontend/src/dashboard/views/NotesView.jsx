import './sectionView.css';
import './NotesView.css';
import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { IconChat, IconCheck, IconUndo, IconTrash, IconClose } from '../components/icons.jsx';
import { formatRelative } from '../../utils/formatRelative.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useRequests } from '../hooks/useRequests.js';
import { useRooms } from '../hooks/useRooms.js';
import { createRequest, resolveRequest, unresolveRequest, deleteRequest } from '../../api/requestsApi.js';

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
];

function NewNoteForm({ rooms, busy, onSubmit, onCancel }) {
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.roomNumber ?? '');
  const [note, setNote] = useState('');
  const trimmed = note.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!trimmed || !roomNumber) return;
    try { await onSubmit({ note: trimmed, roomId: Number(roomNumber) }); }
    catch { /* parent surfaces the error; keep the form + values */ }
  };

  return (
    <form className="ibh-note-form" onSubmit={submit}>
      <div className="ibh-note-form-head">
        <h2>New note</h2>
        <button type="button" className="ibh-icon-btn" onClick={onCancel} aria-label="Close form"><IconClose size={18} /></button>
      </div>
      <label className="ibh-field ibh-note-room">
        <span>Room</span>
        <select value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} disabled={busy}>
          {rooms.map((r) => <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber}</option>)}
        </select>
      </label>
      <label className="ibh-field">
        <span>Note for the next shift</span>
        <textarea value={note} placeholder="What does the next shift need to know?" autoFocus rows={3}
          onChange={(e) => setNote(e.target.value)} disabled={busy} />
      </label>
      <div className="ibh-note-form-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || !trimmed}>{busy ? 'Adding…' : 'Add note'}</button>
      </div>
    </form>
  );
}

function NoteCard({ note, roomNumber, canEdit, busy, delay, onResolve, onUnresolve, onDelete }) {
  const resolved = Boolean(note.resolved);
  return (
    <article className={`ibh-note-card ibh-rise-in ${resolved ? 'is-resolved' : ''}`} style={{ animationDelay: delay }}>
      <span className="ibh-note-accent" aria-hidden="true" />
      <div className="ibh-note-body">
        <div className="ibh-note-top">
          <span className="ibh-room-chip">Room {roomNumber}</span>
          {resolved && <span className="ibh-note-resolved-tag"><IconCheck size={12} /> Resolved</span>}
        </div>
        <p className="ibh-note-text">{note.note}</p>
        <p className="ibh-note-meta">{note.createdAt ? formatRelative(note.createdAt) : ''}{note.createdBy ? ` · ${note.createdBy}` : ''}</p>
      </div>
      {canEdit && (
        <div className="ibh-note-actions">
          {resolved ? (
            <button type="button" className="ibh-mini-btn" disabled={busy} onClick={() => onUnresolve(note)}><IconUndo size={15} /> Reopen</button>
          ) : (
            <button type="button" className="ibh-mini-btn is-checkin" disabled={busy} onClick={() => onResolve(note)}><IconCheck size={15} /> Resolve</button>
          )}
          <button type="button" className="ibh-mini-btn is-ghost ibh-icon-only" disabled={busy} onClick={() => onDelete(note)} aria-label="Delete note"><IconTrash size={15} /></button>
        </div>
      )}
    </article>
  );
}

// Live shift-notes feed, in-shell. Reception adds/resolves/deletes; cleaning and
// manager are read-only — matching the backend route guards.
export default function NotesView() {
  const { role } = useAuth();
  const canEdit = role === 'reception';

  const { requests, loading: lq, error: eq, refetch: rq } = useRequests();
  const { rooms } = useRooms();

  const [filter, setFilter] = useState('open');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = [...(requests || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const visible = sorted.filter((n) =>
    filter === 'all' ? true : filter === 'resolved' ? n.resolved : !n.resolved);
  const openCount = sorted.filter((n) => !n.resolved).length;

  // Resolve a note's room by either key (real API: numeric roomNumber; mock: _id).
  const roomById = Object.fromEntries((rooms || []).flatMap((r) => [[r._id, r], [r.roomNumber, r]]));
  const roomLabel = (n) => roomById[n.roomId]?.roomNumber ?? n.roomId;

  const run = async (id, fn, onDone) => {
    setBusyId(id);
    setActionError(null);
    try { await fn(); rq(); if (onDone) onDone(); }
    catch (err) { setActionError(err?.message || 'Action failed. Please try again.'); throw err; }
    finally { setBusyId(null); }
  };

  const handleResolve = (n) => run(n._id, () => resolveRequest(n._id)).catch(() => {});
  const handleUnresolve = (n) => run(n._id, () => unresolveRequest(n._id)).catch(() => {});
  const handleCreate = (data) => run('new', () => createRequest(data), () => setShowForm(false));
  const doDelete = () => {
    if (!confirmDelete) return;
    const n = confirmDelete;
    run(n._id, () => deleteRequest(n._id), () => setConfirmDelete(null)).catch(() => setConfirmDelete(null));
  };

  return (
    <section className="ibh-role-view ibh-notes-view" data-testid="notes-view" aria-labelledby="notes-heading">
      <header className="ibh-section-head">
        <div className="ibh-section-title">
          <h1 id="notes-heading">Guest notes</h1>
          <span className="ibh-count-pill">{openCount} open</span>
        </div>
        {canEdit && !showForm && (
          <button type="button" className="ibh-checkin-btn ibh-section-add" onClick={() => setShowForm(true)}>
            <IconChat size={16} /> New note
          </button>
        )}
      </header>

      {showForm && canEdit && (
        <NewNoteForm rooms={rooms || []} busy={busyId === 'new'} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      <div className="ibh-filter-row" role="group" aria-label="Filter notes">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className={`ibh-filter-chip ${filter === f.value ? 'is-active' : ''}`}
            aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>{f.label}</button>
        ))}
      </div>

      {actionError && <div className="ibh-panel-error" role="alert">{actionError}</div>}
      {eq && <ErrorState message={`Could not load notes: ${eq}`} onRetry={rq} />}

      {lq ? (
        <LoadingState message="Loading notes…" />
      ) : visible.length === 0 ? (
        <p className="ibh-section-empty">{filter === 'open' ? 'No open notes — all clear.' : filter === 'resolved' ? 'No resolved notes.' : 'No notes yet.'}</p>
      ) : (
        <div className="ibh-note-list">
          {visible.map((n, i) => (
            <NoteCard key={n._id} note={n} roomNumber={roomLabel(n)} canEdit={canEdit}
              busy={busyId === n._id} delay={`${Math.min(i * 0.03, 0.3)}s`}
              onResolve={handleResolve} onUnresolve={handleUnresolve} onDelete={setConfirmDelete} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete note?"
        message={confirmDelete ? confirmDelete.note : ''}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
