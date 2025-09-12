import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server;

export const initializeSocket = (socketServer: Server) => {
  io = socketServer;

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected via Socket.IO`);

    try {
      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join user to all their group rooms
      const userMemberships = await prisma.groupMembership.findMany({
        where: { userId: socket.userId! },
        include: { group: true }
      });

      for (const membership of userMemberships) {
        socket.join(`group:${membership.groupId}`);
      }

      // Handle joining specific group rooms
      socket.on('join-group', (groupId: string) => {
        socket.join(`group:${groupId}`);
      });

      // Handle leaving specific group rooms
      socket.on('leave-group', (groupId: string) => {
        socket.leave(`group:${groupId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });
};

// Emit notification to specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit notification to all group members
export const emitToGroup = (groupId: string, event: string, data: any) => {
  if (io) {
    io.to(`group:${groupId}`).emit(event, data);
  }
};

// Emit notification for project updates
export const emitProjectUpdate = (groupId: string, project: any) => {
  if (io) {
    io.to(`group:${groupId}`).emit('project-updated', project);
  }
};

// Emit notification for new projects
export const emitNewProject = (groupId: string, project: any) => {
  if (io) {
    io.to(`group:${groupId}`).emit('project-created', project);
  }
};

// Emit notification for project status change
export const emitProjectStatusChange = (groupId: string, project: any) => {
  if (io) {
    io.to(`group:${groupId}`).emit('project-status-changed', project);
  }
};

// Emit real-time notification
export const emitNotification = (userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('new-notification', notification);
  }
};
