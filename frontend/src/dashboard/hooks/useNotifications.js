import { useRooms } from './useRooms.js';
import { useTasks } from './useTasks.js';
import { useBookings } from './useBookings.js';

// Actionable items surfaced from existing data — no new backend:
//   - rooms needing cleaning
//   - overdue checkouts (checked-in bookings past their checkout date)
//   - open tasks
// Each item carries enough to link through (a room number, or the tasks page).
export function useNotifications() {
  const { rooms } = useRooms();
  const { tasks } = useTasks();
  const { bookings } = useBookings(); // 403s for cleaning → [] (no overdue items)

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const overdue = (bookings ?? [])
    .filter((b) => b.occupancyStatus === 'checked-in' && new Date(b.checkOut) < startOfToday)
    .map((b) => ({
      id: `overdue-${b._id}`,
      type: 'overdue',
      roomNumber: Number(b.roomId),
      label: `Room ${b.roomId} — overdue checkout (${b.guestName})`,
    }));

  const needsCleaning = (rooms ?? [])
    .filter((r) => r.status === 'needs-cleaning')
    .map((r) => ({
      id: `clean-${r.roomNumber}`,
      type: 'room',
      roomNumber: Number(r.roomNumber),
      label: `Room ${r.roomNumber} needs cleaning`,
    }));

  const openTasks = (tasks ?? [])
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `task-${t._id}`,
      type: 'task',
      roomNumber: Number(t.roomId),
      label: t.description,
    }));

  // Most urgent first: overdue → needs-cleaning → open tasks.
  const items = [...overdue, ...needsCleaning, ...openTasks];
  return { items, count: items.length };
}
