<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "../helper/axios";
import { CircleX, Search, Clock, Calendar } from "@lucide/vue";
import formatRupiah from "../helper/currency";
import { useRouter } from "vue-router";

type RentalHistory = {
  id: string;
  customerName: string;
  playTime: string;
  createdAt: string;
  paymentStatus: string;
  totalPrice: number;
};

const sidebarStatus = defineModel("sidebar-status", {
  type: Boolean,
  default: false,
});

const props = defineProps<{
  sidebarStatus: boolean;
  unitId: number;
}>();

const rentalHistoryList = ref<RentalHistory[]>([]);

onMounted(() => {
  axios.get(
    `transaction/unit-history/${props.unitId}`,
    (data: any) => {
      data.data.map((item: any) => {
        rentalHistoryList.value.push({
          id: item.id,
          customerName: item.customer_name,
          playTime: item.rentedUnitOrder[0].play_time,
          paymentStatus: item.status,
          totalPrice: item.total,
          createdAt: item.created_at,
        });
      });
    },
    (error: any) => {
      console.error("Error fetching rental history:", error);
    },
  );
});

// Search Logic (Pencarian Berdasarkan Nama atau Tanggal/Status)
const searchQuery = ref("");

const filteredRentalHistory = computed(() => {
  if (!searchQuery.value.trim()) return rentalHistoryList.value;

  const query = searchQuery.value.toLowerCase();
  return rentalHistoryList.value.filter((item) => {
    return (
      item.customerName.toLowerCase().includes(query) ||
      item.paymentStatus.toLowerCase().includes(query) ||
      item.createdAt.includes(query)
    );
  });
});

onMounted(async () => {});

const closeSidebar = () => {
  sidebarStatus.value = false;
};

const router = useRouter();
const goToDetail = (orderId: any) => {
  router.replace({
    name: "rent-detail",
    params: { id: props.unitId },
    query: { order: orderId },
  });
};
</script>
<template>
  <Teleport to="body">
    <!-- Overlay Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarStatus"
        @click="closeSidebar"
        class="fixed inset-0 bg-black/40 z-40"
      ></div>
    </Transition>

    <!-- Sidebar Content -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="sidebarStatus"
        class="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div
          class="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-2">
            <h3 class="font-display font-semibold text-[15px] text-gray-900">
              Riwayat Sewa
            </h3>
          </div>
          <button
            @click="closeSidebar"
            class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer"
          >
            <CircleX :size="20" />
          </button>
        </div>

        <!-- Search Input -->
        <div class="px-5 py-3 border-b border-gray-100 shrink-0">
          <div class="relative">
            <Search
              :size="20"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama penyewa / tanggal..."
              class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <!-- List Riwayat -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          <div
            v-for="item in filteredRentalHistory"
            :key="item.id"
            @click="goToDetail(item.id)"
            class="w-full p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 transition-all text-left cursor-pointer shadow-xs space-y-2.5"
          >
            <!-- Header List: Nama & Status -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-gray-900 truncate">
                {{ item.customerName }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 text-[11px] font-medium rounded-full shrink-0',
                  item.paymentStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                    : item.paymentStatus === 'pending'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                      : 'bg-rose-50 text-rose-600 border border-rose-200/60',
                ]"
              >
                {{ item.paymentStatus }}
              </span>
            </div>

            <!-- Detail Info: Waktu Main & Tanggal Order -->
            <div class="space-y-1 text-xs text-gray-500">
              <div class="flex items-center gap-1.5">
                <Clock :size="14" class="text-gray-400 shrink-0" />
                <span>Waktu Main: {{ item.playTime }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Calendar :size="14" class="text-gray-400 shrink-0" />
                <span>Order: {{ item.createdAt }}</span>
              </div>
            </div>

            <!-- Footer List: Total Pembayaran -->
            <div
              class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs"
            >
              <span class="text-gray-400 font-medium">Total Bayar</span>
              <span class="font-semibold text-indigo-600 text-sm">
                {{ formatRupiah(item.totalPrice) }}
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredRentalHistory.length === 0"
            class="text-center py-12 text-sm text-gray-400 space-y-1"
          >
            <p class="font-medium text-gray-500">Riwayat tidak ditemukan</p>
            <p class="text-xs text-gray-400">
              Pencarian "{{ searchQuery }}" tidak cocok dengan data manapun
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
