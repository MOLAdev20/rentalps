<script setup lang="ts">
import pslogo from "/ps-logo.webp";

defineProps<{
  id: number;
  name: string;
  pricePerHour: string;
  status: string;
}>();

// trigger open modal di komponen induk (RentalManagement.vue)
const emit = defineEmits<{
  (e: "open-modal"): void;
}>();

const handleButtonClick = () => {
  emit("open-modal");
};
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
          <button
            v-if="status === 'available'"
            type="button"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-indigo-600 hover:bg-indigo-800 transition-all active:scale-[0.98] cursor-pointer"
            @click="handleButtonClick()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-circle-play-icon lucide-circle-play"
            >
              <path
                d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"
              />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Mulai Sewa</span>
          </button>

          <RouterLink
            v-if="status === 'rented'"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-emerald-600 hover:bg-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{ name: 'rent-detail', params: { id } }"
          >
            <span>Disewa (-10:32)</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-circle-arrow-right-icon lucide-circle-arrow-right"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m12 16 4-4-4-4" />
              <path d="M8 12h8" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
