import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { addDays, subDays, format, startOfDay, endOfDay, getHours } from 'date-fns';

const router = express.Router();

// GET /api/analytics - Get productivity analytics
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's groups to filter tasks
    const userGroups = await prisma.groupMembership.findMany({
      where: { userId },
      select: { groupId: true }
    });

    const groupIds = userGroups.map(membership => membership.groupId);

    if (groupIds.length === 0) {
      return res.json({
        tasksCompletedLast7Days: Array.from({ length: 7 }, (_, i) => ({
          day: format(subDays(new Date(), 6 - i), 'EEE'),
          count: 0
        })),
        productivityByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: String(i).padStart(2, '0') + ':00',
          completed: 0
        }))
      });
    }

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    // Get completed tasks from the last 7 days
    const completedTasks = await prisma.project.findMany({
      where: {
        groupId: { in: groupIds },
        status: 'DONE',
        updatedAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      select: {
        updatedAt: true,
        status: true
      }
    });

    // Group tasks by day for last 7 days
    const tasksCompletedLast7Days = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const tasksCompletedOnDay = completedTasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      return {
        day: format(day, 'EEE'),
        count: tasksCompletedOnDay.length
      };
    });

    // Group tasks by hour of completion
    const productivityByHour = Array.from({ length: 24 }, (_, hour) => {
      const tasksCompletedInHour = completedTasks.filter(task => {
        const taskHour = getHours(new Date(task.updatedAt));
        return taskHour === hour;
      });

      return {
        hour: String(hour).padStart(2, '0') + ':00',
        completed: tasksCompletedInHour.length
      };
    });

    res.json({
      tasksCompletedLast7Days,
      productivityByHour
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// GET /api/analytics/productivity-trends - Get detailed productivity trends
router.get('/productivity-trends', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's groups
    const userGroups = await prisma.groupMembership.findMany({
      where: { userId },
      select: { groupId: true }
    });

    const groupIds = userGroups.map(membership => membership.groupId);

    if (groupIds.length === 0) {
      return res.json({
        weeklyTrend: [],
        completionRate: 0,
        averageTasksPerDay: 0
      });
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Get all tasks from last 30 days
    const allTasks = await prisma.project.findMany({
      where: {
        groupId: { in: groupIds },
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const completedTasks = allTasks.filter(task => task.status === 'DONE');
    const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    const averageTasksPerDay = completedTasks.length / 30;

    // Weekly trend over last 4 weeks
    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(now, (i + 1) * 7);
      const weekEnd = subDays(now, i * 7);
      
      const weekCompletedTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      return {
        week: `Week ${4 - i}`,
        completed: weekCompletedTasks.length,
        weekStart: format(weekStart, 'MMM dd'),
        weekEnd: format(weekEnd, 'MMM dd')
      };
    });

    res.json({
      weeklyTrend,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTasksPerDay: Math.round(averageTasksPerDay * 100) / 100
    });

  } catch (error) {
    console.error('Productivity trends error:', error);
    res.status(500).json({ error: 'Failed to fetch productivity trends' });
  }
});

export default router;