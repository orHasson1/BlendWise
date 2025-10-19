import React from 'react';
import { cn } from '../../lib/utils';
import Surface from './Surface';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className, compact }) => {
  return (
  <Surface elevation={1} className={cn('text-center flex flex-col items-center justify-center', compact ? 'p-10' : 'p-12', className)}>
      {icon && (
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">{title}</h2>
  {description && <p className="text-base-token text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">{description}</p>}
      {action}
    </Surface>
  );
};

export default EmptyState;
