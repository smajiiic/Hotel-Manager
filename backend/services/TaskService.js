class TaskService {
  onRoomStatusChanged(roomId, newStatus) {
    if (newStatus === 'needs-cleaning') {
      console.log(`[TaskService] Automatically trigger cleaning task for room ${roomId}`);
    }
  }

  async createTask(roomId, description) {
    return { success: true, data: { roomId, description, status: 'pending' } };
  }
}

module.exports = new TaskService();