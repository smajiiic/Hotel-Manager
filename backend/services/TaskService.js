const RoomObserver = require('./RoomObserver');

// Subscriber 2
class TaskService extends RoomObserver {
  update(roomData) {
    // If the room status changes to 'needs cleaning', automatically create a task
    if (roomData.status === 'needs cleaning') {
      console.log(`[TaskService] SUCCESS: Auto-creating cleaning task for Room ${roomData.roomNumber}!`);
      // In a real project, we would save the new task to the database here
    }
  }
}

module.exports = new TaskService();