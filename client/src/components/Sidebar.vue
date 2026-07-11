<script setup lang="ts">
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
        >Panel</span
      >
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <p
        class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
        :class="collapsed ? 'lg:hidden' : ''"
      >
        Menu
      </p>
      <div class="space-y-1">
        <a
          href="#"
          class="flex h-10 items-center gap-3 rounded-lg bg-white/10 px-3 text-sm font-medium text-white"
          :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
            />
          </svg>
          <span :class="collapsed ? 'lg:hidden' : ''">Dasbor</span>
        </a>
        <a
          href="#"
          class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span :class="collapsed ? 'lg:hidden' : ''">Formulir</span>
        </a>
        <a
          href="#"
          class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span :class="collapsed ? 'lg:hidden' : ''">Tabel Data</span>
        </a>
        <a
          href="#"
          class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span :class="collapsed ? 'lg:hidden' : ''">Pengaturan</span>
        </a>
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
