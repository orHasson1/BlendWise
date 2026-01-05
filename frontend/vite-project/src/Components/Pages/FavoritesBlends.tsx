import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../Common/PageHeader';
import client from '../../api/client';
import Surface from '../Common/Surface';
import BlendCard from '../Common/BlendCard';
import { Heart, Compass } from 'lucide-react';
import { Button } from '../ui/button';

interface Blend { id:number; name:string; description?:string; is_public:boolean; created_by:string; ingredients_detail:any[]; }

// Backend endpoint for favorite blends is /blend-favorites/ which returns the full blend objects.
const FavoritesBlends: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [blends, setBlends] = useState<Blend[]>([]);
  const [vibeMap, setVibeMap] = useState<Record<number, string>>({});

  useEffect(()=>{
    let mounted=true;
    client.get('/blend-favorites/')
      .then(r=>{ if(!mounted) return; setBlends(Array.isArray(r.data) ? r.data : (r.data.results || [])); })
      .catch(()=> mounted && setError('Failed to load favorite blends.'))
      .finally(()=> mounted && setLoading(false));
    return ()=>{mounted=false};
  },[]);

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

  const removeFavorite = (blend: Blend) => {
    // Optimistic update
    setBlends(prev => prev.filter(b => b.id !== blend.id));
    client.delete(`/blend-favorites/by-blend/?blend_id=${blend.id}`).catch(() => {
      // Rollback on error
      setBlends(prev => [...prev, blend]);
    });
  };

  return (
    <div>
      <PageHeader title="Favorite Blends" icon={<Heart className="h-6 w-6" />} subtitle="Your curated list of blends you've marked as favorites." />
      {loading && <Surface elevation={1} className="p-6 text-sm text-slate-500">Loading favorites...</Surface>}
      {!loading && error && (
        <Surface elevation={1} className="p-6 text-sm text-red-600">{error}</Surface>
      )}
      {!loading && !error && blends.length === 0 && (
        <Surface elevation={1} className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-pink-500/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No favorites yet</h2>
          <p className="text-base-token text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">Discover inspiring blends from the community and tap the heart icon to save your favorites here.</p>
          <Button onClick={() => navigate('/blends')}><Compass className="h-4 w-4 mr-1" />Explore Blends</Button>
        </Surface>
      )}
      {!loading && !error && blends.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {blends.map(b => (
            <BlendCard
              key={b.id}
              blend={b as any}
              compact={true}
              ownerUsername={b.created_by}
              favorite={true}
              onFavoriteToggle={(blendObj, next) => { if (!next) removeFavorite(b); }}
              vibeMap={vibeMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesBlends;