<template>
  <Layout>
    <Layout.Content >
      <Card class="relative!">
        <ToggleTheme  />
        <RouterView />
      </Card>
    </Layout.Content>
  </Layout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import { Card, Layout } from "ant-design-vue";
import { RouteEnum } from "@/enums/route.enum";
import ToggleTheme from "@/components/layout/ToggleTheme.vue";

const route = useRoute();

const selectedKeys = ref<string[]>(["dashboard"]);

watch(
  () => [route.name, route.params.moduleId],
  () => {
    if (route.name === RouteEnum.Dashboard) {
      selectedKeys.value = ["dashboard"];
      return;
    }
    const moduleId = route.params.moduleId;
    if (typeof moduleId === "string") {
      selectedKeys.value = [moduleId];
    }
  },
  { immediate: true },
);
</script>
