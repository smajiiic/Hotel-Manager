const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const taskRoutes = require('./routes/tasks');
const requestRoutes = require('./routes/requests');
const roomOpsFacade = require('./services/RoomOperationsFacade');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

if (isProduction) app.set('trust proxy', 1);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotelDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

app.use(session({
  secret: 'hotel_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', requestRoutes);

app.get('/test-checkout', async (req, res) => {
  const result = await roomOpsFacade.checkoutRoom('101');
  res.json(result);
});

app.get('/', (req, res) => res.send('Hotel Manager Backend is running...'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: frontendUrl, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

app.set('io', io);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
