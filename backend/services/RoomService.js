const Room = require('../models/Room');

class RoomService {
  constructor() {
    this.subs = [];
  }

  subscribe(service) {
    this.subs.push(service);
  }

  notifyObservers(room) {
    for (let sub of this.subs) {
      if (typeof sub.onRoomStatusChanged === 'function') {
        sub.onRoomStatusChanged(room._id, room.status);
      }
    }
  }

  // roomId is the Mongo _id. Persists the new status, then notifies observers
  // with the updated document. Returns the updated room (or null if not found).
  async updateRoomStatus(roomId, newStatus) {
    const updated = await Room.findByIdAndUpdate(
      roomId,
      { status: newStatus },
      { new: true, runValidators: true }
    );
    if (updated) this.notifyObservers(updated);
    return updated;
  }
}

module.exports = new RoomService();
