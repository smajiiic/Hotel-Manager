const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  note: { type: String, required: true },
  roomId: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
