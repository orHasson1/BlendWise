import React, { useEffect, useMemo, useState, useRef } from 'react';
import client from '../../api/client';
import EssentialOilCard from '../Common/EssentialOilCard';
import EssentialOilCompactItem from '../Common/EssentialOilCompactItem';
import { Droplets, PackageOpen, Filter, Search, X } from 'lucide-react';
import PageHeader from '../Common/PageHeader';
import EmptyState from '../Common/EmptyState';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import Surface from '../Common/Surface';
import Skeleton from '../Common/Skeleton';
import { VIBE_CATEGORIES, categorizeVibe } from '../../design/vibes';

interface Oil { id: number; name: string; notes?: number[]; aromas?: number[]; vibes?: number[]; description?: string | null }

// Owned list with full catalog-like refine & display controls
const UserOwned: React.FC = () => {
  const [oils, setOils] = useState<Oil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]); // should mirror oils ids
  // Filters & search
  const [search, setSearch] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [selectedAromas, setSelectedAromas] = useState<number[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<number[]>([]);
  const [sort, setSort] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [noteOptions, setNoteOptions] = useState<{id:number; name:string}[]>([]);
  const [aromaOptions, setAromaOptions] = useState<{id:number; name:string}[]>([]);
  const [vibeOptions, setVibeOptions] = useState<{id:number; name:string}[]>([]);
  const [displayMode, setDisplayMode] = useState<'card' | 'compact'>('card');
  const [activeOilId, setActiveOilId] = useState<number | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);

  // Load owned oils
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    client.get('/oil-relations/owned/')
      .then(res => { if(!mounted) return; const arr = res.data?.oils || []; setOils(arr); setOwnedIds(arr.map((o:Oil)=>o.id)); })
      .catch(e => { if(!mounted) return; setError(e?.message || 'Failed to load owned oils'); })
      .finally(()=> mounted && setLoading(false));
    return ()=>{ mounted = false; };
  }, []);

  // Summary (wishlist too so toggle buttons stay in sync)
  useEffect(() => {
    let mounted = true;
    client.get('/oil-relations/summary/')
      .then(res => { if(!mounted) return; setWishlistIds(res.data?.wishlist || []); /* owned already from owned endpoint */ })
      .catch(()=>{})
    return ()=>{ mounted = false; };
  }, []);

  // Fetch option label lists
  useEffect(() => {
    let mounted = true;
    client.get('/notes/').then(r=>mounted && setNoteOptions(r.data || [])).catch(()=>{});
    client.get('/aromas/').then(r=>mounted && setAromaOptions(r.data || [])).catch(()=>{});
    client.get('/vibes/').then(r=>mounted && setVibeOptions(r.data || [])).catch(()=>{});
    return ()=>{ mounted = false; };
  }, []);

  const noteMap = useMemo(()=>Object.fromEntries(noteOptions.map(o=>[o.id,(o as any).label || o.name])), [noteOptions]);
  const aromaMap = useMemo(()=>Object.fromEntries(aromaOptions.map(o=>[o.id,(o as any).label || o.name])), [aromaOptions]);
  const vibeMap = useMemo(()=>Object.fromEntries(vibeOptions.map(o=>[o.id,(o as any).label || o.name])), [vibeOptions]);

  const availableNotes = useMemo(()=>{ const s = new Set<number>(); oils.forEach(o=> (o.notes||[]).forEach(n=>s.add(n))); return Array.from(s).sort((a,b)=>a-b); }, [oils]);
  const availableAromas = useMemo(()=>{ const s = new Set<number>(); oils.forEach(o=> (o.aromas||[]).forEach(n=>s.add(n))); return Array.from(s).sort((a,b)=>a-b); }, [oils]);
  const availableVibes = useMemo(()=>{ const s = new Set<number>(); oils.forEach(o=> (o.vibes||[]).forEach(n=>s.add(n))); return Array.from(s).sort((a,b)=>a-b); }, [oils]);

  const toggleFilter = (setter:React.Dispatch<React.SetStateAction<number[]>>, arr:number[], id:number) => {
    if (arr.includes(id)) setter(arr.filter(x=>x!==id)); else setter([...arr,id]);
  };
  const clearFilters = () => { setSelectedNotes([]); setSelectedAromas([]); setSelectedVibes([]); };

  const filtered = oils.filter(o => {
    const q = search.trim().toLowerCase();
    if (q) {
      const inName = o.name.toLowerCase().includes(q);
      const inDesc = o.description ? o.description.toLowerCase().includes(q) : false;
      if(!inName && !inDesc) return false;
    }
    if (selectedNotes.length>0 && !(o.notes||[]).some(n=>selectedNotes.includes(n))) return false;
    if (selectedAromas.length>0 && !(o.aromas||[]).some(n=>selectedAromas.includes(n))) return false;
    if (selectedVibes.length>0 && !(o.vibes||[]).some(n=>selectedVibes.includes(n))) return false;
    return true;
  }).sort((a,b)=> sort==='name-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  // Close refine on ESC
  useEffect(()=>{
    const handler = (e:KeyboardEvent) => { if(e.key==='Escape') setRefineOpen(false); };
    if(refineOpen) window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [refineOpen]);

  const optionLabel = (arr:{id:number; name:string}[], id:number) => { const o = arr.find(x=>x.id===id); return o ? ((o as any).label || o.name) : String(id); };

  const filterGroups: Array<{key:'notes'|'aromas'|'vibes'; title:string; options:{id:number; name:string}[]; selected:number[]; toggle:(id:number)=>void;}> = [
    { key:'notes', title:`Notes (${selectedNotes.length})`, options: noteOptions.filter(o=>availableNotes.includes(o.id)), selected:selectedNotes, toggle:(id)=>toggleFilter(setSelectedNotes, selectedNotes, id) },
    { key:'aromas', title:`Aromas (${selectedAromas.length})`, options: aromaOptions.filter(o=>availableAromas.includes(o.id)), selected:selectedAromas, toggle:(id)=>toggleFilter(setSelectedAromas, selectedAromas, id) },
    { key:'vibes', title:`Vibes (${selectedVibes.length})`, options: vibeOptions.filter(o=>availableVibes.includes(o.id)), selected:selectedVibes, toggle:(id)=>toggleFilter(setSelectedVibes, selectedVibes, id) }
  ];

  // Status change from card (owned/wishlist). Removing owned should remove oil from list.
  const handleStatusChange = (oil:Oil) => (u:{wishlist?:boolean; owned?:boolean}) => {
    if (u.wishlist !== undefined) {
      setWishlistIds(prev => u.wishlist ? [...new Set([...prev, oil.id])] : prev.filter(id=>id!==oil.id));
      // Enforce mutual exclusivity
      if (u.wishlist) setOwnedIds(prev => prev.filter(id=>id!==oil.id));
    }
    if (u.owned !== undefined) {
      setOwnedIds(prev => u.owned ? [...new Set([...prev, oil.id])] : prev.filter(id=>id!==oil.id));
      if (u.owned) setWishlistIds(prev => prev.filter(id=>id!==oil.id));
      if (!u.owned) { // removed from owned list: drop from local oils collection
        setOils(prev => prev.filter(o=>o.id!==oil.id));
      }
    }
  };

  return (
    <div className="py-8">
      <PageHeader
        title="Owned Oils"
        icon={<Droplets className="h-6 w-6" />}
        subtitle={oils.length ? `${oils.length} oil${oils.length===1?'':'s'} in your collection` : 'Track which oils you physically have.'}
        actions={oils.length>0 && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" aria-label="Result count">{filtered.length} result{filtered.length!==1 && 's'}</div>
            <div className="inline-flex items-center gap-1" aria-label="Display mode toggle">
              <button type="button" onClick={()=>setDisplayMode('card')} className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${displayMode==='card' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'}`}>Cards</button>
              <button type="button" onClick={()=>setDisplayMode('compact')} className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${displayMode==='compact' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'}`}>Compact</button>
            </div>
          </div>
        )}
      />
      {loading && (
        <div className="oil-grid mb-6" aria-label="Loading owned oils">
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
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {!loading && oils.length === 0 && (
        <EmptyState
          icon={<PackageOpen className="h-8 w-8 text-brand" />}
          title="No owned oils yet"
          description="Mark oils as owned from the catalog to build your personal inventory and unlock blend insights."
          action={<Button variant="secondary" onClick={()=>window.location.href='/essential-oils'}>Browse Catalog</Button>}
        />
      )}
      {oils.length > 0 && (
        <div className="flex gap-8">
          {/* Desktop Aside */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-[5.25rem] h-[calc(100vh-5.25rem)] pr-1">
              <Surface elevation={1} className="p-0 h-full flex flex-col">
                <div className="p-4 pb-3 border-b border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1"><Filter className="h-4 w-4" />Refine</h2>
                    {(selectedNotes.length+selectedAromas.length+selectedVibes.length>0 || search) && (
                      <button onClick={clearFilters} className="text-xs text-brand hover:underline">Reset</button>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="relative">
                      <Input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-8" />
                      <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
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
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Button variant="secondary" size="sm" onClick={()=>setRefineOpen(true)} className="gap-1"><Filter className="h-4 w-4" />Refine</Button>
              <div className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} result{filtered.length!==1 && 's'}</div>
            </div>
            {(search || selectedNotes.length+selectedAromas.length+selectedVibes.length>0) && (
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                {search && (
                  <Badge variant="primary" className="flex items-center gap-1 pr-1">Search: {search}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>setSearch('')}><X className="h-3 w-3" /></button></Badge>
                )}
                {selectedNotes.map(id => (
                  <Badge key={`owned-chip-note-${id}`} variant="primary" className="flex items-center gap-1 pr-1">{optionLabel(noteOptions, id)}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>toggleFilter(setSelectedNotes, selectedNotes, id)}><X className="h-3 w-3" /></button></Badge>
                ))}
                {selectedAromas.map(id => (
                  <Badge key={`owned-chip-aroma-${id}`} variant="primary" className="flex items-center gap-1 pr-1">{optionLabel(aromaOptions, id)}<button className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-teal-600/15" onClick={()=>toggleFilter(setSelectedAromas, selectedAromas, id)}><X className="h-3 w-3" /></button></Badge>
                ))}
                {selectedVibes.map(id => {
                  const label = optionLabel(vibeOptions, id);
                  const cat = categorizeVibe(label);
                  const theme = VIBE_CATEGORIES[cat];
                  return (
                    <span key={`owned-chip-vibe-${id}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs-token font-medium ${theme.chipBgLight} dark:${theme.chipBgDark} ${theme.border} ${theme.textLight} dark:${theme.textDark}`}>
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${theme.dotLight} dark:${theme.dotDark}`} />
                      <span className="truncate max-w-[5.5rem]" title={label}>{label}</span>
                      <button aria-label="Remove vibe filter" className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-slate-200/50 dark:hover:bg-slate-600/40" onClick={()=>toggleFilter(setSelectedVibes, selectedVibes, id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <Button variant="secondary" size="sm" onClick={clearFilters}>Clear All</Button>
              </div>
            )}
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
              <>
                {displayMode==='card' && (
                  <div className="oil-grid">
                    {filtered.map(o => (
                      <EssentialOilCard
                        key={o.id}
                        id={o.id}
                        name={o.name}
                        notes={o.notes}
                        aromas={o.aromas}
                        vibes={o.vibes}
                        description={o.description}
                        noteMap={noteMap}
                        aromaMap={aromaMap}
                        vibeMap={vibeMap}
                        wishlist={wishlistIds.includes(o.id) && !ownedIds.includes(o.id)}
                        owned={ownedIds.includes(o.id)}
                        onStatusChange={handleStatusChange(o)}
                      />
                    ))}
                  </div>
                )}
                {displayMode==='compact' && (
                  <div className="space-y-1" role="list" aria-label="Owned oils list (compact)">
                    {filtered.map(o => (
                      <EssentialOilCompactItem
                        key={o.id}
                        id={o.id}
                        name={o.name}
                        owned={ownedIds.includes(o.id)}
                        wishlist={wishlistIds.includes(o.id) && !ownedIds.includes(o.id)}
                        onOpen={(id)=>setActiveOilId(id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal for compact mode full card */}
      {displayMode==='compact' && activeOilId !== null && (
        <OwnedModalOilDetail
          oilId={activeOilId}
          onClose={()=>setActiveOilId(null)}
          oils={oils}
          wishlistIds={wishlistIds}
          ownedIds={ownedIds}
          setWishlistIds={setWishlistIds}
          setOwnedIds={setOwnedIds}
          noteMap={noteMap}
          aromaMap={aromaMap}
          vibeMap={vibeMap}
          setOils={setOils}
        />
      )}
      {/* Mobile Refine Drawer */}
      {refineOpen && oils.length>0 && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={()=>setRefineOpen(false)} aria-hidden="true" />
            <div className="fixed inset-y-0 left-0 w-72 z-50 p-4 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold tracking-wide flex items-center gap-1 text-slate-700 dark:text-slate-200"><Filter className="h-4 w-4" />Refine</h2>
                <button onClick={()=>setRefineOpen(false)} aria-label="Close refine" className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"><X className="h-4 w-4" /></button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-8" />
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

// Reusable filter group component (copied from catalog for consistency)
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
            const isVibeGroup = /^Vibes/i.test(title);
            let catTheme: any = null;
            if (isVibeGroup) { const cat = categorizeVibe(label); catTheme = VIBE_CATEGORIES[cat]; }
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

// Modal detail (compact mode) mirroring catalog behavior
interface OwnedModalOilDetailProps {
  oilId: number;
  onClose: () => void;
  oils: Oil[];
  wishlistIds: number[];
  ownedIds: number[];
  setWishlistIds: React.Dispatch<React.SetStateAction<number[]>>;
  setOwnedIds: React.Dispatch<React.SetStateAction<number[]>>;
  noteMap: Record<number,string>;
  aromaMap: Record<number,string>;
  vibeMap: Record<number,string>;
  setOils: React.Dispatch<React.SetStateAction<Oil[]>>;
}

const OwnedModalOilDetail: React.FC<OwnedModalOilDetailProps> = ({ oilId, onClose, oils, wishlistIds, ownedIds, setWishlistIds, setOwnedIds, noteMap, aromaMap, vibeMap, setOils }) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const o = oils.find(x=>x.id===oilId);

  useEffect(()=>{
    closeBtnRef.current?.focus();
    const handleKey = (e:KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(containerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if(focusables.length===0) return;
        const first = focusables[0]; const last = focusables[focusables.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.classList.add('overflow-hidden');
    return ()=>{ window.removeEventListener('keydown', handleKey); document.body.classList.remove('overflow-hidden'); };
  }, [onClose]);

  if (!o) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-label="Oil not found">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-md mx-auto">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm-token font-medium">Not found</h2>
              <button ref={closeBtnRef} onClick={onClose} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">The selected oil could not be located.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-labelledby="owned-oil-modal-title">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl mx-auto animate-overlay-enter" ref={containerRef}>
        <div className="rounded-2xl shadow-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-white/30 dark:border-slate-700/60">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <h2 id="owned-oil-modal-title" className="text-md-token font-semibold text-slate-800 dark:text-slate-100">{o.name}</h2>
            <button ref={closeBtnRef} type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <EssentialOilCard
              id={o.id}
              name={o.name}
              notes={o.notes}
              aromas={o.aromas}
              vibes={o.vibes}
              description={o.description}
              noteMap={noteMap}
              aromaMap={aromaMap}
              vibeMap={vibeMap}
              wishlist={wishlistIds.includes(o.id) && !ownedIds.includes(o.id)}
              owned={ownedIds.includes(o.id)}
              onStatusChange={(u)=>{
                if (u.wishlist !== undefined) {
                  setWishlistIds(prev => u.wishlist ? [...new Set([...prev, o.id])] : prev.filter(id=>id!==o.id));
                  if (u.wishlist) setOwnedIds(prev => prev.filter(id=>id!==o.id));
                }
                if (u.owned !== undefined) {
                  setOwnedIds(prev => u.owned ? [...new Set([...prev, o.id])] : prev.filter(id=>id!==o.id));
                  if (u.owned) setWishlistIds(prev => prev.filter(id=>id!==o.id));
                  if (!u.owned) { setOils(prev => prev.filter(x=>x.id!==o.id)); onClose(); }
                }
              }}
              hideTitle={true}
            />
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOwned;
