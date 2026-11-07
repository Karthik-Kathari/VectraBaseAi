<!-- ============================================================================
  embed-widget — Root App Component
  Author: Karthik Kathari
  ============================================================================ -->

<template>
  <div class="vectrabase-root h-full flex flex-col bg-obsidian-900">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
