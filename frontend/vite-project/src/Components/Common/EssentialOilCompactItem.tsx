import React from 'react';

interface EssentialOilCompactItemProps {
  id: number;
  name: string;
  onOpen: (id: number) => void;
  owned?: boolean;
  wishlist?: boolean;
}

// Simple compact list row showing only name (and subtle status markers if available)
const EssentialOilCompactItem: React.FC<EssentialOilCompactItemProps> = ({ id, name, onOpen, owned, wishlist }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="group w-full text-left px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-brand flex items-center gap-2"
      aria-label={`Open details for ${name}`}
    >
      <span className="flex-1 truncate font-medium text-sm-token text-slate-700 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300">{name}</span>
      {owned && (
        <span title="Owned" aria-label="Owned" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">O</span>
      )}
      {wishlist && !owned && (
        <span title="Wishlist" aria-label="Wishlist" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-300 text-[10px] font-semibold">W</span>
      )}
    </button>
  );
};

export default EssentialOilCompactItem;
