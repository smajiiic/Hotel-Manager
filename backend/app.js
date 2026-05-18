const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const roomOpsFacade = require('./services/RoomOperationsFacade');

const app = express();

// middleware for parsing json
app.use(express.json());

// session configuration
app.use(session({
  secret: 'hotel_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day session
}));

// API routes integration
app.use('/api/auth', authRoutes);

// temporary route to test facade and observer patterns
app.get('/test-checkout', async (req, res) => {
  const result = await roomOpsFacade.checkoutRoom('101');
  res.json(result);
});

// base route
app.get('/', (req, res) => {
  res.send('Hotel Manager Backend is running...');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});