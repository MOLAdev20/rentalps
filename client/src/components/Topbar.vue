<script setup lang="ts">
defineEmits<{
  (event: "open-mobile-sidebar"): void;
}>();
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6"
  >
    <button
      class="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-100 lg:hidden"
      type="button"
      @click="$emit('open-mobile-sidebar')"
    >
      <svg
        class="h-5 w-5"
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
    </button>

    <div class="ml-auto flex items-center gap-1.5">
      <button
        class="relative grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-gray-100"
        type="button"
      >
        <svg
          class="h-4 w-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span
          class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
        ></span>
      </button>

      <div
        class="ml-1 flex h-9 cursor-pointer items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-gray-100"
      >
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/022/014/184/small/user-icon-member-login-isolated-vector.jpg"
          class="h-7 w-7 rounded-full"
          alt="avatar"
        />
        <svg
          class="h-3.5 w-3.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </header>
</template>
