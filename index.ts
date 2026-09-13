import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import salonRoutes from './routes/salonRoutes';
import bookingRoutes from './routes/bookingRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Salon Backend is running!'
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', salonRoutes);
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/salon-db';

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });