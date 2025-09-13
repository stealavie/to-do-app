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

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Configuration ---
// Define the list of allowed origins for your application
const allowedOrigins = [
  'http://localhost:5173', // Your local development frontend
];

// Add the production frontend URL from environment variables if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (
    origin: string | undefined, 
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (e.g., mobile apps, curl) and from whitelisted domains
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS policy'));
    }
  },
  credentials: true
};
// --- Middleware Setup ---

// Security middleware
app.use(helmet());
app.use(cors(corsOptions)); // Apply the dynamic CORS options

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Limit each IP to 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Request logging
app.use(morgan('combined'));

// Body parsing middleware to handle JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Health check endpoint to verify server status
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

// Nested projects routes
app.use('/api/groups/:groupId/projects', projectRoutes);

// --- Error Handling ---

// 404 handler for requests to non-existent routes
app.use(notFound);

// Global error handler to catch all other errors
app.use(errorHandler);

// --- Server and Socket.IO Setup ---

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Socket.IO can accept the array of origins directly
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO event listeners and services
initializeSocket(io);

// --- Start Server ---

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO enabled for real-time notifications`);
  
  // Start the Smart Notification Scheduler
  notificationScheduler.start();
  console.log(`⏰ Smart Notification Engine activated`);
});

// Export the app and io instances for potential use in other modules (e.g., testing)
export default app;
export { io };