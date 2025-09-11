import React from 'react';

interface FilterButtonProps {
  /** Whether the filter button is currently active/selected */
  isActive: boolean;
  /** Callback fired when the button is clicked */
  onClick: () => void;
  /** Button content - typically text label */
  children: React.ReactNode;
  /** Color variant for the button - affects active state colors */
  variant?: 'primary' | 'blue' | 'orange' | 'red' | 'yellow' | 'green';
}

/**
 * Reusable filter button component with consistent styling
 * 
 * Features:
 * - Multiple color variants for different filter types
 * - Active/inactive state styling
 * - Consistent hover and transition effects
 * - Accessible button semantics
 * 
 * @example
 * ```tsx
 * <FilterButton
 *   isActive={filter === 'high'}
 *   onClick={() => setFilter('high')}
 *   variant="red"
 * >
 *   High Priority
 * </FilterButton>
 * ```
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  isActive,
  onClick,
  children,
  variant = 'primary'
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: isActive ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
      blue: isActive ? 'bg-blue-100 text-blue-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
      orange: isActive ? 'bg-orange-100 text-orange-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
      red: isActive ? 'bg-red-100 text-red-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
      yellow: isActive ? 'bg-yellow-100 text-yellow-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
      green: isActive ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
    };
    
    return variants[variant];
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${getVariantClasses()}`}
    >
      {children}
    </button>
  );
};
