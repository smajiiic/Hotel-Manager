const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { requireRole } = require('../middleware/auth');

const VALID_STATUSES = ['confirmed', 'checked-in', 'checked-out'];

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);
const emit = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.emit(event, data);
};

async function autoCheckoutOverdue(io) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const stillCheckedIn = await Booking.find({ occupancyStatus: 'checked-in' });
    const overdue = stillCheckedIn.filter(b => new Date(b.checkOut) < startOfToday);
    if (overdue.length === 0) return;
    const overdueIds = overdue.map(b => b._id);
    const overdueRoomNums = [...new Set(overdue.map(b => b.roomId))];
    await Booking.updateMany(
      { _id: { $in: overdueIds } },
      { $set: { occupancyStatus: 'checked-out' } }
    );
    await Room.updateMany(
      { roomNumber: { $in: overdueRoomNums } },
      { $set: { status: 'needs-cleaning' } }
    );
    if (io) {
      io.emit('bookings:updated');
      io.emit('rooms:updated');
    }
    console.log(`Auto-checked-out ${overdue.length} overdue booking(s)`);
  } catch (err) {
    console.error('autoCheckoutOverdue failed:', err.message);
  }
}

// Reception and manager can view bookings; cleaning has no booking access.
router.get('/', requireRole('reception', 'manager'), async (req, res) => {
  try {
    await autoCheckoutOverdue(req.app.get('io'));
    const bookings = await Booking.find().sort({ checkIn: 1 });
    send(res, ok(bookings));
  } catch (err) { send(res, fail(err.message)); }
});

// Only reception creates bookings.
router.post('/', requireRole('reception'), async (req, res) => {
  try {
    const { guestName, roomId, checkIn, checkOut, occupancyStatus } = req.body || {};

    if (!guestName || roomId === undefined || roomId === null || !checkIn || !checkOut) {
      return send(res, fail('Missing required fields: guestName, roomId, checkIn, checkOut', 400));
    }

    const status = occupancyStatus || 'confirmed';
    if (!VALID_STATUSES.includes(status)) {
      return send(res, fail(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400));
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return send(res, fail('checkOut must be after checkIn', 400));
    }

    const overlap = await Booking.findOne({
      roomId: Number(roomId),
      occupancyStatus: { $ne: 'checked-out' },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });

    if (overlap) {
      return send(res, fail(
        `Room ${roomId} is already booked by ${overlap.guestName} (${overlap.checkIn} → ${overlap.checkOut})`,
        409
      ));
    }

    const newBooking = new Booking({
      guestName: String(guestName).trim(),
      roomId: Number(roomId),
      checkIn,
      checkOut,
      occupancyStatus: status,
    });
    const saved = await newBooking.save();
    emit(req, 'bookings:updated');
    send(res, ok(saved, 201));
  } catch (err) { send(res, fail(err.message, 400)); }
});

// Only reception deletes bookings.
router.delete('/:id', requireRole('reception'), async (req, res) => {
  try {
    const removed = await Booking.findByIdAndDelete(req.params.id);
    if (!removed) return send(res, fail('Booking not found', 404));
    emit(req, 'bookings:updated');
    send(res, ok({ deleted: true, _id: req.params.id }));
  } catch (err) { send(res, fail(err.message)); }
});

module.exports = router;
