const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Task = require('../models/Task');
const roomService = require('../services/RoomService');

const VALID_STATUSES = ['occupied', 'available', 'needs-cleaning'];

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

// When a room flips to 'needs-cleaning', create a cleaning task (idempotent).
async function maybeCreateCleaningTask(room) {
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
    console.log(`Auto-created cleaning task for room ${room.roomNumber}`);
  } catch (err) {
    console.error('maybeCreateCleaningTask failed:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    send(res, ok(rooms));
  } catch (err) {
    send(res, fail(err.message));
  }
});

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

    roomService.notifyObservers(updated);
    await maybeCreateCleaningTask(updated);

    send(res, ok(updated));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;
