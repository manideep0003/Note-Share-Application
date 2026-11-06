import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify server and database status
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    message: 'NoteShare API is running smoothly',
    data: {
      status: 'UP',
      uptime: `${process.uptime().toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      database: dbStatusMap[dbState] || 'unknown'
    }
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the NoteShare API',
    data: {
      docs: '/api/health',
      version: '1.0.0'
    }
  });
});

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Notes Routes
app.use('/api/notes', noteRoutes);

// Mount Bookmark Routes
app.use('/api/bookmarks', bookmarkRoutes);

// Mount User Routes
app.use('/api/users', userRoutes);

// Fallback 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `NoteShare server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
});

export default app;

