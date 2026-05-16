// Mock fixture — all 15 rooms (101–115), mixed statuses.
// roomId on Task/Request references the `_id` here, not `roomNumber`.

export const mockRooms = [
  { _id: 'rm_101', roomNumber: 101, status: 'occupied' },
  { _id: 'rm_102', roomNumber: 102, status: 'available' },
  { _id: 'rm_103', roomNumber: 103, status: 'needs-cleaning' },
  { _id: 'rm_104', roomNumber: 104, status: 'occupied' },
  { _id: 'rm_105', roomNumber: 105, status: 'available' },
  { _id: 'rm_106', roomNumber: 106, status: 'needs-cleaning' },
  { _id: 'rm_107', roomNumber: 107, status: 'occupied' },
  { _id: 'rm_108', roomNumber: 108, status: 'occupied' },
  { _id: 'rm_109', roomNumber: 109, status: 'available' },
  { _id: 'rm_110', roomNumber: 110, status: 'occupied' },
  { _id: 'rm_111', roomNumber: 111, status: 'needs-cleaning' },
  { _id: 'rm_112', roomNumber: 112, status: 'available' },
  { _id: 'rm_113', roomNumber: 113, status: 'occupied' },
  { _id: 'rm_114', roomNumber: 114, status: 'available' },
  { _id: 'rm_115', roomNumber: 115, status: 'occupied' },
]
