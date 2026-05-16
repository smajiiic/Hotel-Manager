const roomService = require('./RoomService');
const taskService = require('./TaskService');

class RoomOperationsFacade {
  constructor() {
    // Observer connection
    roomService.subscribe(taskService);
  }

  async checkoutRoom(roomId) {
    console.log(`[Facade] Running checkout for room: ${roomId}`);
    await roomService.updateRoomStatus(roomId, 'needs-cleaning');
    return { success: true, message: 'Checkout completed successfully' };
  }
}

module.exports = new RoomOperationsFacade();