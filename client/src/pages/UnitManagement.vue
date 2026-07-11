<script setup lang="ts">
import { onMounted, ref } from "vue";
import Axios from "axios";
import toast, { Toaster } from "vue3-hot-toast";

import BaseLayout from "../components/__Layout.vue";

document.title = "Sewa | Reno Rental";

const title = ref("PS2 Hen");
const description = ref("PS2 Deskripsi");
const rent_price = ref<number | null>(3000);

const isModalOpen = ref(false);

interface Unit {
  id: number;
  title: string;
  rent_price: number;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}
const unitData = ref<Unit[]>([]);

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  try {
    const response = await Axios.get("http://localhost:8080/unit");

    unitData.value = response.data.unit;
  } catch (err) {
    toast.error("Data gagal dimuat. Harap coba lagi");
  }
};

const saveData = async () => {
  try {
    const response = await Axios.post("http://localhost:8080/unit", {
      title: title.value,
      description: description.value,
      rent_price: rent_price.value,
    });

    if (response.data.message == "unit-created") {
      toast.success("Data berhasil disimpan");
      isModalOpen.value = false;
      fetchData();
    }
  } catch (err) {
    toast.error("Kesalahan. Harap coba lagi");
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const currencyFormat = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusStyles: Record<string, string> = {
  tersedia: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  aktif: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  dipakai: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
  nonaktif: "bg-slate-100 text-slate-600 ring-slate-200",
};

const getStatusClass = (status: string) =>
  statusStyles[status.toLowerCase()] ??
  "bg-slate-100 text-slate-600 ring-slate-200";
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold tracking-tight">
            Master Unit
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Tambah, edit atau hapus unit yang sudah ada
          </p>
        </div>
        <button
          class="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
          @click="openModal"
        >
          Tambah
        </button>
      </div>
    </div>
    <Toaster />

    <section
      id="unit-table-data"
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 px-5 py-4"
      >
        <div>
          <h2 class="font-display text-[15px] font-semibold text-slate-900">
            Daftar Unit
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">
            Data unit PS, harga sewa per jam, status, dan riwayat pembaruan
          </p>
        </div>
        <div
          class="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500"
        >
          {{ unitData.length }} unit
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50/80">
            <tr class="text-xs uppercase tracking-wide text-slate-500">
              <th class="px-5 py-3 font-medium">Nama Unit</th>
              <th class="px-5 py-3 font-medium">Harga / Jam</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium">Deskripsi</th>
              <th class="px-5 py-3 font-medium">Created At</th>
              <th class="px-5 py-3 font-medium">Updated At</th>
              <th class="px-5 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="unit in unitData"
              :key="unit.id"
              class="transition-colors hover:bg-slate-50/70"
            >
              <td class="px-5 py-4">
                <p class="truncate font-semibold text-slate-900">
                  {{ unit.title }}
                </p>
              </td>

              <td
                class="whitespace-nowrap px-5 py-4 font-semibold text-slate-900"
              >
                {{ currencyFormat(unit.rent_price) }}
              </td>

              <td class="px-5 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1"
                  :class="getStatusClass(unit.status)"
                >
                  {{ unit.status }}
                </span>
              </td>

              <td class="px-5 py-4 text-slate-600">
                <p class="max-w-sm line-clamp-2">
                  {{ unit.description }}
                </p>
              </td>

              <td class="whitespace-nowrap px-5 py-4 text-slate-500">
                {{ formatDateTime(unit.created_at) }}
              </td>

              <td class="whitespace-nowrap px-5 py-4 text-slate-500">
                {{ formatDateTime(unit.updated_at) }}
              </td>

              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!unitData.length">
              <td colspan="7" class="px-5 py-14 text-center">
                <div class="mx-auto max-w-sm">
                  <div
                    class="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"
                  >
                    <svg
                      class="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 3v2m6-2v2M8 11h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
                      />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-slate-900">
                    Belum ada data unit
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    Tambahkan unit baru untuk mulai mengelola daftar PS.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

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
              class="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
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
              <label class="mb-1.5 block text-sm font-medium">Nama Unit</label>
              <input
                type="text"
                placeholder="Contoh: Serum Wajah 30ml"
                class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                v-model="title"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-sm font-medium"
                  >Harga Sewa</label
                >
                <input
                  type="number"
                  placeholder="Rp0"
                  class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  v-model="rent_price"
                />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium">Deskripsi</label>
              <textarea
                class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                v-model="description"
              ></textarea>
            </div>
          </div>

          <div
            class="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-4"
          >
            <button
              class="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer"
              type="button"
              @click="closeModal"
            >
              Batal
            </button>
            <button
              class="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
              type="button"
              @click="saveData"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
