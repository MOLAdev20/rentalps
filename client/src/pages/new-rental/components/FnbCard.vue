<script setup lang="ts">
import { onUnmounted } from "vue";
import formatRupiah from "../../../helper/currency";
import { PlusCircleIcon, Trash, Utensils } from "@lucide/vue";
import { useFnb } from "../composables/useFnbDraft";
import FnbItemSidebar from "../../../components/FnbItemSidebar.vue";

const {
  selectedFnBItems,
  decrementQty,
  incrementQty,
  removeFnbItem,
  sidebarStatus,
  pickFnbItem,
} = useFnb();

onUnmounted(() => {
  sidebarStatus.value = false;
  selectedFnBItems.value = [];
});
</script>
<template>
  <div
    class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
  >
    <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
      <Utensils :size="18" class="text-indigo-500" />
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
                class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
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
                class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
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
        @click="() => (sidebarStatus = true)"
        class="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 active:scale-105 transition-all cursor-pointer"
      >
        <PlusCircleIcon :size="18" />
        Tambah Item FnB
      </button>
    </div>
  </div>
  <FnbItemSidebar
    v-model:sidebar-status="sidebarStatus"
    @pick-fnb-item="pickFnbItem"
  />
</template>
