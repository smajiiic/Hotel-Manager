const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const roomOpsFacade = require('./services/RoomOperationsFacade');

const app = express();

// 1) Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotelDB')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 2) CORS — allow Vite dev server to send the session cookie
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: 'hotel_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/test-checkout', async (req, res) => {
  const result = await roomOpsFacade.checkoutRoom('101');
  res.json(result);
});

app.get('/', (req, res) => {
  res.send('Hotel Manager Backend is running...');
});

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});