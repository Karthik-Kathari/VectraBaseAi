// ============================================================================
// embed-widget — IIFE Library Entry Point (for BUILD_MODE=lib)
// ============================================================================
// Consumers call: VectraBaseWidget.init({ tenantId, apiUrl, theme })

import { createApp, type App as VueApp } from "vue";
import { createPinia } from "pinia";
import AppComponent from "./App.vue";
import router from "./router";
import "./assets/main.css";

export interface WidgetInitOptions {
  tenantId: string;
  apiUrl?: string;
  containerId?: string;
  theme?: 'light' | 'dark';
}

let _app: VueApp | null = null;
let _mountEl: HTMLElement | null = null;
let _currentTheme: 'light' | 'dark' = 'dark';

function applyThemeToContainer(el: HTMLElement, theme: 'light' | 'dark'): void {
  if (theme === 'dark') {
    el.classList.add('dark');
    el.classList.remove('light');
  } else {
    el.classList.remove('dark');
    el.classList.add('light');
  }
  el.setAttribute('data-theme', theme);
}

function setTheme(theme: 'light' | 'dark'): void {
  _currentTheme = theme === 'light' ? 'light' : 'dark';
  if (_mountEl) {
    applyThemeToContainer(_mountEl, _currentTheme);
  }
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__VECTRABASE_THEME__ = _currentTheme;
  }
}

function init(options: WidgetInitOptions): void {
  if (_app) {
    console.warn("[VectraBaseWidget] Already initialized.");
    return;
  }

  // Gracefully default theme to 'dark' if omitted or invalid
  _currentTheme = options?.theme === 'light' ? 'light' : 'dark';
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__VECTRABASE_THEME__ = _currentTheme;
  }

  // Allow consumer to override API URL at runtime or default to production API
  const resolvedApiUrl = options?.apiUrl || 'https://vectrabase-api.onrender.com';
  (window as unknown as Record<string, unknown>).__VECTRABASE_API_URL__ =
    resolvedApiUrl;

  if (options?.tenantId) {
    (window as unknown as Record<string, unknown>).__VECTRABASE_TENANT_ID__ =
      options.tenantId;
  }

  const containerId = options?.containerId ?? "vectrabase-widget";
  let mountEl = document.getElementById(containerId);
  if (!mountEl) {
    mountEl = document.createElement("div");
    mountEl.id = containerId;
    document.body.appendChild(mountEl);
  }

  _mountEl = mountEl;
  applyThemeToContainer(mountEl, _currentTheme);

  _app = createApp(AppComponent);
  _app.use(createPinia());
  _app.use(router);
  _app.mount(mountEl);
}

function destroy(): void {
  if (_app) {
    _app.unmount();
    _app = null;
    _mountEl = null;
  }
}

// Expose as global for IIFE consumers
const VectraBaseWidget = { init, destroy, setTheme };

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).VectraBaseWidget =
    VectraBaseWidget;
}

export { init, destroy, setTheme };
export default VectraBaseWidget;
