// ============================================================================
// embed-widget — Vue Router
// Author: Karthik Kathari
// ============================================================================

import { createRouter, createWebHistory } from "vue-router";
import WidgetContainer from "@/components/WidgetContainer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "widget",
      component: WidgetContainer,
    },
  ],
});

export default router;
