// Base Observer class. Subclasses override these methods to react
// to room status changes (Observer pattern with RoomService).
class RoomObserver {
  update(roomData) {
    // override in subclass
  }

  onRoomStatusChanged(roomId, newStatus) {
    // override in subclass
  }
}

module.exports = RoomObserver;
