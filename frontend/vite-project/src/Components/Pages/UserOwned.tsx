import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import EssentialOilCard from '../Common/EssentialOilCard';
import { Droplets, PackageOpen } from 'lucide-react';
import PageHeader from '../Common/PageHeader';
import EmptyState from '../Common/EmptyState';
import { Button } from '../ui/button';

interface Oil { id: number; name: string; notes: number[]; aromas: number[]; vibes: number[]; }

const UserOwned: React.FC = () => {
  const [oils, setOils] = useState<Oil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    setLoading(true);
    client.get('/oil-relations/owned/')
      .then(res => setOils(res.data.oils || []))
      .catch(e => setError(e?.message || 'Failed to load owned oils'))
      .finally(()=> setLoading(false));
  },[]);

  return (
  <div className="py-8">
      <PageHeader title="Owned Oils" icon={<Droplets className="h-6 w-6" />} subtitle={oils.length ? `${oils.length} oil${oils.length===1?'':'s'} in your collection` : 'Track which oils you physically have.'} />
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {!loading && oils.length === 0 && (
        <EmptyState
          icon={<PackageOpen className="h-8 w-8 text-brand" />}
          title="No owned oils yet"
          description="Mark oils as owned from the catalog to build your personal inventory and unlock blend insights."
          action={<Button variant="secondary" onClick={()=>window.location.href='/oils'}>Browse Catalog</Button>}
        />
      )}
      <div className="oil-grid">
        {oils.map(o => (
          <EssentialOilCard key={o.id} id={o.id} name={o.name} notes={o.notes} aromas={o.aromas} vibes={o.vibes} owned wishlist={false} onStatusChange={()=>{}} />
        ))}
      </div>
    </div>
  );
};

export default UserOwned;
