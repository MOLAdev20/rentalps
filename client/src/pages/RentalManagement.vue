<script setup lang="ts">
import BaseLayout from "../components/__Layout.vue";
import UnitCard from "../components/UnitCard.vue";

import { onMounted, ref } from "vue";
import { useAxios } from "../composables/useAxios.ts";
import {
  CheckCircle,
  PauseCircle,
  PlayCircle,
  TvMinimalPlay,
} from "@lucide/vue";

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
  rentedSession: {
    order_id: number;
    start_time: string;
    end_time: string;
  };
}

const unitData = ref<Unit[]>([]);
const axios = useAxios();

onMounted(() => {
  document.title = "Sewa | Rent.Play!";
  axios.get(
    "unit",
    (response: any) => {
      response.data.unit.forEach((el: any) => {
        unitData.value.push({
          id: el.id,
          title: el.title,
          rent_price: formatRupiah(el.rent_price),
          status: el.status,
          rentedSession: el.rentedUnitOrder,
        });
      });

      console.log(unitData.value);
      console.log(response.data.unit);
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
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-medium text-gray-500">Jumlah Unit</span>
              <p class="font-display text-xl font-bold">3 Unit</p>
            </div>
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-gray-500 text-white"
            >
              <TvMinimalPlay />
            </span>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-medium text-gray-500"
                >Sedang Disewa</span
              >
              <p class="font-display text-xl font-bold">2 Unit</p>
            </div>
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white"
            >
              <PauseCircle />
            </span>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-medium text-gray-500"
                >Selesai Disewa</span
              >
              <p class="font-display text-xl font-bold">1 Unit</p>
            </div>
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-amber-600 text-white"
            >
              <PlayCircle />
            </span>
          </div>
        </div>

        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-medium text-gray-500">Tersedia</span>
              <p class="font-display text-xl font-bold">3 Unit</p>
            </div>
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"
            >
              <CheckCircle />
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl mb-6 lg:mt-15">
        <div class="mb-6">
          <h3 class="font-display text-[15px] font-semibold">Unit Disewakan</h3>
          <p class="mt-0.5 text-xs text-gray-500">
            Pantau unit yang sedang disewakan
          </p>
        </div>

        <div
          id="unit-container"
          class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <UnitCard
            v-for="unit in unitData"
            :key="unit.id"
            :id="unit.id"
            :name="unit.title"
            :price-per-hour="unit.rent_price"
            :status="unit.status"
            :rented-session="unit.rentedSession"
          />
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
