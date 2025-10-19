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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const resp = await client.post('/login/', { login: loginValue, password });
      const data = resp.data;
      if (data.token) {
        if (rememberMe) localStorage.setItem('token', data.token);
        else sessionStorage.setItem('token', data.token);
        onLogin(data.token);
        setMessage('Sign in successful!');
      }
    } catch (err) {
      const anyErr: any = err;
      const data = anyErr.response?.data;
      if (!data) {
        setError('Network error');
        return;
      }
      // DRF may return { error: '...' } or field-specific errors
      if (typeof data === 'object') {
        const newFieldErrors: Record<string,string> = {};
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (Array.isArray(val)) newFieldErrors[key] = val.join(' ');
          else newFieldErrors[key] = String(val);
        }
        setFieldErrors(newFieldErrors);
        if (newFieldErrors.non_field_errors) setError(newFieldErrors.non_field_errors);
        if (newFieldErrors.error) setError(newFieldErrors.error);
      } else {
        setError(String(data));
      }
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

  <Button type="submit" className="w-full">Sign In</Button>

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