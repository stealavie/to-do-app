import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO, addMonths, addWeeks, subMonths, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import {
  Flag as FlagIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import type { CalendarEvent, SmartTask } from '../../types';

// Import CSS for react-big-calendar
import './calendar-styles.css';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TaskDetailModalProps {
  task: SmartTask | null;
  open: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, open, onClose }) => {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_PROGRESS': return 'primary';
      case 'PLANNING': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" flex={1}>
            {task.title}
          </Typography>
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority) as any}
            size="small"
            icon={<FlagIcon />}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Description */}
          {task.description && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
            </Box>
          )}

          {/* Status */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle2">Status:</Typography>
            <Chip
              label={task.status.replace('_', ' ')}
              color={getStatusColor(task.status) as any}
              size="small"
            />
          </Box>

          {/* Deadlines */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Deadlines
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {task.dueDate && (
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Official: {format(parseISO(task.dueDate), 'PPp')}
                  </Typography>
                </Box>
              )}
              {task.realisticDeadline && (
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="primary">
                    AI Realistic: {format(parseISO(task.realisticDeadline), 'PPp')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Group and Assignment */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Assignment Details
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {task.group && (
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Group: {task.group.name}
                  </Typography>
                </Box>
              )}
              {task.assignedUser && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                    {task.assignedUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">
                    Assigned to: {task.assignedUser.username}
                  </Typography>
                </Box>
              )}
              {task.lastEditor && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Last edited by: {task.lastEditor.username}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* AI Insights */}
          {task.completionProbability !== undefined && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                AI Insights
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">Completion Probability:</Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={task.completionProbability * 100}
                    size={40}
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
            </Box>
          )}

          {/* Timestamps */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Timeline
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="caption" color="text.secondary">
                Created: {format(parseISO(task.createdAt), 'PPp')}
              </Typography>
              {task.updatedAt && (
                <Typography variant="caption" color="text.secondary">
                  Updated: {format(parseISO(task.updatedAt), 'PPp')}
                </Typography>
              )}
              {task.lastEditedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last edited: {format(parseISO(task.lastEditedAt), 'PPp')}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CalendarView: React.FC = () => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [selectedTask, setSelectedTask] = useState<SmartTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation functions
  const navigateToNext = () => {
    setCurrentDate(prev => {
      if (view === Views.MONTH) {
        return addMonths(prev, 1);
      } else if (view === Views.WEEK) {
        return addWeeks(prev, 1);
      }
      return prev;
    });
  };

  const navigateToPrevious = () => {
    setCurrentDate(prev => {
      if (view === Views.MONTH) {
        return subMonths(prev, 1);
      } else if (view === Views.WEEK) {
        return subWeeks(prev, 1);
      }
      return prev;
    });
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch all tasks with due dates
  const { pages, isLoading, error } = useTasks({
    pageSize: 100, // Get more tasks for calendar view
    status: ['PLANNING', 'IN_PROGRESS', 'DONE'], // Include all tasks
  });

  // Transform tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!pages) return [];

    const allTasks = pages.flatMap((page: any) => page.tasks);
    
    return allTasks
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => {
        const smartTask: SmartTask = {
          ...task,
          urgencyLevel: (() => {
            if (!task.dueDate) return 'low' as const;
            const now = new Date();
            const dueDate = parseISO(task.dueDate);
            const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            
            if (hoursUntilDue <= 24) return 'high' as const;
            if (hoursUntilDue <= 48) return 'medium' as const;
            return 'low' as const;
          })(),
          realisticDeadline: task.dueDate ? 
            new Date(new Date(task.dueDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : 
            undefined,
          completionProbability: Math.random() * 0.4 + 0.6,
        };

        const dueDate = parseISO(task.dueDate!);
        
        return {
          id: task.id,
          title: task.title,
          start: dueDate,
          end: dueDate,
          resource: smartTask,
          allDay: false,
        };
      });
  }, [pages]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTask(event.resource);
    setModalOpen(true);
  }, []);

  // Custom event style based on priority and status
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#3174ad'; // Default blue
    let borderColor = '#3174ad';

    // Color by priority
    switch (task.priority) {
      case 'HIGH':
        backgroundColor = '#f44336';
        borderColor = '#d32f2f';
        break;
      case 'MEDIUM':
        backgroundColor = '#ff9800';
        borderColor = '#f57c00';
        break;
      case 'LOW':
        backgroundColor = '#4caf50';
        borderColor = '#388e3c';
        break;
    }

    // Dim completed tasks
    if (task.status === 'DONE') {
      backgroundColor = '#9e9e9e';
      borderColor = '#757575';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        opacity: task.status === 'DONE' ? 0.6 : 1,
      },
    };
  }, []);

  // Custom event component for better display
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource;
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: '0.875rem',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            flexShrink: 0,
          }}
        />
        {task.title}
      </Box>
    );
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
        Failed to load calendar data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Calendar View
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visualize your deadlines and plan ahead
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Custom Navigation */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              onClick={navigateToPrevious} 
              size="small"
              sx={{ 
                bgcolor: 'background.paper', 
                border: 1, 
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ChevronLeft />
            </IconButton>
            
            <Button 
              onClick={navigateToToday}
              variant="outlined"
              size="small"
              sx={{ minWidth: 80 }}
            >
              Today
            </Button>
            
            <IconButton 
              onClick={navigateToNext} 
              size="small"
              sx={{ 
                bgcolor: 'background.paper', 
                border: 1, 
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Current Date Display */}
          <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center' }}>
            {format(currentDate, view === Views.MONTH ? 'MMMM yyyy' : 'MMM dd, yyyy')}
          </Typography>

          {/* Simplified View Toggle - Only Month and Week */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value={Views.MONTH}>Month</ToggleButton>
            <ToggleButton value={Views.WEEK}>Week</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Legend */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend
        </Typography>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: 1 }} />
            <Typography variant="caption">High Priority</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', borderRadius: 1 }} />
            <Typography variant="caption">Medium Priority</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="caption">Low Priority</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#9e9e9e', borderRadius: 1 }} />
            <Typography variant="caption">Completed</Typography>
          </Box>
        </Box>
      </Card>

      {/* Calendar */}
      <Card sx={{ p: 2, minHeight: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK]}
          date={currentDate}
          onNavigate={setCurrentDate}
          toolbar={false}
          components={{
            event: EventComponent,
          }}
          style={{ height: 500 }}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture),
          }}
          messages={{
            date: "Date",
            time: "Time",
            event: "Event",
            noEventsInRange: "No tasks scheduled in this time range.",
            showMore: (total) => `+${total} more tasks`,
          }}
        />
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </Box>
  );
};

export default CalendarView;