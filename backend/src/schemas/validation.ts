import { z } from 'zod';

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Learning Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
  description: z.string().optional()
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required')
});

export const inviteUserSchema = z.object({
  username: z.string().min(1, 'Username is required')
});

// Project schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200, 'Project title must be less than 200 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    // Handle both date strings (YYYY-MM-DD) and datetime strings
    if (val.includes('T')) {
      // Already a datetime string, validate it
      return z.string().datetime().parse(val);
    } else {
      // Date string, convert to datetime (end of day)
      try {
        const date = new Date(val + 'T23:59:59.999Z');
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toISOString();
      } catch {
        throw new Error('Invalid date format');
      }
    }
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'DONE']).default('PLANNING').optional()
});

// For updating projects - allows partial updates
export const updateProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200, 'Project title must be less than 200 characters').optional(),
  description: z.string().optional(),
  dueDate: z.string().optional().transform((val) => {
    if (!val) return undefined;
    // Handle both date strings (YYYY-MM-DD) and datetime strings
    if (val.includes('T')) {
      // Already a datetime string, validate it
      return z.string().datetime().parse(val);
    } else {
      // Date string, convert to datetime (end of day)
      try {
        const date = new Date(val + 'T23:59:59.999Z');
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date.toISOString();
      } catch {
        throw new Error('Invalid date format');
      }
    }
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'DONE']).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
