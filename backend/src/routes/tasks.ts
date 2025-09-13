import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks - Get paginated tasks for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      status,
      page = '1',
      pageSize = '20',
      priority,
      groupId
    } = req.query;

    // Parse and validate pagination parameters
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10))); // Max 100 items per page
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filter conditions
    const whereClause: any = {
      // Only show projects from groups where the user is a member
      group: {
        memberships: {
          some: {
            userId: userId
          }
        }
      }
    };

    // Status filtering - default to active tasks (PLANNING and IN_PROGRESS)
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      const validStatuses = statusArray.filter(s => 
        ['PLANNING', 'IN_PROGRESS', 'DONE'].includes(s as string)
      );
      if (validStatuses.length > 0) {
        whereClause.status = { in: validStatuses };
      }
    } else {
      // Default to active tasks only
      whereClause.status = { in: ['PLANNING', 'IN_PROGRESS'] };
    }

    // Priority filtering
    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority as string)) {
      whereClause.priority = priority;
    }

    // Group filtering
    if (groupId) {
      whereClause.groupId = groupId;
    }

    // Get tasks with pagination
    const [tasks, totalCount] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        orderBy: [
          { priority: 'desc' }, // HIGH priority first
          { dueDate: 'asc' },   // Earlier due dates first
          { createdAt: 'desc' }  // Newest first for same priority/due date
        ],
        skip: offset,
        take: pageSizeNum,
        include: {
          assignedUser: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          lastEditor: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.project.count({
        where: whereClause
      })
    ]);

    // Calculate if there are more pages
    const hasNextPage = offset + pageSizeNum < totalCount;
    const totalPages = Math.ceil(totalCount / pageSizeNum);

    res.json({
      tasks,
      pagination: {
        currentPage: pageNum,
        pageSize: pageSizeNum,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/tasks/stats - Get task statistics for the authenticated user
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await prisma.project.groupBy({
      by: ['status'],
      where: {
        group: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      },
      _count: {
        status: true
      }
    });

    // Transform stats into a more useful format
    const taskStats = {
      planning: 0,
      inProgress: 0,
      done: 0,
      total: 0
    };

    stats.forEach(stat => {
      const count = stat._count.status;
      taskStats.total += count;
      
      switch (stat.status) {
        case 'PLANNING':
          taskStats.planning = count;
          break;
        case 'IN_PROGRESS':
          taskStats.inProgress = count;
          break;
        case 'DONE':
          taskStats.done = count;
          break;
      }
    });

    res.json(taskStats);

  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({
      error: 'Failed to fetch task statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;