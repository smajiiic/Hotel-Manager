import { buildRoomViewModels } from '../dashboard/lib/roomViewModel';

const rooms = [
  { _id: 'rm_101', roomNumber: 101, status: 'occupied' },
  { _id: 'rm_102', roomNumber: 102, status: 'available' },
];

const tasks = [
  { _id: 't1', roomId: 101, description: 'Replace towels', status: 'pending' },
  { _id: 't2', roomId: 101, description: 'Old job', status: 'completed' },
  { _id: 't3', roomId: 102, description: 'Other room', status: 'pending' },
];

const requests = [
  { _id: 'q1', roomId: 101, note: 'VIP', resolved: false },
  { _id: 'q2', roomId: 101, note: 'Done', resolved: true },
];

const bookings = [
  { _id: 'b1', roomId: 101, guestName: 'Ana Kovač', checkOut: '2026-06-03', occupancyStatus: 'checked-in' },
];

describe('buildRoomViewModels', () => {
  test('joins tasks/requests/bookings to a room by numeric roomNumber', () => {
    const [vm101] = buildRoomViewModels(rooms, tasks, requests, bookings);
    expect(vm101.roomNumber).toBe(101);
    expect(vm101.openTasks).toHaveLength(1); // completed task excluded
    expect(vm101.openTasks[0]._id).toBe('t1');
    expect(vm101.hasTask).toBe(true);
    expect(vm101.openNotes).toHaveLength(1); // resolved note excluded
    expect(vm101.hasNote).toBe(true);
    expect(vm101.guestName).toBe('Ana Kovač');
    expect(vm101.checkOut).toBe('2026-06-03');
  });

  test('does not cross-join another room\'s task', () => {
    const vms = buildRoomViewModels(rooms, tasks, requests, bookings);
    const vm102 = vms.find((v) => v.roomNumber === 102);
    expect(vm102.openTasks.map((t) => t._id)).toEqual(['t3']);
    expect(vm102.guestName).toBeNull();
  });

  test('omitting bookings yields no guest data — the data-layer capability guarantee', () => {
    const [vm101] = buildRoomViewModels(rooms, tasks, requests); // no bookings arg
    expect(vm101.booking).toBeNull();
    expect(vm101.guestName).toBeNull();
    expect(vm101.checkOut).toBeNull();
    // tasks/notes still join — only guest data is withheld
    expect(vm101.hasTask).toBe(true);
    expect(vm101.hasNote).toBe(true);
  });
});
