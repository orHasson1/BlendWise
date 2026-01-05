import React from 'react';
import { categorizeVibe, VIBE_CATEGORIES } from '../../design/vibes';
import { Heart, Pencil, Trash2 } from 'lucide-react';

// ----- Types -----
interface EssentialOilLite { id:number; name:string; notes:number[]; aromas:number[]; vibes:number[]; }
interface NoteLite { id:number; name:string; label?:string; }
interface IngredientDetail { id:number; oil: EssentialOilLite; drops:number; note: NoteLite | null; }
export interface BlendSerializerShape {
  id:number;
  name:string;
  description?:string|null;
  created_by:string;
  is_public:boolean;
  oils: EssentialOilLite[];
  ingredients_detail: IngredientDetail[];
}

interface BlendCardProps {
  blend: BlendSerializerShape;
  onClick?: (blend: BlendSerializerShape) => void;
  compact?: boolean; // if true start collapsed
  ownerUsername?: string; // current logged in user for ownership badge
  favorite?: boolean; // is this blend favorited by current user
  onFavoriteToggle?: (blend: BlendSerializerShape, next: boolean) => void; // toggle handler
  vibeMap?: Record<number, string>; // map of vibe ID to label
  isOwner?: boolean; // whether current user owns this blend
  onEdit?: (blend: BlendSerializerShape) => void; // edit handler
  onDelete?: (blend: BlendSerializerShape) => void; // delete handler
}

