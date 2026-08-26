<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import {
  AlertCircle,
  ArrowRightCircle,
  PauseCircle,
  PlayCircle,
} from "@lucide/vue";
import pslogo from "/ps-logo.webp";
import dayjs from "dayjs";

interface RentedSession {
  order_id: number;
  start_time: string;
  end_time: string;
}

const props = defineProps<{
  id: number;
  name: string;
  pricePerHour: string;
  status: string;
  rentedSession?: RentedSession | null;
}>();

const remainingDuration = ref<string>("");
const remainingTimePercentage = ref(0);
const isTicking = ref(false);

let intervalId: ReturnType<typeof setInterval> | undefined;
// non-reactive, cukup dibaca di dalam tick(), gak perlu trigger re-render
let currentStart = 0;
let currentEnd = 0;

const formatRemainingDuration = (ms: number): string => {
  const totalSeconds = Math.floor(Math.max(ms, 0) / 1_000);
  const h = String((totalSeconds / 3_600) | 0).padStart(2, "0");
  const m = String(((totalSeconds % 3_600) / 60) | 0).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const stopTicking = () => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};

const resetTimer = () => {
  remainingDuration.value = "";
  remainingTimePercentage.value = 0;
  isTicking.value = false;
  currentStart = 0;
  currentEnd = 0;
};

const tick = () => {
  const totalDuration = currentEnd - currentStart;
  const remaining = Math.max(currentEnd - Date.now(), 0);
  const percentage = (remaining / totalDuration) * 100;

  remainingDuration.value = formatRemainingDuration(remaining);
  remainingTimePercentage.value =
    Math.round(Math.min(percentage, 100) * 100) / 100;
  isTicking.value = remaining > 0;

  if (!isTicking.value) stopTicking();
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    stopTicking();
  } else if (isTicking.value && currentEnd > 0) {
    tick();
    if (isTicking.value) intervalId = setInterval(tick, 1_000);
  }
};

watch(
  [
    () => props.rentedSession?.start_time,
    () => props.rentedSession?.end_time,
    () => props.status,
  ],
  ([startTime, endTime, status]) => {
    stopTicking();

    if (status !== "rented" || !startTime || !endTime) {
      resetTimer();
      return;
    }

    const start = dayjs(startTime).valueOf();
    const end = dayjs(endTime).valueOf();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      resetTimer();
      return;
    }

    currentStart = start;
    currentEnd = end;

    tick();

    if (isTicking.value && !document.hidden) {
      intervalId = setInterval(tick, 1_000);
    }
  },
  { immediate: true },
);

document.addEventListener("visibilitychange", handleVisibilityChange);

onUnmounted(() => {
  stopTicking();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
  >
    <div class="flex items-start gap-4">
      <div class="h-16 w-16 shrink-0 place-items-center rounded-2xl">
        <img :src="pslogo" width="100%" alt="PS Logo" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-xl font-bold text-slate-900">
              {{ name }}
            </h3>
          </div>
          <span
            v-if="status === 'rented' && isTicking"
            class="shrink-0 rounded-full px-3 py-1 text-sm font-semibold bg-emerald-600 text-white"
          >
            {{ remainingDuration }}
          </span>
          <span
            v-if="status === 'rented' && !isTicking"
            class="shrink-0 rounded-full p-1 text-sm font-semibold bg-amber-600 text-white"
          >
            <AlertCircle :size="15" />
          </span>
        </div>

        <div v-if="status === 'rented'" class="flex gap-1 mt-2">
          <PauseCircle
            class="text-emerald-600"
            v-if="status === 'rented' && isTicking"
          />
          <PlayCircle
            class="text-amber-600"
            v-if="status === 'rented' && !isTicking"
          />
          <div
            class="mt-2.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden flex"
          >
            <div
              class="h-full rounded-full transition-all duration-1000 ease-linear bg-emerald-600"
              :style="{ width: remainingTimePercentage + '%' }"
            ></div>
          </div>
        </div>

        <div v-else>
          <p class="mt-2 font-semibold tracking-tight text-slate-900">
            {{ pricePerHour }}
          </p>
        </div>

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
            v-else-if="status === 'rented' && isTicking"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-emerald-600 hover:bg-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{
              name: 'rent-detail',
              params: { id },
              query: { order: rentedSession?.order_id },
            }"
          >
            <span>Sedang Disewa</span>
            <ArrowRightCircle />
          </RouterLink>

          <RouterLink
            v-else-if="status === 'rented' && !isTicking"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-amber-600 hover:bg-amber-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{
              name: 'rent-detail',
              params: { id },
              query: { order: rentedSession?.order_id },
            }"
          >
            <span>Selesai Disewa</span>
            <ArrowRightCircle />
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
