<script setup lang="ts">
import BaseLayout from "../components/__Layout.vue";
import UnitCard from "../components/UnitCard.vue";

import { onMounted, ref } from "vue";
import { useAxios } from "../composables/useAxios.ts";

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
const axios = useAxios();

onMounted(() => {
  document.title = "Sewa |  Rental";
  axios.get(
    "unit",
    (response: any) => {
      response.data.unit.forEach((el: any) => {
        unitData.value.push({
          id: el.id,
          title: el.title,
          rent_price: formatRupiah(el.rent_price),
          status: el.status,
        });
      });
    },
    (err: any) => {
      console.log(err);
    },
  );
});
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
          />
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
