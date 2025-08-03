// server.js
// Basic Express server setup for Personal Knowledge Base with AI Search

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Health check route
app.get('/', (req, res) => {
  res.send('Personal Knowledge Base API is running!');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Auth routes

const notesRoutes = require('./routes/notes');
app.use('/api/notes', notesRoutes); // Notes routes

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server only after DB connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
