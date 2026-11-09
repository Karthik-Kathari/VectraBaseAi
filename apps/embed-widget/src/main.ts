// ============================================================================
// embed-widget — Application Entry Point
// ============================================================================

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

// ---------------------------------------------------------------------------
// Mount point resolution — works both in dev (index.html) and as an embed
// ---------------------------------------------------------------------------
function mountWidget(): void {
  let mountEl = document.getElementById("vectrabase-widget");

  if (!mountEl) {
    mountEl = document.createElement("div");
    mountEl.id = "vectrabase-widget";
    document.body.appendChild(mountEl);
  }

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount(mountEl);
}

mountWidget();
