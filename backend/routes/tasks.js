const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks -> Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks -> Create a task
router.post('/', async (req, res) => {
  try {
    const newTask = new Task({
      description: req.body.description,
      roomId: req.body.roomId,
      status: req.body.status || 'pending'
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id -> Delete a task by id
router.delete('/:id', async (req, res) => {
  try {
    const removedTask = await Task.findByIdAndDelete(req.params.id);
    if (!removedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/tasks/:id/complete -> Mark task status as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const completedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!completedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(completedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
