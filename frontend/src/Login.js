import React, { useState } from 'react';

function Login({ onLogin }) {
  const [loginValue, setLoginValue] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // only used for registration
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const url = isRegistering
        ? 'http://127.0.0.1:8000/api/register/'
        : 'http://127.0.0.1:8000/api/login/';

      const body = isRegistering
        ? { username: loginValue, email, password }
        : { login: loginValue, password };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
  onLogin(data.token);
  setMessage(isRegistering ? 'Registration successful!' : 'Sign in successful!');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e6f4ea 0%, #b8c6b9 60%, #e2d6c2 100%)',
      fontFamily: 'Segoe UI, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.30)',
        borderRadius: '2rem',
        boxShadow: '0 8px 32px 0 rgba(34,49,34,0.18)',
        padding: '2.7rem 2.2rem 2.2rem 2.2rem',
        maxWidth: 390,
        width: '100%',
        position: 'relative',
        border: '1.5px solid rgba(163,177,138,0.25)',
        zIndex: 1,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        transition: 'box-shadow 0.2s',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700 }}>
            {isRegistering ? "Register" : "Sign In"}
          </h2>

          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          {message && <div style={{ color: 'green', textAlign: 'center' }}>{message}</div>}

          <input
            placeholder={isRegistering ? "Username" : "Username or Email"}
            value={loginValue}
            onChange={e => setLoginValue(e.target.value)}
            required
            style={{ padding: 8, borderRadius: 8, border: '1px solid #b8c6b9' }}
          />

          {isRegistering && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 8, border: '1px solid #b8c6b9' }}
            />
          )}

          {/* PASSWORD FIELD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: 8, borderRadius: 8, border: '1px solid #b8c6b9' }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <button type="submit" style={{
            padding: 10, borderRadius: 8, background: '#a3b18a', color: 'white', fontWeight: 600
          }}>
            {isRegistering ? "Register" : "Sign In"}
          </button>

          <p style={{ textAlign: 'center', cursor: 'pointer', color: '#4e5d4e' }}
             onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
