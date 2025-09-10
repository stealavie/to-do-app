import React from 'react';
import type { UserStats } from '../../types';
import { BarChart3, Clock, Target, TrendingUp, Brain, Calendar } from 'lucide-react';
import { getProductivityInsights } from '../../utils/analytics';
import type { Task } from '../../types';

interface AnalyticsViewProps {
  stats: UserStats;
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, tasks }) => {
  const insights = getProductivityInsights(tasks);

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'blue' 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ 
    label, 
    value, 
    max, 
    color = 'blue' 
  }: {
    label: string;
    value: number;
    max: number;
    color?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Total Tasks"
          value={stats.totalTasks}
          color="blue"
        />
        
        <StatCard
          icon={BarChart3}
          title="Completed"
          value={stats.completedTasks}
          subtitle={`${Math.round(stats.productivityTrend)}% completion rate`}
          color="green"
        />
        
        <StatCard
          icon={Clock}
          title="Avg. Time"
          value={`${Math.round(stats.avgCompletionTime)}m`}
          subtitle="per task"
          color="orange"
        />
        
        <StatCard
          icon={Brain}
          title="Procrastination Factor"
          value={`${stats.procrastinationFactor.toFixed(1)}x`}
          subtitle="vs estimated time"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Progress Overview
          </h3>
          
          <div className="space-y-4">
            <ProgressBar
              label="Tasks Completed"
              value={stats.completedTasks}
              max={stats.totalTasks}
              color="green"
            />
            
            <ProgressBar
              label="Productivity Score"
              value={Math.round(stats.productivityTrend)}
              max={100}
              color="blue"
            />
            
            <ProgressBar
              label="Time Accuracy"
              value={Math.round(100 / stats.procrastinationFactor)}
              max={100}
              color="purple"
            />
          </div>
        </div>

        {/* Best Working Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Best Working Hours
          </h3>
          
          {stats.bestWorkingHours.length > 0 ? (
            <div className="space-y-3">
              {stats.bestWorkingHours.map((hour, index) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-gray-700">Peak Time #{index + 1}</span>
                  <span className="font-medium text-blue-600">{hour}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Complete more tasks to identify your peak hours!</p>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🧠 AI Insights & Recommendations
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-500"
              >
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
