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
}

module.exports = new RoomOperationsFacade();
