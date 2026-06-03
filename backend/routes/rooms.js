const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Task = require('../models/Task');
const Booking = require('../models/Booking');
const roomService = require('../services/RoomService');
const roomOpsFacade = require('../services/RoomOperationsFacade');
const { requireAuth, requireRole } = require('../middleware/auth');

const VALID_STATUSES = ['occupied', 'available', 'needs-cleaning'];

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

async function maybeCreateCleaningTask(room, io) {
  try {
    if (room.status !== 'needs-cleaning') return;
    const existing = await Task.findOne({
      roomId: room.roomNumber,
      status: 'pending',
      description: { $regex: /clean/i },
    });
    if (existing) return;
    await Task.create({
      description: `Clean room ${room.roomNumber}`,
      roomId: room.roomNumber,
      status: 'pending',
    });
    if (io) io.emit('tasks:updated');
    console.log(`Auto-created cleaning task for room ${room.roomNumber}`);
  } catch (err) {
    console.error('maybeCreateCleaningTask failed:', err.message);
  }
}

// Any authenticated role can view the rooms.
router.get('/', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    send(res, ok(rooms));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// Reception may set any status; cleaning may only flip a room to 'available'.
router.put('/:id/status', requireRole('reception', 'cleaning'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUSES.includes(status)) {
      return send(res, fail(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400));
    }

    if (req.session.role === 'cleaning' && status !== 'available') {
      return send(res, fail('Cleaning staff can only set a room to available', 403));
    }

    // Find room to get its number
    const room = await Room.findById(req.params.id);
    if (!room) return send(res, fail('Room not found', 404));

    // Block status change if room has an active checked-in booking
    const activeBooking = await Booking.findOne({
      roomId: room.roomNumber,
      occupancyStatus: 'checked-in',
    });

    if (activeBooking) {
      return send(res, fail(
        `Cannot change status — Room ${room.roomNumber} is occupied by ${activeBooking.guestName} (checked in until ${activeBooking.checkOut})`,
        409
      ));
    }

    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    const io = req.app.get('io');
    roomService.notifyObservers(updated);
    await maybeCreateCleaningTask(updated, io);
    if (io) io.emit('rooms:updated', updated);

    send(res, ok(updated));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// Checkout turnover — reception only. Delegates the multi-step operation to the
// RoomOperationsFacade (closes the active booking + sets the room to
// needs-cleaning), then mirrors the PUT-status side effects: auto-create the
// cleaning task and broadcast the live socket events so every open plan updates.
router.post('/:id/checkout', requireRole('reception'), async (req, res) => {
  try {
    const result = await roomOpsFacade.checkoutRoom(req.params.id);
    if (!result.success) {
      return send(res, fail(result.error || 'Checkout failed', result.error === 'Room not found' ? 404 : 500));
    }

    const io = req.app.get('io');
    await maybeCreateCleaningTask(result.data.room, io);
    if (io) {
      io.emit('rooms:updated', result.data.room);
      io.emit('bookings:updated');
    }

    send(res, ok(result.data));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// Check-in turnover — reception only. Delegates to the RoomOperationsFacade
// (creates/activates a booking + flips the room to occupied), then broadcasts
// the live socket events so every open plan updates. Mirror of /checkout.
router.post('/:id/checkin', requireRole('reception'), async (req, res) => {
  try {
    const result = await roomOpsFacade.checkinRoom(req.params.id, req.body || {});
    if (!result.success) {
      const code = result.error === 'Room not found' ? 404
        : /already|booked|not available/i.test(result.error || '') ? 409
        : 400;
      return send(res, fail(result.error || 'Check-in failed', code));
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('rooms:updated', result.data.room);
      io.emit('bookings:updated');
    }

    send(res, ok(result.data));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;
