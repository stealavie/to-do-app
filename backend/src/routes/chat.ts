import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = express.Router();

// Validation schema for chat message request
const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  apiKey: z.string().min(1),
});

// Helper function to get user's project context
async function getUserProjectContext(userId: string) {
  try {
    // Get user's groups and projects
    const userMemberships = await prisma.groupMembership.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            projects: {
              include: {
                assignedUser: {
                  select: { username: true }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    // Get user's assigned projects across all groups
    const assignedProjects = await prisma.project.findMany({
      where: { assignedTo: userId },
      include: {
        group: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the context data
    const groups = userMemberships.map(membership => ({
      name: membership.group.name,
      role: membership.role,
      projectCount: membership.group.projects.length,
      projects: membership.group.projects.map(project => ({
        title: project.title,
        status: project.status,
        priority: project.priority,
        dueDate: project.dueDate,
        assignedTo: project.assignedUser?.username || 'Unassigned',
        description: project.description
      }))
    }));

    const myAssignedProjects = assignedProjects.map(project => ({
      title: project.title,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      groupName: project.group.name,
      description: project.description
    }));

    return {
      groups,
      assignedProjects: myAssignedProjects,
      totalGroups: groups.length,
      totalProjects: groups.reduce((sum, group) => sum + group.projectCount, 0),
      myAssignedCount: myAssignedProjects.length
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return null;
  }
}

// Generate system prompt with user context
function generateSystemPrompt(userContext: any) {
  if (!userContext) {
    return `You are a helpful AI assistant integrated into a collaborative learning platform. 
    You help users manage their projects, provide recommendations, and assist with their learning goals. 
    Be friendly, concise, and actionable in your responses.`;
  }

  const contextSummary = `
User Context Summary:
- Member of ${userContext.totalGroups} learning groups
- Total projects across all groups: ${userContext.totalProjects}
- Personally assigned projects: ${userContext.myAssignedCount}

Groups and Projects:
${userContext.groups.map((group: any) => `
- Group: "${group.name}" (Role: ${group.role})
  Projects (${group.projectCount}):
  ${group.projects.map((project: any) => `
    * "${project.title}" - Status: ${project.status}, Priority: ${project.priority}
      Assigned to: ${project.assignedTo}
      ${project.dueDate ? `Due: ${new Date(project.dueDate).toLocaleDateString()}` : 'No due date'}
      ${project.description ? `Description: ${project.description}` : ''}
  `).join('')}
`).join('')}

My Assigned Projects:
${userContext.assignedProjects.map((project: any) => `
- "${project.title}" in "${project.groupName}"
  Status: ${project.status}, Priority: ${project.priority}
  ${project.dueDate ? `Due: ${new Date(project.dueDate).toLocaleDateString()}` : 'No due date'}
  ${project.description ? `Description: ${project.description}` : ''}
`).join('')}
  `;

  return `You are a helpful AI assistant integrated into a collaborative learning platform. 
  You help users manage their projects, provide recommendations, and assist with their learning goals.
  
  Based on the user's current project data, provide intelligent recommendations and assistance.
  Analyze their workload, identify potential issues (like approaching deadlines), suggest improvements,
  and help them stay organized and productive.
  
  Be friendly, concise, and actionable in your responses. When relevant, reference specific projects
  or groups from their data.
  
  ${contextSummary}
  
  Focus on being helpful with:
  - Project prioritization and time management
  - Deadline awareness and planning
  - Collaboration suggestions
  - Learning goal recommendations
  - Productivity tips specific to their current workload`;
}

// POST /api/chat/message - Send message to Gemini
router.post('/message', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, apiKey } = chatMessageSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get user's project context
    const userContext = await getUserProjectContext(userId);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate system prompt with user context
    const systemPrompt = generateSystemPrompt(userContext);

    // Create the full prompt
    const fullPrompt = `${systemPrompt}

User message: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    res.json({
      message: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    
    // Handle different types of errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(400).json({ 
        error: 'Invalid API key. Please check your Gemini API key.' 
      });
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please check your Gemini API usage limits.' 
      });
    }

    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.' 
    });
  }
});

// GET /api/chat/context - Get user's project context (for debugging)
router.get('/context', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userContext = await getUserProjectContext(userId);
    res.json(userContext);

  } catch (error) {
    console.error('Context fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

export default router;