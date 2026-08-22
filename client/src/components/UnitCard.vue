<script setup lang="ts">
import { watch, ref } from "vue";
import { ArrowRightCircle, Pause, PauseCircle, PlayCircle } from "@lucide/vue";
import pslogo from "/ps-logo.webp";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(duration);

const props = defineProps<{
  id: number;
  name: string;
  pricePerHour: string;
  status: string;
  rentedSession: any;
}>();

const remainingDuration = ref<string>();
const remainingTimePercentage = ref<number>(0);

let intervalId: ReturnType<typeof setInterval> | undefined;

const formatRemainingDuration = (endTime: dayjs.Dayjs): string => {
  const diffMs = Math.max(endTime.diff(dayjs()), 0);
  const dur = dayjs.duration(diffMs);

  // Math.floor(dur.asHours()) penting biar kalau durasinya > 24 jam, angkanya tetep akumulasi ke jam (misal 36 jam, bukan ke-reset jadi 1 hari 12 jam)
  const hours = String(Math.floor(dur.asHours())).padStart(2, "0");
  const minutes = String(dur.minutes()).padStart(2, "0");
  const seconds = String(dur.seconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const formatRemainingTimeToPercentage = (
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
): number => {
  const totalDuration = endTime.diff(startTime);

  if (totalDuration <= 0) return 0;

  // 1. Hitung durasi sisa waktu dari SEKARANG (real-time, bukan snapshot lama) ke WAKTU AKHIR
  const remainingDuration = endTime.diff(dayjs());

  // 2. Hitung persentase sisa waktunya
  const percentage = (remainingDuration / totalDuration) * 100;

  // 3. Clamp nilainya biar tetep di range 0% - 100%
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return Number(clampedPercentage.toFixed(2));
};

const stopTicking = () => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};

watch(
  [() => props.rentedSession.start_time, () => props.rentedSession.end_time],
  () => {
    // Hentikan interval lama dulu sebelum bikin yang baru,
    // biar gak numpuk tiap kali prop waktu berubah
    stopTicking();

    const rawStartTimeToLocal = dayjs(props.rentedSession.start_time).local();
    const rawEndTimeToLocal = dayjs(props.rentedSession.end_time).local();

    const tick = () => {
      if (props.status == "rented") {
        remainingDuration.value = formatRemainingDuration(rawEndTimeToLocal);
        remainingTimePercentage.value = formatRemainingTimeToPercentage(
          rawStartTimeToLocal,
          rawEndTimeToLocal,
        );
      }
    };

    tick(); // langsung isi nilai awal, gak nunggu 1 detik pertama
    intervalId = setInterval(tick, 1000);
  },
  { immediate: true },
);
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
            v-if="status == 'rented'"
            class="shrink-0 rounded-full px-3 py-1 text-sm font-semibold bg-emerald-600 text-white"
          >
            {{ remainingDuration }}
          </span>
        </div>

        <div v-if="status === 'rented'" class="flex gap-1 mt-2">
          <PauseCircle class="text-emerald-600" />
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
            v-if="status === 'rented'"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl p-3 font-medium text-white bg-emerald-600 hover:bg-emerald-800 transition-all active:scale-[0.98] cursor-pointer"
            :to="{ name: 'rent-detail', params: { id } }"
          >
            <span>Sedang Disewa</span>
            <ArrowRightCircle />
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
