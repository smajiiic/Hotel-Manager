const express = require('express');
const router = express.Router();

// In-memory mock — replaced by real Mongo queries when Imran's lane catches up.
// PUT mutates this array so status changes persist across requests in the
// same backend process (lost on restart — that's fine for the demo).
let mockRooms = [
  { _id: 'rm_101', roomNumber: 101, status: 'occupied' },
  { _id: 'rm_102', roomNumber: 102, status: 'occupied' },
  { _id: 'rm_103', roomNumber: 103, status: 'needs-cleaning' },
  { _id: 'rm_104', roomNumber: 104, status: 'occupied' },
  { _id: 'rm_105', roomNumber: 105, status: 'occupied' },
  { _id: 'rm_106', roomNumber: 106, status: 'needs-cleaning' },
  { _id: 'rm_107', roomNumber: 107, status: 'occupied' },
  { _id: 'rm_108', roomNumber: 108, status: 'available' },
  { _id: 'rm_109', roomNumber: 109, status: 'available' },
  { _id: 'rm_110', roomNumber: 110, status: 'occupied' },
  { _id: 'rm_201', roomNumber: 201, status: 'available' },
  { _id: 'rm_202', roomNumber: 202, status: 'occupied' },
  { _id: 'rm_203', roomNumber: 203, status: 'needs-cleaning' },
  { _id: 'rm_204', roomNumber: 204, status: 'available' },
  { _id: 'rm_205', roomNumber: 205, status: 'occupied' },
];

const VALID_STATUSES = ['occupied', 'available', 'needs-cleaning'];

// GET /api/rooms
router.get('/', (req, res) => {
  res.json({ success: true, data: mockRooms });
});

// PUT /api/rooms/:id/status — frontend roomsApi.js uses this URL shape
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const room = mockRooms.find((r) => r._id === id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  room.status = status;
  res.json({ success: true, data: room });
});

module.exports = router;
