<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue";
import { RouterView } from "vue-router";
import { useThemeStore } from "@/stores/theme.store";
const themeStore = useThemeStore();
</script>

<template>
  <ConfigProvider
    :component-size="themeStore.componentSize"
    :locale="themeStore.locale"
    :theme="themeStore.theme"
    :direction="themeStore.direction"
  >
    <RouterView />
  </ConfigProvider>
</template>

<style scoped></style>
