const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  roomId: { type: Number, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);
