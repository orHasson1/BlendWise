import * as React from 'react';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuPortal = DropdownPrimitive.Portal;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('z-50 min-w-[10rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg focus:outline-none', className)}
      {...props}
    />
  </DropdownPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn('relative flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-600 outline-none transition hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownPrimitive.Item.displayName;
