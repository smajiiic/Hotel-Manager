const roomService = require('./RoomService');
const taskService = require('./TaskService');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Facade for multi-step room operations. Callers (routes) invoke a single method
// here instead of orchestrating RoomService + bookings themselves, per the
// project's architecture rule.
class RoomOperationsFacade {
  constructor() {
    // Observer connection
    roomService.subscribe(taskService);
  }

  // Full checkout turnover for a room (roomId = Mongo _id):
  //   1. Mark the room's currently checked-in booking as checked-out, so the
  //      409 guard on PUT /rooms/:id/status no longer blocks the turnover.
  //   2. Flip the room to 'needs-cleaning' (persisted via RoomService).
  // Returns { success, message, data: { room, booking } } or { success:false, error }.
  async checkoutRoom(roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const booking = await Booking.findOneAndUpdate(
      { roomId: room.roomNumber, occupancyStatus: 'checked-in' },
      { occupancyStatus: 'checked-out' },
      { new: true }
    );

    const updatedRoom = await roomService.updateRoomStatus(roomId, 'needs-cleaning');

    return {
      success: true,
      message: 'Checkout completed successfully',
      data: { room: updatedRoom, booking },
    };
  }

  // Check-in turnover for a room (roomId = Mongo _id). The mirror image of
  // checkout: it lands a guest in the room and flips it to 'occupied'.
  //   1. Reject if the room already has a checked-in guest.
  //   2. Validate the guest details (name + a valid date range).
  //   3. If a *confirmed* reservation already covers those dates, honor it
  //      (activate that booking) instead of creating a duplicate; otherwise
  //      create a fresh walk-in booking, guarding against an overlapping one.
  //   4. Flip the room to 'occupied' (persisted via RoomService).
  // `bookingData` = { guestName, checkIn, checkOut } (dates are 'YYYY-MM-DD').
  // Returns { success, message, data: { room, booking } } or { success:false, error }.
  async checkinRoom(roomId, bookingData = {}) {
    const room = await Room.findById(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const active = await Booking.findOne({
      roomId: room.roomNumber,
      occupancyStatus: 'checked-in',
    });
    if (active) {
      return { success: false, error: `Room ${room.roomNumber} already has a checked-in guest` };
    }
    if (room.status !== 'available') {
      return { success: false, error: `Room ${room.roomNumber} is not available for check-in (currently ${room.status})` };
    }

    const guestName = (bookingData.guestName || '').trim();
    const { checkIn, checkOut } = bookingData;
    if (!guestName || !checkIn || !checkOut) {
      return { success: false, error: 'Guest name, check-in and check-out dates are required' };
    }
    // Dates must be canonical YYYY-MM-DD — the string-based overlap query below
    // relies on lexical = chronological ordering, so a non-padded date would
    // silently miss an overlap.
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
      return { success: false, error: 'Dates must be in YYYY-MM-DD format' };
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return { success: false, error: 'Check-out must be after check-in' };
    }

    // Is there a booking overlapping the requested window? (A checked-in one is
    // ruled out above, so this is a 'confirmed' reservation.) Honor it only when
    // it's the SAME guest — that's reception checking in their reservation. A
    // different guest overlapping the dates is a genuine double-booking → reject.
    const overlap = await Booking.findOne({
      roomId: room.roomNumber,
      occupancyStatus: { $ne: 'checked-out' },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });

    let booking;
    if (overlap) {
      if (overlap.guestName.trim().toLowerCase() !== guestName.toLowerCase()) {
        return { success: false, error: `Room ${room.roomNumber} is already booked for those dates` };
      }
      overlap.checkIn = checkIn;
      overlap.checkOut = checkOut;
      overlap.occupancyStatus = 'checked-in';
      booking = await overlap.save();
    } else {
      booking = await Booking.create({
        guestName,
        roomId: room.roomNumber,
        checkIn,
        checkOut,
        occupancyStatus: 'checked-in',
      });
    }

    const updatedRoom = await roomService.updateRoomStatus(roomId, 'occupied');
    if (!updatedRoom) {
      // Room vanished between the lookup and the status write — don't report a
      // success with a null room (which would leave a checked-in booking on a
      // room that never flipped to occupied).
      return { success: false, error: 'Room not found' };
    }

    return {
      success: true,
      message: 'Check-in completed successfully',
      data: { room: updatedRoom, booking },
    };
  }
}

module.exports = new RoomOperationsFacade();
