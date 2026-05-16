// Mock fixture — 4 shift notes / guest requests.

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const mockRequests = [
  { _id: 'req_1', note: 'Guest in 101 requested late checkout at 14:00', roomId: 'rm_101', createdAt: daysAgo(0), createdBy: 'tarik' },
  { _id: 'req_2', note: 'AC in 104 making noise — call maintenance', roomId: 'rm_104', createdAt: daysAgo(0), createdBy: 'amina' },
  { _id: 'req_3', note: 'Honeymoon couple in 110 — leave flowers and card', roomId: 'rm_110', createdAt: daysAgo(1), createdBy: 'tarik' },
  { _id: 'req_4', note: 'Room 115 wifi intermittent — check router', roomId: 'rm_115', createdAt: daysAgo(2), createdBy: 'edin' },
]
