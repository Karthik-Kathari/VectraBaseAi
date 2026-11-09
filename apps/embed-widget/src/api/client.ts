// ============================================================================
// embed-widget — Axios API Client
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
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0';

    const runtimeUrl = (window as unknown as Record<string, unknown>).__VECTRABASE_API_URL__;
    if (typeof runtimeUrl === 'string' && runtimeUrl.trim().length > 0) {
      if (!isLocalhost && (runtimeUrl.includes('localhost') || runtimeUrl.includes('127.0.0.1'))) {
        return 'https://vectrabase-api.onrender.com';
      }
      return runtimeUrl.replace(/\/+$/, '');
    }

    if (!isLocalhost) {
      const buildUrl = import.meta.env.VITE_API_URL as string | undefined;
      if (buildUrl && !buildUrl.includes('localhost') && !buildUrl.includes('127.0.0.1')) {
        return buildUrl.replace(/\/+$/, '');
      }
      return 'https://vectrabase-api.onrender.com';
    }
  }

  const buildUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (buildUrl && buildUrl.trim().length > 0) {
    return buildUrl.replace(/\/+$/, '');
  }
  return 'https://vectrabase-api.onrender.com';
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
// Request interceptor — attach dynamic baseURL and tenant ID if set
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = resolveBaseUrl();
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
