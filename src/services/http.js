import axios from 'axios';
import { SYSTEM_MESSAGES } from '../constants/messages';
import { apiDelay } from '../lib/apiDelay';

const API_URL = import.meta.env.VITE_API_URL;

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important if backend uses cookies/session
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor to add delay
http.interceptors.request.use(async (config) => {
  await apiDelay();
  return config;
});

export const handleApiError = (error) => {
  const isOffline = !navigator.onLine;
  const isNetworkError =
    error.code === 'ECONNABORTED' || error.message === 'Network Error';

  const message = isOffline
    ? SYSTEM_MESSAGES.NETWORK_ERROR
    : isNetworkError
      ? SYSTEM_MESSAGES.SERVICE_UNAVAILABLE
      : error.response?.data?.message ||
        error.response?.data?.error?.message ||
        SYSTEM_MESSAGES.SERVICE_UNAVAILABLE;

  throw new Error(message);
};

export default http;
