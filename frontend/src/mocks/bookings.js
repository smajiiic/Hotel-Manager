// Mock fixture — 5 upcoming bookings positioned around today so that
// "Arriving today" / "Departing today" highlights are exercised whenever
// the page is loaded.

const dateOffset = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  // toLocaleDateString('sv-SE') returns YYYY-MM-DD in LOCAL time; using
  // toISOString().slice(0,10) would drift by a day in negative UTC offsets.
  return d.toLocaleDateString('sv-SE')
}

// occupancyStatus values:
//   'confirmed'   — upcoming reservation, guest hasn't arrived
//   'checked-in'  — guest currently in the room
//   'checked-out' — guest left (not normally returned by 'upcoming' GET,
//                   but valid in the model)
export const mockBookings = [
  { _id: 'bkg_1', guestName: 'Emir Hadžić',         roomId: 'rm_105', checkIn: dateOffset(-2), checkOut: dateOffset(0), occupancyStatus: 'checked-in' },
  { _id: 'bkg_2', guestName: 'Ana Kovač',           roomId: 'rm_102', checkIn: dateOffset(0),  checkOut: dateOffset(3), occupancyStatus: 'checked-in' },
  { _id: 'bkg_3', guestName: 'Sara Petrović',       roomId: 'rm_109', checkIn: dateOffset(1),  checkOut: dateOffset(4), occupancyStatus: 'confirmed' },
  { _id: 'bkg_4', guestName: 'Damir Bajraktarević', roomId: 'rm_111', checkIn: dateOffset(2),  checkOut: dateOffset(6), occupancyStatus: 'confirmed' },
  { _id: 'bkg_5', guestName: 'Lana Smajić',         roomId: 'rm_115', checkIn: dateOffset(4),  checkOut: dateOffset(9), occupancyStatus: 'confirmed' },
]
