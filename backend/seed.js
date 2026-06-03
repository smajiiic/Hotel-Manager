require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Task = require('./models/Task');
const Request = require('./models/Request');

const rooms = [
  { roomNumber: 101, status: 'occupied' },
  { roomNumber: 102, status: 'occupied' },
  { roomNumber: 103, status: 'available' },
  { roomNumber: 104, status: 'occupied' },
  { roomNumber: 105, status: 'occupied' },
  { roomNumber: 106, status: 'needs-cleaning' },
  { roomNumber: 107, status: 'occupied' },
  { roomNumber: 108, status: 'available' },
  { roomNumber: 109, status: 'available' },
  { roomNumber: 110, status: 'available' },
  { roomNumber: 111, status: 'needs-cleaning' },
  { roomNumber: 112, status: 'available' },
  { roomNumber: 113, status: 'occupied' },
  { roomNumber: 114, status: 'available' },
  { roomNumber: 115, status: 'available' },
];

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const bookings = [
  { guestName: 'Emir Hadžić',         roomId: 105, checkIn: dateOffset(-2), checkOut: dateOffset(0), occupancyStatus: 'checked-in' },
  { guestName: 'Ana Kovač',           roomId: 102, checkIn: dateOffset(0),  checkOut: dateOffset(3), occupancyStatus: 'checked-in' },
  { guestName: 'Sara Petrović',       roomId: 109, checkIn: dateOffset(1),  checkOut: dateOffset(4), occupancyStatus: 'confirmed'  },
  { guestName: 'Damir Bajraktarević', roomId: 108, checkIn: dateOffset(2),  checkOut: dateOffset(6), occupancyStatus: 'confirmed'  },
  { guestName: 'Lana Smajić',         roomId: 114, checkIn: dateOffset(4),  checkOut: dateOffset(9), occupancyStatus: 'confirmed'  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  await Room.deleteMany({});
  await Booking.deleteMany({});
  await Task.deleteMany({});
  await Request.deleteMany({});

  await Room.insertMany(rooms);
  await Booking.insertMany(bookings);

  console.log(`Seeded ${rooms.length} rooms, ${bookings.length} bookings`);
  console.log('Users were preserved (not touched)');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
