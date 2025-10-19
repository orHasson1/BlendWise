import React from 'react';
import { cn } from '../../lib/utils';

interface SurfaceProps {
  /** Visual depth tier.
   * e0 – layout grouping (neutral background, no border / shadow)
   * e1 – standard card / container (border, no strong shadow)
   * e2 – primary panel / featured card (light elevation shadow)
   * e3 – overlay / popover / dialog (strongest elevation)
   */
  elevation?: 0 | 1 | 2 | 3;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  /** Adds hover & focus affordances and pressed micro-elevation */
  interactive?: boolean;
  /** Apply default padding (p-6) */
  padding?: boolean;
  radius?: 'sm' | 'md' | 'lg';
}

// Elevation mapping – see JSDoc above for semantic intent.
const elevationMap: Record<number,string> = {
  0: 'role-surface',
  1: 'role-surface border role-border',
  2: 'role-surface border role-border shadow-sm elevation-1',
  3: 'role-surface border role-border elevation-2'
};

const radiusMap = { sm: 'radius-sm', md: 'radius-md', lg: 'radius-lg' } as const;

const Surface: React.FC<SurfaceProps> = ({ elevation=1, className, as='div', children, interactive=false, padding=true, radius='lg' }) => {
  const Comp: any = as;
  const classes = [
    elevationMap[elevation] ?? elevationMap[1],
    radiusMap[radius],
    padding ? 'p-6' : null,
    interactive ? [
      'transition-all duration-150',
      'hover:shadow-md',
      // micro “press” – reduce shadow slightly & translate down 1px for tactile feedback
      'active:shadow-sm active:translate-y-[1px]',
      'focus-within:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)] focus-within:ring-offset-2'
    ].join(' ') : null
  ].filter(Boolean).join(' ');
  return <Comp className={cn(classes, className)}>{children}</Comp>;
};

export default Surface;
