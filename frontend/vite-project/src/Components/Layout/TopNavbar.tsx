import React, { useState, useEffect } from 'react';
import { LogoMark } from '../Brand/Logo';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Moon, Sun, Menu } from 'lucide-react';

interface TopNavbarProps { isLoggedIn?: boolean; onLogout?: () => void; onLoginClick?: () => void; onMobileMenu?: () => void }


const TopNavbar: React.FC<TopNavbarProps> = ({ isLoggedIn = false, onLogout, onLoginClick, onMobileMenu }) => {
  const navigate = useNavigate();
  const toggleDark = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    try {
      const pref = localStorage.getItem('theme');
      if (pref === 'dark') document.documentElement.classList.add('dark');
      else if (pref === 'light') document.documentElement.classList.remove('dark');
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/80 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-700/60 supports-backdrop">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <button onClick={onMobileMenu} className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={()=>navigate('/home')} className="flex items-center gap-2 group" aria-label="Go home">
            <span className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-teal-600/10 shadow-sm ring-1 ring-teal-600/30 group-hover:scale-105 transition-transform text-teal-700 dark:text-teal-400">
              <LogoMark />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-700 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">BlendWise</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={toggleDark} aria-label="Toggle dark mode" className="backdrop-blur bg-white/60 dark:bg-slate-800/60">
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </Button>
            {isLoggedIn ? (
              <Button variant="secondary" size="sm" onClick={onLogout}>Log out</Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => { onLoginClick?.(); navigate('/signin'); }}>Sign In</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default TopNavbar;
