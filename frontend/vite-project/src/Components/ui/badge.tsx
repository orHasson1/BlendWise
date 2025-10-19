import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition select-none',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 border-slate-200',
  // Primary (teal) formula
  primary: 'bg-primary-soft text-teal-700 dark:text-teal-300 border-teal-300/40 dark:border-teal-600/40',
        outline: 'border-slate-300 text-slate-700'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
};
