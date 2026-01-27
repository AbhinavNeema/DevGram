// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

// attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle auth errors
api.interceptors.response.use(
  res => res,
  error => {
    const status = error.response?.status;

    // ❌ REMOVE 403 from here
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;