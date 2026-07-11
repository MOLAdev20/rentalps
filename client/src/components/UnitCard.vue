<script setup lang="ts">
defineProps<{
  name: string;
  pricePerHour: string;
  status: string;
}>();
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
  >
    <div class="flex items-start gap-4">
      <div
        class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 ring-1 ring-slate-200"
      >
        <svg
          class="h-9 w-9 text-indigo-600"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M23.5 13.5H40.5C43.8137 13.5 46.5 16.1863 46.5 19.5V44.5C46.5 47.8137 43.8137 50.5 40.5 50.5H23.5C20.1863 50.5 17.5 47.8137 17.5 44.5V19.5C17.5 16.1863 20.1863 13.5 23.5 13.5Z"
            stroke="currentColor"
            stroke-width="3"
          />
          <path
            d="M26 24.5H38"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M26 32H38"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M26 39.5H33"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
          <circle cx="45" cy="19" r="5" fill="currentColor" opacity="0.15" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-xl font-bold text-slate-900">
              {{ name }}
            </h3>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-lg font-semibold bg-orange-300 text-white"
          >
            12:52
          </span>
        </div>
        <p class="mt-2 font-semibold tracking-tight text-slate-900">
          {{ pricePerHour }}
        </p>

        <div class="mt-4 flex gap-2">
          <button
            type="button"
            class="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m6-6H6"
              />
            </svg>
            Mulai
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
