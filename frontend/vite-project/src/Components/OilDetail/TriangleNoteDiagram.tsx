import React, { useMemo } from 'react';

interface TriangleNoteDiagramProps {
  notes?: number[];
  noteMap: Record<number,string>;
  className?: string;
}

const classify = (label: string): 'top'|'middle'|'base'|'unknown' => {
  const l = label.toLowerCase();
  if (l.includes('top')) return 'top';
  if (l.includes('middle')) return 'middle';
  if (l.includes('base')) return 'base';
  return 'unknown';
};

// Triangle subdivided horizontally into 3 bands: top (small apex), middle, base (largest)
// We fill a band if there is at least one note of that classification.
const TriangleNoteDiagram: React.FC<TriangleNoteDiagramProps> = ({ notes, noteMap, className }) => {
  const presence = useMemo(() => {
    const result = { top:false, middle:false, base:false };
    (notes||[]).forEach(id => { const layer = classify(noteMap[id]||''); if(layer==='top'||layer==='middle'||layer==='base') result[layer]=true; });
    return result;
  }, [notes, noteMap]);

  const labelsByLayer = useMemo(() => {
    const layers: Record<'top'|'middle'|'base', string[]> = { top:[], middle:[], base:[] };
    (notes||[]).forEach(id => { const layer = classify(noteMap[id]||''); if(layer==='top'||layer==='middle'||layer==='base') layers[layer].push(noteMap[id]||String(id)); });
    return layers;
  }, [notes, noteMap]);

  return (
    <div className={className} aria-label="Note pyramid triangle">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-wide font-semibold text-slate-600 dark:text-slate-300">Note Pyramid</h2>
        <span className="text-[10px] text-slate-400">visual</span>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <svg
          viewBox="0 0 100 100"
          className="w-40 h-40 mx-auto flex-shrink-0"
          role="img"
          aria-label={`Top:${presence.top?'yes':'no'} Middle:${presence.middle?'yes':'no'} Base:${presence.base?'yes':'no'}`}
        >
          {/* Outline */}
          <polygon points="50,2 98,98 2,98" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-600" />
          {/* Base band */}
          <polygon
            points="50,2 98,98 2,98"
            fill={presence.base ? 'url(#baseFill)' : 'none'}
            opacity={presence.base ? 0.55 : 0}
          />
          {/* Middle mask */}
          <polygon
            points="50,2 85,85 15,85"
            fill={presence.middle ? 'url(#middleFill)' : 'none'}
            opacity={presence.middle ? 0.6 : 0}
          />
          {/* Top mask */}
            <polygon
              points="50,2 70,60 30,60"
              fill={presence.top ? 'url(#topFill)' : 'none'}
              opacity={presence.top ? 0.75 : 0}
            />
          <defs>
            <linearGradient id="baseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="middleFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="topFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
        {/* Labels */}
        <div className="flex-1 space-y-4">
          {(['top','middle','base'] as const).map(layer => (
            <div key={layer} className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1 text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                <span className={`h-2 w-2 rounded-full ${presence[layer] ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} aria-hidden="true" />
                {layer} note{labelsByLayer[layer].length!==1 && 's'}
              </div>
              <div className="flex flex-wrap gap-1">
                {labelsByLayer[layer].length === 0 && <span className="text-xs text-slate-400">—</span>}
                {labelsByLayer[layer].map(lbl => (
                  <span key={lbl} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs-token font-medium shadow-sm">
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">Filled triangle bands indicate which note layers this oil commonly represents.</p>
    </div>
  );
};

export default TriangleNoteDiagram;