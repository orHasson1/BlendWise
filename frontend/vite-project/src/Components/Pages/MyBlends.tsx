import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../Common/PageHeader';
import Surface from '../Common/Surface';
import BlendCard from '../Common/BlendCard';
import { FlaskConical, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import client from '../../api/client';
import { useToast } from '../ui/toast';

interface Blend { id:number; name:string; description?:string|null; is_public:boolean; created_by:string; ingredients_detail:any[]; }
interface FavoriteSummary { favorites: number[] }

const MyBlends: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [blends, setBlends] = useState<Blend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [vibeMap, setVibeMap] = useState<Record<number, string>>({});

  const load = () => {
    setLoading(true); setError(null);
    client.get('/blends/mine/')
      .then(r=>{
        const data = r.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setBlends(list);
      })
      .catch(e=>{ setError('Failed loading blends'); })
      .finally(()=> setLoading(false));
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

  useEffect(()=>{
    client.get('/blend-favorites/summary/')
      .then(r=> setFavoriteIds((r.data as FavoriteSummary).favorites || []))
      .catch(()=>{});
  },[]);

  const toggleFavorite = (blend: Blend, next: boolean) => {
    setFavoriteIds(prev => next ? [...new Set([...prev, blend.id])] : prev.filter(id=>id!==blend.id));
    if (next) {
      client.post('/blend-favorites/', { blend_id: blend.id }).catch(()=>{
        setFavoriteIds(prev => prev.filter(id=>id!==blend.id));
      });
    } else {
      client.delete(`/blend-favorites/by-blend/?blend_id=${blend.id}`).catch(()=>{
        setFavoriteIds(prev => [...new Set([...prev, blend.id])]);
      });
    }
  };

  const handleEdit = (blend: Blend) => {
    navigate(`/blends/edit/${blend.id}`);
  };

  const handleDelete = (blend: Blend) => {
    if (!window.confirm(`Are you sure you want to delete "${blend.name}"? This action cannot be undone.`)) {
      return;
    }
    client.delete(`/blends/${blend.id}/`)
      .then(() => {
        setBlends(prev => prev.filter(b => b.id !== blend.id));
        success(`"${blend.name}" deleted successfully`);
      })
      .catch((err) => {
        toastError('Failed to delete blend. Please try again.');
      });
  };

  const hasBlends = blends.length>0;

  return (
    <div className="py-4">
      <PageHeader
        title="My Blends"
        icon={<FlaskConical className="h-6 w-6" />}
        subtitle={hasBlends ? 'Your saved and crafted blend formulas.' : 'Craft and save your personal aromatic creations.'}
        actions={<Button size="sm" onClick={() => navigate('/blends/create')}><Plus className="h-4 w-4 mr-1" />Create a Blend</Button>}
      />
      {loading && (
        <Surface elevation={1} className="p-6 text-sm text-slate-500">Loading your blends...</Surface>
      )}
      {!loading && error && (
        <Surface elevation={1} className="p-6 text-sm text-red-600 flex items-center gap-3">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Retry</Button>
        </Surface>
      )}
      {!loading && !error && !hasBlends && (
        <Surface elevation={1} className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
            <FlaskConical className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No blends yet</h2>
          <p className="text-base-token text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">Start by experimenting with essential oils you love and save your first blend for quick reference.</p>
          <Button onClick={() => navigate('/blends/create')}><Plus className="h-4 w-4 mr-1" />Create a Blend</Button>
        </Surface>
      )}
      {!loading && !error && hasBlends && (
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
              isOwner={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlends;
