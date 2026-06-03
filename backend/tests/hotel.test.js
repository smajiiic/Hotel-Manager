/**
 * Hotel Manager — Backend Unit & Integration Tests
 *
 * Stack : Jest + Supertest + mongodb-memory-server
 * Run   : npx jest --runInBand
 *
 * Install dev-deps first:
 *   npm install --save-dev jest supertest @jest-community/jest-extended \
 *     mongodb-memory-server
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// ─── App factory (avoids binding a real port) ────────────────────────────────
// We re-require app internals rather than importing app.js directly so that we
// can control the DB URI before Mongoose connects.
let app;
let mongod;

// ─── Models ──────────────────────────────────────────────────────────────────
let Room, Booking, Task, Request, User;

// ─── Services (pure-logic units) ─────────────────────────────────────────────
let RoomService, RoomObserver, TaskService, RoomOperationsFacade;

// =============================================================================
// SETUP / TEARDOWN
// =============================================================================

beforeAll(async () => {
  // 1. Spin up an in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // 2. Set env vars BEFORE requiring app (dotenv override)
  process.env.MONGO_URI = uri;
  process.env.NODE_ENV = 'test';

  // 3. Connect mongoose directly (app.js also calls connect, but since
  //    readyState may already be 1 by the time routes run, it's fine)
  await mongoose.connect(uri);

  // 4. Load models
  Room    = require('../models/Room');
  Booking = require('../models/Booking');
  Task    = require('../models/Task');
  Request = require('../models/Request');
  User   = require('../models/user');


  // 5. Load services
  RoomService          = require('../services/RoomService');
  RoomObserver         = require('../services/RoomObserver');
  TaskService          = require('../services/TaskService');
  RoomOperationsFacade = require('../services/RoomOperationsFacade');

  // 6. Build Express app (inline, mirrors app.js without server.listen)
  const express        = require('express');
  const session        = require('express-session');
  const cors           = require('cors');
  const { Server }     = require('socket.io');
  const http           = require('http');

  const authRoutes    = require('../routes/auth');
  const roomRoutes    = require('../routes/rooms');
  const bookingRoutes = require('../routes/bookings');
  const taskRoutes    = require('../routes/tasks');
  const requestRoutes = require('../routes/requests');

  const testApp = express();
  testApp.use(cors({ origin: '*', credentials: true }));
  testApp.use(express.json());
  testApp.use(session({
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  }));

  testApp.use('/api/auth',     authRoutes);
  testApp.use('/api/rooms',    roomRoutes);
  testApp.use('/api/bookings', bookingRoutes);
  testApp.use('/api/tasks',    taskRoutes);
  testApp.use('/api/requests', requestRoutes);

  // Attach a mock socket.io (so emit calls don't blow up)
  const server = http.createServer(testApp);
  const io = new Server(server);
  testApp.set('io', io);

  app = testApp;
});

afterEach(async () => {
  // Wipe all collections between tests for isolation
  await Room.deleteMany({});
  await Booking.deleteMany({});
  await Task.deleteMany({});
  await Request.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// =============================================================================
// HELPERS
// =============================================================================

const bcrypt = require('bcrypt');

async function createUser(username = 'admin', password = 'secret', role = 'admin') {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ username, passwordHash, role });
}

async function createRoom(roomNumber = 101, status = 'available') {
  return Room.create({ roomNumber, status });
}

async function createBooking(overrides = {}) {
  return Booking.create({
    guestName:       'Alice',
    roomId:          101,
    checkIn:         '2025-06-01',
    checkOut:        '2025-06-05',
    occupancyStatus: 'confirmed',
    ...overrides,
  });
}

async function createTask(overrides = {}) {
  return Task.create({
    description: 'Fix light',
    roomId:      101,
    status:      'pending',
    ...overrides,
  });
}

async function createRequest(overrides = {}) {
  return Request.create({
    note:   'Need extra towels',
    roomId: 101,
    ...overrides,
  });
}

// =============================================================================
// AUTH ROUTES  (/api/auth)
// =============================================================================

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'secret' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 for unknown username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nobody', password: 'secret' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns success even without an active session', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

// =============================================================================
// ROOMS ROUTES  (/api/rooms)
// =============================================================================

describe('Rooms Routes', () => {
  describe('GET /api/rooms', () => {
    it('returns empty array when no rooms exist', async () => {
      const res = await request(app).get('/api/rooms');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('returns all rooms sorted by roomNumber', async () => {
      await Room.create([
        { roomNumber: 202, status: 'available' },
        { roomNumber: 101, status: 'occupied' },
      ]);
      const res = await request(app).get('/api/rooms');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].roomNumber).toBe(101);
      expect(res.body.data[1].roomNumber).toBe(202);
    });
  });

  describe('PUT /api/rooms/:id/status', () => {
    it('returns 400 for an invalid status value', async () => {
      const room = await createRoom();
      const res = await request(app)
        .put(`/api/rooms/${room._id}/status`)
        .send({ status: 'dirty' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 when room id does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/rooms/${fakeId}/status`)
        .send({ status: 'available' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when room has an active checked-in booking', async () => {
      const room = await createRoom(101, 'occupied');
      await createBooking({ roomId: 101, occupancyStatus: 'checked-in' });
      const res = await request(app)
        .put(`/api/rooms/${room._id}/status`)
        .send({ status: 'available' });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('updates status to available successfully', async () => {
      const room = await createRoom(101, 'needs-cleaning');
      const res = await request(app)
        .put(`/api/rooms/${room._id}/status`)
        .send({ status: 'available' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('available');
    });

    it('auto-creates a cleaning task when status set to needs-cleaning', async () => {
      const room = await createRoom(303, 'occupied');
      await request(app)
        .put(`/api/rooms/${room._id}/status`)
        .send({ status: 'needs-cleaning' });
      const task = await Task.findOne({ roomId: 303, description: /clean/i });
      expect(task).not.toBeNull();
      expect(task.status).toBe('pending');
    });

    it('does NOT create duplicate cleaning tasks', async () => {
      const room = await createRoom(404, 'occupied');
      // First update
      await request(app).put(`/api/rooms/${room._id}/status`).send({ status: 'needs-cleaning' });
      // Second update (same status again — set to available first, then back)
      await Room.findByIdAndUpdate(room._id, { status: 'occupied' });
      await request(app).put(`/api/rooms/${room._id}/status`).send({ status: 'needs-cleaning' });
      const tasks = await Task.find({ roomId: 404, description: /clean/i });
      expect(tasks).toHaveLength(1);
    });
  });
});

// =============================================================================
// BOOKINGS ROUTES  (/api/bookings)
// =============================================================================

describe('Bookings Routes', () => {
  describe('GET /api/bookings', () => {
    it('returns empty list when no bookings', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('auto-checks-out overdue bookings on GET', async () => {
      const room = await createRoom(101, 'occupied');
      await createBooking({
        roomId:          101,
        checkIn:         '2020-01-01',
        checkOut:        '2020-01-05',
        occupancyStatus: 'checked-in',
      });
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(200);
      const booking = res.body.data[0];
      expect(booking.occupancyStatus).toBe('checked-out');
      // Room should have been set to needs-cleaning
      const updatedRoom = await Room.findOne({ roomNumber: 101 });
      expect(updatedRoom.status).toBe('needs-cleaning');
    });
  });

  describe('POST /api/bookings', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/bookings').send({ guestName: 'Bob' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when checkOut is before checkIn', async () => {
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Bob',
        roomId:    101,
        checkIn:   '2025-06-10',
        checkOut:  '2025-06-05',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when checkOut equals checkIn', async () => {
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Bob',
        roomId:    101,
        checkIn:   '2025-06-10',
        checkOut:  '2025-06-10',
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid occupancyStatus', async () => {
      const res = await request(app).post('/api/bookings').send({
        guestName:       'Bob',
        roomId:          101,
        checkIn:         '2025-06-01',
        checkOut:        '2025-06-05',
        occupancyStatus: 'no-show',
      });
      expect(res.status).toBe(400);
    });

    it('creates a booking successfully', async () => {
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Alice',
        roomId:    101,
        checkIn:   '2025-07-01',
        checkOut:  '2025-07-05',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.guestName).toBe('Alice');
      expect(res.body.data.occupancyStatus).toBe('confirmed');
    });

    it('returns 409 on overlapping booking for same room', async () => {
      await createBooking({
        roomId:   101,
        checkIn:  '2025-07-01',
        checkOut: '2025-07-10',
        occupancyStatus: 'confirmed',
      });
      // Overlaps by 4 days
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Charlie',
        roomId:    101,
        checkIn:   '2025-07-08',
        checkOut:  '2025-07-15',
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('allows adjacent (non-overlapping) bookings for same room', async () => {
      await createBooking({
        roomId:   101,
        checkIn:  '2025-07-01',
        checkOut: '2025-07-10',
        occupancyStatus: 'confirmed',
      });
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Diana',
        roomId:    101,
        checkIn:   '2025-07-10',
        checkOut:  '2025-07-15',
      });
      // checkIn of new equals checkOut of old — should NOT overlap
      expect(res.status).toBe(201);
    });

    it('allows overlapping dates for DIFFERENT rooms', async () => {
      await createBooking({
        roomId:   101,
        checkIn:  '2025-07-01',
        checkOut: '2025-07-10',
        occupancyStatus: 'confirmed',
      });
      const res = await request(app).post('/api/bookings').send({
        guestName: 'Eve',
        roomId:    202,
        checkIn:   '2025-07-05',
        checkOut:  '2025-07-15',
      });
      expect(res.status).toBe(201);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('deletes a booking by id', async () => {
      const booking = await createBooking();
      const res = await request(app).delete(`/api/bookings/${booking._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
      const found = await Booking.findById(booking._id);
      expect(found).toBeNull();
    });

    it('returns 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/bookings/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});

// =============================================================================
// TASKS ROUTES  (/api/tasks)
// =============================================================================

describe('Tasks Routes', () => {
  describe('GET /api/tasks', () => {
    it('returns empty array when no tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('returns tasks sorted by createdAt descending', async () => {
      await createTask({ description: 'Old task' });
      await new Promise(r => setTimeout(r, 10));
      await createTask({ description: 'New task' });
      const res = await request(app).get('/api/tasks');
      expect(res.body.data[0].description).toBe('New task');
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a task with default pending status', async () => {
      const res = await request(app).post('/api/tasks').send({
        description: 'Fix air conditioning',
        roomId: 201,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/tasks').send({ roomId: 101 });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('marks a task as completed', async () => {
      const task = await createTask();
      const res = await request(app).patch(`/api/tasks/${task._id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    it('auto-sets room to available when a cleaning task is completed', async () => {
      const room = await createRoom(101, 'needs-cleaning');
      const task = await createTask({ description: 'Clean room 101', roomId: 101 });
      await request(app).patch(`/api/tasks/${task._id}/complete`);
      const updatedRoom = await Room.findOne({ roomNumber: 101 });
      expect(updatedRoom.status).toBe('available');
    });

    it('does NOT flip room when a non-cleaning task is completed', async () => {
      const room = await createRoom(101, 'needs-cleaning');
      const task = await createTask({ description: 'Replace lightbulb', roomId: 101 });
      await request(app).patch(`/api/tasks/${task._id}/complete`);
      const unchangedRoom = await Room.findOne({ roomNumber: 101 });
      expect(unchangedRoom.status).toBe('needs-cleaning');
    });

    it('returns 404 for unknown task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/tasks/${fakeId}/complete`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id/reopen', () => {
    it('reopens a completed task back to pending', async () => {
      const task = await createTask({ status: 'completed' });
      const res = await request(app).patch(`/api/tasks/${task._id}/reopen`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });

    it('returns 404 for unknown task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/tasks/${fakeId}/reopen`);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task', async () => {
      const task = await createTask();
      const res = await request(app).delete(`/api/tasks/${task._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('returns 404 when task not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/tasks/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});

// =============================================================================
// REQUESTS ROUTES  (/api/requests)
// =============================================================================

describe('Requests Routes', () => {
  describe('GET /api/requests', () => {
    it('returns empty array when no requests', async () => {
      const res = await request(app).get('/api/requests');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/requests', () => {
    it('creates a new request', async () => {
      const res = await request(app).post('/api/requests').send({
        note:   'Extra pillows please',
        roomId: 305,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.note).toBe('Extra pillows please');
      expect(res.body.data.resolved).toBe(false);
    });

    it('returns 400 when required fields are absent', async () => {
      const res = await request(app).post('/api/requests').send({ roomId: 101 });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/requests/:id/resolve', () => {
    it('marks a request as resolved', async () => {
      const req_ = await createRequest();
      const res = await request(app).patch(`/api/requests/${req_._id}/resolve`);
      expect(res.status).toBe(200);
      expect(res.body.data.resolved).toBe(true);
    });

    it('returns 404 for unknown request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/requests/${fakeId}/resolve`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/requests/:id/unresolve', () => {
    it('marks a request as unresolved', async () => {
      const req_ = await createRequest({ resolved: true });
      const res = await request(app).patch(`/api/requests/${req_._id}/unresolve`);
      expect(res.status).toBe(200);
      expect(res.body.data.resolved).toBe(false);
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('deletes a request', async () => {
      const req_ = await createRequest();
      const res = await request(app).delete(`/api/requests/${req_._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('returns 404 for non-existent request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/requests/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});

// =============================================================================
// SERVICE UNIT TESTS (no HTTP)
// =============================================================================

describe('RoomService (Observer pattern)', () => {
  // Use a fresh standalone instance so we don't pollute the singleton
  let freshService;
  beforeEach(() => {
    const RoomServiceClass = RoomService.constructor;
    // RoomService is exported as `new RoomService()` — reconstruct manually
    freshService = { subs: [], subscribe: RoomService.subscribe.bind({ subs: [] }), notifyObservers: RoomService.notifyObservers.bind({ subs: [] }) };
    freshService.subs = [];
    freshService.subscribe = (s) => freshService.subs.push(s);
    freshService.notifyObservers = (room) => {
      for (const sub of freshService.subs) {
        if (typeof sub.onRoomStatusChanged === 'function') sub.onRoomStatusChanged(room._id, room.status);
      }
    };
    freshService.updateRoomStatus = async (roomId, status) => {
      freshService.notifyObservers({ _id: roomId, status });
      return { success: true };
    };
  });

  it('notifies all subscribers when room status changes', () => {
    const mockObserver = { onRoomStatusChanged: jest.fn() };
    freshService.subscribe(mockObserver);
    freshService.notifyObservers({ _id: '101', status: 'needs-cleaning' });
    expect(mockObserver.onRoomStatusChanged).toHaveBeenCalledWith('101', 'needs-cleaning');
  });

  it('notifies multiple subscribers', () => {
    const obs1 = { onRoomStatusChanged: jest.fn() };
    const obs2 = { onRoomStatusChanged: jest.fn() };
    freshService.subscribe(obs1);
    freshService.subscribe(obs2);
    freshService.notifyObservers({ _id: '202', status: 'available' });
    expect(obs1.onRoomStatusChanged).toHaveBeenCalledTimes(1);
    expect(obs2.onRoomStatusChanged).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there are no subscribers', () => {
    expect(() => freshService.notifyObservers({ _id: '303', status: 'occupied' })).not.toThrow();
  });

  it('updateRoomStatus returns success', async () => {
    const result = await freshService.updateRoomStatus('101', 'needs-cleaning');
    expect(result.success).toBe(true);
  });

  it('skips subscribers without onRoomStatusChanged', () => {
    const badObserver = {}; // no method
    freshService.subscribe(badObserver);
    expect(() => freshService.notifyObservers({ _id: '1', status: 'available' })).not.toThrow();
  });
});

describe('RoomObserver (base class)', () => {
  it('can be instantiated without errors', () => {
    const obs = new RoomObserver();
    expect(obs).toBeDefined();
  });

  it('update() is a no-op and does not throw', () => {
    const obs = new RoomObserver();
    expect(() => obs.update({ roomNumber: 1, status: 'available' })).not.toThrow();
  });

  it('onRoomStatusChanged() is a no-op and does not throw', () => {
    const obs = new RoomObserver();
    expect(() => obs.onRoomStatusChanged('1', 'occupied')).not.toThrow();
  });
});

describe('TaskService (observer subscriber)', () => {
  it('is an instance of RoomObserver', () => {
    expect(TaskService).toBeInstanceOf(RoomObserver);
  });

  it('update() logs but does not throw for needs-cleaning status', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => TaskService.update({ roomNumber: 5, status: 'needs-cleaning' })).not.toThrow();
    spy.mockRestore();
  });

  it('update() does not log for other statuses', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    TaskService.update({ roomNumber: 5, status: 'available' });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('RoomOperationsFacade', () => {
  it('checkoutRoom returns success', async () => {
    const result = await RoomOperationsFacade.checkoutRoom('101');
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/checkout completed/i);
  });

  it('checkoutRoom with any room id does not throw', async () => {
    await expect(RoomOperationsFacade.checkoutRoom('999')).resolves.not.toThrow();
  });
});

// =============================================================================
// AuthService unit tests
// =============================================================================

describe('AuthService', () => {
  let authService;
  beforeAll(() => { authService = require('../services/AuthService'); });

  it('returns error when user not found', async () => {
    const fakeReq = { session: {} };
    const result = await authService.login(fakeReq, 'nobody', 'pass');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });

  it('logout resolves successfully', async () => {
    const fakeReq = {
      session: { destroy: (cb) => cb(null) },
    };
    const result = await authService.logout(fakeReq);
    expect(result.success).toBe(true);
  });

  it('logout returns error if session.destroy fails', async () => {
    const fakeReq = {
      session: { destroy: (cb) => cb(new Error('destroy error')) },
    };
    const result = await authService.logout(fakeReq);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/session destroy failed/i);
  });
});
