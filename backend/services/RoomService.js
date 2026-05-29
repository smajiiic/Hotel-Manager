class RoomService {
  constructor() {
    this.observers = []; // List of subscribers
  }

  // Add a new observer (Subscribe)
  addObserver(observer) {
    this.observers.push(observer);
  }

  // Notify all observers when a room's state changes
  notifyObservers(roomData) {
    for (let observer of this.observers) {
      observer.update(roomData);
    }
  }

  // Checkout process
  checkout(roomNumber) {
    console.log(`[RoomService] Processing checkout for room ${roomNumber}...`);
    
    // Update room status to 'needs cleaning'
    const updatedRoom = {
      roomNumber: roomNumber,
      status: 'needs cleaning'
    };

    console.log(`[RoomService] Room ${roomNumber} status changed. Notifying everyone...`);
    
    // Notify everyone listening about the change!
    this.notifyObservers(updatedRoom);
    
    return updatedRoom;
  }
}

module.exports = new RoomService();