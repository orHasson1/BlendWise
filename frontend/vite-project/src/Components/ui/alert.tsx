import * as React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const intentStyles: Record<string,string> = {
  error: 'border-red-300 bg-red-50 text-red-800 dark:border-red-600/60 dark:bg-red-900/30 dark:text-red-200',
  info: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-600/60 dark:bg-sky-900/30 dark:text-sky-200',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-600/60 dark:bg-emerald-900/30 dark:text-emerald-200',
  warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600/60 dark:bg-amber-900/30 dark:text-amber-200'
};

const intentIcon: Record<string, React.ReactNode> = {
  error: <AlertCircle className="h-5 w-5 shrink-0" />,
  info: <Info className="h-5 w-5 shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
  warning: <AlertCircle className="h-5 w-5 shrink-0" />
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  intent?: 'error' | 'info' | 'success' | 'warning';
  title?: string;
  actions?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ intent='info', title, children, actions, className, ...rest }) => {
  return (
    <div
      role={intent === 'error' ? 'alert' : 'status'}
      className={cn('relative flex w-full gap-3 rounded-md border px-4 py-3 text-sm', intentStyles[intent], className)}
      {...rest}
    >
      <div className="mt-0.5">{intentIcon[intent]}</div>
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-0.5 leading-none">{title}</div>}
        {children && <div className="leading-snug break-words">{children}</div>}
      </div>
      {actions && <div className="flex items-start">{actions}</div>}
    </div>
  );
};

export default Alert;
