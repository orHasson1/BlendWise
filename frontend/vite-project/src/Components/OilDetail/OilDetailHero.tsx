import React from 'react';
import { Heart, PackagePlus } from 'lucide-react';

interface OilDetailHeroProps {
  name: string;
  tagline?: string;
  description?: string | null;
  descExpanded: boolean;
  onToggleDescription: () => void;
  wishlist: boolean;
  owned: boolean;
  mutationLoading: boolean;
  relationLoading: boolean;
  onToggleWishlist: () => void;
  onToggleOwned: () => void;
  aromaGradientClass: string;
  notes?: number[];
  aromas?: number[];
  vibes?: number[];
  noteMap: Record<number,string>;
  aromaMap: Record<number,string>;
  vibeMap: Record<number,string>;
  visibleNotes: number[];
  visibleAromasRaw: number[];
  visibleVibes: number[];
  needsNotesToggle: boolean;
  needsAromasToggle: boolean;
  needsVibesToggle: boolean;
  showAllNotes: boolean;
  showAllAromas: boolean;
  showAllVibes: boolean;
  onToggleShowAllNotes: () => void;
  onToggleShowAllAromas: () => void;
  onToggleShowAllVibes: () => void;
  MAX_DESC_CHARS: number;
}

const OilDetailHero: React.FC<OilDetailHeroProps> = ({
  name, tagline, description, descExpanded, onToggleDescription,
  wishlist, owned, mutationLoading, relationLoading,
  onToggleWishlist, onToggleOwned, aromaGradientClass,
  notes, aromas, vibes, noteMap, aromaMap, vibeMap,
  visibleNotes, visibleAromasRaw, visibleVibes,
  needsNotesToggle, needsAromasToggle, needsVibesToggle,
  showAllNotes, showAllAromas, showAllVibes,
  onToggleShowAllNotes, onToggleShowAllAromas, onToggleShowAllVibes,
  MAX_DESC_CHARS
}) => {
  const truncatedDescription = description && !descExpanded && description.length > MAX_DESC_CHARS
    ? description.slice(0, MAX_DESC_CHARS) + '…'
    : description || null;

  return (
    <header className={`mb-12 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative ${aromaGradientClass}`} id="oil-content">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/70 to-transparent dark:from-slate-900/60" />
      <div className="relative px-5 py-8 flex flex-col gap-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mr-auto leading-tight">{name}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-pressed={wishlist}
              aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              disabled={mutationLoading || relationLoading}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600/70 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed ${wishlist ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/90 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'}`}
            >
              {mutationLoading ? (
                <span className="h-4 w-4 inline-block animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden="true" />
              ) : (
                <Heart className={`h-4 w-4 ${wishlist ? 'fill-white' : ''}`} />
              )}
              {wishlist ? 'Wishlisted' : 'Wishlist'}
              <span className="sr-only">(Shortcut: W)</span>
            </button>
            <button
              type="button"
              onClick={onToggleOwned}
              aria-pressed={owned}
              aria-label={owned ? 'Mark as not owned' : 'Mark as owned'}
              disabled={mutationLoading || relationLoading}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600/70 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed ${owned ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/90 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'}`}
            >
              {mutationLoading ? (
                <span className="h-4 w-4 inline-block animate-spin rounded-full border-2 border-white/60 border-t-transparent" aria-hidden="true" />
              ) : (
                <PackagePlus className="h-4 w-4" />
              )}
              {owned ? 'Owned' : 'Mark Owned'}
              <span className="sr-only">(Shortcut: O)</span>
            </button>
          </div>
        </div>
        {tagline && <p className="text-sm-token text-slate-600 dark:text-slate-300 max-w-prose leading-relaxed" id="oil-tagline">{tagline}</p>}
        {truncatedDescription && (
          <div className="max-w-prose">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed" aria-expanded={descExpanded}>{truncatedDescription}</p>
            {description && description.length > MAX_DESC_CHARS && (
              <button
                type="button"
                onClick={onToggleDescription}
                className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                aria-controls="oil-content"
                aria-expanded={descExpanded}
              >{descExpanded ? 'Show less' : 'Show more'}</button>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-labelledby="attributes-heading">
          <h2 id="attributes-heading" className="sr-only">Oil attributes</h2>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
            <h3 className="mb-2 text-[11px] uppercase tracking-wide font-semibold text-slate-600 dark:text-slate-300">Notes</h3>
            {(!notes || notes.length===0) ? (
              <p className="text-sm-token italic text-slate-400 dark:text-slate-300">None yet <span className="not-italic text-[11px] text-slate-400 dark:text-slate-400">(add notes)</span></p>
            ) : (
              <>
                <ul className="text-sm-token text-slate-700 dark:text-slate-300 space-y-1" aria-label="Notes" id="notes-list">
                  {visibleNotes.map(id => {
                    const lbl = noteMap[id] || '';
                    return <li key={id} className="leading-snug truncate" title={lbl}>{lbl}</li>;
                  })}
                </ul>
                {needsNotesToggle && (
                  <button
                    type="button"
                    onClick={onToggleShowAllNotes}
                    aria-expanded={showAllNotes}
                    aria-controls="notes-list"
                    className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                  >{showAllNotes ? 'Show fewer' : 'Show all notes'}</button>
                )}
              </>
            )}
          </div>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
            <h3 className="mb-2 text-[11px] uppercase tracking-wide font-semibold text-slate-600 dark:text-slate-300">Aromas</h3>
            {(!aromas || aromas.length===0) ? (
              <p className="text-sm-token italic text-slate-400 dark:text-slate-300">None yet <span className="not-italic text-[11px] text-slate-400 dark:text-slate-400">(add aromas)</span></p>
            ) : (
              <>
                <ul className="text-sm-token text-slate-700 dark:text-slate-300 space-y-1" aria-label="Aromas" id="aromas-list">
                  {visibleAromasRaw.map(id => {
                    const lbl = aromaMap[id] || '';
                    return <li key={id} className="leading-snug truncate" title={lbl}>{lbl}</li>;
                  })}
                </ul>
                {needsAromasToggle && (
                  <button
                    type="button"
                    onClick={onToggleShowAllAromas}
                    aria-expanded={showAllAromas}
                    aria-controls="aromas-list"
                    className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                  >{showAllAromas ? 'Show fewer' : 'Show all aromas'}</button>
                )}
              </>
            )}
          </div>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
            <h3 className="mb-2 text-[11px] uppercase tracking-wide font-semibold text-slate-600 dark:text-slate-300">Vibes</h3>
            {(!vibes || vibes.length===0) ? (
              <p className="text-sm-token italic text-slate-400 dark:text-slate-300">None yet <span className="not-italic text-[11px] text-slate-400 dark:text-slate-400">(add vibes)</span></p>
            ) : (
              <>
                <ul className="text-sm-token text-slate-700 dark:text-slate-300 space-y-1" aria-label="Vibes" id="vibes-list">
                  {visibleVibes.map(id => {
                    const lbl = vibeMap[id] || '';
                    return <li key={id} className="leading-snug truncate" title={lbl}>{lbl}</li>;
                  })}
                </ul>
                {needsVibesToggle && (
                  <button
                    type="button"
                    onClick={onToggleShowAllVibes}
                    aria-expanded={showAllVibes}
                    aria-controls="vibes-list"
                    className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                  >{showAllVibes ? 'Show fewer' : 'Show all vibes'}</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default OilDetailHero;
