import React, { useState } from 'react';
import { Heart, PackagePlus, Share2, FlaskConical, Copy } from 'lucide-react';

interface QuickActionsClusterProps {
  owned: boolean;
  wishlist: boolean;
  onToggleOwned: () => Promise<void> | void;
  onToggleWishlist: () => Promise<void> | void;
  oilId: number;
  oilName: string;
  onUseInBlend?: (oilId: number) => void;
  showToast?: (msg: string, intent?: 'success' | 'error') => void;
}

// Minimal inline toast fallback if none provided
const InlineToast: React.FC<{ message: string; intent: 'success' | 'error'; onClose: () => void; }> = ({ message, intent, onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-sm font-medium flex items-center gap-3 ${intent==='success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'}`}>{message}<button aria-label="Close" onClick={onClose} className="text-white/80 hover:text-white">×</button></div>
);

const QuickActionsCluster: React.FC<QuickActionsClusterProps> = ({ owned, wishlist, onToggleOwned, onToggleWishlist, oilId, oilName, onUseInBlend, showToast }) => {
  const [pending, setPending] = useState<boolean>(false);
  const [toast, setToast] = useState<{message:string; intent:'success'|'error'}|null>(null);

  const emitToast = (message: string, intent: 'success' | 'error' = 'success') => {
    if (showToast) showToast(message, intent); else setToast({ message, intent });
    if (!showToast) setTimeout(() => setToast(null), 3000);
  };

  const handleWishlist = async () => {
    setPending(true);
    try {
      await onToggleWishlist();
      emitToast(wishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (e) {
      emitToast('Wishlist update failed', 'error');
    } finally { setPending(false); }
  };
  const handleOwned = async () => {
    setPending(true);
    try {
      await onToggleOwned();
      emitToast(owned ? 'Marked as not owned' : 'Marked as owned');
    } catch (e) {
      emitToast('Owned update failed', 'error');
    } finally { setPending(false); }
  };
  const handleUseInBlend = () => {
    if (onUseInBlend) onUseInBlend(oilId);
  };
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      emitToast('Link copied');
    } catch {
      emitToast('Copy failed', 'error');
    }
  };

  return (
    <div className="mb-8 flex flex-wrap gap-3 items-center" aria-label="Quick actions">
      <button
        type="button"
        onClick={handleWishlist}
        aria-pressed={wishlist}
        disabled={pending}
        className={`chip-btn inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border transition ${wishlist ? 'bg-teal-600 text-white border-teal-600 shadow' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'} ${pending ? 'opacity-70' : ''}`}
      >
        <Heart className={`h-4 w-4 ${wishlist ? 'fill-white' : ''}`} />
        {wishlist ? 'Wishlisted' : 'Add Wishlist'}
      </button>
      <button
        type="button"
        onClick={handleOwned}
        aria-pressed={owned}
        disabled={pending}
        className={`chip-btn inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border transition ${owned ? 'bg-teal-700 text-white border-teal-700 shadow' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700'} ${pending ? 'opacity-70' : ''}`}
      >
        <PackagePlus className="h-4 w-4" />
        {owned ? 'Owned' : 'Mark Owned'}
      </button>
      <button
        type="button"
        onClick={handleUseInBlend}
        className="chip-btn inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700"
      >
        <FlaskConical className="h-4 w-4" />
        Use in Blend
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copy link"
        className="chip-btn inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700"
      >
        <Copy className="h-4 w-4" />
        Copy Link
      </button>
      {/* Placeholder for ratings/favorites reserved space */}
      <div className="ml-auto flex items-center gap-1" aria-label="Ratings placeholder">
        <Share2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <span className="text-xs text-slate-400">(ratings coming)</span>
      </div>
      {toast && <InlineToast message={toast.message} intent={toast.intent} onClose={() => setToast(null)} />}
    </div>
  );
};

export default QuickActionsCluster;