const RoomObserver = require('./RoomObserver');

// Subscriber 1
class RequestService extends RoomObserver {
  update(roomData) {
    console.log(`[RequestService] Notified: Room ${roomData.roomNumber} is now '${roomData.status}'`);
  }
}

module.exports = new RequestService();