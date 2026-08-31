<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import BaseLayout from "../../components/__Layout.vue";
import FnbItemSidebar from "../../components/FnbItemSidebar.vue";
import { PlayCircle, PlusCircleIcon, Trash } from "@lucide/vue";
import AlertDialog from "../../components/AlertDialog.vue";
import { formatRupiah } from "../../helper/currency.ts";
import SessionCard from "./components/SessionCard.vue";
import { useFnb } from "./composables/useFnb.ts";
import { usePlaySession } from "./composables/usePlaySession.ts";

const props = defineProps<{
  unitId: String;
}>();

const {
  fnbTotal,
  selectedFnBItems,
  sidebarStatus,
  decrementQty,
  incrementQty,
  pickFnbItem,
  removeFnbItem,
} = useFnb();

const {
  increasePlayDuration,
  decreasePlayDuration,
  currentTime,
  estimatedEndTime,
  playDuration,
  todaysFormattedDate,
  unitTitle,
  unitRentPrice,
  loadSession,
  resetInterval,
  grandTotal,
  startPlay,
  customerName,
  totalRentPrice,
} = usePlaySession(Number(props.unitId) as number);

onMounted(async () => {
  loadSession();
});

onUnmounted(() => {
  resetInterval();
});
</script>
<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <h1 class="font-display text-2xl font-bold tracking-tight text-gray-900">
        Rencana Sewa {{ unitTitle }}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Proses sewa PS dan pesanan makanan/minuman
      </p>
      <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Session Card -->
        <SessionCard
          v-model:customer-name="customerName"
          :todays-formatted-date="todaysFormattedDate"
          :current-time="currentTime"
          :unit-rent-price="unitRentPrice"
          :play-duration="playDuration"
          @decrease-play-duration="decreasePlayDuration"
          @increase-play-duration="increasePlayDuration"
          :estimated-end-time="estimatedEndTime"
          :total-rent-price="totalRentPrice"
        />

        <div
          class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
        >
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-center gap-2"
          >
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
                d="M3 3h18M3 9h18M3 15h18M3 21h18"
              />
            </svg>
            <h3 class="font-display font-semibold text-[15px] text-gray-900">
              Makanan & Minuman
            </h3>
          </div>

          <div class="p-5 flex-1 flex flex-col">
            <p class="text-xs text-gray-500 mb-2.5">Item FnB</p>

            <!-- List item FnB -->
            <div class="space-y-2 mb-3">
              <div
                v-if="selectedFnBItems.length === 0"
                class="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl"
              >
                Belum ada item FnB dipilih
              </div>

              <TransitionGroup name="fnb-row">
                <div
                  v-for="item in selectedFnBItems"
                  :key="item.id"
                  class="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5"
                >
                  <div
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-lg shrink-0"
                  >
                    ✅
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ item.name }}
                    </p>
                    <p class="text-xs text-gray-400">{{ item.price }} / item</p>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      @click="decrementQty(item)"
                      class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path stroke-linecap="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <span
                      class="w-5 text-center text-sm font-semibold text-gray-800 tabular-nums"
                      >{{ item.qty }}</span
                    >
                    <button
                      @click="incrementQty(item)"
                      class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>

                  <span
                    class="w-20 text-right text-sm font-semibold text-gray-900 shrink-0"
                  >
                    {{ formatRupiah(item.price * item.qty) }}
                  </span>

                  <button
                    @click="removeFnbItem(item)"
                    class="p-2 rounded-full bg-red-400 text-white hover:bg-red-600 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash :size="12" />
                  </button>
                </div>
              </TransitionGroup>
            </div>

            <button
              @click="sidebarStatus = true"
              class="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 active:scale-105 transition-all cursor-pointer"
            >
              <PlusCircleIcon :size="18" />
              Tambah Item FnB
            </button>

            <!-- Totals -->
            <div class="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Total Sewa PS</span>
                <span class="font-medium text-gray-700">{{
                  formatRupiah(totalRentPrice)
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Total FnB</span>
                <span class="font-medium text-gray-700">{{
                  formatRupiah(fnbTotal)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between pt-2 border-t border-gray-100"
              >
                <span class="text-sm font-semibold text-gray-900">TOTAL</span>
                <span class="text-lg font-bold text-indigo-600">{{
                  formatRupiah(grandTotal)
                }}</span>
              </div>
            </div>

            <button
              @click="startPlay"
              class="mt-4 w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlayCircle />
              Mulai Sewa
            </button>
          </div>
        </div>
      </div>
    </div>

    <FnbItemSidebar
      v-if="unitTitle"
      v-model:sidebar-status="sidebarStatus"
      @pick-fnb-item="pickFnbItem"
    />
  </BaseLayout>

  <AlertDialog />
</template>
