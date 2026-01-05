import React, { useEffect, useState } from 'react';
import PageHeader from '../Common/PageHeader';
import { FlaskConical, RefreshCw } from 'lucide-react';
import client from '../../api/client';
import BlendCard from '../Common/BlendCard';
import Surface from '../Common/Surface';
import { Button } from '../ui/button';

interface Blend { id:number; name:string; description?:string|null; is_public:boolean; created_by:string; ingredients_detail:any[]; }
interface FavoriteSummary { favorites: number[] }

const Blends: React.FC = () => {
  const [blends, setBlends] = useState<Blend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [vibeMap, setVibeMap] = useState<Record<number, string>>({});

  const load = () => {
    setLoading(true); setError(null);
    client.get('/blends/')
      .then(r=>{
        const data = r.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setBlends(list);
      })
      .catch(()=>setError('Failed loading blends'))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); },[]);

  // Load vibes for label display
  useEffect(()=>{
    client.get('/vibes/')
      .then(r => {
        const map: Record<number, string> = {};
        (r.data || []).forEach((v: any) => { map[v.id] = v.label || v.name; });
        setVibeMap(map);
      })
      .catch(()=>{});
  },[]);

  // Load favorites for logged-in users (assumes auth token attached via client interceptor)
  useEffect(()=>{
    client.get('/blend-favorites/summary/')
      .then(r=> setFavoriteIds((r.data as FavoriteSummary).favorites || []))
      .catch(()=>{});
  },[]);

  const toggleFavorite = (blend: Blend, next: boolean) => {
    // optimistic update
    setFavoriteIds(prev => next ? [...new Set([...prev, blend.id])] : prev.filter(id=>id!==blend.id));
    if (next) {
      client.post('/blend-favorites/', { blend_id: blend.id }).catch(()=>{
        // rollback
        setFavoriteIds(prev => prev.filter(id=>id!==blend.id));
      });
    } else {
      client.delete(`/blend-favorites/by-blend/?blend_id=${blend.id}`).catch(()=>{
        setFavoriteIds(prev => [...new Set([...prev, blend.id])]);
      });
    }
  };

  return (
    <div>
      <PageHeader title="Blends Catalog" icon={<FlaskConical className="h-6 w-6" />} subtitle="Explore public blends and your creations." />
      {loading && <Surface elevation={1} className="p-6 text-sm text-slate-500">Loading blends...</Surface>}
      {!loading && error && (
        <Surface elevation={1} className="p-6 text-sm text-red-600 flex items-center gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Retry</Button>
        </Surface>
      )}
      {!loading && !error && blends.length === 0 && (
        <Surface elevation={1} className="p-6 text-sm text-slate-500">No blends available yet.</Surface>
      )}
      {!loading && !error && blends.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {blends.map(b => (
            <BlendCard
              key={b.id}
              blend={b as any}
              compact={true}
              ownerUsername={b.created_by}
              favorite={favoriteIds.includes(b.id)}
              onFavoriteToggle={(blendObj, next) => toggleFavorite(b, next)}
              vibeMap={vibeMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blends;
