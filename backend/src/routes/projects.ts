import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createProjectSchema, updateProjectSchema } from '../schemas/validation';
import { createTaskAssignmentNotification } from '../services/notificationService';

const router = Router({ mergeParams: true });

// POST /api/groups/:groupId/projects - Create a new project
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { title, description, dueDate } = createProjectSchema.parse(req.body);
    const userId = req.user!.userId;

    // Debug logging
    console.log('Request params:', req.params);
    console.log('Group ID:', groupId);
    console.log('Request URL:', req.url);

    // Validate that groupId exists
    if (!groupId) {
      return res.status(400).json({
        error: 'Group ID is required',
        debug: {
          params: req.params,
          url: req.url
        }
      });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: groupId
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

    // Validate that groupId exists
    if (!groupId) {
      return res.status(400).json({
        error: 'Group ID is required'
      });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: groupId
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
        assignedUser: {
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
    });

    res.json({ projects });
  } catch (error) {
    throw error;
  }
});

// PUT /api/groups/:groupId/projects/:projectId/assign - Assign project to a user
router.put('/:projectId/assign', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, projectId } = req.params;
    const { assignedTo } = req.body;
    const userId = req.user!.userId;

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'You are not a member of this group'
      });
    }

    // Validate that the project exists and belongs to the group
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        groupId: groupId
      }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // If assignedTo is provided, validate that the user is a member of the group
    if (assignedTo) {
      const assigneeMembership = await prisma.groupMembership.findUnique({
        where: {
          userId_groupId: {
            userId: assignedTo,
            groupId: groupId
          }
        }
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          error: 'Assigned user is not a member of this group'
        });
      }
    }

    // Update the project assignment
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        assignedTo: assignedTo || null
      },
      include: {
        assignedUser: {
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
    });

    // Create notification for task assignment (only if assigning, not unassigning)
    if (assignedTo && assignedTo !== existingProject.assignedTo) {
      try {
        // Get the username of the user who is doing the assignment
        const assigningUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true }
        });

        await createTaskAssignmentNotification(
          assignedTo,
          updatedProject.title,
          assigningUser?.username,
          updatedProject.id,
          updatedProject.groupId,
          updatedProject.group?.name
        );
      } catch (notificationError) {
        console.error('Error creating task assignment notification:', notificationError);
        // Don't fail the assignment if notification creation fails
      }
    }

    res.json({
      message: assignedTo ? 'Project assigned successfully' : 'Project unassigned successfully',
      project: updatedProject
    });
  } catch (error) {
    throw error;
  }
});

// PUT /api/groups/:groupId/projects/:projectId - Update a project
router.put('/:projectId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, projectId } = req.params;
    const { title, description, dueDate } = updateProjectSchema.parse(req.body);
    const userId = req.user!.userId;

    // Validate that groupId and projectId exist
    if (!groupId || !projectId) {
      return res.status(400).json({
        error: 'Group ID and Project ID are required'
      });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'You are not a member of this group'
      });
    }

    // Check if project exists and belongs to the group
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        groupId: groupId
      }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Update the project (only include fields that are provided)
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: updateData,
      include: {
        assignedUser: {
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
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    throw error;
  }
});

// DELETE /api/groups/:groupId/projects/:projectId - Delete a project
router.delete('/:projectId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, projectId } = req.params;
    const userId = req.user!.userId;

    // Validate that groupId and projectId exist
    if (!groupId || !projectId) {
      return res.status(400).json({
        error: 'Group ID and Project ID are required'
      });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'You are not a member of this group'
      });
    }

    // Check if project exists and belongs to the group
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        groupId: groupId
      }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Delete the project
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    throw error;
  }
});

export default router;
