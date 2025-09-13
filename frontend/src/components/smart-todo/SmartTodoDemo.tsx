import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, BarChart3 } from 'lucide-react';

const SmartTodoDemo: React.FC = () => {
  const features = [
    {
      path: '/tasks',
      title: 'Do Now View',
      description: 'AI-prioritized tasks with deadline pressure indicators',
      icon: CheckSquare,
      color: '#3b82f6'
    },
    {
      path: '/calendar',
      title: 'Calendar View',
      description: 'Visual overview of all your task deadlines',
      icon: Calendar,
      color: '#10b981'
    },
    {
      path: '/analytics',
      title: 'Analytics Dashboard',
      description: 'Productivity insights and completion trends',
      icon: BarChart3,
      color: '#f59e0b'
    }
  ];

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
          Smart To-Do List
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Experience AI-powered task management with intelligent prioritization, 
          visual calendar planning, and detailed productivity analytics.
        </Typography>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} justifyContent="center">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          
          return (
            <Box
              key={feature.path}
              sx={{
                flex: 1,
                maxWidth: 350,
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: `${feature.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto'
                }}
              >
                <IconComponent size={32} color={feature.color} />
              </Box>

              <Typography variant="h5" component="h2" gutterBottom textAlign="center" sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, lineHeight: 1.6 }}>
                {feature.description}
              </Typography>

              <Box textAlign="center">
                <Button
                  component={Link}
                  to={feature.path}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: feature.color,
                    '&:hover': {
                      bgcolor: feature.color,
                      filter: 'brightness(0.9)',
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                  }}
                >
                  Try {feature.title}
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box mt={8} p={4} bgcolor="background.paper" borderRadius={3} textAlign="center">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          🚀 Key Features
        </Typography>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={4} mt={3} justifyContent="center">
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#dc2626' }}>
              ⚡ Deadline Pressure Mode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visual indicators change color based on deadline proximity
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb' }}>
              🎯 AI Prioritization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart task ordering based on importance and deadlines
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#059669' }}>
              📊 Productivity Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed insights into your work patterns and efficiency
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SmartTodoDemo;