import { computeReceptionMetrics } from '../dashboard/lib/metrics';

describe('computeReceptionMetrics', () => {
  const rooms = [
    { roomNumber: 101, status: 'occupied' },
    { roomNumber: 102, status: 'occupied' },
    { roomNumber: 103, status: 'occupied' },
    { roomNumber: 104, status: 'available' },
    { roomNumber: 105, status: 'available' },
    { roomNumber: 106, status: 'needs-cleaning' },
  ];
  const tasks = [
    { _id: 't1', roomId: 106, status: 'pending' },
    { _id: 't2', roomId: 103, status: 'pending' },
    { _id: 't3', roomId: 101, status: 'completed' },
  ];

  test('counts rooms by status and open (non-completed) tasks', () => {
    const m = computeReceptionMetrics(rooms, tasks);
    expect(m).toEqual({ available: 2, occupied: 3, needsCleaning: 1, openTasks: 2 });
  });

  test('values are whole numbers (rounded)', () => {
    const m = computeReceptionMetrics(rooms, tasks);
    Object.values(m).forEach((v) => expect(Number.isInteger(v)).toBe(true));
  });

  test('handles empty inputs', () => {
    expect(computeReceptionMetrics([], [])).toEqual({ available: 0, occupied: 0, needsCleaning: 0, openTasks: 0 });
  });
});
