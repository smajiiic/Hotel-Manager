const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  roomId: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
