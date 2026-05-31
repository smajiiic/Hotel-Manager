const express = require('express');
const router = express.Router();

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

// In-memory mock store — POST mutates this so newly created bookings show up
// in subsequent GETs until backend restart. Replaces with a real Mongo write
// once Imran's bookings model is wired in.
let mockBookings = [
  { _id: 'bkg_1', guestName: 'Emir Hadžić',         roomId: 'rm_105', checkIn: dateOffset(-2), checkOut: dateOffset(0), occupancyStatus: 'checked-in' },
  { _id: 'bkg_2', guestName: 'Ana Kovač',           roomId: 'rm_102', checkIn: dateOffset(0),  checkOut: dateOffset(3), occupancyStatus: 'checked-in' },
  { _id: 'bkg_3', guestName: 'Sara Petrović',       roomId: 'rm_109', checkIn: dateOffset(1),  checkOut: dateOffset(4), occupancyStatus: 'confirmed'  },
  { _id: 'bkg_4', guestName: 'Damir Bajraktarević', roomId: 'rm_108', checkIn: dateOffset(2),  checkOut: dateOffset(6), occupancyStatus: 'confirmed'  },
  { _id: 'bkg_5', guestName: 'Lana Smajić',         roomId: 'rm_204', checkIn: dateOffset(4),  checkOut: dateOffset(9), occupancyStatus: 'confirmed'  },
];

const VALID_STATUSES = ['confirmed', 'checked-in', 'checked-out'];

// GET /api/bookings
router.get('/', (req, res) => {
  res.json({ success: true, data: mockBookings });
});

// POST /api/bookings — body: { guestName, roomId, checkIn, checkOut, occupancyStatus? }
router.post('/', (req, res) => {
  const { guestName, roomId, checkIn, checkOut, occupancyStatus } = req.body || {};

  if (!guestName || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: guestName, roomId, checkIn, checkOut',
    });
  }

  const status = occupancyStatus || 'confirmed';
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    return res.status(400).json({
      success: false,
      error: 'checkOut must be after checkIn',
    });
  }

  const newBooking = {
    _id: `bkg_${Date.now()}`,
    guestName: String(guestName).trim(),
    roomId,
    checkIn,
    checkOut,
    occupancyStatus: status,
  };

  mockBookings.push(newBooking);
  res.status(201).json({ success: true, data: newBooking });
});

module.exports = router;
