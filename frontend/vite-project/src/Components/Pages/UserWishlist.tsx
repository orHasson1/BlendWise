import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import EssentialOilCard from '../Common/EssentialOilCard';
import { Button } from '../ui/button';
import { Droplets, Heart } from 'lucide-react';
import PageHeader from '../Common/PageHeader';
import EmptyState from '../Common/EmptyState';

interface Oil { id: number; name: string; notes: number[]; aromas: number[]; vibes: number[]; }

const UserWishlist: React.FC = () => {
  const [oils, setOils] = useState<Oil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    setLoading(true);
    client.get('/oil-relations/wishlist/')
      .then(res => setOils(res.data.oils || []))
      .catch(e => setError(e?.message || 'Failed to load wishlist'))
      .finally(()=> setLoading(false));
  },[]);

  return (
  <div className="py-8">
      <PageHeader title="My Wishlist" icon={<Droplets className="h-6 w-6" />} subtitle={oils.length ? `${oils.length} saved oil${oils.length===1?'':'s'}` : 'Save oils you want to try next.'} />
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {!loading && oils.length === 0 && (
        <EmptyState
          icon={<Heart className="h-8 w-8 text-brand" />}
          title="Wishlist is empty"
          description="Save interesting oils to revisit them quickly and plan future purchases or blends."
          action={<Button variant="secondary" onClick={()=>window.location.href='/oils'}>Explore Oils</Button>}
        />
      )}
      <div className="oil-grid">
        {oils.map(o => (
          <EssentialOilCard key={o.id} id={o.id} name={o.name} notes={o.notes} aromas={o.aromas} vibes={o.vibes} wishlist owned={false} onStatusChange={()=>{}} />
        ))}
      </div>
    </div>
  );
};

export default UserWishlist;
