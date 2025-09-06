// frontend/src/api/client.js
import axios from 'axios';

// Use Vite env for the API base URL.
// Ensure VITE_API_URL is set in your .env (e.g., http://localhost:5000).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000, // 15s timeout is a reasonable default
  // withCredentials: false, // keep false for pure Bearer JWT; set true if you switch to cookies
});

// Attach JWT on every request if present.
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Centralize 401 handling: clear local auth and redirect to /login.
// Reject the promise to stop downstream .then() chains and let React Query see an error.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        ['token', 'role', 'userId'].forEach((k) => localStorage.removeItem(k));
      } catch {}
      // Redirect outside React tree is fine here; Router will render Login.
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
      // Stop chain and notify callers that auth failed.
      return Promise.reject(new Error('Unauthorized'));
    }
    return Promise.reject(err);
  }
);

export default api;
