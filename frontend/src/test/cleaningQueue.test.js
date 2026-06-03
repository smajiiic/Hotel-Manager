import { buildCleaningQueue, isCleaningTask } from '../dashboard/lib/cleaningQueue';

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

describe('isCleaningTask', () => {
  test('matches /clean/i descriptions', () => {
    expect(isCleaningTask({ description: 'Clean room 103' })).toBe(true);
    expect(isCleaningTask({ description: 'Deep CLEANING' })).toBe(true);
    expect(isCleaningTask({ description: 'Fix shower head' })).toBe(false);
  });
});

describe('buildCleaningQueue — sort order', () => {
  const rooms = [
    { _id: 'r101', roomNumber: 101, status: 'needs-cleaning' }, // turnover
    { _id: 'r102', roomNumber: 102, status: 'available' },
    { _id: 'r103', roomNumber: 103, status: 'available' },
  ];
  const tasks = [
    { _id: 'tA', roomId: 101, description: 'Clean room 101', status: 'pending', createdAt: hoursAgo(5) }, // tier0 (room needs-cleaning), oldest
    { _id: 'tB', roomId: 102, description: 'Clean room 102', status: 'pending', createdAt: hoursAgo(3) }, // tier1 (cleaning, room available)
    { _id: 'tC', roomId: 103, description: 'Fix tap', status: 'pending', createdAt: hoursAgo(10) }, // tier2 (general) — oldest overall but lowest tier
    { _id: 'tD', roomId: 101, description: 'Replace towels', status: 'pending', createdAt: hoursAgo(2) }, // tier0 (room needs-cleaning), newer
    { _id: 'tE', roomId: 103, description: 'Done already', status: 'completed', createdAt: hoursAgo(1) }, // excluded
  ];

  test('orders checkout-turnover → cleaning-type → general, oldest-first within a tier', () => {
    const queue = buildCleaningQueue(rooms, tasks);
    expect(queue.map((i) => i.id)).toEqual(['tA', 'tD', 'tB', 'tC']);
  });

  test('excludes completed tasks', () => {
    const queue = buildCleaningQueue(rooms, tasks);
    expect(queue.find((i) => i.id === 'tE')).toBeUndefined();
  });

  test('adds a synthetic room item for a needs-cleaning room with no pending cleaning task', () => {
    const roomsWithBare = [{ _id: 'r106', roomNumber: 106, status: 'needs-cleaning', updatedAt: hoursAgo(1) }];
    const queue = buildCleaningQueue(roomsWithBare, []);
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ id: 'room-106', type: 'room', roomNumber: 106, roomId: 'r106', isTurnover: true });
  });

  test('does not duplicate a needs-cleaning room that already has a pending cleaning task', () => {
    const queue = buildCleaningQueue(
      [{ _id: 'r103', roomNumber: 103, status: 'needs-cleaning' }],
      [{ _id: 'tc', roomId: 103, description: 'Clean room 103', status: 'pending', createdAt: hoursAgo(1) }]
    );
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('task');
  });
});
