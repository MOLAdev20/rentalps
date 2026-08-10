<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type ComputedRef } from "vue";
import BaseLayout from "../components/__Layout.vue";
import FnbItemSidebar from "./rental-detail/components/FnbItemSidebar.vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  MinusCircleIcon,
  PlayCircle,
  PlusCircleIcon,
  Trash,
} from "@lucide/vue";
import Axios from "axios";
import { useRouter } from "vue-router";
import AlertDialog from "../components/AlertDialog.vue";
import { useAlertDialog } from "../composables/useAlertDialog.ts";

const props = defineProps<{
  unitId: String;
}>();

interface FnBItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const router = useRouter();
const sidebarStatus = ref(false);
const unitTitle = ref<string>();
const unitRentPrice = ref<number>(0);
const selectedFnBItems = ref<FnBItem[]>([]);
const customerName = ref<string>();
const todaysFormattedDate = ref<string>(
  dayjs().locale("id").format("DD MMMM YYYY"),
);
const currentTime = ref<string>(dayjs().format("HH:mm:ss"));
const playDuration = ref<number>(1);

const { alert, confirm } = useAlertDialog();

let tick = 0;
onMounted(async () => {
  try {
    const data = await Axios.get(`http://localhost:8080/unit/${props.unitId}`);

    document.title = "Sewa Baru | Reno Rental";

    unitTitle.value = data.data.title;
    unitRentPrice.value = data.data.rent_price;

    tick = setInterval(() => {
      currentTime.value = dayjs().format("HH:mm:ss");
      todaysFormattedDate.value = dayjs().locale("id").format("DD MMMM YYYY");
    }, 1000);
  } catch (err) {
    router.replace({ name: "NotFound" });
  }
});

onUnmounted(() => {
  clearInterval(tick);
});

const totalRentPrice: ComputedRef<number> = computed(() => {
  return playDuration.value * unitRentPrice.value;
});

const estimatedEndTime = computed(() => {
  if (!playDuration.value) return "-";

  // Ambil jam hari ini dengan waktu dari startTime
  const baseTime = dayjs(`2026-08-09 ${currentTime.value}`);

  // Tambahkan durasi berdasarkan state playDuration
  return baseTime.add(playDuration.value, "hour").format("HH:mm:ss");
});

const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

const decreasePlayDuration = () => {
  if (playDuration.value > 0) {
    playDuration.value--;
  }
};

const increasePlayDuration = () => {
  playDuration.value++;
};

function incrementQty(item: FnBItem) {
  item.qty += 1;
}

function decrementQty(item: FnBItem) {
  if (item.qty <= 1) {
    removeFnbItem(item);
    return;
  }
  item.qty -= 1;
}

function removeFnbItem(item: FnBItem) {
  selectedFnBItems.value = selectedFnBItems.value.filter((i) => i !== item);
}

const pickFnbItem = (catalogItem: FnBItem) => {
  const existing = selectedFnBItems.value.find((i) => i.id === catalogItem.id);
  if (existing) {
    existing.qty += 1;
  } else {
    selectedFnBItems.value.push({ ...catalogItem, qty: 1 });
  }

  setTimeout(() => (sidebarStatus.value = false), 250);
};

const fnbTotal: ComputedRef<number> = computed(() =>
  selectedFnBItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
);

const grandTotal = computed(() => totalRentPrice.value + fnbTotal.value);

const proceedPayment = async () => {
  const askProceed: Boolean = await confirm({
    title: "Mulai Main?",
    message: "Unit dimainkan sampai waktu yang ditentukan",
    variant: "warning",
    confirmText: "Oke, Lanjut",
    cancelText: "Batal",
  });

  if (askProceed) {
    try {
      dayjs.extend(utc);

      let transactionFnb = selectedFnBItems.value.map((item) => ({
        fnb_item: item.id,
        quantity: item.qty,
      }));

      const endTime = dayjs().add(playDuration.value, "hour").utc().format();

      const payload = {
        customer_name: customerName.value,
        transaction_rental: [
          {
            unit_item: Number(props.unitId),
            play_time: playDuration.value,
            start_time: dayjs().utc().format(),
            end_time: endTime,
          },
        ],
        transaction_fnb: transactionFnb,
      };

      console.log(payload);

      const response = await Axios.post(
        "http://localhost:8080/transaction",
        payload,
      );
      if (response.status === 200)
        router.replace({
          name: "rent-detail",
          params: { id: String(props.unitId) },
        });
    } catch (err) {
      return await alert({
        title: "Terjadi Kesalahan",
        message: "Harap coba lagi",
        variant: "danger",
      });
    }
  }
};
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
        <div
          class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
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
              <label class="text-xs text-gray-500 mb-1.5 block"
                >Nama Penyewa</label
              >
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
                todaysFormattedDate
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Waktu Main</span>
              <span class="text-sm font-medium text-gray-700">{{
                currentTime
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
                  @click="decreasePlayDuration"
                  class="p-2 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                >
                  <MinusCircleIcon :size="18" />
                </button>

                <div class="text-center w-16">
                  <p
                    class="font-mono text-3xl font-bold text-gray-900 tabular-nums"
                  >
                    {{ playDuration }}
                  </p>
                  <p class="text-[11px] text-gray-400 -mt-1">Jam</p>
                </div>

                <button
                  @click="increasePlayDuration"
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
                  estimatedEndTime
                }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs text-gray-500">Total Biaya Sewa</span>
              <span class="text-sm font-bold text-gray-900">{{
                totalRentPrice
              }}</span>
            </div>
          </div>
        </div>

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
              FnB &amp; Tagihan
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
                  totalRentPrice
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Total FnB</span>
                <span class="font-medium text-gray-700">{{ fnbTotal }}</span>
              </div>
              <div
                class="flex items-center justify-between pt-2 border-t border-gray-100"
              >
                <span class="text-sm font-semibold text-gray-900">TOTAL</span>
                <span class="text-lg font-bold text-indigo-600">{{
                  grandTotal
                }}</span>
              </div>
            </div>

            <button
              @click="proceedPayment"
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
      v-model:sidebar-status="sidebarStatus"
      @pick-fnb-item="pickFnbItem"
    />
  </BaseLayout>

  <AlertDialog />
</template>
