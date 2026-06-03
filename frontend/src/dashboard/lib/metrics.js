import { round } from './format.js';

// Live reception metrics computed from rooms + tasks. Values are whole numbers,
// rounded defensively per spec.
export function computeReceptionMetrics(rooms = [], tasks = []) {
  const byStatus = { available: 0, occupied: 0, 'needs-cleaning': 0 };
  for (const r of rooms || []) {
    if (r.status in byStatus) byStatus[r.status] += 1;
  }
  const openTasks = (tasks || []).filter((t) => t.status !== 'completed').length;

  return {
    available: round(byStatus.available),
    occupied: round(byStatus.occupied),
    needsCleaning: round(byStatus['needs-cleaning']),
    openTasks: round(openTasks),
  };
}
