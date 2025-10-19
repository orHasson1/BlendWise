import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, subtitle, actions, className }) => {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-100)] dark:bg-[var(--accent-200)] text-[var(--accent-700)] dark:text-[var(--accent-600)] ring-1 ring-[var(--accent-300)] dark:ring-[var(--accent-400)] shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">{title}</h1>
          {subtitle && <p className="mt-1 text-base-token text-slate-600 dark:text-slate-300 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
