const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const roomService = require('../services/RoomService'); // Wire RoomService

const VALID_STATUSES = ['occupied', 'available', 'needs-cleaning'];

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    send(res, ok(rooms));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// PUT /api/rooms/:id/status — body: { status }
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUSES.includes(status)) {
      return send(res, fail(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      ));
    }
    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) return send(res, fail('Room not found', 404));

    // TRIGGER OBSERVER: Notify system when room status changes
    roomService.notifyObservers(updated);

    send(res, ok(updated));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;