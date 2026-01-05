import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { Alert } from '../ui/alert';
import { Heart, PackagePlus } from 'lucide-react';
import OilDetailHero from '../../Components/OilDetail/OilDetailHero';
// ...existing imports

interface Oil {
  id: number;
  name: string;
  notes?: number[];
  aromas?: number[];
  vibes?: number[];
  description?: string | null;
}

const OilDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [oil, setOil] = useState<Oil | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<number, string>>({});
  const [aromaMap, setAromaMap] = useState<Record<number, string>>({});
  const [vibeMap, setVibeMap] = useState<Record<number, string>>({});
  // relation state
  const [owned, setOwned] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<boolean>(false);
  // initial relation fetch loading
  const [relationLoading, setRelationLoading] = useState<boolean>(false);
  const [relationError, setRelationError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    client.get(`/essential-oils/${id}/`)
      .then((res) => { if (mounted) setOil(res.data || null); })
      .catch((err) => { console.error(err); if (mounted) setError('Failed to load oil'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // fetch relation summary to know wishlist/owned status
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setRelationLoading(true);
    client.get('/oil-relations/summary/')
      .then(res => {
        if (!mounted) return;
        const wishlistIds: number[] = res.data?.wishlist || [];
        const ownedIds: number[] = res.data?.owned || [];
        const oilIdNum = Number(id);
        setWishlist(wishlistIds.includes(oilIdNum) && !ownedIds.includes(oilIdNum));
        setOwned(ownedIds.includes(oilIdNum));
      })
      .catch(err => { if (mounted) setRelationError('Failed to load relation state'); })
      .finally(()=> { if (mounted) setRelationLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // fetch label maps for display
  useEffect(() => {
    let mounted = true;
    client.get('/notes/').then((res) => {
      if (!mounted) return;
      const map = Object.fromEntries((res.data || []).map((x: any) => [x.id, x.label || x.name]));
      setNoteMap(map);
    }).catch(() => {});
    client.get('/aromas/').then((res) => {
      if (!mounted) return;
      const map = Object.fromEntries((res.data || []).map((x: any) => [x.id, x.label || x.name]));
      setAromaMap(map);
    }).catch(() => {});
    client.get('/vibes/').then((res) => {
      if (!mounted) return;
      const map = Object.fromEntries((res.data || []).map((x: any) => [x.id, x.label || x.name]));
      setVibeMap(map);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Optimistic relation mutation helpers
  const [mutationLoading, setMutationLoading] = useState(false);
  const mutateRelation = async (target: 'wishlist' | 'owned', desired: boolean) => {
    if (!oil || mutationLoading) return;
    setRelationError(null);
    setMutationLoading(true);
    const oilId = oil.id;
    // snapshot for rollback
    const prevWishlist = wishlist;
    const prevOwned = owned;
    // optimistic apply (respect exclusivity: owned overrides wishlist)
    if (target === 'wishlist') {
      setWishlist(desired && !owned);
    } else {
      setOwned(desired);
      if (desired) setWishlist(false); // ensure exclusivity
    }
    try {
      if (desired) {
        await client.post('/oil-relations/', { oil_id: oilId, list_type: target });
      } else {
        await client.delete(`/oil-relations/by-oil/?oil_id=${oilId}&list_type=${target}`);
      }
      // refresh summary to reconcile with backend rules
      const res = await client.get('/oil-relations/summary/');
      const wishlistIds: number[] = res.data?.wishlist || [];
      const ownedIds: number[] = res.data?.owned || [];
      setWishlist(wishlistIds.includes(oilId) && !ownedIds.includes(oilId));
      setOwned(ownedIds.includes(oilId));
    } catch (e: any) {
      console.error(e);
      // rollback
      setWishlist(prevWishlist);
      setOwned(prevOwned);
      setRelationError('Failed updating list');
    } finally {
      setMutationLoading(false);
    }
  };

  const toggleWishlist = () => mutateRelation('wishlist', !wishlist);
  const toggleOwned = () => mutateRelation('owned', !owned);

  const [descExpanded, setDescExpanded] = useState(false);
  const MAX_DESC_CHARS = 340;
  const displayDescription = oil?.description ? (
    !descExpanded && oil.description.length > MAX_DESC_CHARS
      ? oil.description.slice(0, MAX_DESC_CHARS) + '…'
      : oil.description
  ) : null;

  // Generate tagline from first aroma + first vibe
  const primaryAromaLabel = oil?.aromas && oil.aromas.length ? aromaMap[oil.aromas[0]] : undefined;
  const primaryVibeLabel = oil?.vibes && oil.vibes.length ? vibeMap[oil.vibes[0]] : undefined;
  const tagline = (() => {
    if (!primaryAromaLabel && !primaryVibeLabel) return '';
    const aromaWord = primaryAromaLabel ? primaryAromaLabel.split(/[\s/]/)[0] : '';
    const vibeWord = primaryVibeLabel ? (primaryVibeLabel.split(/[\s/]/)[0] || '').toLowerCase() : '';
    if (aromaWord && vibeWord) return `${aromaWord} ${vibeWord} essence`;
    return aromaWord || primaryVibeLabel || '';
  })();
  const aromaGradientClass = (() => {
    if (!primaryAromaLabel) return 'bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)]';
    const lower = primaryAromaLabel.toLowerCase();
    if (lower.includes('citrus')) return 'bg-[linear-gradient(135deg,#fffbe6,#ffe08a)]';
    if (lower.includes('floral')) return 'bg-[linear-gradient(135deg,#fff0f6,#ffd7ec)]';
    if (lower.includes('herbal')||lower.includes('green')) return 'bg-[linear-gradient(135deg,#f1fff2,#d9f7dd)]';
    if (lower.includes('woody')||lower.includes('earth')) return 'bg-[linear-gradient(135deg,#f5f2ed,#e5d9c9)]';
    if (lower.includes('spicy')||lower.includes('warm')) return 'bg-[linear-gradient(135deg,#fff4e6,#ffd9ad)]';
    if (lower.includes('resin')||lower.includes('balsam')) return 'bg-[linear-gradient(135deg,#f7f3ff,#e8dcff)]';
    if (lower.includes('mint')||lower.includes('camph')) return 'bg-[linear-gradient(135deg,#eafffa,#c9f7ee)]';
    return 'bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)]';
  })();

  // Keyboard shortcuts: W wishlist, O owned, Esc back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!oil) return;
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return; // skip form fields
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        toggleWishlist();
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        toggleOwned();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [oil, wishlist, owned]);

  // Progressive disclosure states
  const COLLAPSE_THRESHOLD = 6;
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllAromas, setShowAllAromas] = useState(false);
  const [showAllVibes, setShowAllVibes] = useState(false);

  const visibleNotes = oil?.notes ? (showAllNotes ? oil.notes : oil.notes.slice(0, COLLAPSE_THRESHOLD)) : [];
  const visibleAromasRaw = oil?.aromas ? (showAllAromas ? oil.aromas : oil.aromas.slice(0, COLLAPSE_THRESHOLD)) : [];
  const visibleAromas = visibleAromasRaw.map(id => aromaMap[id] || '');
  const visibleVibes = oil?.vibes ? (showAllVibes ? oil.vibes : oil.vibes.slice(0, COLLAPSE_THRESHOLD)) : [];

  const needsNotesToggle = !!oil?.notes && oil.notes.length > COLLAPSE_THRESHOLD;
  const needsAromasToggle = !!oil?.aromas && oil.aromas.length > COLLAPSE_THRESHOLD;
  const needsVibesToggle = !!oil?.vibes && oil.vibes.length > COLLAPSE_THRESHOLD;

  return (
    <div className="py-8">
      {/* Skip link for keyboard users */}
      <a href="#oil-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-teal-600 text-white px-3 py-2 rounded-md text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-300" data-skip-link>Skip to content</a>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 px-5 max-w-5xl mx-auto text-xs text-slate-500 dark:text-slate-400">
        <ol className="flex flex-wrap gap-1">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li className="select-none">/</li>
          <li><Link to="/oils" className="hover:underline">Oils</Link></li>
          {oil && <><li className="select-none">/</li><li className="font-medium text-slate-700 dark:text-slate-300" aria-current="page">{oil.name}</li></>}
        </ol>
      </nav>
      {oil && (
        <OilDetailHero
          name={oil.name}
          tagline={tagline}
          description={oil.description || null}
          descExpanded={descExpanded}
          onToggleDescription={() => setDescExpanded(x => !x)}
          wishlist={wishlist}
          owned={owned}
          mutationLoading={mutationLoading}
          relationLoading={relationLoading}
          onToggleWishlist={toggleWishlist}
          onToggleOwned={toggleOwned}
          aromaGradientClass={aromaGradientClass}
          notes={oil.notes}
          aromas={oil.aromas}
          vibes={oil.vibes}
          noteMap={noteMap}
          aromaMap={aromaMap}
          vibeMap={vibeMap}
          visibleNotes={visibleNotes}
          visibleAromasRaw={visibleAromasRaw}
          visibleVibes={visibleVibes}
          needsNotesToggle={needsNotesToggle}
          needsAromasToggle={needsAromasToggle}
          needsVibesToggle={needsVibesToggle}
          showAllNotes={showAllNotes}
          showAllAromas={showAllAromas}
          showAllVibes={showAllVibes}
          onToggleShowAllNotes={() => setShowAllNotes(x => !x)}
          onToggleShowAllAromas={() => setShowAllAromas(x => !x)}
          onToggleShowAllVibes={() => setShowAllVibes(x => !x)}
          MAX_DESC_CHARS={MAX_DESC_CHARS}
        />
      )}
      {loading && <div>Loading…</div>}
      {error && (
        <div className="mb-6">
          <Alert intent="error" title="Failed to load oil">{error}</Alert>
        </div>
      )}
  {oil && relationError && <div className="text-xs text-red-600 mt-2" role="alert">{relationError}</div>}
    </div>
  );
};

export default OilDetail;
