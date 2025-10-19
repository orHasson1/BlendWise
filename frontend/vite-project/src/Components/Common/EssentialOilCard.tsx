import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import client from '../../api/client';
import { Button } from '../ui/button';

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
}

const DESCRIPTION_THRESHOLD = 160; // character threshold to show Read more

const EssentialOilCard: React.FC<EssentialOilCardPropsExtended> = ({ id, name, notes, aromas, vibes, noteMap, aromaMap, vibeMap, description, wishlist, owned, onStatusChange }) => {
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

  const vibeColor = (label?: string) => {
    if (!label) return 'bg-primary-soft text-teal-700 dark:text-teal-300';
    const l = label.toLowerCase();
    if (/(calm|sooth|peace|seren)/.test(l)) return 'bg-tone-calm/20 text-tone-calm';
    if (/(energ|uplift|bright|happy)/.test(l)) return 'bg-tone-uplift/20 text-tone-uplift';
    if (/(focus|clarity|center)/.test(l)) return 'bg-tone-focus/20 text-tone-focus';
    if (/(relax|sleep|rest)/.test(l)) return 'bg-tone-relax/25 text-tone-relax';
    if (/(warm|comfort|cozy)/.test(l)) return 'bg-tone-warm/25 text-tone-warm';
    if (/(sooth|soft)/.test(l)) return 'bg-tone-soothe/25 text-tone-soothe';
    return 'bg-primary-soft text-teal-700 dark:text-teal-300';
  };

  const vibeBadges = (vibes || [])
    .map(v => ({ id: v, label: vibeMap?.[v] }))
    .filter(v => v.label)
    .map(v => (
  <span key={v.id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs-token font-medium ${vibeColor(v.label)}`}>
        {v.label}
      </span>
    ));

  // Summary line: take first note + up to first two vibes for quick scanning
  const primaryNote = (notes && notes.length && noteMap?.[notes[0]]) ? noteMap[notes[0]] : null;
  const vibeCluster = (vibeBadges.length ? (vibes || [])
    .map(id => vibeMap?.[id])
    .filter(Boolean)
    .slice(0,2)
    : []);
  const summaryParts = [primaryNote, vibeCluster.join(' / ')].filter(Boolean);
  const summary = summaryParts.join(' • ');

  return (
    <div className="card relative transition-shadow hover:shadow-lg dark:bg-slate-800 dark:border-slate-700">
      {(onStatusChange && (wishlist !== undefined || owned !== undefined)) && (
        <TooltipProvider delayDuration={150} skipDelayDuration={250}>
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
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
                <div>
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
  <h3 className="text-md-token font-semibold tracking-tight text-slate-800 dark:text-slate-100">{name}</h3>
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
        {summary && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {summary}
          </div>
        )}
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
            <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-0.5 flex items-center gap-2">Vibes {vibeBadges.length > 0 && <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />}</div>
            {vibeBadges.length > 0 ? (
              <div className="flex flex-wrap gap-1">{vibeBadges}</div>
            ) : (
              <div className="text-sm text-slate-700 dark:text-slate-200">—</div>
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
      className={`${common} ${active ? 'bg-emerald-100 border-emerald-300 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300' : 'bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 text-slate-500 hover:text-emerald-600 hover:border-emerald-300'}`}
    >
      <CheckCircle2 className={`h-4 w-4 ${active ? 'text-emerald-600' : ''}`} />
    </button>
  );
};

export default EssentialOilCard;
