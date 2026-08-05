<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps<{
  collapsed: boolean;
  to: string;
}>();

const isActive = computed(() => {
  if (props.to === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(props.to);
});
</script>

<template>
  <RouterLink
    :to="to"
    class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
    :class="[
      collapsed && 'lg:justify-center lg:px-0',
      isActive && 'bg-white/10',
    ]"
  >
    <slot name="icon" />
    <span :class="{ 'lg:hidden': collapsed }">
      <slot name="title" />
    </span>
  </RouterLink>
</template>
