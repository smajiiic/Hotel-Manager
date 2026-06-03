import './CleaningView.css';
import { useState, useCallback } from 'react';
import TaskQueue from '../components/TaskQueue.jsx';
import FloorPlan from '../components/FloorPlan.jsx';
import RoomDetailPanel from '../components/RoomDetailPanel.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { useRooms } from '../hooks/useRooms.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRequests } from '../hooks/useRequests.js';
import { buildCleaningQueue, isCleaningTask } from '../lib/cleaningQueue.js';
import { buildRoomViewModels } from '../lib/roomViewModel.js';
import { completeTask } from '../../api/tasksApi.js';
import { updateRoomStatus } from '../../api/roomsApi.js';

// Cleaning can read rooms/tasks/notes, complete tasks, and flip a cleaned room to
// available — nothing else. No guest names, no checkout, no task/note creation.
const CLEANING_CAPS = {
  setStatus: true,
  checkout: false,
  createTask: false,
  createNote: false,
  showGuest: false,
};

export default function CleaningView() {
  const { rooms, loading: lr, error: er, refetch: rr } = useRooms();
  const { tasks, loading: lt, error: et, refetch: rt } = useTasks();
  const { requests, loading: lq, error: eq, refetch: rq } = useRequests();
  // No useBookings on purpose — cleaning has no booking access, so guest data is
  // never fetched (defense in depth alongside the backend 403 and showGuest=false).

  const [tab, setTab] = useState('queue');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [busyIds, setBusyIds] = useState(new Set());
  const [actionError, setActionError] = useState(null);
  const [liveMessage, setLiveMessage] = useState('');
  const announce = (msg) => setLiveMessage(msg);

  const loading = lr || lt || lq;
  const error = er || et || eq;
  const refetchAll = () => { rr(); rt(); rq(); };

  const queue = buildCleaningQueue(rooms, tasks);
  const roomViewModels = buildRoomViewModels(rooms, tasks, requests); // no bookings → no guest data
  const selectedRoom = roomViewModels.find((r) => r.roomNumber === selectedNumber) ?? null;

  const closePanel = useCallback(() => {
    setSelectedNumber(null);
    setActionError(null);
  }, []);

  const runAction = async (id, fn, refetchers) => {
    setBusyIds((prev) => new Set(prev).add(id));
    setActionError(null);
    try {
      await fn();
      refetchers.forEach((f) => f());
    } catch (err) {
      setActionError(err?.message || 'Action failed. Please try again.');
      throw err;
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleComplete = (item) =>
    runAction(item.id, () => completeTask(item.task._id), [rt, rr])
      .then(() => announce(`Room ${item.roomNumber} task marked complete`))
      .catch(() => {});

  const handleSetAvailable = (item) =>
    runAction(item.id, () => updateRoomStatus(item.roomId, 'available'), [rr, rt])
      .then(() => announce(`Room ${item.roomNumber} set to available`))
      .catch(() => {});

  const panelBusyId = selectedRoom ? `panel-${selectedRoom.roomNumber}` : null;
  const handlePanelSetStatus = (status) => {
    if (!selectedRoom) return Promise.resolve();
    // Flipping a needs-cleaning room to available: if a cleaning task is pending,
    // complete THAT (the backend auto-flips the room) rather than a raw status PUT,
    // so we never orphan the "Clean room N" task. Mirrors the queue's behavior.
    const pendingCleaning =
      status === 'available' ? selectedRoom.openTasks?.find((t) => isCleaningTask(t)) : null;
    const fn = pendingCleaning
      ? () => completeTask(pendingCleaning._id)
      : () => updateRoomStatus(selectedRoom._id, status);
    return runAction(panelBusyId, fn, [rr, rt])
      .then(() => announce(`Room ${selectedRoom.roomNumber} set to ${status}`))
      .catch(() => {});
  };

  return (
    <section data-testid="cleaning-view" aria-labelledby="cleaning-heading">
      {/* Screen-reader announcements for queue changes (the list re-renders silently otherwise) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liveMessage}
      </div>

      <h1 id="cleaning-heading">Task queue</h1>
      <p className="muted">Your work, most urgent first — checkout turnovers at the top.</p>

      <div className="ibh-tabs" role="tablist" aria-label="Cleaning views">
        <button
          type="button"
          role="tab"
          id="tab-queue"
          aria-selected={tab === 'queue'}
          aria-controls="panel-queue"
          className="ibh-tab"
          onClick={() => setTab('queue')}
        >
          Queue
        </button>
        <button
          type="button"
          role="tab"
          id="tab-plan"
          aria-selected={tab === 'plan'}
          aria-controls="panel-plan"
          className="ibh-tab"
          onClick={() => setTab('plan')}
        >
          Floor plan
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState message={`Could not load your work: ${error}`} onRetry={refetchAll} />
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading your queue…" />
      ) : tab === 'queue' ? (
        <div role="tabpanel" id="panel-queue" aria-labelledby="tab-queue">
          <TaskQueue
            items={queue}
            busyIds={busyIds}
            error={actionError}
            onComplete={handleComplete}
            onSetAvailable={handleSetAvailable}
          />
        </div>
      ) : (
        <div role="tabpanel" id="panel-plan" aria-labelledby="tab-plan">
          <FloorPlan
            rooms={roomViewModels}
            mode="interactive"
            selectedRoomNumber={selectedNumber}
            onRoomSelect={(room) => {
              setActionError(null);
              setSelectedNumber(room.roomNumber);
            }}
            title="Cleaning floor plan"
          />
        </div>
      )}

      {selectedRoom && tab === 'plan' && (
        <RoomDetailPanel
          room={selectedRoom}
          onClose={closePanel}
          onSetStatus={handlePanelSetStatus}
          busy={panelBusyId ? busyIds.has(panelBusyId) : false}
          actionError={actionError}
          capabilities={CLEANING_CAPS}
          allowedStatuses={['available']}
        />
      )}
    </section>
  );
}
