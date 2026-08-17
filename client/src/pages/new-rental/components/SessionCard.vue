<script setup lang="ts">
import { formatRupiah } from "../../../helper";
import { MinusCircleIcon, PlusCircleIcon } from "@lucide/vue";

const customerName = defineModel<string>("customer-name");
const props = defineProps<{
  todaysFormattedDate: string;
  currentTime: string;
  unitRentPrice: number;
  playDuration: number;
  estimatedEndTime: string;
  totalRentPrice: number;
}>();

const emit = defineEmits<{
  decreasePlayDuration: [value: number];
  increasePlayDuration: [value: number];
}>();
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
      <!-- Nama Penyewa jadi input, bukan teks statis -->
      <div>
        <label class="text-xs text-gray-500 mb-1.5 block">Nama Penyewa</label>
        <input
          v-model="customerName"
          type="text"
          placeholder="Masukkan nama penyewa"
          class="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
        />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Tanggal Main</span>
        <span class="text-sm font-medium text-gray-700">{{
          props.todaysFormattedDate
        }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Waktu Main</span>
        <span class="text-sm font-medium text-gray-700">{{
          props.currentTime
        }}</span>
      </div>

      <!-- Durasi Sewa, gantiin blok "Sisa Waktu" -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
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
            Durasi Sewa
          </span>
          <span class="text-[11px] font-medium text-gray-400"
            >{{ formatRupiah(unitRentPrice) }}/jam</span
          >
        </div>

        <div class="flex items-center justify-center gap-5 py-1">
          <button
            @click="emit('decreasePlayDuration', props.playDuration)"
            class="p-2 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <MinusCircleIcon :size="18" />
          </button>

          <div class="text-center w-16">
            <p class="font-mono text-3xl font-bold text-gray-900 tabular-nums">
              {{ props.playDuration }}
            </p>
            <p class="text-[11px] text-gray-400 -mt-1">Jam</p>
          </div>

          <button
            @click="emit('increasePlayDuration', props.playDuration)"
            class="p-2 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircleIcon :size="18" />
          </button>
        </div>

        <div
          class="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs"
        >
          <span class="text-gray-500">Estimasi Selesai</span>
          <span class="font-semibold text-gray-700">{{
            props.estimatedEndTime
          }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-gray-500">Total Biaya Sewa</span>
        <span class="text-sm font-bold text-gray-900">{{
          formatRupiah(props.totalRentPrice)
        }}</span>
      </div>
    </div>
  </div>
</template>
