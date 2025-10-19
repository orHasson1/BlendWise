import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'badge' | 'card';
}

const variantClasses: Record<string, string> = {
  line: 'h-3 rounded-md',
  circle: 'rounded-full',
  badge: 'h-5 rounded-full',
  card: 'rounded-xl h-40'
};

const Skeleton: React.FC<SkeletonProps> = ({ className, variant='line' }) => (
  <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-700/60', variantClasses[variant], className)} />
);

export default Skeleton;
