const roomService = require('./RoomService');
const taskService = require('./TaskService');
const requestService = require('./RequestService');

// Wiring process requested by the professor:
// Adding Subscribers (TaskService and RequestService) to the Publisher (RoomService).
roomService.addObserver(taskService);
roomService.addObserver(requestService);

class RoomOperationsFacade {
  // Facade Pattern: Reducing the complex system to a single, simple function call
  async checkoutRoom(roomNumber) {
    console.log(`[Facade] Initiating checkout process for Room ${roomNumber}...`);
    
    // Trigger RoomService with one click, which then notifies everyone else
    const result = roomService.checkout(roomNumber);
    
    console.log(`[Facade] Checkout process completed for Room ${roomNumber}.`);
    return { success: true, room: result };
  }
}

module.exports = new RoomOperationsFacade();