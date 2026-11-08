// ============================================================================
// embed-widget — Axios API Client
// Author: Karthik Kathari
// ============================================================================

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// ---------------------------------------------------------------------------
// Resolve base URL — supports runtime injection for IIFE embed mode
// ---------------------------------------------------------------------------
function resolveBaseUrl(): string {
  // 1. Runtime injection from VectraBaseWidget.init({ apiUrl })
  const runtimeUrl = typeof window !== 'undefined'
    ? (window as unknown as Record<string, unknown>).__VECTRABASE_API_URL__
    : undefined;
  if (typeof runtimeUrl === "string" && runtimeUrl.trim().length > 0) {
    return runtimeUrl.replace(/\/+$/, '');
  }
  // 2. Vite env variable (dev / preview)
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
  }
  // 3. Default production fallback
  return "https://vectrabase-api.onrender.com";
}

// ---------------------------------------------------------------------------
// Create the Axios instance
// ---------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach tenant ID if set
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tenantId = (window as unknown as Record<string, unknown>)
      .__VECTRABASE_TENANT_ID__;
    if (typeof tenantId === "string" && tenantId.length > 0) {
      config.headers["x-tenant-id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — normalize errors
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as
        | Record<string, unknown>
        | undefined;

      // Surface rate-limit header
      if (status === 429) {
        const retryAfter = error.response?.headers["retry-after"];
        const enhanced = new Error(
          typeof data?.message === "string"
            ? data.message
            : "Rate limit exceeded. Please slow down.",
        ) as Error & { code: string; retryAfterMs: number | null };
        enhanced.code = "RATE_LIMITED";
        enhanced.retryAfterMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : null;
        return Promise.reject(enhanced);
      }

      // Guardrail block
      if (status === 400 && data?.code === "GUARDRAIL_BLOCK") {
        const enhanced = new Error(
          typeof data?.message === "string"
            ? data.message
            : "Your query was blocked by the content guardrail.",
        ) as Error & { code: string };
        enhanced.code = "GUARDRAIL_BLOCK";
        return Promise.reject(enhanced);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
