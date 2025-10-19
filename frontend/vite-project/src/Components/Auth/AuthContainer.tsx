import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContainerProps {
  onLogin: (token: string) => void;
  initialTab?: 'login' | 'register';
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onLogin, initialTab = 'login' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // helper to normalize path (ignore trailing slash)
  const normalize = (p: string) => p.replace(/\/$/, '');

  // derive initial state from location or prop
  const [showRegister, setShowRegister] = useState(() => {
    const p = normalize(location.pathname);
    if (p === '/register') return true;
    if (p === '/signin') return false;
    return initialTab === 'register';
  });

  // keep state in sync when route changes
  useEffect(() => {
    const p = normalize(location.pathname);
    if (p === '/register') setShowRegister(true);
    else if (p === '/signin') setShowRegister(false);
    // otherwise leave as-is
  }, [location.pathname]);

  // navigation helpers we pass to children
  const goToRegister = () => {
    navigate('/register');
    setShowRegister(true);
  };

  const goToLogin = () => {
    navigate('/signin');
    setShowRegister(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-essence-bg px-4 py-10">
      <div className="w-full max-w-md card">
        <div className="card-body">
          {showRegister ? (
            <RegisterForm onLogin={onLogin} onSwitchToLogin={goToLogin} />
          ) : (
            <LoginForm onLogin={onLogin} onSwitchToRegister={goToRegister} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;