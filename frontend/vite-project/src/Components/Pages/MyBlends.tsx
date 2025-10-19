import React from 'react';
import PageHeader from '../Common/PageHeader';
import Surface from '../Common/Surface';
import { FlaskConical } from 'lucide-react';
import { Button } from '../ui/button';

const MyBlends: React.FC = () => {
  const hasBlends = false; // placeholder until real data
  return (
    <div className="py-8">
      <PageHeader
        title="My Blends"
        icon={<FlaskConical className="h-6 w-6" />}
        subtitle={hasBlends ? 'Your saved and crafted blend formulas.' : 'Craft and save your personal aromatic creations.'}
        actions={hasBlends ? <Button size="sm">New Blend</Button> : undefined}
      />
      {!hasBlends && (
  <Surface elevation={1} className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center">
            <FlaskConical className="h-8 w-8 text-brand" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No blends yet</h2>
          <p className="text-base-token text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">Start by experimenting with essential oils you love and save your first blend for quick reference.</p>
          <Button>Start a Blend</Button>
        </Surface>
      )}
    </div>
  );
};

export default MyBlends;
