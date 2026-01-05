import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import client from '../../api/client';
import { Button } from '../ui/button';
import { VIBE_CATEGORIES, categorizeVibe } from '../../design/vibes';

interface EssentialOilCardProps {
  id: number;
  name: string;
  notes?: number[];
  aromas?: number[];
  vibes?: number[];
  noteMap?: Record<number, string>;
  aromaMap?: Record<number, string>;
  vibeMap?: Record<number, string>;
}

interface EssentialOilCardPropsExtended extends EssentialOilCardProps {
  description?: string | null;
  wishlist?: boolean;
  owned?: boolean;
  onStatusChange?: (update: {wishlist?: boolean; owned?: boolean}) => void;
  hideTitle?: boolean; // when true, suppress internal name heading (modal already shows title)
}

const DESCRIPTION_THRESHOLD = 160; // character threshold to show Read more

const EssentialOilCard: React.FC<EssentialOilCardPropsExtended> = ({ id, name, notes, aromas, vibes, noteMap, aromaMap, vibeMap, description, wishlist, owned, onStatusChange, hideTitle }) => {
  const [descExpanded, setDescExpanded] = React.useState(false);
  const isLong = !!description && description.length > DESCRIPTION_THRESHOLD;
  const renderBadges = (ids?: number[], map?: Record<number, string>) => {
    if (!ids || ids.length === 0) return <span className="text-slate-400">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {ids.map((i) => (
          <span className="oil-badge" key={i}>
            {map && map[i] ? map[i] : `—`}
          </span>
        ))}
      </div>
    );
  };

  // Build vibe chips using centralized design tokens
  const vibeChips = React.useMemo(() => {
    return (vibes || [])
      .map(id => ({ id, label: vibeMap?.[id] }))
      .filter(v => v.label)
      .map(v => {
        const cat = categorizeVibe(v.label!);
        const theme = VIBE_CATEGORIES[cat];
        return (
          <li key={v.id} className="contents">
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs-token font-medium',
                'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                theme.chipBgLight, 'dark:' + theme.chipBgDark,
                theme.border,
                theme.textLight, 'dark:' + theme.textDark
              ].join(' ')}
            >
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${theme.dotLight} dark:${theme.dotDark}`} />
              <span className="truncate max-w-[6.5rem]" title={v.label!}>{v.label}</span>
            </span>
          </li>
        );
      });
  }, [vibes, vibeMap]);

  // Summary line: take first note + up to first two vibes for quick scanning
  // Removed summary line (note • vibes) per user request.
  // If reintroduced, ensure shorter vibe labels or limit slashes for readability.

  return (
    <div className="card relative transition-shadow hover:shadow-lg dark:bg-slate-800 dark:border-slate-700">
      {(onStatusChange && (wishlist !== undefined || owned !== undefined)) && (
        <TooltipProvider delayDuration={150} skipDelayDuration={250}>
          {/* Single overlay toolbar container: pointer-events-none wrapper with interactive children */}
          <div className="absolute top-2 right-2 flex gap-1 z-10 pointer-events-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="pointer-events-auto">
                  <IconToggle
                    active={!!wishlist && !owned}
                    variant="wishlist"
                    onClick={async ()=>{
                      if(!onStatusChange) return; 
                      try {
                        if (wishlist && !owned) {
                          await client.delete(`/oil-relations/by-oil/?oil_id=${id}&list_type=wishlist`);
                          onStatusChange({ wishlist: false });
                        } else {
                          await client.post(`/oil-relations/`, { oil_id: id, list_type: 'wishlist' });
                          onStatusChange({ wishlist: true, owned: false });
                        }
                      } catch(e) { console.error(e); }
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">{wishlist && !owned ? 'Remove from wishlist' : 'Add to wishlist'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="pointer-events-auto">
                  <IconToggle
                    active={!!owned}
                    variant="owned"
                    onClick={async ()=>{
                      if(!onStatusChange) return; 
                      try {
                        if (owned) {
                          await client.delete(`/oil-relations/by-oil/?oil_id=${id}&list_type=owned`);
                          onStatusChange({ owned: false });
                        } else {
                          await client.post(`/oil-relations/`, { oil_id: id, list_type: 'owned' });
                          onStatusChange({ owned: true, wishlist: false });
                        }
                      } catch(e) { console.error(e); }
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">{owned ? 'Remove from owned list' : 'Mark as owned'}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}
      <div className="card-body space-y-3 pr-12">
        {!hideTitle && (
          <h3 className="text-md-token font-semibold tracking-tight text-slate-800 dark:text-slate-100" data-testid="oil-name">{name}</h3>
        )}
        {description && (
          <div className="relative">
            <p id={`oil-desc-${id}`} className={"text-base-token text-slate-600 dark:text-slate-300 " + (descExpanded ? '' : 'line-clamp-3')}>{description}</p>
            {/* Fade overlay when truncated plus subtle ellipsis glyph */}
            {!descExpanded && isLong && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-slate-800 to-transparent flex items-end justify-end pr-1 pb-0.5">
                <span aria-hidden="true" className="text-xs-token text-slate-400 dark:text-slate-500">…</span>
              </div>
            )}
            {isLong && (
              <button
                type="button"
                aria-expanded={descExpanded}
                aria-controls={`oil-desc-${id}`}
                aria-label={descExpanded ? 'Collapse full description' : 'Expand full description'}
                onClick={()=>setDescExpanded(e=>!e)}
                className="mt-1 inline-flex items-center text-xs font-medium text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-600/50 rounded"
              >
                {descExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        {/* Summary line removed as requested */}
        <div className="space-y-2">
          <div>
            <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-0.5">Notes</div>
            <div className="text-sm text-slate-700 dark:text-slate-200">{(notes || []).map((n) => noteMap?.[n] || '').filter(Boolean).join(', ') || '—'}</div>
          </div>
          <div>
            <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-0.5">Aromas</div>
            <div className="text-sm text-slate-700 dark:text-slate-200">{(aromas || []).map((n) => aromaMap?.[n] || '').filter(Boolean).join(', ') || '—'}</div>
          </div>
          <div>
            <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-2">
              Vibes {vibeChips.length > 0 && <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />}
            </div>
            {vibeChips.length === 0 && <div className="text-sm text-slate-700 dark:text-slate-200">—</div>}
            {vibeChips.length > 0 && (
              <ul role="list" aria-label="Emotional vibes" className="flex flex-wrap gap-1">
                {vibeChips.slice(0,6)}
                {vibeChips.length > 6 && (
                  <li>
                    <OverflowVibesButton total={vibeChips.length} hiddenItems={vibeChips.slice(6)} />
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface IconToggleProps { active: boolean; variant: 'wishlist' | 'owned'; onClick: () => void; }
const IconToggle: React.FC<IconToggleProps> = ({ active, variant, onClick }) => {
  const common = 'h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50';
  if (variant === 'wishlist') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        title={active ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={active}
        className={`${common} ${active ? 'bg-pink-100 border-pink-300 text-pink-600 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300' : 'bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-slate-500 hover:text-pink-600 hover:border-pink-300'}`}
      >
        <Heart className={`h-4 w-4 ${active ? 'fill-pink-500 text-pink-500' : ''}`} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from owned list' : 'Mark as owned'}
      title={active ? 'Remove from owned list' : 'Mark as owned'}
      aria-pressed={active}
      className={`${common} ${active ? 'bg-emerald-100 border-emerald-300 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300' : 'bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-slate-500 hover:text-emerald-600 hover:border-emerald-300'}`}
    >
      <CheckCircle2 className={`h-4 w-4 ${active ? 'text-emerald-600' : ''}`} />
    </button>
  );
};

export default EssentialOilCard;

// Overflow button that reveals hidden vibe chips inside tooltip
const OverflowVibesButton: React.FC<{ total:number; hiddenItems: React.ReactNode[] }> = ({ total, hiddenItems }) => {
  if (hiddenItems.length === 0) return null;
  const hiddenCount = hiddenItems.length;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Show ${hiddenCount} more vibes (total ${total})`}
            className="px-2 py-0.5 text-xs-token rounded-full border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            +{hiddenCount}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="flex flex-wrap gap-1">
            {hiddenItems}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
