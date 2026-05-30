require('dotenv').config(); // Loads your MONGO_URI from the .env file
const express = require('express');
const mongoose = require('mongoose');

// Import the route files you created in Step 2
const taskRoutes = require('./routes/tasks');
const requestRoutes = require('./routes/requests');
const roomRoutes = require('./routes/rooms');

const app = express();

// Middleware: This is CRITICAL. It allows your server to read JSON bodies sent by the frontend
app.use(express.json());

// Bind your routes to the specific URLs your partners requested
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/rooms', roomRoutes);

// Connect to MongoDB using Mongoose (matching your seed.js setup)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Hotel Manager Backend running on port ${PORT}`));
