<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import MainContent from './MainContent.vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

const sidebarBackdropClass = computed(() =>
  isMobileSidebarOpen.value ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const openMobileSidebar = () => {
  isMobileSidebarOpen.value = true
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

watch(
  isMobileSidebarOpen,
  (open) => {
    document.documentElement.classList.toggle('overflow-hidden', open)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.documentElement.classList.remove('overflow-hidden')
})
</script>

<template>
  <div class="bg-gray-50 text-gray-900 antialiased">
    <div class="flex h-screen overflow-hidden">
      <div
        class="fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 lg:hidden"
        :class="sidebarBackdropClass"
        @click="closeMobileSidebar"
      />

      <Sidebar
        :collapsed="isSidebarCollapsed"
        :mobile-open="isMobileSidebarOpen"
        @toggle-collapse="toggleSidebar"
      />

      <div class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar @open-mobile-sidebar="openMobileSidebar" />
        <MainContent>
          <slot />
        </MainContent>
      </div>
    </div>
  </div>
</template>
