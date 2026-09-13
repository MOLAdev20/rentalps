<script setup lang="ts">
import BaseLayout from "../../components/__Layout.vue";
import FnbItemSidebar from "../../components/FnbItemSidebar.vue";
import SessionCard from "./components/SessionCard.vue";
import { useRoute } from "vue-router";
import AlertDialog from "../../components/AlertDialog.vue";
import {
  ArrowLeftCircle,
  CheckCircle,
  History,
  Minus,
  Plus,
  PlusCircle,
  RefreshCcw,
  SquareChevronRight,
  Trash,
  Wallet,
} from "@lucide/vue";
import formatRupiah from "../../helper/currency.ts";
import RentedHistorySidebar from "../../components/RentedHistorySidebar.vue";
import { useOrderPage } from "./composables/useOrderPage.ts";

const props = defineProps({
  id: String,
});

const route = useRoute();

const {
  customerName,
  rentedUnit,
  rawStartTime,
  rawEndTime,
  playDuration,
  fnbItems,
  fnbTotal,
  unitRentTotal,
  paymentStatus,
  paymentMethod,
  paymentSelectionMode,
  qrisUrl,
  showQrisModal,
  isLoadingQris,
  turnOffUnit,
  sidebarStatus,
  pickFnbItem,
  incrementQty,
  decrementQty,
  removeFnbItem,
  handlePayment,
  switchPaymentMode,
  openRentHistorySidebar,
  rentedHistorySidebarStatus,
  grandTotal,
} = useOrderPage(Number(props.id), Number(route.query.order));
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex gap-2 items-center">
              <RouterLink :to="{ name: 'rent' }">
                <ArrowLeftCircle class="text-indigo-600" :size="30" />
              </RouterLink>
              <h1
                class="font-display text-2xl font-bold tracking-tight text-gray-900"
              >
                Detail Sewa Unit — {{ rentedUnit || "..." }}
              </h1>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Kelola waktu main, item FnB, dan pembayaran sesi ini
            </p>
          </div>
          <div>
            <button
              @click="openRentHistorySidebar"
              class="flex gap-1 items-center cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <History />
              <span>Riwayat Sewa</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grid 2 kartu -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ============ CARD 1: Informasi Sesi ============ -->
        <SessionCard
          :customer-name="customerName"
          :raw-start-time="rawStartTime"
          :raw-end-time="rawEndTime"
          :play-duration="playDuration"
        />
        <!-- ============ CARD 2: FnB & Tagihan ============ -->
        <div class="relative">
          <!-- Card Utama FnB & Tagihan -->
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
                  v-if="fnbItems.length === 0"
                  class="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl"
                >
                  Belum ada item FnB dipesan
                </div>

                <TransitionGroup name="fnb-row">
                  <div
                    v-for="item in fnbItems"
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
                      <p class="text-xs text-gray-400">
                        {{ formatRupiah(item.price) }} / item
                      </p>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        @click="decrementQty(item)"
                        class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus :size="15" />
                      </button>
                      <span
                        class="w-5 text-center text-sm font-semibold text-gray-800 tabular-nums"
                        >{{ item.qty }}</span
                      >
                      <button
                        @click="incrementQty(item)"
                        class="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus :size="15" />
                      </button>
                    </div>

                    <span
                      class="w-20 text-right text-sm font-semibold text-gray-900 shrink-0"
                    >
                      {{ formatRupiah(item.price * item.qty) }}
                    </span>

                    <button
                      @click="removeFnbItem(item.id)"
                      class="text-white p-2 bg-red-300 rounded-full hover:bg-red-400 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash :size="13" />
                    </button>
                  </div>
                </TransitionGroup>
              </div>

              <button
                @click="sidebarStatus = true"
                class="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 active:bg-indigo-200 transition-all cursor-pointer"
              >
                <PlusCircle :size="18" />
                Tambah Item FnB
              </button>

              <!-- Totals -->
              <div class="mt-5 pt-4 border-t border-gray-100 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Sewa PS</span>
                  <span class="font-medium text-gray-700">{{
                    formatRupiah(unitRentTotal)
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

              <!-- Pilihan Metode Pembayaran (Di atas tombol Selesaikan & Bayar) -->
              <div v-if="paymentStatus === 'pending'">
                <div v-if="paymentSelectionMode">
                  <div class="mt-5 pt-4 border-t border-gray-100">
                    <p class="text-xs font-medium text-gray-500 mb-2.5">
                      Metode Pembayaran
                    </p>
                    <div class="grid grid-cols-2 gap-2.5">
                      <!-- Tunai -->
                      <label
                        class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                        :class="
                          paymentMethod === 'cash'
                            ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        "
                      >
                        <div class="flex items-center gap-2">
                          <input
                            type="radio"
                            v-model="paymentMethod"
                            value="cash"
                            class="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span class="text-sm font-medium text-gray-800"
                            >Tunai/Cash</span
                          >
                        </div>
                      </label>

                      <!-- QRIS -->
                      <label
                        class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                        :class="
                          paymentMethod === 'qris'
                            ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        "
                      >
                        <div class="flex items-center gap-2">
                          <input
                            type="radio"
                            v-model="paymentMethod"
                            value="qris"
                            class="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span class="text-sm font-medium text-gray-800"
                            >QRIS</span
                          >
                        </div>
                      </label>
                    </div>
                  </div>

                  <div class="mt-5 pt-1 border-t border-gray-100 flex gap-2">
                    <input v-model="turnOffUnit" type="checkbox" id="turn-of" />
                    <label for="turn-of">Matikan unitnya juga</label>
                  </div>

                  <!-- Tombol Selesaikan & Bayar -->
                  <button
                    @click="handlePayment"
                    :disabled="isLoadingQris"
                    class="mt-4 w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 active:scale-[0.98] transition-all cursor-pointer"
                    :class="
                      isLoadingQris ? 'opacity-70 cursor-not-allowed' : ''
                    "
                  >
                    <Wallet class="text-white" :size="16" />
                    {{
                      isLoadingQris
                        ? "Sedang Membuat QRIS..."
                        : "Selesaikan & Bayar"
                    }}
                  </button>
                </div>
                <div v-else>
                  <!-- Tombol Selesaikan & Bayar -->
                  <button
                    @click="showQrisModal = true"
                    :disabled="isLoadingQris"
                    class="mt-4 w-full flex items-center justify-center gap-1 h-11 rounded-xl bg-yellow-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 active:scale-[0.98] transition-all cursor-pointer"
                    :class="
                      isLoadingQris ? 'opacity-70 cursor-not-allowed' : ''
                    "
                  >
                    Lanjutkan Pembayaran
                    <SquareChevronRight class="text-white" :size="18" />
                  </button>
                  <button
                    @click="switchPaymentMode"
                    class="mt-3 text-sm text-indigo-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCcw :size="18" /><span
                      >Ganti Metode Pembayaran</span
                    >
                  </button>
                </div>
              </div>
              <div v-else>
                <div class="mt-5 pt-4 border-t border-gray-100">
                  <div
                    class="flex items-center gap-1 rounded-xl text-emerald-500 font-semibold text-xs"
                  >
                    <CheckCircle :size="15" />
                    <span>Seluruh tagihan sudah dibayar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Slide Animation QRIS (Di luar komponen utama / Full screen overlay) -->
          <Teleport to="body">
            <Transition name="slide-up">
              <div
                v-if="showQrisModal"
                class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex flex-col justify-end items-center p-4 sm:p-0"
              >
                <div
                  class="bg-white w-full max-w-lg p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center text-center mb-0 sm:mb-8"
                >
                  <div
                    class="w-12 h-1 bg-gray-200 rounded-full mb-4 sm:hidden"
                  ></div>

                  <div
                    class="w-full h-[65vh] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-4"
                  >
                    <iframe
                      :src="qrisUrl"
                      class="w-full h-full"
                      title="Midtrans Snap Payment"
                    ></iframe>
                  </div>

                  <button
                    @click="showQrisModal = false"
                    class="w-full h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>
    </div>

    <!-- ============ Sidebar Katalog FnB ============ -->
    <FnbItemSidebar
      v-if="rentedUnit"
      v-model:sidebar-status="sidebarStatus"
      @pick-fnb-item="pickFnbItem"
    />

    <!-- Sidebar Riwayat Sewa -->
    <RentedHistorySidebar
      v-if="rentedUnit"
      v-model:sidebar-status="rentedHistorySidebarStatus"
      :unitId="Number(props.id)"
    />
  </BaseLayout>
  <AlertDialog />
</template>

<style scoped>
.fnb-row-move,
.fnb-row-enter-active,
.fnb-row-leave-active {
  transition: all 0.25s ease;
}
.fnb-row-enter-from,
.fnb-row-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.fnb-row-leave-active {
  position: absolute;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
