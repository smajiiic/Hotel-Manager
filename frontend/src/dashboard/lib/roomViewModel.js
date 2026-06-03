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

    // The next upcoming reservation (a 'confirmed', not-yet-arrived booking) for
    // this room — used to pre-fill check-in. Kept separate from `booking` (the
    // in-house guest) so existing checked-in semantics are untouched.
    const reservation = (bookings || [])
      .filter((b) => sameRoom(b.roomId, roomNumber) && b.occupancyStatus === 'confirmed')
      .sort((a, b) => String(a.checkIn).localeCompare(String(b.checkIn)))[0] ?? null;

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
      reservation,
      guestName: booking?.guestName ?? null,
      checkOut: booking?.checkOut ?? null,
    };
  });
}
