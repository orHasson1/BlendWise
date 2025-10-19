import React from 'react';

export interface LogoMarkProps {
  className?: string;
  /** Explicit pixel size (auto-chooses internal variant). Overrides size derived from className if provided */
  size?: number;
  /** Force a variant instead of auto */
  variant?: 'gradient' | 'flat' | 'outline';
  /** Mark purely decorative (aria-hidden) */
  decorative?: boolean;
  /** Disable gradient even if variant=gradient (e.g. for print) */
  noGradient?: boolean;
}

// Utility: derive variant from size if not forced
function variantFor(size: number): 'gradient' | 'flat' | 'outline' {
  if (size < 24) return 'outline'; // tiny: crisp outline
  if (size < 44) return 'flat';    // mid: flat for clarity
  return 'gradient';               // large: full expression
}

// Geometry builders (parametric future friendly)
const mainDropletPath = 'M32 9.5c-5.7 8.5-10.4 15.3-10.4 21.9 0 8.2 6.2 15.2 14 15.2s14-7 14-15.2c0-6.6-4.8-13.4-10.4-21.9-1.4-2.1-2.7-3.9-3.5-5.1-.8 1.1-2.1 3-2.9 4.2Z';
const companionDropletPath = 'M21 25.2c-3.3 5.1-5.2 9.1-5.2 12.8 0 5.1 3.7 9.3 8.8 9.3 5.1 0 8.8-4.2 8.8-9.3 0-3.8-2.3-7.8-5.6-12.8-1.1-.6-3.6-1-6.8 0Z';
const highlightPath = 'M35.4 19.2c-2.1 3.3-3.2 6-3.2 8.6 0 3.7 2.6 6.6 5.7 6.6 3.1 0 5.7-3 5.7-6.6 0-2.6-1.1-5.3-3.2-8.6-.9-1.4-1.8-2.5-2.6-3.3-.8.8-1.6 1.9-2.4 3.3Z';

// Small sparkle as diamond
const sparkleDiamond = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} L ${cx + r} ${cy} ${cx} ${cy + r} ${cx - r} ${cy} Z`;

/** Central droplet brand mark with size-aware styling */
export const LogoMark: React.FC<LogoMarkProps> = ({ className = 'w-6 h-6', size, variant, decorative = true, noGradient }) => {
  // Try to parse size from className if not passed (rudimentary: looks for w-<n> or h-<n>)
  if (!size) {
    const match = className.match(/(?:w|h)-(\d{1,3})/);
    if (match) size = parseInt(match[1], 10);
  }
  size = size || 24;
  const autoVariant = variantFor(size);
  const finalVariant = variant || autoVariant;
  const outline = finalVariant === 'outline';
  const flat = finalVariant === 'flat';
  const gradient = finalVariant === 'gradient' && !noGradient;
  const showCompanion = size >= 44; // hide companion on small/mid sizes
  const showHighlight = !outline && size >= 32;
  const showSparkle = size >= 40;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role={decorative ? 'img' : 'img'}
      aria-label={decorative ? 'BlendWise droplet' : 'BlendWise droplet logo'}
      aria-hidden={decorative ? 'true' : undefined}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {gradient && (
        <defs>
          <linearGradient id="bwDropletFill" x1="18" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--accent-600, 172 75% 40%))" />
            <stop offset="55%" stopColor="hsl(var(--accent-500, 172 70% 45%))" />
            <stop offset="100%" stopColor="hsl(var(--accent-300, 172 65% 70%))" />
          </linearGradient>
        </defs>
      )}
      <path
        d={mainDropletPath}
        fill={gradient ? 'url(#bwDropletFill)' : flat ? 'currentColor' : 'none'}
        fillOpacity={gradient ? 0.9 : 1}
        stroke="currentColor"
        strokeWidth={outline ? 2.1 : 1.7}
      />
      {showCompanion && (
        <path
          d={companionDropletPath}
          fill={outline ? 'none' : 'hsl(var(--accent-200, 172 55% 80%) / 0.55)'}
          stroke="currentColor"
          strokeWidth={outline ? 1.5 : 1.1}
        />
      )}
      {showHighlight && (
        <path
          d={highlightPath}
            fill="white"
          fillOpacity={outline ? 0 : 0.33}
        />
      )}
      {showSparkle && (
        <path
          d={sparkleDiamond(47, 18.5, outline ? 1.8 : 2.3)}
          fill={flat ? 'hsl(var(--accent-300, 172 65% 70%))' : 'currentColor'}
          fillOpacity={outline ? 0.55 : 0.85}
        />
      )}
    </svg>
  );
};

interface BrandLockupProps extends LogoMarkProps { showWord?: boolean; wordClassName?: string; }
export const BrandLockup: React.FC<BrandLockupProps> = ({ showWord = true, className='w-7 h-7', wordClassName='text-lg font-semibold tracking-tight', ...rest }) => {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={className} {...rest} />
      {showWord && <span className={wordClassName}>BlendWise</span>}
    </span>
  );
};

export default LogoMark;