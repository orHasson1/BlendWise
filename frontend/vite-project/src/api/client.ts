import axios from 'axios';

export const API = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
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

// Optional: global 401 handling + retry on cold start (Render free tier returns HTML 404 while waking)
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    // Retry once if we get an HTML response (Render cold start proxy page)
    if (
      !config._retried &&
      err.response &&
      typeof err.response.data === 'string' &&
      err.response.data.includes('<!doctype html>')
    ) {
      config._retried = true;
      await new Promise((r) => setTimeout(r, 5000));
      return client(config);
    }
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default client;