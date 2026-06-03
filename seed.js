require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB...'))
  .catch((err) => {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['reception', 'cleaning', 'manager'], required: true },
});

const roomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['occupied', 'available', 'needs-cleaning'], required: true },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  roomId: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  note: { type: String, required: true },
  roomId: { type: Number, required: true },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  roomId: { type: Number, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  occupancyStatus: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out'],
    required: true,
    default: 'confirmed',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Task = mongoose.model('Task', taskSchema);
const Request = mongoose.model('Request', requestSchema);
const Booking = mongoose.model('Booking', bookingSchema);

const rawUsers = [
  { username: 'admin',      password: 'admin123', role: 'manager' },
  { username: 'reception1', password: 'test1234', role: 'reception' },
  { username: 'cleaning1',  password: 'test1234', role: 'cleaning' },
  { username: 'manager1',   password: 'test1234', role: 'manager' },
];

// Rooms: 5 occupied (one for each checked-in guest below), 3 needs-cleaning, 7 available
const roomsData = [
  { roomNumber: 101, status: 'occupied' },
  { roomNumber: 102, status: 'occupied' },
  { roomNumber: 103, status: 'needs-cleaning' },
  { roomNumber: 104, status: 'available' },
  { roomNumber: 105, status: 'occupied' },
  { roomNumber: 106, status: 'needs-cleaning' },
  { roomNumber: 107, status: 'occupied' },
  { roomNumber: 108, status: 'available' },
  { roomNumber: 109, status: 'available' },
  { roomNumber: 110, status: 'available' },
  { roomNumber: 111, status: 'available' },
  { roomNumber: 112, status: 'occupied' },
  { roomNumber: 113, status: 'needs-cleaning' },
  { roomNumber: 114, status: 'available' },
  { roomNumber: 115, status: 'available' },
];

const tasksData = [
  { description: 'Change towels',    roomId: 103, status: 'pending' },
  { description: 'Fix bathroom tap', roomId: 107, status: 'pending' },
  { description: 'Deep clean',       roomId: 113, status: 'pending' },
  { description: 'Replace pillow',   roomId: 112, status: 'completed' },
];

const requestsData = [
  { note: 'Guest in 104 requested extra blanket', roomId: 104 },
  { note: 'Room 112 - VIP guest, handle carefully', roomId: 112 },
  { note: 'Room 106 checkout delayed until 14:00', roomId: 106 },
];

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

// 5 checked-in guests in the 5 occupied rooms + 3 upcoming confirmed bookings
const bookingsData = [
  // checked-in (matches "occupied" rooms)
  { guestName: 'Emir Hadžić',         roomId: 105, checkIn: dateOffset(-2), checkOut: dateOffset(0), occupancyStatus: 'checked-in' },
  { guestName: 'Ana Kovač',           roomId: 102, checkIn: dateOffset(0),  checkOut: dateOffset(3), occupancyStatus: 'checked-in' },
  { guestName: 'Jasmin Begić',        roomId: 101, checkIn: dateOffset(-1), checkOut: dateOffset(2), occupancyStatus: 'checked-in' },
  { guestName: 'Selma Dizdar',        roomId: 107, checkIn: dateOffset(-3), checkOut: dateOffset(1), occupancyStatus: 'checked-in' },
  { guestName: 'Marko Jurić',         roomId: 112, checkIn: dateOffset(-2), checkOut: dateOffset(2), occupancyStatus: 'checked-in' },
  // upcoming
  { guestName: 'Sara Petrović',       roomId: 109, checkIn: dateOffset(1),  checkOut: dateOffset(4), occupancyStatus: 'confirmed' },
  { guestName: 'Damir Bajraktarević', roomId: 108, checkIn: dateOffset(2),  checkOut: dateOffset(6), occupancyStatus: 'confirmed' },
  { guestName: 'Lana Smajić',         roomId: 114, checkIn: dateOffset(4),  checkOut: dateOffset(9), occupancyStatus: 'confirmed' },
];

async function seedDatabase() {
  try {
    await User.deleteMany({});
    await Room.deleteMany({});
    await Task.deleteMany({});
    await Request.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleaned up existing collections.');

    const saltRounds = 10;
    const hashedUsers = await Promise.all(
      rawUsers.map(async ({ username, password, role }) => ({
        username, role,
        passwordHash: await bcrypt.hash(password, saltRounds),
      }))
    );
    await User.insertMany(hashedUsers);
    console.log('👤 Users inserted.');

    await Room.insertMany(roomsData);
    console.log('🏨 Rooms inserted.');

    await Task.insertMany(tasksData);
    await Request.insertMany(requestsData);
    await Booking.insertMany(bookingsData);

    console.log('🚀 Database populated.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

seedDatabase();
