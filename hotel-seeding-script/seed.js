
users: [
{ username: "reception1", password: "test1234", role: "reception" },
{ username: "cleaning1",  password: "test1234", role: "cleaning"  },
{ username: "manager1",   password: "test1234", role: "manager"   }
]

// ROOMS — all 15, mixed statuses for realistic testing
rooms: [
{ roomNumber: 101, status: "occupied"      },
{ roomNumber: 102, status: "available"     },
{ roomNumber: 103, status: "needs-cleaning"},
{ roomNumber: 104, status: "occupied"      },
{ roomNumber: 105, status: "available"     },
{ roomNumber: 106, status: "needs-cleaning"},
{ roomNumber: 107, status: "occupied"      },
{ roomNumber: 108, status: "available"     },
{ roomNumber: 109, status: "available"     },
{ roomNumber: 110, status: "occupied"      },
{ roomNumber: 201, status: "available"     },
{ roomNumber: 202, status: "occupied"      },
{ roomNumber: 203, status: "needs-cleaning"},
{ roomNumber: 204, status: "available"     },
{ roomNumber: 205, status: "occupied"      }
]

// TASKS — a mix of pending and completed
tasks: [
{ description: "Change towels",    roomId: 103, status: "pending"   },
{ description: "Fix bathroom tap", roomId: 107, status: "pending"   },
{ description: "Deep clean",       roomId: 203, status: "pending"   },
{ description: "Replace pillow",   roomId: 202, status: "completed" }
]

// REQUESTS — shift notes
requests: [
{ note: "Guest in 104 requested extra blanket", roomId: 104 },
{ note: "Room 202 - VIP guest, handle carefully", roomId: 202 },
{ note: "Room 106 checkout delayed until 14:00", roomId: 106 }
]

// BOOKINGS — upcoming reservations
bookings: [
{ guestName: "Ana Kovač",    roomId: 102, checkIn: "2026-04-10", checkOut: "2026-04-13" },
{ guestName: "Emir Hadžić",  roomId: 105, checkIn: "2026-04-11", checkOut: "2026-04-14" },
{ guestName: "Sara Petrović",roomId: 109, checkIn: "2026-04-12", checkOut: "2026-04-15" }
]

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 1. CONNECT TO MONGOOSE
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB...'))
.catch(err => {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
});

// 2. DEFINE SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
passwordHash: { type: String, required: true },
role: { type: String, enum: ['reception', 'cleaning', 'manager'], required: true }
});

const roomSchema = new mongoose.Schema({
roomNumber: { type: Number, required: true, unique: true },
status: { type: String, enum: ['occupied', 'available', 'needs-cleaning'], required: true }
});

const taskSchema = new mongoose.Schema({
description: { type: String, required: true },
roomId: { type: Number, required: true },
status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

const requestSchema = new mongoose.Schema({
note: { type: String, required: true },
roomId: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
guestName: { type: String, required: true },
roomId: { type: Number, required: true },
checkIn: { type: String, required: true },
checkOut: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Task = mongoose.model('Task', taskSchema);
const Request = mongoose.model('Request', requestSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// 3. SEED DATA SOURCE
const rawUsers = [
{ username: "reception1", password: "test1234", role: "reception" },
{ username: "cleaning1",  password: "test1234", role: "cleaning"  },
{ username: "manager1",   password: "test1234", role: "manager"   }
];

const roomsData = [
{ roomNumber: 101, status: "occupied"      },
{ roomNumber: 102, status: "available"     },
{ roomNumber: 103, status: "needs-cleaning"},
{ roomNumber: 104, status: "occupied"      },
{ roomNumber: 105, status: "available"     },
{ roomNumber: 106, status: "needs-cleaning"},
{ roomNumber: 107, status: "occupied"      },
{ roomNumber: 108, status: "available"     },
{ roomNumber: 109, status: "available"     },
{ roomNumber: 110, status: "occupied"      },
{ roomNumber: 201, status: "available"     },
{ roomNumber: 202, status: "occupied"      },
{ roomNumber: 203, status: "needs-cleaning"},
{ roomNumber: 204, status: "available"     },
{ roomNumber: 205, status: "occupied"      }
];

const tasksData = [
{ description: "Change towels",    roomId: 103, status: "pending"   },
{ description: "Fix bathroom tap", roomId: 107, status: "pending"   },
{ description: "Deep clean",       roomId: 203, status: "pending"   },
{ description: "Replace pillow",   roomId: 202, status: "completed" }
];

const requestsData = [
{ note: "Guest in 104 requested extra blanket", roomId: 104 },
{ note: "Room 202 - VIP guest, handle carefully", roomId: 202 },
{ note: "Room 106 checkout delayed until 14:00", roomId: 106 }
];

const bookingsData = [
{ guestName: "Ana Kovač",    roomId: 102, checkIn: "2026-04-10", checkOut: "2026-04-13" },
{ guestName: "Emir Hadžić",  roomId: 105, checkIn: "2026-04-11", checkOut: "2026-04-14" },
{ guestName: "Sara Petrović",roomId: 109, checkIn: "2026-04-12", checkOut: "2026-04-15" }
];

// 4. MAIN SEED FUNCTION
async function seedDatabase() {
 try {
    // Clear existing data to avoid duplicates during testing
    await User.deleteMany({});
    await Room.deleteMany({});
    await Task.deleteMany({});
    await Request.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️ Cleaned up existing database collections.');

    // Hash passwords safely before saving
    console.log('🔒 Hashing user passwords...');
    const saltRounds = 10;
    const hashedUsers = await Promise.all(
    rawUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        return {
    ...user,
        passwordHash: hashedPassword
        };
    })
    );

    // Insert new data
    await User.insertMany(hashedUsers);
    await Room.insertMany(roomsData);
    await Task.insertMany(tasksData);
    await Request.insertMany(requestsData);
    await Booking.insertMany(bookingsData);

    console.log('🚀 Database successfully populated with seed data!');
} catch (error) {
    console.error('❌ Error seeding database:', error);
} finally {
    // Always close the connection when finished
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
}
}

// Run the script
seedDatabase();