import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createGroupSchema, joinGroupSchema, inviteUserSchema } from '../schemas/validation';

const router = Router();

// GET /api/groups - Get all groups for the authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const groups = await prisma.learningGroup.findMany({
      where: {
        memberships: {
          some: {
            userId
          }
        }
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        projects: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ groups });
  } catch (error) {
    throw error;
  }
});

// POST /api/groups - Create a new learning group
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, isPublic } = createGroupSchema.parse(req.body);
    const userId = req.user!.userId;

    const group = await prisma.learningGroup.create({
      data: {
        name,
        description,
        isPublic,
        memberships: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    throw error;
  }
});

// GET /api/groups/:id - Get group details
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const group = await prisma.learningGroup.findFirst({
      where: {
        id,
        memberships: {
          some: {
            userId
          }
        }
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        projects: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Group not found or you are not a member'
      });
    }

    res.json({ group });
  } catch (error) {
    throw error;
  }
});

// POST /api/groups/join - Join a group using invite code
router.post('/join', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inviteCode } = joinGroupSchema.parse(req.body);
    const userId = req.user!.userId;

    // Find group by invite code
    const group = await prisma.learningGroup.findUnique({
      where: { inviteCode }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Invalid invite code'
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id
        }
      }
    });

    if (existingMembership) {
      return res.status(409).json({
        error: 'You are already a member of this group'
      });
    }

    // Add user to group
    const membership = await prisma.groupMembership.create({
      data: {
        userId,
        groupId: group.id,
        role: 'MEMBER'
      },
      include: {
        group: {
          include: {
            memberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Successfully joined the group',
      membership
    });
  } catch (error) {
    throw error;
  }
});

// POST /api/groups/:id/invite - Invite a user to the group
router.post('/:id/invite', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = inviteUserSchema.parse(req.body);
    const userId = req.user!.userId;

    // Check if the requesting user is an OWNER or ADMIN
    const requesterMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: id
        }
      }
    });

    if (!requesterMembership || (requesterMembership.role !== 'OWNER' && requesterMembership.role !== 'ADMIN')) {
      return res.status(403).json({
        error: 'Only group owners and admins can invite users'
      });
    }

    // Find user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { username }
    });

    if (!userToInvite) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: userToInvite.id,
          groupId: id
        }
      }
    });

    if (existingMembership) {
      return res.status(409).json({
        error: 'User is already a member of this group'
      });
    }

    // Add user to group
    const membership = await prisma.groupMembership.create({
      data: {
        userId: userToInvite.id,
        groupId: id,
        role: 'MEMBER'
      },
      include: {
        user: {
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

    res.status(201).json({
      message: 'User invited successfully',
      membership
    });
  } catch (error) {
    throw error;
  }
});

export default router;
