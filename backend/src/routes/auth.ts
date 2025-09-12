import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema, updateUsernameSchema, updatePasswordSchema } from '../schemas/validation';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    throw error;
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    throw error;
  }
});

// PUT /api/auth/update-username
router.put('/update-username', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = updateUsernameSchema.parse(req.body);
    const userId = req.user!.userId;

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: userId
        }
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Username already taken',
        message: 'This username is already in use by another user'
      });
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Username updated successfully',
      user: updatedUser
    });
  } catch (error) {
    throw error;
  }
});

// PUT /api/auth/update-password
router.put('/update-password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
    const userId = req.user!.userId;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'The current password you entered is incorrect'
      });
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    throw error;
  }
});

export default router;
