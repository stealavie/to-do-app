import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import projectRoutes from './routes/projects';
import tasksRoutes from './routes/tasks';
import notificationRoutes from './routes/notifications';
import chatRoutes from './routes/chat';
import analyticsRoutes from './routes/analytics';
import { errorHandler, notFound } from './middleware/error';
import { initializeSocket } from './services/socketService';
import { notificationScheduler } from './services/notificationScheduler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Projects routes are nested under groups - using param merging
app.use('/api/groups/:groupId/projects', projectRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO
initializeSocket(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO enabled for real-time notifications`);
  
  // Start the Smart Notification Scheduler
  notificationScheduler.start();
  console.log(`⏰ Smart Notification Engine (Module 4) activated`);
});

export default app;
export { io };
