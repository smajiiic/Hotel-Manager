const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// GET /api/requests -> Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/requests -> Create a new request
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request({
      note: req.body.note,
      roomId: req.body.roomId
    });
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/requests/:id -> Delete a request by id
router.delete('/:id', async (req, res) => {
  try {
    const removedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!removedRequest) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
