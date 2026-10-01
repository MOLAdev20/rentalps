<script setup lang="ts">
import { onMounted } from "vue";
import BaseLayout from "../../components/__Layout.vue";
import { ArrowLeftCircle, History, PlayCircle } from "@lucide/vue";
import AlertDialog from "../../components/AlertDialog.vue";
import formatRupiah from "../../helper/currency.ts";
import SessionCard from "./components/SessionCard.vue";
import FnbCard from "./components/FnbCard.vue";
import { useCreateOrder } from "./composables/useCreateOrder.ts";
import RentedHistorySidebar from "../../components/RentedHistorySidebar.vue";

onMounted(async () => {
  document.title = `Sewa Baru | Rent.Play!`;
});

const props = defineProps<{
  unitId: number;
}>();

const {
  unitTitle,
  fnbTotal,
  grandTotal,
  startPlay,
  totalRentPrice,
  rentedHistorySidebarStatus,
  openRentHistorySidebar,
} = useCreateOrder(props.unitId);
</script>
<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
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
                Rencana Sewa {{ unitTitle }}
              </h1>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Proses sewa PS dan pesanan makanan/minuman
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

      <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Session Card -->
        <SessionCard :unit-id="Number(props.unitId)" />

        <div>
          <FnbCard />

          <div
            class="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            <div class="px-5 py-4 border-b border-gray-100">
              <!-- Totals -->
              <div class="border-gray-100 space-y-2">
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
    </div>

    <!-- Sidebar Riwayat Sewa -->
    <RentedHistorySidebar
      v-model:sidebar-status="rentedHistorySidebarStatus"
      :unitId="Number(props.unitId)"
    />
  </BaseLayout>

  <AlertDialog />
</template>
