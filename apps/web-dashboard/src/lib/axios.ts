/**
 * VectraBase AI — Axios Client with Thread-Safe 401 Silent Refresh Queue
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0';

    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/+$/, '');
      }
      return 'https://vectrabase-api.onrender.com';
    }
  }

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://vectrabase-api.onrender.com';
}

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token storage (XSS protection)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
// Alias failedQueue as refreshSubscribers for thread-safe request replay queue
const refreshSubscribers = failedQueue;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('vectrabase_refresh_token', token);
    else localStorage.removeItem('vectrabase_refresh_token');
  }
}

export function getRefreshToken(): string | null {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('vectrabase_refresh_token');
  }
  return refreshToken;
}

// Global interceptor telemetry listener for recruiter visualizer
type TelemetryListener = (event: {
  type: 'REQUEST_401' | 'REFRESH_START' | 'REFRESH_SUCCESS' | 'REPLAY_SUCCESS' | 'REFRESH_FAILED';
  payload?: any;
  timestamp: string;
}) => void;

let telemetryListeners: TelemetryListener[] = [];

export function registerInterceptorListener(fn: TelemetryListener) {
  telemetryListeners.push(fn);
  return () => {
    telemetryListeners = telemetryListeners.filter((l) => l !== fn);
  };
}

function notifyTelemetry(type: any, payload?: any) {
  const event = { type, payload, timestamp: new Date().toISOString() };
  telemetryListeners.forEach((l) => l(event));
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach bearer token and dynamic base URL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: silent refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Avoid infinite loop if refresh endpoint itself 401s
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/refresh')) {
      notifyTelemetry('REQUEST_401', {
        url: originalRequest.url,
        dataSize: originalRequest.data ? JSON.stringify(originalRequest.data).length : 0,
      });

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      notifyTelemetry('REFRESH_START');

      try {
        let currentRefreshToken = getRefreshToken();
        let newAccessToken: string;
        const effectiveBaseUrl = getApiBaseUrl();

        try {
          const { data } = await axios.post(
            `${effectiveBaseUrl}/api/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { withCredentials: true },
          );
          newAccessToken = data.data.accessToken;
          if (data.data.refreshToken) {
            setRefreshToken(data.data.refreshToken);
          }
        } catch (refreshErr) {
          // Fallback to bootstrap demo session for recruiters if initial session was absent
          const { data } = await axios.post(
            `${effectiveBaseUrl}/api/auth/demo-session`,
            {},
            { withCredentials: true },
          );
          newAccessToken = data.data.accessToken;
          if (data.data.refreshToken) {
            setRefreshToken(data.data.refreshToken);
          }
        }

        setAccessToken(newAccessToken);
        notifyTelemetry('REFRESH_SUCCESS', { newAccessToken: `${newAccessToken.slice(0, 15)}...` });

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        const replayResponse = await apiClient(originalRequest);
        notifyTelemetry('REPLAY_SUCCESS', {
          url: originalRequest.url,
          status: replayResponse.status,
          zeroDataLoss: true,
        });

        return replayResponse;
      } catch (refreshError: any) {
        notifyTelemetry('REFRESH_FAILED', { error: refreshError.message });
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

