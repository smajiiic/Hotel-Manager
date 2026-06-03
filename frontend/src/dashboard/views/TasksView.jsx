import './sectionView.css';
import './TasksView.css';
import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { IconClipboard, IconCheck, IconUndo, IconTrash, IconClose } from '../components/icons.jsx';
import { formatRelative } from '../../utils/formatRelative.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRooms } from '../hooks/useRooms.js';
import { createTask, completeTask, reopenTask, deleteTask } from '../../api/tasksApi.js';

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

function NewTaskForm({ rooms, busy, onSubmit, onCancel }) {
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.roomNumber ?? '');
  const [description, setDescription] = useState('');
  const trimmed = description.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!trimmed || !roomNumber) return;
    try { await onSubmit({ description: trimmed, roomId: Number(roomNumber) }); }
    catch { /* parent surfaces the error; keep the form + values */ }
  };

  return (
    <form className="ibh-task-form" onSubmit={submit}>
      <div className="ibh-task-form-head">
        <h2>New task</h2>
        <button type="button" className="ibh-icon-btn" onClick={onCancel} aria-label="Close form"><IconClose size={18} /></button>
      </div>
      <div className="ibh-task-form-grid">
        <label className="ibh-field ibh-field-room">
          <span>Room</span>
          <select value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} disabled={busy}>
            {rooms.map((r) => <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber}</option>)}
          </select>
        </label>
        <label className="ibh-field">
          <span>What needs doing?</span>
          <input type="text" value={description} placeholder="e.g. Replace towels, fix shower head…" autoFocus
            onChange={(e) => setDescription(e.target.value)} disabled={busy} />
        </label>
      </div>
      <div className="ibh-task-form-actions">
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || !trimmed}>{busy ? 'Adding…' : 'Add task'}</button>
      </div>
    </form>
  );
}

function TaskCard({ task, roomNumber, canManage, canComplete, busy, delay, onComplete, onReopen, onDelete }) {
  const done = task.status === 'completed';
  return (
    <article className={`ibh-task-card ibh-rise-in ${done ? 'is-done' : ''}`} data-status={task.status} style={{ animationDelay: delay }}>
      <span className="ibh-task-accent" aria-hidden="true" />
      <div className="ibh-task-body">
        <div className="ibh-task-top">
          <span className="ibh-room-chip">Room {roomNumber}</span>
          <span className={`ibh-task-state ${done ? 'is-done' : 'is-pending'}`}>{done ? 'Done' : 'Pending'}</span>
        </div>
        <p className="ibh-task-desc">{task.description}</p>
        <p className="ibh-task-meta">{task.createdAt ? formatRelative(task.createdAt) : ''}{task.createdBy ? ` · ${task.createdBy}` : ''}</p>
      </div>
      <div className="ibh-task-actions">
        {!done && canComplete && (
          <button type="button" className="ibh-mini-btn is-checkin" disabled={busy} onClick={() => onComplete(task)}><IconCheck size={15} /> Complete</button>
        )}
        {done && canManage && (
          <button type="button" className="ibh-mini-btn" disabled={busy} onClick={() => onReopen(task)}><IconUndo size={15} /> Reopen</button>
        )}
        {canManage && (
          <button type="button" className="ibh-mini-btn is-ghost ibh-icon-only" disabled={busy} onClick={() => onDelete(task)} aria-label={`Delete task: ${task.description}`}><IconTrash size={15} /></button>
        )}
      </div>
    </article>
  );
}

// Live task board, in-shell. Reception manages (create/delete/reopen); reception
// + cleaning complete; manager is read-only — matching the backend route guards.
export default function TasksView() {
  const { role } = useAuth();
  const canManage = role === 'reception';
  const canComplete = role === 'reception' || role === 'cleaning';

  const { tasks, loading: lt, error: et, refetch: rt } = useTasks();
  const { rooms, refetch: rr } = useRooms();

  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = [...(tasks || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const visible = sorted.filter((t) => filter === 'all' || t.status === filter);
  const pendingCount = sorted.filter((t) => t.status !== 'completed').length;

  // Resolve a task's room by either key — real API stores roomId as the numeric
  // roomNumber, mock fixtures store it as the room _id; map both so the chip is
  // correct in every mode.
  const roomById = Object.fromEntries((rooms || []).flatMap((r) => [[r._id, r], [r.roomNumber, r]]));
  const roomLabel = (t) => roomById[t.roomId]?.roomNumber ?? t.roomId;

  const run = async (id, fn, onDone) => {
    setBusyId(id);
    setActionError(null);
    try { await fn(); rt(); rr(); if (onDone) onDone(); }
    catch (err) { setActionError(err?.message || 'Action failed. Please try again.'); throw err; }
    finally { setBusyId(null); }
  };

  const handleComplete = (task) => run(task._id, () => completeTask(task._id)).catch(() => {});
  const handleReopen = (task) => run(task._id, () => reopenTask(task._id)).catch(() => {});
  const handleCreate = (data) => run('new', () => createTask(data), () => setShowForm(false));
  const doDelete = () => {
    if (!confirmDelete) return;
    const t = confirmDelete;
    run(t._id, () => deleteTask(t._id), () => setConfirmDelete(null)).catch(() => setConfirmDelete(null));
  };

  return (
    <section className="ibh-role-view ibh-tasks-view" data-testid="tasks-view" aria-labelledby="tasks-heading">
      <header className="ibh-section-head">
        <div className="ibh-section-title">
          <h1 id="tasks-heading">Tasks</h1>
          <span className="ibh-count-pill">{pendingCount} open</span>
        </div>
        {canManage && !showForm && (
          <button type="button" className="ibh-checkin-btn ibh-section-add" onClick={() => setShowForm(true)}>
            <IconClipboard size={16} /> New task
          </button>
        )}
      </header>

      {showForm && canManage && (
        <NewTaskForm rooms={rooms || []} busy={busyId === 'new'} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      <div className="ibh-filter-row" role="group" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className={`ibh-filter-chip ${filter === f.value ? 'is-active' : ''}`}
            aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>{f.label}</button>
        ))}
      </div>

      {actionError && <div className="ibh-panel-error" role="alert">{actionError}</div>}
      {et && <ErrorState message={`Could not load tasks: ${et}`} onRetry={rt} />}

      {lt ? (
        <LoadingState message="Loading tasks…" />
      ) : visible.length === 0 ? (
        <p className="ibh-section-empty">{filter === 'all' ? 'No tasks yet.' : `No ${filter} tasks.`}</p>
      ) : (
        <div className="ibh-task-list">
          {visible.map((t, i) => (
            <TaskCard key={t._id} task={t} roomNumber={roomLabel(t)} canManage={canManage} canComplete={canComplete}
              busy={busyId === t._id} delay={`${Math.min(i * 0.03, 0.3)}s`}
              onComplete={handleComplete} onReopen={handleReopen} onDelete={setConfirmDelete} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete task?"
        message={confirmDelete ? `Delete “${confirmDelete.description}”? This cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  );
}
