// Mock fixture — 7 tasks across varied rooms and dates, mix of pending/completed.

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const mockTasks = [
  { _id: 'tsk_1', description: 'Replace towels and refill amenities', status: 'pending', roomId: 'rm_101', createdAt: daysAgo(0), assignedTo: 'amina' },
  { _id: 'tsk_2', description: 'Restock minibar', status: 'pending', roomId: 'rm_104', createdAt: daysAgo(0) },
  { _id: 'tsk_3', description: 'Deep clean carpet', status: 'completed', roomId: 'rm_103', createdAt: daysAgo(1), assignedTo: 'amina' },
  { _id: 'tsk_4', description: 'Fix leaking shower head', status: 'pending', roomId: 'rm_111', createdAt: daysAgo(2) },
  { _id: 'tsk_5', description: 'Change bedsheets', status: 'completed', roomId: 'rm_106', createdAt: daysAgo(2), assignedTo: 'edin' },
  { _id: 'tsk_6', description: 'Vacuum and dust', status: 'pending', roomId: 'rm_102', createdAt: daysAgo(3) },
  { _id: 'tsk_7', description: 'Refill toiletries', status: 'completed', roomId: 'rm_108', createdAt: daysAgo(4), assignedTo: 'edin' },
]
