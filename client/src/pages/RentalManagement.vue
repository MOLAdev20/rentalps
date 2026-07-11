<script setup lang="ts">
import BaseLayout from "../components/__Layout.vue";
import UnitCard from "../components/UnitCard.vue";

import { onBeforeUnmount, ref } from "vue";

document.title = "Sewa | Reno Rental";

const isModalOpen = ref(false);
const isToastVisible = ref(false);
let toastTimer: number | undefined;

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const showToast = () => {
  window.clearTimeout(toastTimer);
  isToastVisible.value = true;

  toastTimer = window.setTimeout(() => {
    isToastVisible.value = false;
  }, 2200);
};

const saveItem = () => {
  closeModal();
  showToast();
};

const units = [
  {
    name: "PS 5 - Unit A",
    pricePerHour: "Rp25.000 / jam",
    status: "Aktif",
  },
  {
    name: "PS 4 - Unit B",
    pricePerHour: "Rp18.000 / jam",
    status: "Menunggu",
  },
  {
    name: "PS 5 - Unit C",
    pricePerHour: "Rp25.000 / jam",
    status: "Terlambat",
  },
  {
    name: "PS 3 - Unit D",
    pricePerHour: "Rp12.000 / jam",
    status: "Selesai",
  },
] as const;

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer);
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
        <button
          type="button"
          class="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97]"
          @click="openModal"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Data
        </button>
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
            v-for="unit in units"
            :key="unit.name"
            :name="unit.name"
            :price-per-hour="unit.pricePerHour"
            :status="unit.status"
          />
        </div>
      </div>

      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h3 class="font-display text-[15px] font-semibold">
                Performa Mingguan
              </h3>
              <p class="mt-0.5 text-xs text-gray-500">
                Pendapatan 7 hari terakhir
              </p>
            </div>
            <select
              class="rounded-lg border border-gray-200 bg-transparent px-2.5 py-1.5 text-xs outline-none"
            >
              <option>7 Hari</option>
              <option>30 Hari</option>
            </select>
          </div>

          <div class="flex h-44 items-end gap-3 px-1 lg:gap-5">
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 45%"
              ></div>
              <span class="text-[11px] text-gray-400">Sen</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 65%"
              ></div>
              <span class="text-[11px] text-gray-400">Sel</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 38%"
              ></div>
              <span class="text-[11px] text-gray-400">Rab</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-600 transition-all duration-500 group-hover:bg-indigo-700"
                style="height: 88%"
              ></div>
              <span class="text-[11px] font-semibold text-indigo-600">Kam</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 52%"
              ></div>
              <span class="text-[11px] text-gray-400">Jum</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 70%"
              ></div>
              <span class="text-[11px] text-gray-400">Sab</span>
            </div>
            <div class="group flex flex-1 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-md bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"
                style="height: 30%"
              ></div>
              <span class="text-[11px] text-gray-400">Min</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 class="mb-4 font-display text-[15px] font-semibold">
            Aktivitas Terbaru
          </h3>
          <div class="space-y-4">
            <div class="flex gap-3">
              <span
                class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <div class="text-sm">
                <p><b class="font-medium">Pesanan #2847</b> selesai diproses</p>
                <p class="mt-0.5 text-xs text-gray-500">5 menit lalu</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span
                class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50"
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </span>
              <div class="text-sm">
                <p>
                  <b class="font-medium">Produk baru</b> ditambahkan ke katalog
                </p>
                <p class="mt-0.5 text-xs text-gray-500">42 menit lalu</p>
              </div>
            </div>
            <div class="flex gap-3">
              <span
                class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-50"
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
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </span>
              <div class="text-sm">
                <p><b class="font-medium">Stok menipis</b> untuk 3 produk</p>
                <p class="mt-0.5 text-xs text-gray-500">2 jam lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
        >
          <h3 class="font-display text-[15px] font-semibold">
            Transaksi Terbaru
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="text-left text-xs uppercase tracking-wide text-gray-400"
              >
                <th class="px-5 py-3 font-medium">Pelanggan</th>
                <th class="px-5 py-3 font-medium">Produk</th>
                <th class="px-5 py-3 font-medium">Jumlah</th>
                <th class="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="transition-colors hover:bg-gray-50">
                <td class="px-5 py-3 font-medium">Rina Amelia</td>
                <td class="px-5 py-3 text-gray-500">Serum Wajah 30ml</td>
                <td class="px-5 py-3">Rp185.000</td>
                <td class="px-5 py-3">
                  <span
                    class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600"
                    >Lunas</span
                  >
                </td>
              </tr>
              <tr class="transition-colors hover:bg-gray-50">
                <td class="px-5 py-3 font-medium">Budi Santoso</td>
                <td class="px-5 py-3 text-gray-500">Sepatu Lari X2</td>
                <td class="px-5 py-3">Rp420.000</td>
                <td class="px-5 py-3">
                  <span
                    class="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600"
                    >Diproses</span
                  >
                </td>
              </tr>
              <tr class="transition-colors hover:bg-gray-50">
                <td class="px-5 py-3 font-medium">Citra Dewi</td>
                <td class="px-5 py-3 text-gray-500">Tas Ransel Kanvas</td>
                <td class="px-5 py-3">Rp310.000</td>
                <td class="px-5 py-3">
                  <span
                    class="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
                    >Dibatalkan</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="closeModal" />
      <div class="relative flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
          <div
            class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
          >
            <h3 class="font-display text-[15px] font-semibold">
              Tambah Data Baru
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
              <label class="mb-1.5 block text-sm font-medium">Nama Item</label>
              <input
                type="text"
                placeholder="Contoh: Serum Wajah 30ml"
                class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-sm font-medium">Harga</label>
                <input
                  type="text"
                  placeholder="Rp0"
                  class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium">Stok</label>
                <input
                  type="number"
                  placeholder="0"
                  class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium">Kategori</label>
              <select
                class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option>Kecantikan</option>
                <option>Fashion</option>
                <option>Elektronik</option>
              </select>
            </div>
          </div>

          <div
            class="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-4"
          >
            <button
              class="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium transition-colors hover:bg-gray-50"
              type="button"
              @click="closeModal"
            >
              Batal
            </button>
            <button
              class="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97]"
              type="button"
              @click="saveItem"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg bg-gray-900 py-3 pl-4 pr-5 text-sm font-medium text-white shadow-lg transition-all duration-300"
      :class="
        isToastVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-24 opacity-0 pointer-events-none'
      "
    >
      <svg
        class="h-4 w-4 shrink-0 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>Data baru berhasil ditambahkan</span>
    </div>
  </BaseLayout>
</template>
