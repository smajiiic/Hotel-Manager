const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

const VALID_STATUSES = ['confirmed', 'checked-in', 'checked-out'];

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ checkIn: 1 });
    send(res, ok(bookings));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
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

    const newBooking = new Booking({
      guestName: String(guestName).trim(),
      roomId: Number(roomId),
      checkIn,
      checkOut,
      occupancyStatus: status,
    });
    const saved = await newBooking.save();
    send(res, ok(saved, 201));
  } catch (err) {
    send(res, fail(err.message, 400));
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Booking.findByIdAndDelete(req.params.id);
    if (!removed) return send(res, fail('Booking not found', 404));
    send(res, ok({ deleted: true, _id: req.params.id }));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;
