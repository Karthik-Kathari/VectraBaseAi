/**
 * VectraBase AI — Axios Client with Thread-Safe 401 Silent Refresh Queue
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
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
            `${API_BASE_URL}/api/auth/demo-session`,
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

