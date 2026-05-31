const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    send(res, ok(tasks));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const newTask = new Task({
      description: req.body.description,
      roomId: req.body.roomId,
      status: req.body.status || 'pending',
    });
    const saved = await newTask.save();
    send(res, ok(saved, 201));
  } catch (err) {
    send(res, fail(err.message, 400));
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return send(res, fail('Task not found', 404));
    send(res, ok({ deleted: true, _id: req.params.id }));
  } catch (err) {
    send(res, fail(err.message));
  }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', async (req, res) => {
  try {
    const completed = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!completed) return send(res, fail('Task not found', 404));
    send(res, ok(completed));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;
