const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Room = require('../models/Room');

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);
const emit = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.emit(event, data);
};

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    send(res, ok(tasks));
  } catch (err) { send(res, fail(err.message)); }
});

router.post('/', async (req, res) => {
  try {
    const newTask = new Task({
      description: req.body.description,
      roomId: req.body.roomId,
      status: req.body.status || 'pending',
    });
    const saved = await newTask.save();
    emit(req, 'tasks:updated');
    send(res, ok(saved, 201));
  } catch (err) { send(res, fail(err.message, 400)); }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return send(res, fail('Task not found', 404));
    emit(req, 'tasks:updated');
    send(res, ok({ deleted: true, _id: req.params.id }));
  } catch (err) { send(res, fail(err.message)); }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const completed = await Task.findByIdAndUpdate(
      req.params.id, { status: 'completed' }, { new: true }
    );
    if (!completed) return send(res, fail('Task not found', 404));

    // If this is a cleaning task, auto-flip the room to 'available'
    if (/clean/i.test(completed.description)) {
      const room = await Room.findOneAndUpdate(
        { roomNumber: completed.roomId, status: 'needs-cleaning' },
        { status: 'available' },
        { new: true }
      );
      if (room) {
        emit(req, 'rooms:updated', room);
        console.log(`Auto-set room ${room.roomNumber} to available after cleaning task done`);
      }
    }

    emit(req, 'tasks:updated');
    send(res, ok(completed));
  } catch (err) { send(res, fail(err.message)); }
});

router.patch('/:id/reopen', async (req, res) => {
  try {
    const reopened = await Task.findByIdAndUpdate(
      req.params.id, { status: 'pending' }, { new: true }
    );
    if (!reopened) return send(res, fail('Task not found', 404));
    emit(req, 'tasks:updated');
    send(res, ok(reopened));
  } catch (err) { send(res, fail(err.message)); }
});

module.exports = router;
