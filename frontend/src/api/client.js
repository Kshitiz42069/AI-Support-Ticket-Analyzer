import axios from "axios";
import { tokens } from "../lib/tokens";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokens.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokens.clear();
      // Defer redirect to avoid race during render. The router-level
      // ProtectedRoute will see no user and bounce to /login.
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function apiError(err, fallback = "Something went wrong") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(", ");
  }
  return err?.message || fallback;
}
