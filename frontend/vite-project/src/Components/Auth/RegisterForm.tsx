import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';

interface RegisterFormProps {
  onLogin: (token: string) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onLogin, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});

    try {
      const resp = await client.post('/register/', { username, email, password });
      const data = resp.data;
      if (data.token) {
        if (rememberMe) localStorage.setItem('token', data.token);
        else sessionStorage.setItem('token', data.token);
        onLogin(data.token);
        setMessage('Registration successful!');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (!data) {
        setError('Network error');
        return;
      }
      // DRF returns field errors as { field: ["msg"] }
      if (typeof data === 'object') {
        const newFieldErrors: Record<string, string> = {};
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (Array.isArray(val)) newFieldErrors[key] = val.join(' ');
          else newFieldErrors[key] = String(val);
        }
        setFieldErrors(newFieldErrors);
        // show non-field errors in 'error'
        if (newFieldErrors.non_field_errors) setError(newFieldErrors.non_field_errors);
      } else {
        setError(String(data));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Register</h2>
      </div>
  {error && <Alert intent="error" title="Registration failed">{error}</Alert>}
  {message && <Alert intent="success" title="Success">{message}</Alert>}

      <div className="space-y-1">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        {fieldErrors.username && <div className="text-xs text-red-600">{fieldErrors.username}</div>}
      </div>

      <div className="space-y-1">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {fieldErrors.email && <div className="text-xs text-red-600">{fieldErrors.email}</div>}
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

  <Button type="submit" className="w-full">Register</Button>

      <div className="text-center text-sm">
        <button type="button" className="btn-link" onClick={() => {
          try { navigate('/signin'); return; } catch { /* fallback */ }
          onSwitchToLogin();
        }}>
          Already have an account? Sign In
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;