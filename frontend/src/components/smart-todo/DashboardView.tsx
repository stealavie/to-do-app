import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { format, differenceInHours, parseISO } from 'date-fns';
import { useTasks } from '../../hooks/useTasks';
import { projectsApi } from '../../services/api';
import type { Project, SmartTask } from '../../types';

interface TaskItemProps {
  task: SmartTask;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: SmartTask) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  // Calculate urgency level based on due date proximity
  const urgencyLevel = useMemo(() => {
    if (!task.dueDate) return 'low';
    
    const now = new Date();
    const dueDate = parseISO(task.dueDate);
    const hoursUntilDue = differenceInHours(dueDate, now);
    
    if (hoursUntilDue <= 24) return 'high';
    if (hoursUntilDue <= 48) return 'medium';
    return 'low';
  }, [task.dueDate]);

  // Get border color based on urgency
  const getBorderColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#f44336'; // Red
      case 'medium': return '#ff9800'; // Orange/Yellow
      case 'low': return '#4caf50'; // Green
      default: return '#e0e0e0'; // Gray
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    try {
      const completed = task.status !== 'DONE';
      await onToggleComplete(task.id, completed);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: `4px solid ${getBorderColor(urgencyLevel)}`,
        opacity: task.status === 'DONE' ? 0.7 : 1,
        position: 'relative',
        '&:hover': {
          boxShadow: 3,
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Completion Checkbox */}
          <Checkbox
            checked={task.status === 'DONE'}
            onChange={handleToggleComplete}
            disabled={isCompleting}
            sx={{ mt: -1 }}
          />
          
          {/* Task Content */}
          <Box flex={1}>
            {/* Title and Priority */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                  flex: 1
                }}
              >
                {task.title}
              </Typography>
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority) as any}
                size="small"
                icon={<FlagIcon />}
              />
            </Box>

            {/* Description */}
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 2 }}
              >
                {task.description}
              </Typography>
            )}

            {/* Deadlines Section */}
            <Box display="flex" flex-wrap="wrap" gap={2} mb={2}>
              {/* Official Deadline */}
              {task.dueDate && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Due: {format(parseISO(task.dueDate), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              )}

              {/* Realistic Deadline (AI-generated) */}
              {task.realisticDeadline && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon fontSize="small" color="primary" />
                  <Typography variant="caption" color="primary">
                    Realistic: {format(parseISO(task.realisticDeadline), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Group and Assignment Info */}
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              {task.group && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <GroupIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {task.group.name}
                  </Typography>
                </Box>
              )}

              {task.assignedUser && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                    {task.assignedUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {task.assignedUser.username}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* AI Completion Probability */}
            {task.completionProbability !== undefined && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  AI Confidence:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={task.completionProbability * 100}
                    size={20}
                    thickness={4}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {Math.round(task.completionProbability * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={1}>
            <IconButton 
              size="small" 
              onClick={() => onEdit(task)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDelete(task.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface EditTaskDialogProps {
  task: SmartTask | null;
  open: boolean;
  onClose: () => void;
  onSave: (task: SmartTask, updates: Partial<Project>) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [status, setStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'DONE'>('PLANNING');
  const [dueDate, setDueDate] = useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : ''); // Format for datetime-local input
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;

    const updates: Partial<Project> = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    onSave(task, updates);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              label="Priority"
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              label="Status"
            >
              <MenuItem value="PLANNING">Planning</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const DashboardView: React.FC = () => {
  const [editingTask, setEditingTask] = useState<SmartTask | null>(null);
  const { pages, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useTasks({
    status: ['PLANNING', 'IN_PROGRESS'], // Only show active tasks
    pageSize: 20
  });

  // Transform Project data to SmartTask
  const tasks: SmartTask[] = useMemo(() => {
    if (!pages) return [];
    
    return pages.flatMap((page: any) => 
      page.tasks.map((task: any) => ({
        ...task,
        urgencyLevel: (() => {
          if (!task.dueDate) return 'low' as const;
          const now = new Date();
          const dueDate = parseISO(task.dueDate);
          const hoursUntilDue = differenceInHours(dueDate, now);
          
          if (hoursUntilDue <= 24) return 'high' as const;
          if (hoursUntilDue <= 48) return 'medium' as const;
          return 'low' as const;
        })(),
        // Mock AI features for now - these would come from the AI engine
        realisticDeadline: task.dueDate ? 
          new Date(new Date(task.dueDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        completionProbability: Math.random() * 0.4 + 0.6, // Mock 60-100% probability
      }))
    );
  }, [pages]);

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      // Find the task to get its groupId
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await projectsApi.updateProject(task.groupId, taskId, {
        status: completed ? 'DONE' : 'IN_PROGRESS'
      });
      // The query will be invalidated automatically by the mutation
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEditTask = (task: SmartTask) => {
    setEditingTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Find the task to get its groupId
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        await projectsApi.deleteProject(task.groupId, taskId);
        // The query will be invalidated automatically by the mutation
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSaveTask = async (task: SmartTask, updates: Partial<Project>) => {
    try {
      await projectsApi.updateProject(task.groupId, task.id, updates);
      // The query will be invalidated automatically by the mutation
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load tasks. Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Do Now
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Your AI-prioritized tasks for maximum productivity
      </Typography>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Alert severity="info">
          No active tasks found. Great job! 🎉
        </Alert>
      ) : (
        <>
          <List sx={{ width: '100%' }}>
            {tasks.map((task) => (
              <ListItem key={task.id} sx={{ px: 0 }}>
                <TaskItem
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </ListItem>
            ))}
          </List>

          {/* Load More Button */}
          {hasNextPage && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outlined"
                startIcon={isFetchingNextPage ? <CircularProgress size={16} /> : undefined}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Tasks'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </Box>
  );
};

export default DashboardView;