import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// unwrap { success, data } here so callers just get plain data or an error message
api.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const message = error.response?.data?.message || 'Unable to reach the server. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
