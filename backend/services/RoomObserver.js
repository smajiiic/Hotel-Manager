// Observer Interface (Base Class)
class RoomObserver {
  update(roomData) {
    throw new Error("update() method must be implemented by subscribers");
  }
}

module.exports = RoomObserver;