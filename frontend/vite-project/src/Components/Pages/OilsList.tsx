import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, Droplets, Filter, Search, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import client from '../../api/client';
import EssentialOilCompactItem from '../Common/EssentialOilCompactItem';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import Skeleton from '../Common/Skeleton';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import Surface from '../Common/Surface';
import PageHeader from '../Common/PageHeader';
import { VIBE_CATEGORIES, categorizeVibe } from '../../design/vibes';
interface Oil {
  id: number;
  name: string;
  notes?: number[];
  aromas?: number[];
  vibes?: number[];
  description?: string | null;
}

interface OilsListProps { isLoggedIn?: boolean }
const OilsList: React.FC<OilsListProps> = ({ isLoggedIn = false }) => {
  const [oils, setOils] = useState<Oil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [selectedAromas, setSelectedAromas] = useState<number[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<number[]>([]);
  const [noteOptions, setNoteOptions] = useState<{ id: number; name: string }[]>([]);
  const [aromaOptions, setAromaOptions] = useState<{ id: number; name: string }[]>([]);
  const [vibeOptions, setVibeOptions] = useState<{ id: number; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);
  // Only compact mode now
  const [activeOilId] = useState<number | null>(null); // removed modal usage

  // Precompute mapping tables once (avoid redoing per card render)
  const noteMap = useMemo(() => Object.fromEntries(noteOptions.map(x => [x.id, (x as any).label || x.name])), [noteOptions]);
  const aromaMap = useMemo(() => Object.fromEntries(aromaOptions.map(x => [x.id, (x as any).label || x.name])), [aromaOptions]);
  const vibeMap = useMemo(() => Object.fromEntries(vibeOptions.map(x => [x.id, (x as any).label || x.name])), [vibeOptions]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    client
      .get('/essential-oils/')
      .then((res) => {
        if (!mounted) return;
        setOils(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        // show a more helpful error message when available
        const msg = err?.response?.data || err?.message || 'Failed to load oils';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // fetch wishlist/owned summary for authenticated users
  useEffect(() => {
    if(!isLoggedIn) return;
    let mounted = true;
    client.get('/oil-relations/summary/')
      .then(res => { if(!mounted) return; setWishlistIds(res.data?.wishlist || []); setOwnedIds(res.data?.owned || []); })
      .catch(()=>{})
    return () => { mounted = false; };
  }, [isLoggedIn]);

  // fetch label lists for filter dropdowns
  useEffect(() => {
    let mounted = true;
    client.get('/notes/').then((res) => mounted && setNoteOptions(res.data || [])).catch(() => {});
    client.get('/aromas/').then((res) => mounted && setAromaOptions(res.data || [])).catch(() => {});
    client.get('/vibes/').then((res) => mounted && setVibeOptions(res.data || [])).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // derive available option ids from fetched oils
  const availableNotes = useMemo(() => {
    const s = new Set<number>();
    oils.forEach((o) => (o.notes || []).forEach((n) => s.add(n)));
    return Array.from(s).sort((a, b) => a - b);
  }, [oils]);

  const availableAromas = useMemo(() => {
    const s = new Set<number>();
    oils.forEach((o) => (o.aromas || []).forEach((n) => s.add(n)));
    return Array.from(s).sort((a, b) => a - b);
  }, [oils]);

  const availableVibes = useMemo(() => {
    const s = new Set<number>();
    oils.forEach((o) => (o.vibes || []).forEach((n) => s.add(n)));
    return Array.from(s).sort((a, b) => a - b);
  }, [oils]);

  const clearFilters = () => {
    setSelectedNotes([]);
    setSelectedAromas([]);
    setSelectedVibes([]);
  };

  // filter logic: within a group OR, across groups AND
  const filtered = oils.filter((o) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const inName = o.name.toLowerCase().includes(q);
      const inDesc = (o as any).description ? ((o as any).description || '').toLowerCase().includes(q) : false;
      if (!inName && !inDesc) return false;
    }
    if (selectedNotes.length > 0) {
      const hit = (o.notes || []).some((n) => selectedNotes.includes(n));
      if (!hit) return false;
    }
    if (selectedAromas.length > 0) {
      const hit = (o.aromas || []).some((n) => selectedAromas.includes(n));
      if (!hit) return false;
    }
    if (selectedVibes.length > 0) {
      const hit = (o.vibes || []).some((n) => selectedVibes.includes(n));
      if (!hit) return false;
    }
    return true;
  }).sort((a,b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  const toggle = (listSetter: React.Dispatch<React.SetStateAction<number[]>>, arr: number[], value: number) => {
    if (arr.includes(value)) listSetter(arr.filter((x) => x !== value));
    else listSetter([...arr, value]);
  };

  const [refineOpen, setRefineOpen] = useState(false);

  // close refine on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setRefineOpen(false); };
    if (refineOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [refineOpen]);

  const optionLabel = (arr: {id:number; name:string}[], id:number) => {
    const o = arr.find(x=>x.id===id); return o ? ((o as any).label || o.name) : String(id);
  };

  // Consolidated filter group meta to guarantee stable ordering across desktop & mobile
  const filterGroups: Array<{
    key: 'notes' | 'aromas' | 'vibes';
    title: string;
    options: {id:number; name:string}[];
    selected: number[];
    toggle: (id:number)=>void;
  }> = [
    { key: 'notes', title: `Notes (${selectedNotes.length || 0})`, options: noteOptions.filter(o=>availableNotes.includes(o.id)), selected: selectedNotes, toggle: (id)=>toggle(setSelectedNotes, selectedNotes, id) },
    { key: 'aromas', title: `Aromas (${selectedAromas.length || 0})`, options: aromaOptions.filter(o=>availableAromas.includes(o.id)), selected: selectedAromas, toggle: (id)=>toggle(setSelectedAromas, selectedAromas, id) },
    { key: 'vibes', title: `Vibes (${selectedVibes.length || 0})`, options: vibeOptions, selected: selectedVibes, toggle: (id)=>toggle(setSelectedVibes, selectedVibes, id) }
  ];

  // Dark mode toggle moved to TopNavbar

  return (
    <div>
  {/* Removed accent stripe for cleaner header spacing */}
      <PageHeader
        title="Essential Oils"
        icon={<Droplets className="h-6 w-6" />}
        subtitle={`Explore ${filtered.length} ${filtered.length === 1 ? 'oil' : 'oils'}${filtered.length !== oils.length ? ` of ${oils.length}` : ''} • Refine by aromatic notes, aroma families & emotional vibes.`}
        actions={<div className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" aria-label="Result count">{filtered.length} result{filtered.length!==1 && 's'}</div>}
      />
      {/* Layout with Refine Aside */}
      <div className="flex gap-8">
        {/* Desktop Aside */}
        <aside className="hidden lg:block w-64 shrink-0">
          {/* Use fixed height instead of only max-h so internal flex layout can calculate and overflow */}
          <div className="sticky top-[5.25rem] h-[calc(100vh-5.25rem)] pr-1">
            <Surface elevation={1} className="p-0 h-full flex flex-col">
              {/* Fixed header portion */}
              <div className="p-4 pb-3 border-b border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1"><Filter className="h-4 w-4" />Refine</h2>
                  {(selectedNotes.length+selectedAromas.length+selectedVibes.length>0 || search) && (
                    <button onClick={clearFilters} className="text-xs text-brand hover:underline">Reset</button>
                  )}
                </div>
                <div className="mt-3">
                  <div className="relative">
                    <Input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search..." className="pl-8" />
                    <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 refine-scroll scrollbar-thin">
                {filterGroups.map(g => (
                  <FilterGroup key={g.key} title={g.title} options={g.options} selected={g.selected} onToggle={g.toggle} />
                ))}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">Sort</label>
                  <select value={sort} onChange={e=>setSort(e.target.value as any)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="name-asc">Name A → Z</option>
                    <option value="name-desc">Name Z → A</option>
                  </select>
                </div>
              </div>
            </Surface>
          </div>
        </aside>
        {/* Main content column */}
        <div className="flex-1 min-w-0">
          {/* Mobile refine trigger & result summary */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <Button variant="secondary" size="sm" onClick={()=>setRefineOpen(true)} className="gap-1"><Filter className="h-4 w-4" />Refine</Button>
            <div className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} result{filtered.length!==1 && 's'}</div>
          </div>
          {/* Active filter chips */}
          {(search || selectedNotes.length+selectedAromas.length+selectedVibes.length>0) && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              {search && (
                <Badge variant="primary" className="flex items-center gap-1 pr-1">Search: {search}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>setSearch('')}><X className="h-3 w-3" /></button></Badge>
              )}
              {selectedNotes.map(id => (
                <Badge key={`chip-note-${id}`} variant="primary" className="flex items-center gap-1 pr-1">{optionLabel(noteOptions, id)}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>toggle(setSelectedNotes, selectedNotes, id)}><X className="h-3 w-3" /></button></Badge>
              ))}
              {selectedAromas.map(id => (
                <Badge key={`chip-aroma-${id}`} variant="primary" className="flex items-center gap-1 pr-1">{optionLabel(aromaOptions, id)}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>toggle(setSelectedAromas, selectedAromas, id)}><X className="h-3 w-3" /></button></Badge>
              ))}
              {selectedVibes.map(id => {
                const label = optionLabel(vibeOptions, id);
                const cat = categorizeVibe(label);
                const theme = VIBE_CATEGORIES[cat];
                return (
                  <span key={`chip-vibe-${id}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs-token font-medium ${theme.chipBgLight} dark:${theme.chipBgDark} ${theme.border} ${theme.textLight} dark:${theme.textDark}`}>
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${theme.dotLight} dark:${theme.dotDark}`} />
                    <span className="truncate max-w-[5.5rem]" title={label}>{label}</span>
                    <button aria-label="Remove vibe filter" className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-slate-200/50 dark:hover:bg-slate-600/40" onClick={()=>toggle(setSelectedVibes, selectedVibes, id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear All</Button>
            </div>
          )}
          {/* Content */}
          {loading && (
            <div className="oil-grid mb-6" aria-label="Loading results">
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
                  <Skeleton className="w-1/2" variant="line" />
                  <Skeleton className="w-full" variant="line" />
                  <Skeleton className="w-5/6" variant="line" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="w-12" variant="badge" />
                    <Skeleton className="w-16" variant="badge" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="mb-6">
              <Alert intent="error" title="Failed to load oils" actions={
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              }>
                {error}
              </Alert>
            </div>
          )}
          <div>
            {filtered.length === 0 && !loading ? (
              <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white/40 dark:bg-slate-800/40">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-mist dark:bg-slate-700 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-brand-dark dark:text-slate-300" />
                </div>
                <h2 className="text-lg font-semibold mb-1">No matching oils</h2>
                <p className="text-base-token text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">Try adjusting your search or removing some filters to broaden the results.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="secondary" size="sm" onClick={clearFilters}>Clear All Filters</Button>
                  {search && <Button size="sm" onClick={()=>setSearch('')}>Reset Search</Button>}
                </div>
              </div>
            ) : (
              <div className="space-y-1" role="list" aria-label="Essential oils list (compact)">
                {filtered.map(o => (
                  <EssentialOilCompactItem
                    key={o.id}
                    id={o.id}
                    name={o.name}
                    owned={isLoggedIn ? ownedIds.includes(o.id) : undefined}
                    wishlist={isLoggedIn ? wishlistIds.includes(o.id) : undefined}
                    onOpen={(id)=>{ window.location.href = `/essential-oils/${id}`; }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal removed: navigation now handles detail view */}
      {/* Mobile Refine Drawer */}
      {refineOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={()=>setRefineOpen(false)} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 w-72 z-50 p-4 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide flex items-center gap-1 text-slate-700 dark:text-slate-200"><Filter className="h-4 w-4" />Refine</h2>
              <button onClick={()=>setRefineOpen(false)} aria-label="Close refine" className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Input type="search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search..." className="pl-8" />
                <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-5">
              <div className="space-y-4">
                {filterGroups.map(g => (
                  <FilterGroup key={g.key} title={g.title} options={g.options} selected={g.selected} onToggle={g.toggle} />
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">Sort</label>
                <select value={sort} onChange={e=>setSort(e.target.value as any)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand">
                  <option value="name-asc">Name A → Z</option>
                  <option value="name-desc">Name Z → A</option>
                </select>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={clearFilters}>Clear</Button>
              <Button size="sm" className="flex-1" onClick={()=>setRefineOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterGroup: React.FC<{title:string; options:{id:number; name:string}[]; selected:number[]; onToggle:(id:number)=>void;}> = ({ title, options, selected, onToggle }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
  <button type="button" onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-3 py-2 text-left text-sm-token font-medium bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-brand">
        <span>{title}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="max-h-56 overflow-y-auto p-2 space-y-1 scrollbar-thin filter-options">
          {options.length === 0 && <div className="text-xs text-slate-400 px-1 py-1">No options</div>}
          {options.map(o => {
            const active = selected.includes(o.id);
            const label = (o as any).label || o.name;
            // If this is the vibes group (heuristic: title starts with 'Vibes' or options === vibeOptions length?) we show dot.
            const isVibeGroup = /^Vibes/i.test(title);
            let catTheme: any = null;
            if (isVibeGroup) {
              const cat = categorizeVibe(label);
              catTheme = VIBE_CATEGORIES[cat];
            }
            return (
              <label key={o.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60 text-sm-token cursor-pointer">
                <Checkbox checked={active} onCheckedChange={()=>onToggle(o.id)} />
                {isVibeGroup && (
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${catTheme.dotLight} dark:${catTheme.dotDark}`} />
                )}
                <span className="flex-1 truncate" title={label}>{label}</span>
                {active && isVibeGroup && (
                  <span className={`inline-flex items-center rounded-full border ml-auto px-1.5 py-0.5 text-[10px] font-medium ${catTheme.chipBgLight} dark:${catTheme.chipBgDark} ${catTheme.border} ${catTheme.textLight} dark:${catTheme.textDark}`}>On</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OilsList;
