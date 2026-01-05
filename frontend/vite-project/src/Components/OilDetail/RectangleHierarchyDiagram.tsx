import React, { useMemo } from 'react';

interface RectangleHierarchyDiagramProps {
  notes?: number[]; // NoteType ids
  noteMap: Record<number,string>; // Map id -> backend name ('top'|'middle'|'base') or human label
  className?: string;
  humanize?: boolean; // whether to title-case labels in chips
}

// Backend defines canonical names; accept exact matches, else bucket as 'unclassified'.
const classify = (raw: string): 'top'|'middle'|'base'|'unclassified' => {
  const v = (raw||'').toLowerCase();
  if (v === 'top') return 'top';
  if (v === 'middle') return 'middle';
  if (v === 'base') return 'base';
  return 'unclassified';
};

const RectangleHierarchyDiagram: React.FC<RectangleHierarchyDiagramProps> = ({ notes, noteMap, className, humanize=true }) => {
  const layers = useMemo(() => {
    const layerData: Record<'top'|'middle'|'base'|'unclassified', string[]> = { top:[], middle:[], base:[], unclassified:[] };
    (notes||[]).forEach(id => {
      const raw = noteMap[id] || String(id);
      const layer = classify(raw);
      layerData[layer].push(raw);
    });
    return layerData;
  }, [notes, noteMap]);

  const counts = { top: layers.top.length, middle: layers.middle.length, base: layers.base.length, unclassified: layers.unclassified.length };
  const maxCount = Math.max(1, counts.top, counts.middle, counts.base);
  const presence = { top: counts.top>0, middle: counts.middle>0, base: counts.base>0 };

  // Derive opacity classes scaling 40%..80% based on relative count share
  const opacityFor = (layer: 'top'|'middle'|'base') => {
    if (!presence[layer]) return 'bg-transparent';
    const ratio = counts[layer] / maxCount; // 0..1
    if (ratio > 0.66) return 'from-teal-400/80 to-teal-500/80';
    if (ratio > 0.33) return 'from-teal-400/60 to-teal-500/60';
    return 'from-teal-400/40 to-teal-500/40';
  };

  // Heights allocate more space to base naturally: using flex proportions 2:3:4 (top:middle:base) for visual hierarchy
  return (
    <div className={className} aria-label="Hierarchical note diagram">
      <h2 className="text-xs uppercase tracking-wide font-semibold text-slate-600 dark:text-slate-300 mb-2">Note Hierarchy</h2>
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex flex-col w-44 h-60 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm">
          <div className={`flex-2 relative border-b border-slate-200 dark:border-slate-700 ${presence.top ? 'bg-gradient-to-r ' + opacityFor('top') : 'bg-transparent'}`}
               aria-label={`Top layer ${presence.top ? 'present' : 'empty'}`}> 
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-semibold tracking-wide uppercase text-white drop-shadow-sm">Top</span>
            </div>
          </div>
          <div className={`flex-3 relative border-b border-slate-200 dark:border-slate-700 ${presence.middle ? 'bg-gradient-to-r ' + opacityFor('middle') : 'bg-transparent'}`}
               aria-label={`Middle layer ${presence.middle ? 'present' : 'empty'}`}> 
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[10px] font-semibold tracking-wide uppercase ${presence.middle ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>Middle</span>
            </div>
          </div>
          <div className={`flex-4 relative ${presence.base ? 'bg-gradient-to-r ' + opacityFor('base') : 'bg-transparent'}`}
               aria-label={`Base layer ${presence.base ? 'present' : 'empty'}`}> 
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[10px] font-semibold tracking-wide uppercase ${presence.base ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>Base</span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {(['top','middle','base'] as const).map(layer => (
            <div key={layer} className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                <span className={`h-2 w-2 rounded-full ${presence[layer] ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} aria-hidden="true" />
                {layer} note{counts[layer]!==1 && 's'} ({counts[layer]})
              </div>
              <div className="flex flex-wrap gap-1">
                {layers[layer].length === 0 && <span className="text-xs text-slate-400">—</span>}
                {layers[layer].map(lbl => (
                  <span key={lbl} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs-token font-medium shadow-sm">{humanize ? lbl.replace(/\b\w/g, c=>c.toUpperCase()) : lbl}</span>
                ))}
              </div>
            </div>
          ))}
          {counts.unclassified > 0 && (
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                Unclassified ({counts.unclassified})
              </div>
              <div className="flex flex-wrap gap-1">
                {layers.unclassified.map(lbl => (
                  <span key={lbl} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600 text-xs-token font-medium shadow-sm" title="Note not assigned to top/middle/base">{humanize ? lbl.replace(/\b\w/g, c=>c.toUpperCase()) : lbl}</span>
                ))}
              </div>
            </div>
          )}
          {notes && notes.length === 0 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">No note layering data for this oil.</div>
          )}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Bands represent canonical layers (Top, Middle, Base). Unclassified notes appear separately. Opacity indicates relative abundance among classified layers.</p>
    </div>
  );
};

export default RectangleHierarchyDiagram;