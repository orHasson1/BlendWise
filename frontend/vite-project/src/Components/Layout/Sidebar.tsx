import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Droplets, CheckCircle2, Heart, FlaskConical, Layers, Home, X, Plus } from 'lucide-react';
import client from '../../api/client';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isLoggedIn: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SummaryCounts { wishlist: number | null; owned: number | null }

const navSections = (isLoggedIn: boolean, counts: SummaryCounts) => [
  {
    label: 'Essential Oils',
    items: [
  { to: '/essential-oils', label: 'Catalog', icon: Droplets },
  isLoggedIn && { to: '/essential-oils/owned', label: 'Owned', icon: CheckCircle2, badge: counts.owned },
  isLoggedIn && { to: '/essential-oils/wishlist', label: 'Wishlist', icon: Heart, badge: counts.wishlist }
    ].filter(Boolean) as any[]
  },
  {
    label: 'Blends',
    items: [
      { to: '/blends', label: 'Catalog', icon: FlaskConical },
      isLoggedIn && { to: '/blends/my-blends', label: 'My Blends', icon: Layers },
  isLoggedIn && { to: '/blends/create', label: 'Create a Blend', icon: Plus },
  isLoggedIn && { to: '/blends/favorites', label: 'Favorites', icon: Heart }
    ].filter(Boolean) as any[]
  }
];

const baseItem = 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative pl-4';

const Sidebar: React.FC<SidebarProps> = ({ isLoggedIn, mobileOpen, onCloseMobile }) => {
  const [counts, setCounts] = useState<SummaryCounts>({ wishlist: null, owned: null });
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || loaded) return;
    client.get('/oil-relations/summary/')
      .then(res => {
        setCounts({
          wishlist: (res.data?.wishlist || []).length,
          owned: (res.data?.owned || []).length
        });
        setLoaded(true);
      })
      .catch(()=>{});
  }, [isLoggedIn, loaded]);

  // Close mobile sheet on route change
  useEffect(()=>{ onCloseMobile(); }, [location.pathname]);

  const sections = navSections(isLoggedIn, counts);

  const content = (
    <nav aria-label="Primary" className="flex flex-col h-full py-4 overflow-y-auto">
      {/* Brand removed per request */}
      <div className="px-2 md:px-3 mb-2">
        <NavLink to="/home" className={({isActive}) => cn(baseItem, isActive ? 'bg-teal-600/10 text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800')}>
          <span className={"absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-colors " + (location.pathname==='/home' ? 'bg-teal-600' : 'group-hover:bg-slate-300 dark:group-hover:bg-slate-600')} />
          <Home className="h-4 w-4" />
          <span>Home</span>
        </NavLink>
      </div>
      {sections.map(section => (
        <div key={section.label} className="mt-4">
          <div className="px-5 mb-1 text-xs-token font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{section.label}</div>
          <div className="flex flex-col gap-1 px-2 md:px-3">
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} className={({isActive}) => cn(baseItem, isActive ? 'bg-teal-600/10 text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800')}>
                <span className={"absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-colors " + (location.pathname===item.to ? 'bg-teal-600' : 'group-hover:bg-slate-300 dark:group-hover:bg-slate-600')} />
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === 'number' && (
                  <span className="ml-2 brand-pill h-5 min-w-[1.25rem] justify-center text-xs-token font-semibold px-1">{item.badge}</span>
                )}
                {item.badge === null && item.badge !== undefined && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto px-5 pt-6 pb-4 text-xs text-slate-400 dark:text-slate-500">
        <p className="leading-snug">Track, explore & craft your aromatic collection.</p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur supports-backdrop sticky top-14 h-[calc(100vh-3.5rem)]">
        <div className="flex-1 min-h-0">
          {content}
        </div>
      </aside>
      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="absolute top-0 left-0 bottom-0 w-[260px] max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col animate-[slideIn_.25s_cubic-bezier(.4,.1,.2,1)]">
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-brand">Menu</span>
              <button onClick={onCloseMobile} aria-label="Close" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
