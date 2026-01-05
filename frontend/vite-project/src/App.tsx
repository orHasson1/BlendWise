import React, { useState } from 'react';
import AuthContainer from './Components/Auth/AuthContainer';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider } from './Components/ui/toast';
import Home from './Components/Pages/Home';
import OilsList from './Components/Pages/OilsList';
import UserWishlist from './Components/Pages/UserWishlist';
import UserOwned from './Components/Pages/UserOwned';
import OilDetail from './Components/Pages/OilDetail';
import Blends from './Components/Pages/Blends';
import FavoritesBlends from './Components/Pages/FavoritesBlends';
import CreateBlend from './Components/Pages/CreateBlend';
import EditBlend from './Components/Pages/EditBlend';
import MyBlends from './Components/Pages/MyBlends';
import TopNavbar from './Components/Layout/TopNavbar';
import Sidebar from './Components/Layout/Sidebar';
import { useLocation } from 'react-router-dom';

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [mobileNav, setMobileNav] = useState(false);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/home', { replace: true });
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/signin', { replace: true });
  };

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/signin';

  return (
    <div className="min-h-screen w-full bg-essence-bg dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Global top bar spanning full width (hidden on auth pages) */}
      {!isAuthRoute && (
        <TopNavbar isLoggedIn={!!token} onLogout={handleLogout} onLoginClick={() => navigate('/login')} onMobileMenu={()=>setMobileNav(true)} />
      )}
      <div className="flex flex-1 min-h-0">
        {!isAuthRoute && (
          <Sidebar isLoggedIn={!!token} mobileOpen={mobileNav} onCloseMobile={()=>setMobileNav(false)} />
        )}
        <main className={isAuthRoute ? 'flex-1 flex items-center justify-center py-8 px-4 sm:px-6' : 'flex-1 py-8 px-4 sm:px-6'}>
          <div className="mx-auto w-full max-w-6xl">
  <Routes>
  <Route path="/login" element={<AuthContainer onLogin={handleLogin} initialTab="login" />} />
  <Route path="/signin" element={<Navigate to="/login" replace />} />
  <Route path="/register" element={<AuthContainer onLogin={handleLogin} initialTab="register" />} />
    <Route path="/home" element={<Home />} />
  <Route path="/essential-oils" element={<OilsList isLoggedIn={!!token} />} />
    <Route path="/essential-oils/wishlist" element={token ? <UserWishlist /> : <Navigate to="/signin" replace />} />
    <Route path="/essential-oils/owned" element={token ? <UserOwned /> : <Navigate to="/signin" replace />} />
    <Route path="/wishlist" element={<Navigate to="/essential-oils/wishlist" replace />} />
    <Route path="/owned" element={<Navigate to="/essential-oils/owned" replace />} />
    <Route path="/essential-oils/:id" element={<OilDetail />} />
  <Route path="/blends" element={<Blends />} />
  <Route path="/blends/create" element={token ? <CreateBlend /> : <Navigate to="/signin" replace />} />
  <Route path="/blends/edit/:id" element={token ? <EditBlend /> : <Navigate to="/signin" replace />} />
  <Route path="/blends/new" element={<Navigate to="/blends/create" replace />} />
  <Route path="/blends/favorites" element={token ? <FavoritesBlends /> : <Navigate to="/signin" replace />} />
  {/* Blends - user specific */}
  <Route path="/blends/my-blends" element={token ? <MyBlends /> : <Navigate to="/signin" replace />} />
  {/* Backward compatibility / aliases */}
  <Route path="/my-blends" element={<Navigate to="/blends/my-blends" replace />} />
  <Route path="/blends/mine" element={<Navigate to="/blends/my-blends" replace />} />
  <Route path="/favorites" element={<Navigate to="/blends/favorites" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;