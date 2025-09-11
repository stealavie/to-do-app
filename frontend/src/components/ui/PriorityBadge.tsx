import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { getPriorityStyles, getPriorityDisplayText } from '../../utils/projectUtils';
import type { Project } from '../../types';

interface PriorityBadgeProps {
  /** Project priority level */
  priority: Project['priority'];
  /** Whether to show the priority icon (default: true) */
  showIcon?: boolean;
  /** Badge size variant (default: 'sm') */
  size?: 'sm' | 'md';
}

/**
 * Reusable priority badge component with consistent styling
 * 
 * Features:
 * - Color-coded priority levels (High: red, Medium: yellow, Low: blue)
 * - Optional icons for visual recognition
 * - Multiple size variants
 * - Consistent styling with project utility functions
 * 
 * @example
 * ```tsx
 * <PriorityBadge priority="HIGH" showIcon={true} size="md" />
 * ```
 */
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  size = 'sm'
}) => {
  const styles = getPriorityStyles(priority);
  const displayText = getPriorityDisplayText(priority);
  
  const getIcon = () => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle className={`w-3 h-3 ${styles.iconColor}`} />;
      case 'MEDIUM':
        return <Clock className={`w-3 h-3 ${styles.iconColor}`} />;
      case 'LOW':
        return <CheckCircle className={`w-3 h-3 ${styles.iconColor}`} />;
      default:
        return <Clock className={`w-3 h-3 ${styles.iconColor}`} />;
    }
  };

  const sizeClasses = size === 'md' ? 'px-3 py-1.5' : 'px-2 py-1';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div className={`inline-flex items-center space-x-2 ${sizeClasses} rounded-lg font-medium ${textSize} ${styles.bgColor} ${styles.textColor}`}>
      {showIcon && (
        <div className={`p-1.5 rounded-lg ${styles.bgColor}`}>
          {getIcon()}
        </div>
      )}
      <span>{displayText}</span>
    </div>
  );
};
