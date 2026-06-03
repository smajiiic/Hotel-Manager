// Builds the cleaning role's prioritized work queue.
//
// Reality: tasks carry no assignedTo, so the queue is ALL pending tasks (not a
// filtered-by-assignee list), plus any needs-cleaning room that doesn't already
// have a pending cleaning task (a safety net so no turnover is missed).
//
// Sort = urgency first:
//   tier 0  checkout turnover  — item's room is currently needs-cleaning
//   tier 1  cleaning-type task — description matches /clean/i (room not needs-cleaning)
//   tier 2  everything else    — general pending tasks
// Within a tier, oldest first (the most overdue rises to the top — the 1 PM
// checkout crunch is the core problem this addresses).

export const isCleaningTask = (task) => /clean/i.test(task?.description || '');

export function buildCleaningQueue(rooms = [], tasks = []) {
  const roomByNumber = new Map((rooms || []).map((r) => [Number(r.roomNumber), r]));
  const pending = (tasks || []).filter((t) => t.status !== 'completed');

  const taskItems = pending.map((t) => {
    const roomNumber = Number(t.roomId);
    const room = roomByNumber.get(roomNumber) || null;
    const roomStatus = room?.status ?? null;
    return {
      id: t._id,
      type: 'task',
      task: t,
      roomNumber,
      roomId: room?._id ?? null,
      roomStatus,
      title: t.description,
      isCleaning: isCleaningTask(t),
      isTurnover: roomStatus === 'needs-cleaning',
      since: t.createdAt ?? null,
    };
  });

  // Needs-cleaning rooms that have no pending cleaning task get a synthetic item.
  const roomsWithPendingCleaning = new Set(
    pending.filter(isCleaningTask).map((t) => Number(t.roomId))
  );
  const syntheticRoomItems = (rooms || [])
    .filter(
      (r) => r.status === 'needs-cleaning' && !roomsWithPendingCleaning.has(Number(r.roomNumber))
    )
    .map((r) => ({
      id: `room-${r.roomNumber}`,
      type: 'room',
      task: null,
      roomNumber: Number(r.roomNumber),
      roomId: r._id ?? null,
      roomStatus: 'needs-cleaning',
      title: 'Room needs cleaning',
      isCleaning: true,
      isTurnover: true,
      since: r.updatedAt ?? r.createdAt ?? null,
    }));

  const items = [...taskItems, ...syntheticRoomItems];

  const tier = (it) => (it.isTurnover ? 0 : it.isCleaning ? 1 : 2);
  const ts = (s) => (s ? new Date(s).getTime() : Infinity);

  items.sort((a, b) => {
    if (tier(a) !== tier(b)) return tier(a) - tier(b);
    if (ts(a.since) !== ts(b.since)) return ts(a.since) - ts(b.since);
    return a.roomNumber - b.roomNumber;
  });

  return items;
}
