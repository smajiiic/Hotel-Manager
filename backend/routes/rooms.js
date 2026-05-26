const express = require('express');
const router = express.Router();

// Mock rooms data matching project needs
const mockRooms = [
  { id: '101', number: '101', type: 'Single', status: 'Available', price: 100 },
  { id: '102', number: '102', type: 'Double', status: 'Occupied', price: 150 },
  { id: '103', number: '103', type: 'Suite', status: 'Available', price: 250 }
];

// GET /api/rooms - Get all rooms
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockRooms
  });
});

module.exports = router;