<!-- ============================================================================
  embed-widget — Root App Component
  ============================================================================ -->

<template>
  <div class="vectrabase-root h-full flex flex-col bg-white dark:bg-obsidian-900 text-slate-900 dark:text-slate-100">
    <WidgetContainer />
  </div>
</template>

<script setup lang="ts">
import WidgetContainer from "./components/WidgetContainer.vue";
</script>
