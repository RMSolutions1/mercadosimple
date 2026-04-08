import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import { redirectToLoginPreserveReturn } from '@/lib/auth-routes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Evita botones “colgados” si la API no responde (cold start Fly, 502, red). */
export const API_CLIENT_TIMEOUT_MS = 55_000;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_CLIENT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/** Mensaje legible para toasts / UI (registro, login, etc.). */
export function apiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      return 'El servidor tardó demasiado en responder. Esperá unos segundos e intentá de nuevo (si usás fly.dev, la API puede estar iniciando).';
    }
    if (!error.response) {
      return 'No pudimos contactar al servidor. Revisá tu conexión o probá más tarde.';
    }
    const st = error.response.status;
    if (st === 502 || st === 503 || st === 504) {
      return 'El servicio no está disponible en este momento (error del servidor). Intentá de nuevo en un minuto.';
    }
    const data = error.response.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg[0] ?? 'Error en la solicitud';
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error. Intentá de nuevo.';
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {}
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void; config: AxiosRequestConfig }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (config.headers) config.headers.Authorization = `Bearer ${token}`;
      resolve(api(config));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem('auth-storage');
        const parsed = stored ? JSON.parse(stored) : null;
        const refreshToken = parsed?.state?.refreshToken;

        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: API_CLIENT_TIMEOUT_MS });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Actualizar localStorage
        if (parsed?.state) {
          parsed.state.accessToken = newAccessToken;
          parsed.state.refreshToken = newRefreshToken;
          parsed.state.user = data.user;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          redirectToLoginPreserveReturn();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
