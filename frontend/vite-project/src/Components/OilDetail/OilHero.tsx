import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, PackagePlus } from 'lucide-react';

interface OilHeroProps {
  name: string;
  aromas?: number[];
  vibes?: number[];
  aromaMap: Record<number,string>;
  vibeMap: Record<number,string>;
  owned: boolean;
  wishlist: boolean;
  onToggleOwned: () => void;
  onToggleWishlist: () => void;
}

// Basic aroma => color mapping
const AROMA_COLORS: Record<string,{from:string;to:string}> = {
  Citrus: { from: '#fffbe6', to: '#ffe07a' },
  Floral: { from: '#fff0f6', to: '#ffd1e8' },
  Herbal: { from: '#f1fff2', to: '#c9f7cc' },
  Woody: { from: '#f5f2ed', to: '#e0d4c2' },
  Spicy: { from: '#fff4e6', to: '#ffd7a9' },
  Resin: { from: '#f7f3ff', to: '#e4d4ff' },
  Minty: { from: '#eafffa', to: '#c5f7ed' },
};

// Generate a tagline from primary aroma + top vibe term
function generateTagline(aromaLabel?: string, vibeLabel?: string): string {
  if (!aromaLabel && !vibeLabel) return 'Aromatic profile';
  if (aromaLabel && vibeLabel) {
    const adj = aromaLabel.split(/[\s/]/)[0];
    const vibeWord = (vibeLabel.split(/[\s/]/)[0] || '').toLowerCase();
    return `${adj} ${vibeWord} essence`;
  }
  return aromaLabel || vibeLabel || 'Aromatic profile';
}

// Procedural emblem: circle of dots representing counts of aromas/vibes
function Emblem({ aromaCount, vibeCount }: { aromaCount: number; vibeCount: number }) {
  const total = Math.max(4, aromaCount + vibeCount);
  const dots = Array.from({ length: total });
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden="true" className="drop-shadow-sm">
      <circle cx={36} cy={36} r={34} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={2} />
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const r = 26 + (i % 3);
        const x = 36 + Math.cos(angle) * r;
        const y = 36 + Math.sin(angle) * r;
        const isAroma = i < aromaCount;
        return <circle key={i} cx={x} cy={y} r={isAroma ? 4 : 3} fill={isAroma ? '#0d9488' : '#6366f1'} opacity={0.85} />;
      })}
      <circle cx={36} cy={36} r={10} fill="#0d9488" opacity={0.15} />
    </svg>
  );
}

const OilHero: React.FC<OilHeroProps> = ({ name, aromas, vibes, aromaMap, vibeMap, owned, wishlist, onToggleOwned, onToggleWishlist }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [sticky, setSticky] = useState(false);

  const primaryAromaLabel = useMemo(() => aromas && aromas.length ? aromaMap[aromas[0]] : undefined, [aromas, aromaMap]);
  const primaryVibeLabel = useMemo(() => vibes && vibes.length ? vibeMap[vibes[0]] : undefined, [vibes, vibeMap]);
  const tagline = useMemo(() => generateTagline(primaryAromaLabel, primaryVibeLabel), [primaryAromaLabel, primaryVibeLabel]);

  const gradient = useMemo(() => {
    if (primaryAromaLabel) {
      const key = Object.keys(AROMA_COLORS).find(k => primaryAromaLabel.toLowerCase().includes(k.toLowerCase()));
      if (key) {
        const g = AROMA_COLORS[key];
        return `linear-gradient(135deg, ${g.from}, ${g.to})`;
      }
    }
    return 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
  }, [primaryAromaLabel]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => setSticky(!entry.isIntersecting));
      },
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={heroRef}
        className="relative rounded-3xl overflow-hidden mb-8 transition duration-300 group border border-slate-200 dark:border-slate-700"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-transparent dark:from-slate-900/50" />
        <div className="relative p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex-shrink-0">
            <Emblem aromaCount={aromas?.length || 0} vibeCount={vibes?.length || 0} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mb-2">{name}</h1>
            <p className="text-base-token text-slate-600 dark:text-slate-300" aria-describedby="oil-tagline">{tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-pressed={wishlist}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border transition ${wishlist ? 'bg-teal-600 text-white border-teal-600 shadow' : 'bg-white/80 backdrop-blur border-slate-300 text-slate-700 hover:bg-teal-50'}`}
            >
              <Heart className={`h-4 w-4 ${wishlist ? 'fill-white' : ''}`} />
              {wishlist ? 'Wishlisted' : 'Add Wishlist'}
            </button>
            <button
              type="button"
              onClick={onToggleOwned}
              aria-pressed={owned}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border transition ${owned ? 'bg-teal-700 text-white border-teal-700 shadow' : 'bg-white/80 backdrop-blur border-slate-300 text-slate-700 hover:bg-teal-50'}`}
            >
              <PackagePlus className="h-4 w-4" />
              {owned ? 'Owned' : 'Mark Owned'}
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
      </div>
      {sticky && (
        <div className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-2">
          <span className="font-medium text-sm truncate max-w-[50%]">{name}</span>
          <div className="flex items-center gap-2">
            <Heart
              onClick={onToggleWishlist}
              aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`h-4 w-4 cursor-pointer ${wishlist ? 'text-teal-600 fill-teal-600' : 'text-slate-500 hover:text-teal-600'}`}
              aria-pressed={wishlist}
              role="button"
            />
            <PackagePlus
              onClick={onToggleOwned}
              aria-label={owned ? 'Mark as not owned' : 'Mark as owned'}
              className={`h-4 w-4 cursor-pointer ${owned ? 'text-teal-700' : 'text-slate-500 hover:text-teal-700'}`}
              aria-pressed={owned}
              role="button"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OilHero;