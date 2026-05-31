const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

const ok = (data, status = 200) => ({ status, body: { success: true, data } });
const fail = (error, status = 500) => ({ status, body: { success: false, error } });
const send = (res, { status, body }) => res.status(status).json(body);

router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    send(res, ok(requests));
  } catch (err) {
    send(res, fail(err.message));
  }
});

router.post('/', async (req, res) => {
  try {
    const newRequest = new Request({
      note: req.body.note,
      roomId: req.body.roomId,
    });
    const saved = await newRequest.save();
    send(res, ok(saved, 201));
  } catch (err) {
    send(res, fail(err.message, 400));
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await Request.findByIdAndDelete(req.params.id);
    if (!removed) return send(res, fail('Request not found', 404));
    send(res, ok({ deleted: true, _id: req.params.id }));
  } catch (err) {
    send(res, fail(err.message));
  }
});

router.patch('/:id/resolve', async (req, res) => {
  try {
    const resolved = await Request.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!resolved) return send(res, fail('Request not found', 404));
    send(res, ok(resolved));
  } catch (err) {
    send(res, fail(err.message));
  }
});

router.patch('/:id/unresolve', async (req, res) => {
  try {
    const unresolved = await Request.findByIdAndUpdate(
      req.params.id,
      { resolved: false },
      { new: true }
    );
    if (!unresolved) return send(res, fail('Request not found', 404));
    send(res, ok(unresolved));
  } catch (err) {
    send(res, fail(err.message));
  }
});

module.exports = router;
