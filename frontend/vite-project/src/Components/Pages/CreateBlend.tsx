import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../Common/PageHeader';
import { Droplets, Search, Filter, X, Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/toast';
import Surface from '../Common/Surface';
import EssentialOilCard from '../Common/EssentialOilCard';
import EssentialOilCompactItem from '../Common/EssentialOilCompactItem';
import { Badge } from '../ui/badge';
import Skeleton from '../Common/Skeleton';

interface Oil { id:number; name:string; notes?:number[]; aromas?:number[]; vibes?:number[]; description?:string|null; }
interface Note { id:number; name:string; label:string; }

interface IngredientDraft { oil: Oil; drops: number; noteId: number | null; }

const CreateBlend: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  // blend meta
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  // oil search/filter
  const [oils, setOils] = useState<Oil[]>([]);
  const [loadingOils, setLoadingOils] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedNotesFilter, setSelectedNotesFilter] = useState<number[]>([]);
  const [selectedAromasFilter, setSelectedAromasFilter] = useState<number[]>([]);
  const [selectedVibesFilter, setSelectedVibesFilter] = useState<number[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [noteOptions, setNoteOptions] = useState<Note[]>([]);
  const [aromaOptions, setAromaOptions] = useState<{id:number; name:string; label:string}[]>([]);
  const [vibeOptions, setVibeOptions] = useState<{id:number; name:string; label:string}[]>([]);
  const [error, setError] = useState<string|null>(null);
  // ingredient drafting
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const totalDrops = useMemo(()=>ingredients.reduce((acc,i)=>acc+i.drops,0),[ingredients]);
  const [activeOilId, setActiveOilId] = useState<number | null>(null); // modal detail
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(()=>{
    let mounted=true; setLoadingOils(true);
    client.get('/essential-oils/')
      .then(r=>{
        if(!mounted) return;
        const data = r.data || [];
        setOils(Array.isArray(data) ? data : (data.results || []));
        if((Array.isArray(data) ? data : (data.results||[])).length === 0){
          // Provide a more specific hint if empty
          console.debug('[CreateBlend] essential-oils returned empty list');
        }
      })
      .catch(e=>{ if(mounted){ console.error('[CreateBlend] oil fetch failed', e); setError('Failed loading oils'); } })
      .finally(()=> mounted && setLoadingOils(false));
    client.get('/notes/').then(r=>mounted && setNoteOptions(r.data||[])).catch(()=>{});
    client.get('/aromas/').then(r=>mounted && setAromaOptions(r.data||[])).catch(()=>{});
    client.get('/vibes/').then(r=>mounted && setVibeOptions(r.data||[])).catch(()=>{});
    return ()=>{mounted=false};
  },[]);

  // Attempt wishlist/owned summary fetch (will 401 if not logged in; we ignore errors)
  useEffect(()=>{
    let mounted=true;
    client.get('/oil-relations/summary/')
      .then(r=>{ if(!mounted) return; setWishlistIds(r.data?.wishlist||[]); setOwnedIds(r.data?.owned||[]); })
      .catch(()=>{})
      .finally(()=> mounted && setAuthChecked(true));
    return ()=>{mounted=false};
  },[]);

  const filteredOils = useMemo(()=>{
    return oils.filter(o=>{
      const q = search.trim().toLowerCase();
      if(q){
        const inName = o.name.toLowerCase().includes(q);
        const inDesc = (o as any).description ? ((o as any).description || '').toLowerCase().includes(q) : false;
        if(!inName && !inDesc) return false;
      }
      if(selectedNotesFilter.length>0 && !(o.notes||[]).some(n=>selectedNotesFilter.includes(n))) return false;
      if(selectedAromasFilter.length>0 && !(o.aromas||[]).some(n=>selectedAromasFilter.includes(n))) return false;
      if(selectedVibesFilter.length>0 && !(o.vibes||[]).some(n=>selectedVibesFilter.includes(n))) return false;
      // Collection filters
      if(showWishlistOnly && !wishlistIds.includes(o.id)) return false;
      if(showOwnedOnly && !ownedIds.includes(o.id)) return false;
      return true;
    }).sort((a,b)=>a.name.localeCompare(b.name));
  },[oils, search, selectedNotesFilter, selectedAromasFilter, selectedVibesFilter, showWishlistOnly, showOwnedOnly, wishlistIds, ownedIds]);

  // Close modal on Escape
  useEffect(()=>{
    if(activeOilId===null) return;
    const handler = (e:KeyboardEvent) => { if(e.key==='Escape') setActiveOilId(null); };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[activeOilId]);

  const addIngredient = (oil:Oil) => {
    if(ingredients.some(i=>i.oil.id===oil.id)) return; // prevent duplicate
    // Auto-select first available note
    const autoNoteId = (oil.notes?.length) ? oil.notes[0] : null;
    setIngredients(prev=>[...prev,{ oil, drops:1, noteId:autoNoteId }]);
  };

  const retryOils = () => {
    setError(null); setLoadingOils(true);
    client.get('/essential-oils/')
      .then(r=>{
        const data = r.data || [];
        setOils(Array.isArray(data) ? data : (data.results || []));
      })
      .catch(()=>setError('Failed loading oils'))
      .finally(()=>setLoadingOils(false));
  };
  const updateIngredient = (oilId:number, changes:Partial<IngredientDraft>) => {
    setIngredients(prev=>prev.map(i=> i.oil.id===oilId ? { ...i, ...changes } : i));
  };
  const removeIngredient = (oilId:number) => setIngredients(prev=>prev.filter(i=>i.oil.id!==oilId));

  const canSubmit = ingredients.length>0 && ingredients.every(i=>i.drops>=1 && i.noteId) && name.trim().length>0;

  const submitBlend = async () => {
    if(!canSubmit || submitting) return; setSubmitting(true); setSubmitError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
        ingredients: ingredients.map(i=>({ oil_id: i.oil.id, drops: i.drops, note_id: i.noteId }))
      };
      await client.post('/blends/', payload);
      success(`"${name.trim()}" created successfully!`);
      navigate('/blends/my-blends');
    } catch(e:any){
      console.error(e); 
      const errMsg = e?.response?.data ? JSON.stringify(e.response.data) : 'Failed creating blend';
      setSubmitError(errMsg);
      toastError('Failed to create blend');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Derived blend analytics ---
  const noteTotals = useMemo(() => {
    const totals: Record<string, number> = { top: 0, middle: 0, base: 0 };
    ingredients.forEach(ing => {
      const note = noteOptions.find(n => n.id === ing.noteId);
      if (note) totals[note.name] = (totals[note.name] || 0) + ing.drops;
    });
    const pct: Record<string, number> = {};
    Object.keys(totals).forEach(k => { pct[k] = totalDrops ? (totals[k] / totalDrops * 100) : 0; });
    return { totals, pct };
  }, [ingredients, noteOptions, totalDrops]);

  const aromaTotals = useMemo(() => {
    const map: Record<number, number> = {};
    ingredients.forEach(ing => (ing.oil.aromas||[]).forEach(aId => { map[aId] = (map[aId]||0) + ing.drops; }));
    const list = Object.entries(map).map(([id, drops]) => ({ id: Number(id), drops })).sort((a,b)=> b.drops - a.drops);
    return list;
  }, [ingredients]);

  const vibeTotals = useMemo(() => {
    const map: Record<number, number> = {};
    ingredients.forEach(ing => (ing.oil.vibes||[]).forEach(vId => { map[vId] = (map[vId]||0) + ing.drops; }));
    const list = Object.entries(map).map(([id, drops]) => ({ id: Number(id), drops })).sort((a,b)=> b.drops - a.drops);
    return list;
  }, [ingredients]);

  const complexityPct = useMemo(() => {
    if (ingredients.length < 2) return 0;
    const proportions = ingredients.map(i => i.drops / totalDrops);
    const shannon = -proportions.reduce((acc,p)=> p ? acc + p*Math.log(p) : acc, 0);
    const norm = shannon / Math.log(ingredients.length);
    return norm * 100;
  }, [ingredients, totalDrops]);

  const dominance = useMemo(() => {
    if (!totalDrops || ingredients.length===0) return null;
    const max = Math.max(...ingredients.map(i=>i.drops));
    const dominant = ingredients.filter(i=>i.drops===max);
    return { oils: dominant.map(d=>d.oil.name), pct: max/totalDrops*100 };
  }, [ingredients, totalDrops]);

  const suggestions = useMemo(() => {
    const s: string[] = [];
    const { pct } = noteTotals;
    if (ingredients.length === 0) return s;
    if (pct.top === 0) s.push('Add a Top note for initial lift.');
    if (pct.middle === 0) s.push('Add a Middle note to build the heart.');
    if (pct.base === 0) s.push('Add a Base note for longevity.');
    if (pct.top > 60) s.push('Top notes dominate; consider more middle/base for balance.');
    if (pct.base < 15 && pct.base > 0) s.push('Base notes are low; add more for staying power.');
    if (complexityPct < 40 && ingredients.length >= 3) s.push('Distribution is uneven; small adjustments could improve harmony.');
    if (dominance && dominance.pct > 55) s.push('One oil is very dominant; consider reducing its drops.');
    return s;
  }, [noteTotals, complexityPct, dominance, ingredients]);

  // Utility label lookup
  const aromaLabel = (id:number) => (aromaOptions.find(a=>a.id===id)?.label || aromaOptions.find(a=>a.id===id)?.name || String(id));
  const vibeLabel = (id:number) => (vibeOptions.find(v=>v.id===id)?.label || vibeOptions.find(v=>v.id===id)?.name || String(id));

  // Color helpers for note pyramid
  const noteColor = (name:string) => {
    switch(name){
      case 'top': return 'bg-teal-400 dark:bg-teal-500';
      case 'middle': return 'bg-indigo-400 dark:bg-indigo-500';
      case 'base': return 'bg-amber-500 dark:bg-amber-600';
      default: return 'bg-slate-400';
    }
  };

  const modalDetail = activeOilId !== null ? (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-labelledby="blend-oil-modal-title">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl mx-auto animate-overlay-enter">
        <div className="rounded-2xl shadow-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-white/30 dark:border-slate-700/60">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <h2 id="blend-oil-modal-title" className="text-md-token font-semibold text-slate-800 dark:text-slate-100">{oils.find(x=>x.id===activeOilId)?.name || 'Oil'}</h2>
            <button type="button" onClick={()=>setActiveOilId(null)} aria-label="Close" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand">
              <X className="h-5 w-5" />
            </button>
          </div>
          {(() => {
            const o = oils.find(x=>x.id===activeOilId);
            if(!o) return <div className="p-5 text-sm text-slate-500">Not found</div>;
            const noteMap = Object.fromEntries(noteOptions.map(n => [n.id, n.label]));
            const aromaMap = Object.fromEntries(aromaOptions.map(a => [a.id, a.label]));
            const vibeMap = Object.fromEntries(vibeOptions.map(v => [v.id, v.label]));
            return (
              <div className="p-5 space-y-4">
                <EssentialOilCard id={o.id} name={o.name} notes={o.notes} aromas={o.aromas} vibes={o.vibes} description={o.description /* show only if real description */} noteMap={noteMap} aromaMap={aromaMap} vibeMap={vibeMap} hideTitle={true} />
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button size="sm" variant="outline" onClick={()=>setActiveOilId(null)}>Close</Button>
                  <Button size="sm" disabled={ingredients.some(i=>i.oil.id===o.id)} onClick={()=>addIngredient(o)}>{ingredients.some(i=>i.oil.id===o.id) ? 'Added' : 'Add to Blend'}</Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <PageHeader title="Create Blend" icon={<Droplets className="h-6 w-6" />} subtitle="Choose oils and define drops & note for each ingredient." />
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Blend form */}
        <div className="lg:col-span-1 space-y-6">
          <Surface elevation={1} className="p-4 space-y-4">
            <div>
              <label className="block text-xs-token font-medium mb-1">Blend Name<span className="text-red-500">*</span></label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="E.g. Morning Focus" />
            </div>
            <div>
              <label className="block text-xs-token font-medium mb-1">Description (optional)</label>
              <textarea className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm p-2 resize-y" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What makes this blend special?" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={isPublic} onCheckedChange={v=>setIsPublic(!!v)} />
              <span className="text-sm">Public blend (others can view)</span>
            </div>
            <div>
              <h3 className="text-sm-token font-semibold mb-2">Ingredients</h3>
              {ingredients.length===0 && <div className="text-xs text-slate-500">No oils chosen yet. Use the picker on the right.</div>}
              <ul className="space-y-3">
                {ingredients.map(ing=> {
                  return (
                    <li key={ing.oil.id} className="border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-white dark:bg-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm-token mb-0.5">{ing.oil.name}</div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs-token">Note:</label>
                            <select className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs py-1 px-2" value={ing.noteId || ''} onChange={e=>updateIngredient(ing.oil.id,{ noteId: e.target.value ? Number(e.target.value) : null })}>
                              {noteOptions.filter(n => (ing.oil.notes || []).includes(n.id)).map(n=> <option key={n.id} value={n.id}>{n.label}</option> )}
                            </select>
                            <label className="text-xs-token ml-2">Drops:</label>
                            <input type="number" min={1} value={ing.drops} onChange={e=>updateIngredient(ing.oil.id,{ drops: Math.max(1, Number(e.target.value)) })} className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs py-1 px-2" />
                          </div>
                        </div>
                        <button type="button" onClick={()=>removeIngredient(ing.oil.id)} aria-label="Remove" className="text-slate-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {ingredients.length>0 && (
                <div className="mt-3 text-xs-token text-slate-600 dark:text-slate-300">Total drops: <span className="font-semibold">{totalDrops}</span></div>
              )}
            </div>
            {submitError && <div className="text-xs text-red-600">{submitError}</div>}
            <Button disabled={!canSubmit || submitting} onClick={submitBlend} className="w-full" variant="default">{submitting ? 'Creating...' : 'Create Blend'}</Button>
            {!canSubmit && <div className="text-[11px] text-slate-500">Fill required fields: name, at least one ingredient with note and drops.</div>}
          </Surface>
          {/* Real-time Blend Summary */}
          <Surface elevation={1} className="p-4 space-y-4">
            <h3 className="text-sm-token font-semibold">Blend Summary</h3>
            {ingredients.length===0 && <div className="text-xs text-slate-500">Add ingredients to see live analysis.</div>}
            {ingredients.length>0 && (
              <div className="space-y-4">
                {/* Note Pyramid */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs-token font-medium">Note Balance</span>
                    <span className="text-[10px] text-slate-500">{totalDrops} drops</span>
                  </div>
                  <div className="space-y-2">
                    {(['top','middle','base'] as const).map(layer => (
                      <div key={layer} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] capitalize text-slate-600 dark:text-slate-300">{layer}</span>
                        <div className="flex-1 h-3 rounded overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
                          <div className={`${noteColor(layer)} h-full transition-all`} style={{ width: noteTotals.pct[layer] + '%' }} />
                        </div>
                        <span className="w-12 text-right text-[10px] font-medium text-slate-600 dark:text-slate-300">{noteTotals.pct[layer].toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Aromas */}
                {aromaTotals.length>0 && (
                  <div>
                    <span className="text-xs-token font-medium block mb-1">Aroma Families</span>
                    <ul className="flex flex-wrap gap-1">
                      {aromaTotals.slice(0,6).map(a => (
                        <li key={a.id}>
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-200" title={`${aromaLabel(a.id)} • ${a.drops} drops`}>{aromaLabel(a.id)}</span>
                        </li>
                      ))}
                      {aromaTotals.length>6 && <li><span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400" title={aromaTotals.slice(6).map(a=>aromaLabel(a.id)).join(', ')}>+{aromaTotals.length-6}</span></li>}
                    </ul>
                  </div>
                )}
                {/* Vibes */}
                {vibeTotals.length>0 && (
                  <div>
                    <span className="text-xs-token font-medium block mb-1">Vibes</span>
                    <ul className="flex flex-wrap gap-1">
                      {vibeTotals.slice(0,6).map(v => (
                        <li key={v.id}>
                          <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300" title={`${vibeLabel(v.id)} • ${v.drops} drops`}>{vibeLabel(v.id)}</span>
                        </li>
                      ))}
                      {vibeTotals.length>6 && <li><span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400" title={vibeTotals.slice(6).map(v=>vibeLabel(v.id)).join(', ')}>+{vibeTotals.length-6}</span></li>}
                    </ul>
                  </div>
                )}
                {/* Metrics */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-2 py-0.5" title="Number of oils used">{ingredients.length} oils</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-2 py-0.5" title="Total drops">{totalDrops} drops</span>
                  {dominance && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700 px-2 py-0.5" title={`Dominant share ${(dominance.pct).toFixed(1)}%`}>Top: {dominance.oils.slice(0,2).join(', ')}{dominance.oils.length>2?'…':''} {dominance.pct.toFixed(0)}%</span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2 py-0.5" title="Blend complexity (distribution balance)">Complexity {complexityPct.toFixed(0)}%</span>
                </div>
                {/* Suggestions */}
                {suggestions.length>0 && (
                  <div className="space-y-1">
                    <span className="text-xs-token font-medium">Suggestions</span>
                    <ul className="space-y-1">
                      {suggestions.map((s,i)=>(<li key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />{s}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Surface>
        </div>
        {/* Right: Oil picker with refine */}
        <div className="lg:col-span-2 space-y-6">
          <Surface elevation={1} className="p-0 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="relative flex-1">
                <Input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search oils..." className="pl-8" />
                <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <Button variant="secondary" size="sm" onClick={()=>{setSelectedNotesFilter([]); setSelectedAromasFilter([]); setSelectedVibesFilter([]); setShowWishlistOnly(false); setShowOwnedOnly(false); setSearch('');}}>Reset</Button>
            </div>
            <div className="flex-1 grid lg:grid-cols-4 gap-0">
              <div className="lg:col-span-3 p-4">
                {loadingOils && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                {!loadingOils && error && (
                  <div className="text-xs text-red-600 flex items-center gap-2">
                    <span>{error}</span>
                    <Button size="sm" variant="outline" onClick={retryOils}>Retry</Button>
                  </div>
                )}
                {!loadingOils && !error && filteredOils.length===0 && (
                  <div className="text-xs text-slate-500">No oils available (or no oils match current filters).{selectedNotesFilter.length+selectedAromasFilter.length+selectedVibesFilter.length>0 || search? '' : ' If this persists, ensure the backend server is running and seeded with oils.'}</div>
                )}
                <div className="space-y-1" role="list" aria-label="Available oils (compact)">
                  {filteredOils.map(o => {
                    const isOwned = ownedIds.includes(o.id);
                    const isWishlist = wishlistIds.includes(o.id);
                    return (
                      <div key={o.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <EssentialOilCompactItem id={o.id} name={o.name} onOpen={()=>setActiveOilId(o.id)} owned={isOwned} wishlist={isWishlist} />
                        </div>
                        <Button size="sm" variant={ingredients.some(i=>i.oil.id===o.id) ? 'secondary' : 'outline'}
                          onClick={()=>addIngredient(o)} disabled={ingredients.some(i=>i.oil.id===o.id)} aria-label={ingredients.some(i=>i.oil.id===o.id) ? 'Oil already added' : 'Add oil to blend'}>
                          {ingredients.some(i=>i.oil.id===o.id) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Refine sidebar */}
              <aside className="hidden lg:block border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto p-4 space-y-4">
                <h3 className="text-sm-token font-semibold flex items-center gap-1"><Filter className="h-4 w-4" />Refine</h3>
                {/* Collection filters */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                  <div className="px-3 py-2 text-xs-token font-medium bg-slate-50 dark:bg-slate-800/60">My Collection</div>
                  <div className="p-2 space-y-1">
                    <label className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs-token cursor-pointer">
                      <Checkbox checked={showWishlistOnly} onCheckedChange={()=>setShowWishlistOnly(v=>!v)} />
                      <span className="flex-1">Wishlist only</span>
                      <span className="text-[10px] text-slate-400">({wishlistIds.length})</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs-token cursor-pointer">
                      <Checkbox checked={showOwnedOnly} onCheckedChange={()=>setShowOwnedOnly(v=>!v)} />
                      <span className="flex-1">Owned only</span>
                      <span className="text-[10px] text-slate-400">({ownedIds.length})</span>
                    </label>
                  </div>
                </div>
                <FilterGroup title={`Notes (${selectedNotesFilter.length})`} options={noteOptions} selected={selectedNotesFilter} onToggle={id=>setSelectedNotesFilter(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])} />
                <FilterGroup title={`Aromas (${selectedAromasFilter.length})`} options={aromaOptions} selected={selectedAromasFilter} onToggle={id=>setSelectedAromasFilter(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])} />
                <FilterGroup title={`Vibes (${selectedVibesFilter.length})`} options={vibeOptions} selected={selectedVibesFilter} onToggle={id=>setSelectedVibesFilter(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])} />
              </aside>
            </div>
          </Surface>
        </div>
      </div>
      {modalDetail}
    </div>
  );
};

const FilterGroup: React.FC<{title:string; options:{id:number; name:string; label?:string}[]; selected:number[]; onToggle:(id:number)=>void;}> = ({ title, options, selected, onToggle }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      <button type="button" onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-3 py-2 text-left text-xs-token font-medium bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60">
        <span>{title}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="max-h-56 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {options.length===0 && <div className="text-xs text-slate-400 px-1 py-1">No options</div>}
          {options.map(o=>{
            const active = selected.includes(o.id);
            return (
              <label key={o.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs-token cursor-pointer">
                <Checkbox checked={active} onCheckedChange={()=>onToggle(o.id)} />
                <span className="flex-1 truncate" title={o.label || o.name}>{o.label || o.name}</span>
                {active && <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">On</Badge>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreateBlend;
