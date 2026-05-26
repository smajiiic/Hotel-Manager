const express = require('express');
const router = express.Router();

// Mock bookings data
const mockBookings = [
  { id: 'b1', guestName: 'John Doe', roomNumber: '102', checkIn: '2026-05-26', checkOut: '2026-05-30', status: 'Confirmed' }
];

// GET /api/bookings - Get all bookings
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockBookings
  });
});

module.exports = router;