
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout for all requests
});

// Track pending requests for debugging
let pendingCount = 0;

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  pendingCount++;

  // Log slow requests (>3s) in development
  config._startTime = Date.now();

  return config;
}, error => {
  pendingCount = Math.max(0, pendingCount - 1);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  res => {
    pendingCount = Math.max(0, pendingCount - 1);

    // Log slow responses
    if (res.config._startTime) {
      const duration = Date.now() - res.config._startTime;
      if (duration > 3000 && !import.meta.env.PROD) {
        console.warn(`Slow request: ${res.config.url} took ${duration}ms`);
      }
    }

    return res;
  },
  error => {
    pendingCount = Math.max(0, pendingCount - 1);

    const status = error.response?.status;

    // Handle auth errors
    if (status === 401) {
      localStorage.removeItem("token");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Debug helper
api.getPendingCount = () => pendingCount;

export default api;