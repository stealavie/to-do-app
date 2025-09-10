import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createProjectSchema } from '../schemas/validation';

const router = Router();

// POST /api/groups/:groupId/projects - Create a new project
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { title, description, dueDate } = createProjectSchema.parse(req.body);
    const userId = req.user!.userId;

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'You are not a member of this group'
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        groupId
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    throw error;
  }
});

// GET /api/groups/:groupId/projects - Get all projects for a group
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user!.userId;

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'You are not a member of this group'
      });
    }

    // Get all projects for the group
    const projects = await prisma.project.findMany({
      where: {
        groupId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ projects });
  } catch (error) {
    throw error;
  }
});

export default router;
