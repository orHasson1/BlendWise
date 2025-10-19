// Central theme role mapping. Use these semantic roles instead of hard-coded classes.
// This indirection lets us shift palette or adjust contrast globally.

export type ThemeRole = 'surface' | 'surfaceMuted' | 'accent' | 'accentSubtle' | 'danger' | 'dangerSubtle' | 'focusRing' | 'border' | 'borderStrong';

// Tailwind + CSS variable hybrid classes.
// Each mapping favors variables but falls back to current utility tokens during dev.
export const roleClasses: Record<ThemeRole, string> = {
  surface: 'role-surface',
  surfaceMuted: 'role-surface-muted',
  accent: 'role-accent',
  accentSubtle: 'bg-brand/10 text-brand',
  danger: 'role-danger',
  dangerSubtle: 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300',
  // Use arbitrary value with CSS variable for ring color.
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2',
  border: 'role-border',
  borderStrong: 'role-border-strong'
};

export interface SurfaceOptions {
  interactive?: boolean;
  elevation?: 0 | 1 | 2;
  padding?: boolean;
  radius?: 'sm' | 'md' | 'lg';
}

export function surface(opts: SurfaceOptions = {}) {
  const { interactive, elevation = 0, padding = true, radius = 'lg' } = opts;
  const base = [roleClasses.surface, 'border', roleClasses.border, 'transition-colors'];
  if (interactive) base.push('hover:shadow-md', 'focus-within:shadow-md', 'cursor-pointer');
  if (elevation === 1) base.push('elevation-1');
  if (elevation === 2) base.push('elevation-2');
  if (padding) base.push('p-5');
  base.push(radius === 'sm' ? 'radius-sm' : radius === 'md' ? 'radius-md' : 'radius-lg');
  return base.join(' ');
}

export function badgeAccent() {
  return 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' + roleClasses.accent + ' bg-[--color-accent]/10 text-[--color-accent-foreground]';
}

export function focusable(extra?: string) {
  return ['focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-focus-ring] focus-visible:ring-offset-2', extra].filter(Boolean).join(' ');
}

// Utility for generating a role-bound button style quickly.
export function button(kind: 'primary' | 'outline' | 'ghost' = 'primary') {
  switch (kind) {
    case 'primary':
      return 'inline-flex items-center justify-center rounded-md px-4 h-9 text-sm font-medium role-accent shadow-sm hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none ' + roleClasses.focusRing;
    case 'outline':
      return 'inline-flex items-center justify-center rounded-md px-4 h-9 text-sm font-medium bg-transparent border role-border text-[--color-accent] hover:bg-[--color-accent]/10 ' + roleClasses.focusRing;
    case 'ghost':
      return 'inline-flex items-center justify-center rounded-md px-3 h-9 text-sm font-medium text-[--color-accent] hover:bg-[--color-accent]/10 ' + roleClasses.focusRing;
  }
}

// Allow runtime swapping of CSS variable values (e.g., theme editor).
export function setThemeVariables(vars: Partial<Record<string, string>>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    if (typeof v === 'string') root.style.setProperty(`--${k}`, v);
  });
}
