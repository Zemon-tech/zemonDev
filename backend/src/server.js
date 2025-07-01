import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import { connectMongoDB, redisClient, socketRedis } from './config/database.js';
import { notFound, errorHandler } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './api/index.js';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  path: process.env.WS_PATH,
});

// Set up Socket.IO Redis adapter
const pubClient = socketRedis;
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });

      // Join user-specific room for notifications
      if (socket.handshake.auth.userId) {
        socket.join(`user:${socket.handshake.auth.userId}`);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  
  try {
    // Close HTTP server
    httpServer.close(() => {
      logger.info('HTTP server closed');
    });

    // Close Socket.IO connections
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    // Close database connections
    await Promise.all([
      redisClient.quit(),
      socketRedis.quit(),
      pubClient.quit(),
      subClient.quit(),
    ]);

    logger.info('All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Export for testing
export { app, io };

// Start the server
startServer(); 