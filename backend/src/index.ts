// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { createServer } from 'http';

import connectDB from './config/database';
import { connectRedis } from './config/redis';
import apiRoutes from './api';
import errorMiddleware from './middleware/error.middleware';
import AppError from './utils/AppError';
import { initializeSocketIO } from './services/socket.service';

console.log('[DEBUG] CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY);
console.log('[DEBUG] CLERK_JWT_KEY:', process.env.CLERK_JWT_KEY);
console.log('[DEBUG] CLERK_ISSUER:', process.env.CLERK_ISSUER);

// Initialize Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Connect to MongoDB
connectDB();

// Connect to Redis
connectRedis();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Define allowed origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5175'
];

// CORS - must be before API routes
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie']
  })
);

// Add Clerk authentication (but don't require it)
app.use(ClerkExpressWithAuth({
  // Ensure Clerk properly handles the Bearer token in the Authorization header
  jwtKey: process.env.CLERK_JWT_KEY,
  authorizedParties: allowedOrigins
}));

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorMiddleware);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Start server
const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_IO_PORT || PORT;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Socket.IO available on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Gracefully close server and exit
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Gracefully close server and exit
  server.close(() => {
    process.exit(1);
  });
});

export default app; 
 