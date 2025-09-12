import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { getStatusStyles, getStatusDisplayText } from '../../utils/projectUtils';
import type { Project } from '../../types';

interface StatusBadgeProps {
  /** Project status level */
  status: Project['status'];
  /** Whether to show the status icon (default: true) */
  showIcon?: boolean;
  /** Badge size variant (default: 'sm') */
  size?: 'sm' | 'md';
}

/**
 * Reusable status badge component with consistent styling
 * 
 * Features:
 * - Color-coded status levels (Planning: gray, In Progress: blue, Done: green)
 * - Status-specific icons (Calendar, Clock, CheckCircle)
 * - Multiple size variants
 * - Consistent styling with project utility functions
 * 
 * @example
 * ```tsx
 * <StatusBadge status="IN_PROGRESS" showIcon={true} size="md" />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'sm'
}) => {
  const styles = getStatusStyles(status);
  const displayText = getStatusDisplayText(status);
  
  const getIcon = () => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className={`w-3 h-3 ${styles.iconColor}`} />;
      case 'IN_PROGRESS':
        return <Clock className={`w-3 h-3 ${styles.iconColor}`} />;
      case 'PLANNING':
        return <Calendar className={`w-3 h-3 ${styles.iconColor}`} />;
      default:
        return <Calendar className={`w-3 h-3 ${styles.iconColor}`} />;
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
