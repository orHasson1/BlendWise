import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../Common/PageHeader';
import Surface from '../Common/Surface';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
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

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    client
      .get(`/oils/${id}/`)
      .then((res) => {
        if (!mounted) return;
        setOil(res.data || null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError('Failed to load oil');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
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

  return (
    <div className="py-8">
      <PageHeader
        title={oil ? oil.name : 'Oil'}
        subtitle={oil ? 'Detailed profile & aromatic characteristics' : undefined}
        actions={<Button variant="secondary" size="sm" onClick={() => navigate(-1)}>← Back</Button>}
      />
      {loading && <div>Loading…</div>}
      {error && (
        <div className="mb-6">
          <Alert intent="error" title="Failed to load oil">{error}</Alert>
        </div>
      )}
      {oil && (
  <Surface elevation={2} className="p-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">{oil.name}</h1>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">ID: {oil.id}</p>
          {oil.description && <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-line">{oil.description}</p>}
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-1">Notes</div>
              <div className="text-slate-700 dark:text-slate-300">{oil.notes?.map((n) => noteMap[n] || '').filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-1">Aromas</div>
              <div className="text-slate-700 dark:text-slate-300">{oil.aromas?.map((n) => aromaMap[n] || '').filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div>
              <div className="text-xs-token uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium mb-1">Vibes</div>
              <div className="text-slate-700 dark:text-slate-300">{oil.vibes?.map((n) => vibeMap[n] || '').filter(Boolean).join(', ') || '—'}</div>
            </div>
          </div>
        </Surface>
      )}
    </div>
  );
};

export default OilDetail;
