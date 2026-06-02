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

  async updateRoomStatus(roomId, newStatus) {
    console.log(`Room ${roomId} status shifted to: ${newStatus}`);

    for (let sub of this.subs) {
      if (typeof sub.onRoomStatusChanged === 'function') {
        sub.onRoomStatusChanged(roomId, newStatus);
      }
    }
    return { success: true };
  }
}

module.exports = new RoomService();
