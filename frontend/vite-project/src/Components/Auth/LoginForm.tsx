import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';

interface LoginFormProps {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [loginValue, setLoginValue] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  const [pending, setPending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setMessage('');
    setFieldErrors({});

    try {
      const resp = await client.post('/login/', { login: loginValue.trim(), password });
      const data = resp.data;
      if (!data?.token) {
        setError('Unexpected response: no token returned');
        return;
      }
      (rememberMe ? localStorage : sessionStorage).setItem('token', data.token);
      onLogin(data.token);
      setMessage('Signed in successfully');
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Cannot reach server. Is the backend running on port 8000?');
        return;
      }
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 400 || status === 401) {
        // DRF custom error or validation errors
        if (typeof data === 'object' && data) {
          const newFieldErrors: Record<string,string> = {};
          Object.keys(data).forEach(key => {
            const val = data[key];
            newFieldErrors[key] = Array.isArray(val) ? val.join(' ') : String(val);
          });
            setFieldErrors(newFieldErrors);
          const topError = newFieldErrors.error || newFieldErrors.non_field_errors;
          setError(topError || 'Invalid credentials');
        } else {
          setError(typeof data === 'string' ? data : 'Invalid credentials');
        }
      } else if (status === 0) {
        setError('Network unreachable');
      } else {
        setError(`Unexpected error (${status || 'unknown'})`);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Sign In</h2>
      </div>
  {error && <Alert intent="error" title="Sign in failed">{error}</Alert>}
  {message && <Alert intent="success" title="Success">{message}</Alert>}

      <div className="space-y-1">
        <Input
          type="text"
          placeholder="Username or Email"
          value={loginValue}
          onChange={e => setLoginValue(e.target.value)}
          required
        />
        {fieldErrors.login && <div className="text-xs text-red-600">{fieldErrors.login}</div>}
      </div>

      <div className="space-y-1">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {fieldErrors.password && <div className="text-xs text-red-600">{fieldErrors.password}</div>}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={e => setRememberMe(e.target.checked)}
          className="rounded border-slate-300 text-brand focus:ring-brand"
        />
        Remember me
      </label>

  <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Signing in…' : 'Sign In'}</Button>

      <div className="text-center text-sm">
        <button type="button" className="btn-link" onClick={() => {
          try { navigate('/register'); return; } catch { /* fallback */ }
          onSwitchToRegister();
        }}>
          Don't have an account? Register
        </button>
      </div>
    </form>
  );
};

export default LoginForm;