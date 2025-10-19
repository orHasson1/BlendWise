import axios from 'axios';

export const API = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// small debug: print base URL so it's obvious in the browser console what the client will call
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.debug('[api/client] baseURL =', API);
}

// Attach token automatically if present
client.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && config.headers) {
    (config.headers as any)['Authorization'] = `Token ${token}`;
  }
  return config;
});

// Optional: global 401 handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Could redirect to /login here if desired
    }
    return Promise.reject(err);
  }
);

export default client;