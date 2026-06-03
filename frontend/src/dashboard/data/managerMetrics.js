// Manager analytics — MOCK data, shaped EXACTLY like a future API response so the
// view never changes when it goes live.
//
// TODO: wire to backend — replace these with real endpoints:
//   getManagerMetrics()            -> GET /api/manager/metrics
//   getRoomStatusHistory(number)   -> GET /api/rooms/:roomNumber/history
// Both return believable static mock data for now; the UI consumes only the
// shapes below, so swapping the bodies for `apiGet(...)` is the only change.

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

// Lead metrics first (the manager-only insights that justify the role), then the
// secondary status figures the heatmap already conveys.
export function getManagerMetrics() {
  return {
    asOf: new Date().toISOString(),

    // Signature metric — the 1 PM checkout crunch from the problem statement.
    // Story: 6 checkouts due, 4 already turned over, 2 still to clean before 1 PM.
    checkoutCrunch: { deadlineLabel: '1 PM', due: 6, ready: 4, remaining: 2 },

    // Operational efficiency reception can't see: checkout -> available.
    avgTurnaround: { minutes: 47 },

    // Tasks completed today vs outstanding + completion rate.
    tasks: { completedToday: 18, outstanding: 5, completionRate: 78 },

    // Communication backlog — unresolved shift notes / requests.
    outstandingRequests: 3,

    // Secondary — restated spatially by the heatmap, so demoted to small tiles.
    occupancy: { ratePct: 73, occupied: 11, available: 2, needsCleaning: 2, total: 15 },

    // Single chart series — tasks completed per hour (UI shows the cumulative line).
    // Sums to tasks.completedToday (18), ramping toward the late-morning crunch.
    tasksByHour: [
      { hour: '08:00', completed: 1 },
      { hour: '09:00', completed: 2 },
      { hour: '10:00', completed: 3 },
      { hour: '11:00', completed: 4 },
      { hour: '12:00', completed: 3 },
      { hour: '13:00', completed: 2 },
      { hour: '14:00', completed: 1 },
      { hour: '15:00', completed: 1 },
      { hour: '16:00', completed: 1 },
    ],
  };
}

const STAFF = ['amina', 'edin', 'reception1', 'lejla'];

// Believable per-room status history (most recent first), deterministic by room
// number so each room tells a stable story across renders.
export function getRoomStatusHistory(roomNumber) {
  const n = Number(roomNumber) || 0;
  return [
    { at: hoursAgo(2 + (n % 5)), by: STAFF[n % STAFF.length], to: 'needs-cleaning' },
    { at: hoursAgo(20 + (n % 7)), by: STAFF[(n + 1) % STAFF.length], to: 'occupied' },
    { at: daysAgo(1 + (n % 3)), by: STAFF[(n + 2) % STAFF.length], to: 'available' },
  ];
}
