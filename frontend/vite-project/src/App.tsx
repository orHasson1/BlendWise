import React, { useState } from 'react';
import AuthContainer from './Components/Auth/AuthContainer';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './Components/Pages/Home';
import OilsList from './Components/Pages/OilsList';
import UserWishlist from './Components/Pages/UserWishlist';
import UserOwned from './Components/Pages/UserOwned';
import OilDetail from './Components/Pages/OilDetail';
import Blends from './Components/Pages/Blends';
import MyBlends from './Components/Pages/MyBlends';
import TopNavbar from './Components/Layout/TopNavbar';
import Sidebar from './Components/Layout/Sidebar';

function AppShell() {
  const navigate = useNavigate();
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

  return (
    <div className="flex min-h-screen w-full bg-essence-bg dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar isLoggedIn={!!token} mobileOpen={mobileNav} onCloseMobile={()=>setMobileNav(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar isLoggedIn={!!token} onLogout={handleLogout} onLoginClick={() => navigate('/signin')} onMobileMenu={()=>setMobileNav(true)} />
        <main className="flex-1 py-8 px-4 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
        <Routes>
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<AuthContainer onLogin={handleLogin} initialTab="login" />} />
        <Route path="/register" element={<AuthContainer onLogin={handleLogin} initialTab="register" />} />
    <Route path="/home" element={<Home />} />
    <Route path="/oils" element={<OilsList isLoggedIn={!!token} />} />
    <Route path="/oils/wishlist" element={token ? <UserWishlist /> : <Navigate to="/signin" replace />} />
    <Route path="/oils/owned" element={token ? <UserOwned /> : <Navigate to="/signin" replace />} />
    <Route path="/wishlist" element={<Navigate to="/oils/wishlist" replace />} />
    <Route path="/owned" element={<Navigate to="/oils/owned" replace />} />
    <Route path="/oils/:id" element={<OilDetail />} />
  <Route path="/blends" element={<Blends />} />
  <Route path="/my-blends" element={token ? <MyBlends /> : <Navigate to="/signin" replace />} />
  <Route path="/blends/mine" element={<Navigate to="/my-blends" replace />} />
        <Route path="/" element={token ? <Home /> : <Navigate to="/signin" replace />} />
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
      <AppShell />
    </BrowserRouter>
  );
}

export default App;