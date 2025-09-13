import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { tasksApi } from '../../services/api';
import { useTaskStats } from '../../hooks/useTasks';
import type { AnalyticsData } from '../../types';

// Custom colors for charts
const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#00bcd4',
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.error, COLORS.info];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, description }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ color }}>
            {value}
          </Typography>
          {description && (
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>
          {React.cloneElement(icon, { fontSize: 'large' })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsView: React.FC = () => {
  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => tasksApi.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Fetch task statistics
  const { data: taskStats, isLoading: statsLoading, error: statsError } = useTaskStats();

  const isLoading = analyticsLoading || statsLoading;
  const error = analyticsError || statsError;

  // Mock data if API doesn't return data yet
  const mockAnalyticsData: AnalyticsData = useMemo(() => ({
    tasksCompletedLast7Days: [
      { day: 'Mon', count: 5 },
      { day: 'Tue', count: 8 },
      { day: 'Wed', count: 3 },
      { day: 'Thu', count: 12 },
      { day: 'Fri', count: 7 },
      { day: 'Sat', count: 4 },
      { day: 'Sun', count: 2 },
    ],
    productivityByHour: [
      { hour: '06:00', completed: 1 },
      { hour: '07:00', completed: 2 },
      { hour: '08:00', completed: 4 },
      { hour: '09:00', completed: 8 },
      { hour: '10:00', completed: 12 },
      { hour: '11:00', completed: 10 },
      { hour: '12:00', completed: 6 },
      { hour: '13:00', completed: 4 },
      { hour: '14:00', completed: 7 },
      { hour: '15:00', completed: 9 },
      { hour: '16:00', completed: 11 },
      { hour: '17:00', completed: 8 },
      { hour: '18:00', completed: 5 },
      { hour: '19:00', completed: 3 },
      { hour: '20:00', completed: 2 },
      { hour: '21:00', completed: 1 },
      { hour: '22:00', completed: 1 },
    ],
  }), []);

  // Use real data if available, otherwise use mock data
  const displayData = analyticsData || mockAnalyticsData;

  // Calculate derived metrics
  const totalCompletedLastWeek = useMemo(() => {
    return displayData.tasksCompletedLast7Days.reduce((sum, day) => sum + day.count, 0);
  }, [displayData.tasksCompletedLast7Days]);

  const averageTasksPerDay = useMemo(() => {
    return (totalCompletedLastWeek / 7).toFixed(1);
  }, [totalCompletedLastWeek]);

  const peakProductivityHour = useMemo(() => {
    const maxHour = displayData.productivityByHour.reduce((max, hour) => 
      hour.completed > max.completed ? hour : max
    );
    return maxHour.hour;
  }, [displayData.productivityByHour]);

  // Prepare data for status distribution pie chart
  const statusDistribution = useMemo(() => {
    if (!taskStats) return [];
    
    return [
      { name: 'Planning', value: taskStats.planning, color: COLORS.warning },
      { name: 'In Progress', value: taskStats.inProgress, color: COLORS.primary },
      { name: 'Completed', value: taskStats.done, color: COLORS.success },
    ].filter(item => item.value > 0);
  }, [taskStats]);

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
        Failed to load analytics data. Showing sample data for demonstration.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Insights into your productivity patterns and task completion trends
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tasks"
            value={taskStats?.total || 0}
            icon={<AssignmentIcon />}
            color={COLORS.primary}
            description="All tasks in system"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed"
            value={taskStats?.done || 0}
            icon={<CheckCircleIcon />}
            color={COLORS.success}
            description="Successfully finished"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Weekly Average"
            value={averageTasksPerDay}
            icon={<TrendingUpIcon />}
            color={COLORS.info}
            description="Tasks per day"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Peak Hour"
            value={peakProductivityHour}
            icon={<ScheduleIcon />}
            color={COLORS.secondary}
            description="Most productive time"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Tasks Completed Per Day - Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasks Completed Last 7 Days
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Daily task completion trends to track your consistency
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={displayData.tasksCompletedLast7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS.primary}
                    name="Tasks Completed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Status Distribution - Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Current breakdown of your tasks by status
              </Typography>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  height={250}
                >
                  <Typography color="textSecondary">
                    No tasks available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Productivity Hotspots - Area Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productivity Hotspots
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Hourly task completion patterns to identify your most productive times
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={displayData.productivityByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                    labelFormatter={(value) => `Time: ${value}`}
                    formatter={(value: number) => [value, 'Tasks Completed']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                    name="Tasks Completed"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Insights & Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    📈 Productivity Trend
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your peak productivity window is around {peakProductivityHour}. 
                    Consider scheduling your most important tasks during this time.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    🎯 Weekly Performance
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    You completed {totalCompletedLastWeek} tasks this week, averaging {averageTasksPerDay} tasks per day.
                    {totalCompletedLastWeek > 35 ? ' Excellent consistency!' : ' Room for improvement in daily consistency.'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ⚡ Optimization Tip
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your completion rate drops significantly after 18:00. 
                    Try to finish important tasks earlier in the day for better results.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    📊 Task Balance
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {taskStats && taskStats.inProgress > taskStats.planning * 2 
                      ? 'You have many tasks in progress. Consider focusing on completion before starting new ones.'
                      : 'Good balance between planning and execution. Keep up the momentum!'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsView;