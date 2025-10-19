import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-white',
  {
    variants: {
      variant: {
  default: 'bg-[var(--accent-500)] text-[var(--color-accent-foreground)] shadow hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]',
        secondary: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100',
  outline: 'border border-[var(--accent-400)] text-[var(--accent-600)] hover:bg-[var(--accent-50)] dark:text-[var(--accent-500)] dark:border-[var(--accent-500)] dark:hover:bg-[var(--accent-100)]'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9 p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { buttonVariants };
