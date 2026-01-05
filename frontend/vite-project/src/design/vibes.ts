// Centralized vibe design tokens & categorization logic
// Each category maps to Tailwind classes for dot, text, background, border

export type VibeCategory =
  | 'uplift'
  | 'relax'
  | 'sleep'
  | 'ground'
  | 'immune'
  | 'romantic'
  | 'soothe'
  | 'other';

export interface VibeCategoryTheme {
  dotLight: string;
  dotDark: string;
  textLight: string;
  textDark: string;
  chipBgLight: string;
  chipBgDark: string;
  border: string;
  rationale: string;
}

export const VIBE_CATEGORIES: Record<VibeCategory, VibeCategoryTheme> = {
  uplift: {
    dotLight: 'bg-amber-500', dotDark: 'bg-amber-400',
    textLight: 'text-amber-700', textDark: 'text-amber-300',
    chipBgLight: 'bg-amber-50', chipBgDark: 'bg-amber-900/25',
    border: 'border-amber-200/70 dark:border-amber-700/60',
    rationale: 'Sun / optimism / activation'
  },
  immune: {
    dotLight: 'bg-cyan-500', dotDark: 'bg-cyan-400',
    textLight: 'text-cyan-700', textDark: 'text-cyan-300',
    chipBgLight: 'bg-cyan-50', chipBgDark: 'bg-cyan-900/25',
    border: 'border-cyan-200/60 dark:border-cyan-700/60',
    rationale: 'Clean / purifying / fresh air'
  },
  romantic: {
    dotLight: 'bg-rose-500', dotDark: 'bg-rose-400',
    textLight: 'text-rose-600', textDark: 'text-rose-300',
    chipBgLight: 'bg-rose-50', chipBgDark: 'bg-rose-900/25',
    border: 'border-rose-200/60 dark:border-rose-700/60',
    rationale: 'Affection / sensual warmth'
  },
  ground: {
    dotLight: 'bg-emerald-600', dotDark: 'bg-emerald-500',
    textLight: 'text-emerald-700', textDark: 'text-emerald-300',
    chipBgLight: 'bg-emerald-50', chipBgDark: 'bg-emerald-900/25',
    border: 'border-emerald-200/60 dark:border-emerald-700/60',
    rationale: 'Rooted / natural / balance'
  },
  soothe: {
    dotLight: 'bg-orange-400', dotDark: 'bg-orange-400',
    textLight: 'text-orange-600', textDark: 'text-orange-300',
    chipBgLight: 'bg-orange-50', chipBgDark: 'bg-orange-900/25',
    border: 'border-orange-200/60 dark:border-orange-700/60',
    rationale: 'Gentle comfort / emotional support'
  },
  relax: {
    dotLight: 'bg-violet-400', dotDark: 'bg-violet-400',
    textLight: 'text-violet-600', textDark: 'text-violet-300',
    chipBgLight: 'bg-violet-50', chipBgDark: 'bg-violet-900/25',
    border: 'border-violet-200/60 dark:border-violet-700/60',
    rationale: 'Gentle tranquility distinct from sleep'
  },
  sleep: {
    dotLight: 'bg-indigo-600', dotDark: 'bg-indigo-500',
    textLight: 'text-indigo-600', textDark: 'text-indigo-300',
    chipBgLight: 'bg-indigo-50', chipBgDark: 'bg-indigo-900/30',
    border: 'border-indigo-200/50 dark:border-indigo-700/50',
    rationale: 'Night / depth / restorative'
  },
  other: {
    dotLight: 'bg-teal-500', dotDark: 'bg-teal-500',
    textLight: 'text-teal-600', textDark: 'text-teal-300',
    chipBgLight: 'bg-teal-50', chipBgDark: 'bg-teal-900/25',
    border: 'border-teal-200/60 dark:border-teal-700/60',
    rationale: 'Fallback aligned with brand teal'
  }
};

export const FALLBACK_VIBE_PATTERNS: { category: VibeCategory; rx: RegExp }[] = [
  { category: 'uplift',   rx: /(uplift|energ|boost|happy|bright|vital)/i },
  { category: 'relax',    rx: /(relax|calm|stress|peace|tranquil|ease)/i },
  { category: 'sleep',    rx: /(sleep|sedat|rest|bed|insom)/i },
  { category: 'ground',   rx: /(ground|center|root|balance|stable|meditat)/i },
  { category: 'immune',   rx: /(immune|clean|purif|antimicro|antibacter|clarif)/i },
  { category: 'romantic', rx: /(aphro|sensu|romant|passion|libido)/i },
  { category: 'soothe',   rx: /(sooth|comfort|support|nurtur|gentle|soft|emotional)/i },
];

export function categorizeVibe(label: string): VibeCategory {
  for (const row of FALLBACK_VIBE_PATTERNS) {
    if (row.rx.test(label)) return row.category;
  }
  return 'other';
}
