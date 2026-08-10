<script setup lang="ts">
import { ArrowRightCircle, PlayCircle } from "@lucide/vue";
import pslogo from "/ps-logo.webp";

defineProps<{
  id: number;
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
      <div class="h-16 w-16 shrink-0 place-items-center rounded-2xl">
        <img :src="pslogo" width="100%" />
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
          <RouterLink
            v-if="status === 'available'"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-indigo-600 hover:bg-indigo-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{ name: 'new-rent', params: { unitId: id } }"
          >
            <PlayCircle />
            <span>Mulai Sewa</span>
          </RouterLink>

          <RouterLink
            v-if="status === 'rented'"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-emerald-600 hover:bg-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{ name: 'rent-detail', params: { id } }"
          >
            <span>Disewa (-10:32)</span>
            <ArrowRightCircle />
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
