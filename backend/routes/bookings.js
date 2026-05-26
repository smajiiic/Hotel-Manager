const express = require('express');
const router = express.Router();

// Same YYYY-MM-DD helper the frontend uses — keeps "Arriving today" /
// "Departing today" badges firing regardless of when this runs.
const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

// Mock bookings — roomId values must match _id of a room above.
const mockBookings = [
  { _id: 'bkg_1', guestName: 'Emir Hadžić',         roomId: 'rm_105', checkIn: dateOffset(-2), checkOut: dateOffset(0), occupancyStatus: 'checked-in' },
  { _id: 'bkg_2', guestName: 'Ana Kovač',           roomId: 'rm_102', checkIn: dateOffset(0),  checkOut: dateOffset(3), occupancyStatus: 'checked-in' },
  { _id: 'bkg_3', guestName: 'Sara Petrović',       roomId: 'rm_109', checkIn: dateOffset(1),  checkOut: dateOffset(4), occupancyStatus: 'confirmed'  },
  { _id: 'bkg_4', guestName: 'Damir Bajraktarević', roomId: 'rm_108', checkIn: dateOffset(2),  checkOut: dateOffset(6), occupancyStatus: 'confirmed'  },
  { _id: 'bkg_5', guestName: 'Lana Smajić',         roomId: 'rm_204', checkIn: dateOffset(4),  checkOut: dateOffset(9), occupancyStatus: 'confirmed'  },
];

// GET /api/bookings
router.get('/', (req, res) => {
  res.json({ success: true, data: mockBookings });
});

module.exports = router;