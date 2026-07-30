<script setup lang="ts">
import BaseLayout from "../components/__Layout.vue";
import UnitCard from "../components/UnitCard.vue";
import Axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { onMounted, ref, computed } from "vue";

interface FnBItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface PayloadFnB {
  fnb_item: number;
  quantity: number;
}

const fnbData = ref<FnBItem[]>([]);

const fnbTotal = computed(() =>
  fnbData.value.reduce((sum, item) => sum + item.price * item.qty, 0),
);

document.title = "Sewa | Reno Rental";

const isModalOpen = ref<Boolean>(false);

const openModal = (targetId: number) => {
  isModalOpen.value = true;
  selectedPSUnit.value = targetId;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(angka);
};

interface Unit {
  id: number;
  title: string;
  rent_price: string;
  status: string;
}

const unitData = ref<Unit[]>([]);

onMounted(async () => {
  const response = await Axios.get("http://localhost:8080/unit");

  if (response.data.length == 0) {
    console.log("Data Unit tidak ada");
  }

  response.data.unit.forEach((el: any) => {
    unitData.value.push({
      id: el.id,
      title: el.title,
      rent_price: formatRupiah(el.rent_price),
      status: el.status,
    });
  });

  await getFnbData();
});

async function getFnbData() {
  const response = await Axios.get("http://localhost:8080/fnb");

  if (response.data.length == 0) {
    console.log("Data Unit tidak ada");
  }

  response.data.fnb.forEach((el: any) => {
    fnbData.value.push({
      id: el.id,
      name: el.title,
      price: el.price,
      qty: 0,
    });
  });
}

const customerName = ref<String>("");
const selectedPSUnit = ref<Number>();
const playTime = ref<number>(0);

const increaseQty = (id: number) => {
  const item = fnbData.value.find((f) => f.id === id);
  if (item) item.qty++;
};

const decreaseQty = (id: number) => {
  const item = fnbData.value.find((f) => f.id === id);
  if (item && item.qty > 0) item.qty--;
};

function proceedTransaction() {
  // 1. Ambil waktu sekarang dulu
  const dateNow = new Date().toISOString();

  dayjs.extend(utc);

  const dateAfterAddition: string = dayjs()
    .add(playTime.value, "hour")
    .utc()
    .format();

  const selectedFnB: PayloadFnB[] = fnbData.value
    .filter((item) => item.qty >= 1)
    .map((item) => ({
      fnb_item: item.id,
      quantity: item.qty,
    }));

  const payload = {
    customer_name: customerName.value,
    transaction_rental: [
      {
        unit_item: selectedPSUnit.value,
        play_time: playTime.value,
        start_time: dateNow,
        end_time: dateAfterAddition,
      },
    ],
    transaction_fnb: selectedFnB,
  };

  const response = Axios.post("http://localhost:8080/transaction", payload);

  console.log(response);
}
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold tracking-tight">
            Manajemen Sewa
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Buat sewa baru atau pantau unit yang sedang disewa
          </p>
        </div>
      </div>

      <!-- Score Card -->
      <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md lg:p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500"
              >Total Pendapatan</span
            >
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50"
            >
              <svg
                class="h-4 w-4 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2"
                />
              </svg>
            </span>
          </div>
          <p class="font-display text-2xl font-bold">Rp48.920.000</p>
          <p class="mt-1.5 text-xs font-medium text-emerald-600">
            ↑ 12.4% dari bulan lalu
          </p>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md lg:p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Pesanan Baru</span>
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50"
            >
              <svg
                class="h-4 w-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </span>
          </div>
          <p class="font-display text-2xl font-bold">1.284</p>
          <p class="mt-1.5 text-xs font-medium text-emerald-600">
            ↑ 8.1% dari bulan lalu
          </p>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md lg:p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500"
              >Pelanggan Aktif</span
            >
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-amber-50"
            >
              <svg
                class="h-4 w-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 3a4 4 0 10-8 0"
                />
              </svg>
            </span>
          </div>
          <p class="font-display text-2xl font-bold">342</p>
          <p class="mt-1.5 text-xs font-medium text-red-500">
            ↓ 2.3% dari bulan lalu
          </p>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md lg:p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500"
              >Tingkat Konversi</span
            >
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-gray-100"
            >
              <svg
                class="h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </span>
          </div>
          <p class="font-display text-2xl font-bold">4.8%</p>
          <p class="mt-1.5 text-xs font-medium text-emerald-600">
            ↑ 0.6% dari bulan lalu
          </p>
        </div>
      </div>

      <div class="rounded-2xl mb-6">
        <div class="mb-6">
          <h3 class="font-display text-[15px] font-semibold">Unit Disewakan</h3>
          <p class="mt-0.5 text-xs text-gray-500">
            Pantau unit yang sedang disewakan
          </p>
        </div>

        <div
          id="unit-container"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <UnitCard
            v-for="unit in unitData"
            :key="unit.id"
            :id="unit.id"
            :name="unit.title"
            :price-per-hour="unit.rent_price"
            :status="unit.status"
            @open-modal="openModal(unit.id)"
            @open-edit-modal="openModal(unit.id)"
          />
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="closeModal" />
      <div class="relative flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
          <div
            class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
          >
            <h3 class="font-display text-[15px] font-semibold">
              Buat Sewa Baru
            </h3>
            <button
              class="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              type="button"
              @click="closeModal"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4 px-5 py-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium"
                >Nama Customer</label
              >
              <input
                type="text"
                v-model="customerName"
                placeholder="Contoh: Serum Wajah 30ml"
                class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium"
                >Durasi Main/Sewa</label
              >
              <div class="flex">
                <input
                  type="number"
                  v-model="playTime"
                  class="h-10 w-full rounded-l-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <div class="bg-gray-200 py-2 px-5 font-medium rounded-r-lg">
                  Jam
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 px-5 py-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900">
                Pesanan Lainnya (FnB)
              </h3>
              <span
                v-if="fnbTotal > 0"
                class="text-xs font-semibold text-indigo-600"
              >
                Subtotal: {{ formatRupiah(fnbTotal) }}
              </span>
            </div>

            <div id="fnb-id" class="max-h-52 space-y-2 overflow-y-auto pr-1">
              <div
                v-for="item in fnbData"
                :key="item.id"
                class="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatRupiah(item.price) }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="item.qty === 0"
                    @click="decreaseQty(item.id)"
                  >
                    <svg
                      class="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>

                  <span
                    class="w-5 text-center text-sm font-semibold text-gray-900"
                  >
                    {{ item.qty }}
                  </span>

                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 active:scale-95"
                    @click="increaseQty(item.id)"
                  >
                    <svg
                      class="h-3.5 w-3.5"
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
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-2.5 border-t border-gray-100 px-5 py-4"
          >
            <h1 class="text-2xl">Total Bayar: <span>Rp12.000.000,00</span></h1>
          </div>

          <div
            class="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-4"
          >
            <button
              class="py-2 px-4 rounded-lg border border-gray-200 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer"
              type="button"
              @click="closeModal"
            >
              Batal
            </button>
            <button
              class="py-2 px-4 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
              type="button"
              @click="proceedTransaction"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
