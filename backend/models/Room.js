const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['occupied', 'available', 'needs-cleaning'], required: true }
});

module.exports = mongoose.model('Room', roomSchema);
