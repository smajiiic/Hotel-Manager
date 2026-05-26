const express = require('express');
const router = express.Router();

// Mock rooms — matches the shape consumed by the React frontend.
// Will be replaced by real DB queries once Imran ships the Mongoose models.
const mockRooms = [
  { _id: 'rm_101', roomNumber: 101, status: 'occupied' },
  { _id: 'rm_102', roomNumber: 102, status: 'available' },
  { _id: 'rm_103', roomNumber: 103, status: 'needs-cleaning' },
  { _id: 'rm_104', roomNumber: 104, status: 'occupied' },
  { _id: 'rm_105', roomNumber: 105, status: 'available' },
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

// GET /api/rooms
router.get('/', (req, res) => {
  res.json({ success: true, data: mockRooms });
});

module.exports = router;