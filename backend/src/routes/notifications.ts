import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(authenticate);

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for the current user
 */
router.get('/unread-count', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put('/:id/read', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ 
      message: 'Notification marked as read',
      notification: updatedNotification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
router.put('/mark-all-read', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false 
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for the current user
 */
router.delete('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.deleteMany({
      where: { userId },
    });

    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

export default router;
