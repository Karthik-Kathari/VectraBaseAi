// ============================================================================
// embed-widget — IIFE Library Entry Point (for BUILD_MODE=lib)
// Author: Karthik Kathari
// ============================================================================
// This file is the entry for the IIFE bundle.
// Consumers call: VectraBaseWidget.init({ tenantId, apiUrl })

import { createApp, type App as VueApp } from "vue";
import { createPinia } from "pinia";
import AppComponent from "./App.vue";
import router from "./router";
import "./assets/main.css";

interface WidgetInitOptions {
  tenantId: string;
  apiUrl?: string;
  containerId?: string;
}

let _app: VueApp | null = null;

function init(options: WidgetInitOptions): void {
  if (_app) {
    console.warn("[VectraBaseWidget] Already initialized.");
    return;
  }

  // Allow consumer to override API URL at runtime or default to production API
  const resolvedApiUrl = options.apiUrl || 'https://vectrabase-api.onrender.com';
  (window as unknown as Record<string, unknown>).__VECTRABASE_API_URL__ =
    resolvedApiUrl;

  if (options.tenantId) {
    (window as unknown as Record<string, unknown>).__VECTRABASE_TENANT_ID__ =
      options.tenantId;
  }

  const containerId = options.containerId ?? "vectrabase-widget";
  let mountEl = document.getElementById(containerId);
  if (!mountEl) {
    mountEl = document.createElement("div");
    mountEl.id = containerId;
    document.body.appendChild(mountEl);
  }

  _app = createApp(AppComponent);
  _app.use(createPinia());
  _app.use(router);
  _app.mount(mountEl);
}

function destroy(): void {
  if (_app) {
    _app.unmount();
    _app = null;
  }
}

// Expose as global for IIFE consumers
const VectraBaseWidget = { init, destroy };

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).VectraBaseWidget =
    VectraBaseWidget;
}

export { init, destroy };
export default VectraBaseWidget;
