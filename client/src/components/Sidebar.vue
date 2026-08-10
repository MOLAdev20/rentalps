<script setup lang="ts">
import {
  CirclePlay,
  LayoutDashboard,
  Monitor,
  ScrollText,
  Utensils,
} from "@lucide/vue";
import SidebarLink from "./SidebarLink.vue";

defineProps<{
  collapsed: boolean;
  mobileOpen: boolean;
}>();

defineEmits<{
  (event: "toggle-collapse"): void;
}>();
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-slate-900 text-slate-300 transition-all duration-300 lg:static lg:translate-x-0"
    :class="[
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'w-60 lg:w-20' : 'w-60',
    ]"
  >
    <div
      class="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5"
      :class="collapsed ? 'lg:justify-center lg:px-3' : ''"
    >
      <div
        class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600"
      >
        <span class="font-display text-sm font-bold text-white">P</span>
      </div>
      <span
        class="brand-text font-display text-[15px] font-bold text-white"
        :class="collapsed ? 'lg:hidden' : ''"
        >Rental PS</span
      >
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <div>
        <p
          class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          :class="collapsed ? 'lg:hidden' : ''"
        >
          Menu
        </p>
        <div class="space-y-1">
          <SidebarLink :to="'/dashboard'" :collapsed="collapsed">
            <template #icon>
              <LayoutDashboard :size="18" />
            </template>
            <template #title>Dashboard</template>
          </SidebarLink>
          <SidebarLink :to="'/rent'" :collapsed="collapsed">
            <template #icon>
              <CirclePlay :size="18" />
            </template>
            <template #title>Sewa</template>
          </SidebarLink>
          <SidebarLink :to="'/transaction-report'" :collapsed="collapsed">
            <template #icon>
              <ScrollText :size="18" />
            </template>
            <template #title>Laporan Transaksi</template>
          </SidebarLink>
        </div>
      </div>
      <div class="mt-3">
        <p
          class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          :class="collapsed ? 'lg:hidden' : ''"
        >
          Master Data
        </p>
        <div class="space-y-1">
          <SidebarLink :to="'/unit'" :collapsed="collapsed">
            <template #icon><Monitor :size="18" /></template>
            <template #title>Unit PS</template>
          </SidebarLink>
          <SidebarLink :to="'/fnb'" :collapsed="collapsed">
            <template #icon><Utensils :size="18" /></template>
            <template #title>Food & Beverage (FnB)</template>
          </SidebarLink>
        </div>
      </div>
    </nav>

    <button
      class="mx-3 mb-4 hidden h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:flex"
      :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
      type="button"
      @click="$emit('toggle-collapse')"
    >
      <svg
        class="h-4 w-4 shrink-0 transition-transform duration-300"
        :class="collapsed ? 'rotate-180' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
      <span :class="collapsed ? 'lg:hidden' : ''">Ciutkan</span>
    </button>

    <div class="border-t border-white/10 p-3">
      <div
        class="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-2 transition-colors hover:bg-white/5"
        :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
      >
        <img
          src=""
          class="h-8 w-8 shrink-0 rounded-full bg-white/10"
          alt="avatar"
        />
        <div
          class="leading-tight overflow-hidden"
          :class="collapsed ? 'lg:hidden' : ''"
        >
          <p class="truncate text-sm font-medium text-white">Sabilul</p>
          <p class="truncate text-xs text-slate-500">Administrator</p>
        </div>
      </div>
    </div>
  </aside>
</template>
