<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const props = defineProps<{
  customerName: string;
  playDuration: number;
  rawStartTime: dayjs.Dayjs;
  rawEndTime: dayjs.Dayjs;
}>();

const playDate = ref<string>();
const playTime = ref<string>();
const remainingTime = ref<string>();
const remainingTimePercentage = ref<number>(0);

let intervalId: ReturnType<typeof setInterval> | undefined;

const stopTicking = () => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};

const formatRemainingTime = (endTime: dayjs.Dayjs): string => {
  // Clamp ke 0 kalau waktu udah lewat, biar gak muncul angka negatif
  const diffMs = Math.max(endTime.diff(dayjs()), 0);
  const dur = dayjs.duration(diffMs);

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

const formatTime = (date: dayjs.Dayjs | string, format: string) =>
  dayjs(date).local().locale("id").format(format);

watch(
  [() => props.rawStartTime, () => props.rawEndTime],
  () => {
    // Hentikan interval lama dulu sebelum bikin yang baru,
    // biar gak numpuk tiap kali prop waktu berubah
    stopTicking();

    const rawStartTimeToLocal = dayjs(props.rawStartTime).local();
    const rawEndTimeToLocal = dayjs(props.rawEndTime).local();

    playTime.value =
      formatTime(rawStartTimeToLocal, "HH:mm") +
      " - " +
      formatTime(rawEndTimeToLocal, "HH:mm");
    playDate.value = formatTime(rawStartTimeToLocal, "DD MMMM YYYY");

    const tick = () => {
      remainingTime.value = formatRemainingTime(rawEndTimeToLocal);
      remainingTimePercentage.value = formatRemainingTimeToPercentage(
        rawStartTimeToLocal,
        rawEndTimeToLocal,
      );
    };

    tick(); // langsung isi nilai awal, gak nunggu 1 detik pertama
    intervalId = setInterval(tick, 1000);
  },
  { immediate: true },
);

onUnmounted(stopTicking);
</script>
<template>
  <div
    class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
  >
    <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
      <svg
        class="w-4 h-4 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <h3 class="font-display font-semibold text-[15px] text-gray-900">
        Informasi Sesi
      </h3>
    </div>

    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Penyewa</span>
        <span class="text-sm font-semibold text-gray-900">{{
          customerName || "-"
        }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Tanggal Main</span>
        <span class="text-sm font-medium text-gray-700">{{
          playDate || "-"
        }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Waktu Main</span>
        <span class="text-sm font-medium text-gray-700">{{
          playTime || "-"
        }}</span>
      </div>

      <!-- Sisa waktu + progress bar -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-500 flex items-center gap-1.5">
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 7v5l3 3"
              />
            </svg>
            Sisa Waktu
          </span>
          <span class="text-[11px] font-medium text-gray-400"
            >{{ playDuration }} Jam Total</span
          >
        </div>
        <p
          class="font-mono text-2xl font-bold tracking-wider text-gray-900 tabular-nums"
        >
          {{ remainingTime }}
        </p>
        <div
          class="mt-2.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-1000 ease-linear"
            :class="
              remainingTimePercentage > 50 ? 'bg-indigo-500' : 'bg-yellow-500'
            "
            :style="{ width: remainingTimePercentage + '%' }"
          ></div>
        </div>
        <div class="text-xs font-semibold text-gray-500 mt-2">
          <span>{{ remainingTimePercentage }}%</span>
        </div>
      </div>
    </div>

    <div class="px-5 pb-5 pt-1 flex items-center gap-3">
      <button
        class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.97] transition-all"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tambah 1 Jam
      </button>
    </div>
  </div>
</template>
