import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';
import { normalizeTimestamps } from '../utils/normalize';
const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL, window.location.hostname);
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(response => {
  response.data = normalizeTimestamps(response.data);
  return response;
}, error => {
  if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  if (Array.isArray(error.response?.data?.errors)) {
    const details = error.response.data.errors.map(item => item.msg || item.message).filter(Boolean);
    if (details.length) error.response.data.message = details.join(' ');
  }
  return Promise.reject(error);
});
export default api;
