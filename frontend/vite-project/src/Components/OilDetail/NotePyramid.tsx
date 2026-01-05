import React from 'react';

interface NotePyramidProps {
  notes?: number[];
  noteMap: Record<number,string>;
}

// We expect note labels to contain Top / Middle / Base words; fallback to 'Unknown'
const classify = (label: string): 'top'|'middle'|'base'|'unknown' => {
  const l = label.toLowerCase();
  if (l.includes('top')) return 'top';
  if (l.includes('middle')) return 'middle';
  if (l.includes('base')) return 'base';
  return 'unknown';
};

const NotePyramid: React.FC<NotePyramidProps> = ({ notes, noteMap }) => {
  const chips = (notes||[]).map(id => ({ id, label: noteMap[id] || String(id), layer: classify(noteMap[id]||'') }));
  const layers: Record<'top'|'middle'|'base'|'unknown', typeof chips> = { top: [], middle: [], base: [], unknown: [] };
  chips.forEach(c => { layers[c.layer].push(c); });

  // Visual pyramid: three stacked sections with proportional fill based on count
  const maxCount = Math.max(layers.top.length, layers.middle.length, layers.base.length, 1);
  const section = (layer: 'top'|'middle'|'base', title: string) => {
    const data = layers[layer];
    const fillRatio = data.length / maxCount; // 0..1
    return (
      <div className="relative flex flex-col gap-1" aria-label={`${title} note section`}>
        <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">{title}</div>
        <div className="relative rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
          <div
            className="absolute inset-0 bg-gradient-to-tr from-teal-500/15 to-teal-400/10 transition-all"
            style={{ opacity: 0.35 + fillRatio * 0.65 }}
            aria-hidden="true"
          />
          <div className="p-2 flex flex-wrap gap-1 min-h-[42px]">
            {data.length === 0 && <span className="text-xs text-slate-400">—</span>}
            {data.map(ch => (
              <span
                key={ch.id}
                title={`This oil is used as a ${layer} note in blends.`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-700 text-xs-token font-medium shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
                {ch.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3" aria-label="Note pyramid visualization">
      {section('top', 'Top')}
      {section('middle', 'Middle')}
      {section('base', 'Base')}
    </div>
  );
};

export default NotePyramid;