const BlendCard: React.FC<BlendCardProps> = ({ blend, onClick, compact=false, ownerUsername, favorite, onFavoriteToggle, vibeMap = {}, isOwner, onEdit, onDelete }) => {
  // For compact cards we never expand; for full cards allow toggle
  const [expanded, setExpanded] = React.useState(!compact);
  const ingredients = blend.ingredients_detail || [];
  const totalDrops = React.useMemo(() => ingredients.reduce((acc,i)=> acc + (i.drops||0), 0), [ingredients]);

  // Aggregate note usage (drops per note label)
  const noteSummary = React.useMemo(() => {
    const counts: Record<string, number> = {};
    ingredients.forEach(ing => {
      const label = ing.note?.label || ing.note?.name || '—';
      counts[label] = (counts[label]||0) + ing.drops;
    });
    return Object.entries(counts).sort((a,b)=> b[1]-a[1]);
  }, [ingredients]);

  // Unique vibes across oils
  const uniqueVibes = React.useMemo(() => {
    const set = new Set<string>();
    ingredients.forEach(ing => (ing.oil.vibes||[]).forEach(v => set.add(String(v))));
    return Array.from(set);
  }, [ingredients]);
  const showVibes = uniqueVibes.length > 0;

  // Build vibe chips with actual labels from vibeMap
  const vibeChips = React.useMemo(() => showVibes ? uniqueVibes.slice(0,6).map(vId => {
    const label = vibeMap[Number(vId)] || `Vibe ${vId}`;
    const cat = categorizeVibe(label);
    const theme = VIBE_CATEGORIES[cat];
    return (
      <li key={vId} className="contents">
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
            theme.chipBgLight, 'dark:' + theme.chipBgDark,
            theme.border,
            theme.textLight, 'dark:' + theme.textDark,
            'truncate max-w-[5rem]'
          ].join(' ')}
          title={label}
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${theme.dotLight} dark:${theme.dotDark}`} />
          {label}
        </span>
      </li>
    );
  }) : [] , [showVibes, uniqueVibes]);

  // Composition bar segments
  const compositionSegments = React.useMemo(() => ingredients.map((ing, idx) => {
    const pct = totalDrops ? (ing.drops / totalDrops * 100) : 0;
    const hue = 180 + (idx * 25);
    return (
      <div
        key={ing.id}
        style={{ width: pct + '%', backgroundColor: `hsl(${hue}deg 60% 70%)` }}
        className="h-2 first:rounded-l-full last:rounded-r-full relative group"
        aria-label={`${ing.oil.name} ${pct.toFixed(1)}%`}
        title={`${ing.oil.name} (${ing.drops} drops • ${pct.toFixed(1)}%)`}
      />
    );
  }), [ingredients, totalDrops]);

  // If compact, render simplified summary
  if (compact) {
    const oilNames = ingredients.map(i => i.oil.name);
    const MAX_CHIPS = 4;
    const visible = oilNames.slice(0, MAX_CHIPS);
    const remaining = oilNames.length - visible.length;
    const cardInner = (
      <>
        <h3 id={`blend-title-${blend.id}`} className="text-md-token font-semibold tracking-tight mb-1 text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
          <span className="truncate" title={blend.name}>{blend.name}</span>
          {!blend.is_public && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300" title="Private blend">Private</span>
          )}
        </h3>
        {blend.description && (
          <p className="text-base-token text-slate-600 dark:text-slate-300 mb-2 line-clamp-2" title={blend.description}>{blend.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1" aria-label="Used oils">
          {visible.map(name => (
            <span
              key={name}
              title={name}
              className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
            >
              {name}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title={oilNames.slice(MAX_CHIPS).join(', ')}>+{remaining} more</span>
          )}
          {oilNames.length === 0 && (
            <span className="text-[11px] italic text-slate-400 dark:text-slate-500">No oils yet</span>
          )}
        </div>
      </>
    );

    // If onClick provided make whole card clickable for better ergonomics
    if (onClick) {
      return (
        <button
          type="button"
          onClick={() => onClick(blend)}
          className="card relative text-left w-full transition-shadow hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
          aria-labelledby={`blend-title-${blend.id}`}
        >
          <div className="card-body space-y-2 pr-10">
            {cardInner}
          </div>
          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            {isOwner && onEdit && (
              <button
                type="button"
                onClick={(e)=>{ e.stopPropagation(); onEdit(blend); }}
                aria-label="Edit blend"
                className="rounded-md p-1.5 transition-colors bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isOwner && onDelete && (
              <button
                type="button"
                onClick={(e)=>{ e.stopPropagation(); onDelete(blend); }}
                aria-label="Delete blend"
                className="rounded-md p-1.5 transition-colors bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={(e)=>{ e.stopPropagation(); onFavoriteToggle(blend, !favorite); }}
                aria-label={favorite ? 'Remove favorite' : 'Add to favorites'}
                className={`rounded-md p-1.5 transition-colors ${favorite ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              >
                <Heart className={`h-4 w-4 ${favorite ? 'fill-pink-500 stroke-pink-500 dark:fill-pink-400 dark:stroke-pink-400' : ''}`} />
              </button>
            )}
          </div>
        </button>
      );
    }

    return (
      <div className="card relative dark:bg-slate-800 dark:border-slate-700" aria-labelledby={`blend-title-${blend.id}`}> 
        <div className="card-body space-y-2">
          {cardInner}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {isOwner && onEdit && (
            <button
              type="button"
              onClick={(e)=>{ e.stopPropagation(); onEdit(blend); }}
              aria-label="Edit blend"
              className="rounded-md p-1.5 transition-colors bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {isOwner && onDelete && (
            <button
              type="button"
              onClick={(e)=>{ e.stopPropagation(); onDelete(blend); }}
              aria-label="Delete blend"
              className="rounded-md p-1.5 transition-colors bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e)=>{ e.stopPropagation(); onFavoriteToggle(blend, !favorite); }}
              aria-label={favorite ? 'Remove favorite' : 'Add to favorites'}
              className={`rounded-md p-1.5 transition-colors ${favorite ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-pink-500 stroke-pink-500 dark:fill-pink-400 dark:stroke-pink-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card relative transition-shadow hover:shadow-lg dark:bg-slate-800 dark:border-slate-700" aria-labelledby={`blend-title-${blend.id}`}> 
      <div className="card-body space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 id={`blend-title-${blend.id}`} className="text-md-token font-semibold tracking-tight truncate flex items-center gap-2 text-slate-800 dark:text-slate-100">
            {blend.name}
            {!blend.is_public && (
              <span className="inline-flex items-center rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300" title="Private blend">Private</span>
            )}
          </h3>
          {blend.description && (
            <p className={"mt-1 text-base-token text-slate-600 dark:text-slate-300 " + (expanded ? '' : 'line-clamp-2')}>{blend.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={()=>setExpanded(e=>!e)}
            aria-expanded={expanded}
            className="rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
          <div className="flex gap-1">
            {isOwner && onEdit && (
              <button
                type="button"
                onClick={()=>onEdit(blend)}
                aria-label="Edit blend"
                className="rounded-md px-2 py-1 text-[11px] font-medium flex items-center gap-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {isOwner && onDelete && (
              <button
                type="button"
                onClick={()=>onDelete(blend)}
                aria-label="Delete blend"
                className="rounded-md px-2 py-1 text-[11px] font-medium flex items-center gap-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          {onClick && (
            <button
              type="button"
              onClick={()=>onClick(blend)}
              className="rounded-md px-2 py-1 text-[11px] font-medium bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/50"
            >View</button>
          )}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={()=>onFavoriteToggle(blend, !favorite)}
              aria-label={favorite ? 'Remove favorite' : 'Add to favorites'}
              className={`rounded-md px-2 py-1 text-[11px] font-medium flex items-center gap-1 border ${favorite ? 'border-pink-300 bg-pink-50 text-pink-600 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <Heart className={`h-3.5 w-3.5 ${favorite ? 'fill-pink-500 stroke-pink-500 dark:fill-pink-400 dark:stroke-pink-400' : ''}`} />
              {favorite ? 'Liked' : 'Like'}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 px-2 py-0.5" title="Total oils">{ingredients.length} oils</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-2 py-0.5" title="Total drops">{totalDrops} drops</span>
          {noteSummary.slice(0,3).map(([label,val]) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-2 py-0.5" title={`${label}: ${val} drops`}>{label}: {val}</span>
          ))}
          {noteSummary.length > 3 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-0.5" title="More notes">+{noteSummary.length - 3} notes</span>
          )}
          {vibeChips.length > 0 && (
            <ul className="flex flex-wrap gap-1" aria-label="Vibes">
              {vibeChips}
              {uniqueVibes.length > 6 && (
                <li>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-[10px]" title="More vibes">+{uniqueVibes.length - 6}</span>
                </li>
              )}
            </ul>
          )}
        </div>
        {ingredients.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Composition</span>
              <span>{totalDrops} drops</span>
            </div>
            <div className="flex w-full overflow-hidden rounded-full h-2 bg-slate-100 dark:bg-slate-700">
              {compositionSegments}
            </div>
          </div>
        )}
      </div>

      {/* Details Table */}
      {expanded && (
        <div className="mt-4">
          {ingredients.length === 0 && <div className="text-xs text-slate-500">No ingredients recorded.</div>}
          {ingredients.length > 0 && (
            <table className="w-full text-[11px] border-collapse" aria-label="Blend composition breakdown">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400">
                  <th className="text-left font-medium pb-1">Oil</th>
                  <th className="text-left font-medium pb-1">Note</th>
                  <th className="text-right font-medium pb-1">Drops</th>
                  <th className="text-right font-medium pb-1">%</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => {
                  const pct = totalDrops ? (ing.drops / totalDrops * 100) : 0;
                  return (
                    <tr key={ing.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-1 pr-2">
                        <span className="truncate block max-w-[10rem]" title={ing.oil.name}>{ing.oil.name}</span>
                      </td>
                      <td className="py-1 pr-2">
                        {ing.note?.label || ing.note?.name || '—'}
                      </td>
                      <td className="py-1 pr-2 text-right font-semibold">{ing.drops}</td>
                      <td className="py-1 pl-2 text-right" title={`${pct.toFixed(2)}% of total`}>{pct.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
        <span>Created by {blend.created_by}</span>
        {ownerUsername && ownerUsername === blend.created_by && (
          <span className="text-teal-600 dark:text-teal-300" title="You own this blend">Owner</span>
        )}
      </div>
      </div>
    </div>
  );
};

export default BlendCard;
