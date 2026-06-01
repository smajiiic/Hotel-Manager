const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const taskRoutes = require('./routes/tasks');
const requestRoutes = require('./routes/requests');
const roomOpsFacade = require('./services/RoomOperationsFacade');

const app = express();

const isProd = process.env.NODE_ENV === 'production';
if (isProd) app.set('trust proxy', 1); // required so secure cookies work behind Railway's proxy

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotelDB')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://hotel-manager.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hotel_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd, // requires HTTPS (Railway provides)
    },
  })
);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', requestRoutes);

app.get('/test-checkout', async (req, res) => {
  const result = await roomOpsFacade.checkoutRoom('101');
  res.json(result);
});

app.get('/', (req, res) => {
  res.send('Hotel Manager Backend is running...');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
