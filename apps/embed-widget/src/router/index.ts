// ============================================================================
// embed-widget — Vue Router
// ============================================================================

import { createRouter, createMemoryHistory } from "vue-router";
import WidgetContainer from "@/components/WidgetContainer.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      name: "widget",
      component: WidgetContainer,
    },
  ],
});

export default router;
