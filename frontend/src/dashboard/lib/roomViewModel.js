// Joins the four independent collections into per-room view-models keyed by the
// numeric roomNumber (the backend's join key across tasks/requests/bookings).
//
// `bookings` is optional: roles without booking access (cleaning) simply don't
// pass it, so no guest data is ever attached to those view-models — capability
// enforcement falls out of the data layer, not just the UI.

const sameRoom = (refRoomId, roomNumber) => Number(refRoomId) === Number(roomNumber);

export function buildRoomViewModels(rooms = [], tasks = [], requests = [], bookings = []) {
  return (rooms || []).map((room) => {
    const roomNumber = Number(room.roomNumber);

    const roomTasks = (tasks || []).filter((t) => sameRoom(t.roomId, roomNumber));
    const openTasks = roomTasks.filter((t) => t.status !== 'completed');

    const notes = (requests || []).filter((r) => sameRoom(r.roomId, roomNumber));
    const openNotes = notes.filter((n) => !n.resolved);

    const booking = (bookings || []).find(
      (b) => sameRoom(b.roomId, roomNumber) && b.occupancyStatus === 'checked-in'
    );

    return {
      ...room,
      roomNumber,
      status: room.status,
      tasks: roomTasks,
      openTasks,
      notes,
      openNotes,
      hasTask: openTasks.length > 0,
      hasNote: openNotes.length > 0,
      booking: booking ?? null,
      guestName: booking?.guestName ?? null,
      checkOut: booking?.checkOut ?? null,
    };
  });
}
