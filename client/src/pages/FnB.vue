<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import toast, { Toaster } from "vue3-hot-toast";

import BaseLayout from "../components/__Layout.vue";
import Modal from "../components/Modal.vue";
import axios from "../helper/axios.ts";
import formatRupiah from "../helper/currency.ts";
import { Plus, Utensils } from "@lucide/vue";

interface FnbItem {
  id: number;
  title: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

const fnbData = ref<FnbItem[]>([]);
const title = ref("");
const price = ref<number | undefined>();
const description = ref("");
const isModalOpen = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);

const isFormValid = computed(
  () =>
    title.value.trim().length > 0 &&
    description.value.trim().length > 0 &&
    price.value !== undefined &&
    Number.isFinite(price.value) &&
    price.value >= 0,
);

const fetchData = () => {
  isLoading.value = true;
  axios.get(
    "fnb",
    (response: { data: { fnb: FnbItem[] } }) => {
      fnbData.value = response.data.fnb;
      isLoading.value = false;
    },
    () => {
      isLoading.value = false;
      toast.error("Data FnB gagal dimuat. Harap coba lagi");
    },
  );
};

const resetForm = () => {
  title.value = "";
  price.value = undefined;
  description.value = "";
};

const openModal = () => {
  resetForm();
  isModalOpen.value = true;
};

const closeModal = () => {
  if (!isSaving.value) isModalOpen.value = false;
};

const saveData = () => {
  if (!isFormValid.value || isSaving.value) return;

  isSaving.value = true;
  axios.post(
    "fnb",
    {
      title: title.value.trim(),
      price: price.value,
      description: description.value.trim(),
    },
    (response: { data: { message: string } }) => {
      isSaving.value = false;
      if (response.data.message === "unit-created") {
        isModalOpen.value = false;
        resetForm();
        toast.success("Item FnB berhasil ditambahkan");
        fetchData();
      }
    },
    () => {
      isSaving.value = false;
      toast.error("Item FnB gagal disimpan. Harap coba lagi");
    },
  );
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

onMounted(() => {
  document.title = "Food & Beverage | Rent.Play!";
  fetchData();
});
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl font-bold tracking-tight">
            Food &amp; Beverage
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Kelola katalog makanan dan minuman untuk pesanan pelanggan.
          </p>
        </div>
        <button
          type="button"
          class="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
          @click="openModal"
        >
          <Plus />
          Tambah Item
        </button>
      </div>

      <section
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-5 py-4"
        >
          <div>
            <h2 class="font-display text-[15px] font-semibold text-slate-900">
              Daftar Item FnB
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Katalog yang tersedia untuk ditambahkan ke transaksi sewa.
            </p>
          </div>
          <div
            class="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500"
          >
            {{ fnbData.length }} item
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead class="bg-slate-50/80">
              <tr class="text-xs uppercase tracking-wide text-slate-500">
                <th class="px-5 py-3 font-medium">Nama Item</th>
                <th class="px-5 py-3 font-medium">Harga</th>
                <th class="px-5 py-3 font-medium">Deskripsi</th>
                <th class="px-5 py-3 font-medium">Ditambahkan</th>
                <th class="px-5 py-3 font-medium">Diperbarui</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-if="isLoading">
                <td
                  colspan="5"
                  class="px-5 py-14 text-center text-sm text-slate-500"
                >
                  Memuat katalog FnB...
                </td>
              </tr>
              <tr
                v-for="item in fnbData"
                v-else
                :key="item.id"
                class="transition-colors hover:bg-slate-50/70"
              >
                <td class="px-5 py-4">
                  <p class="font-semibold text-slate-900">{{ item.title }}</p>
                </td>
                <td
                  class="whitespace-nowrap px-5 py-4 font-semibold text-slate-900"
                >
                  {{ formatRupiah(item.price) }}
                </td>
                <td class="px-5 py-4 text-slate-600">
                  <p class="max-w-sm line-clamp-2">{{ item.description }}</p>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-slate-500">
                  {{ formatDateTime(item.created_at) }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-slate-500">
                  {{ formatDateTime(item.updated_at) }}
                </td>
              </tr>
              <tr v-if="!isLoading && !fnbData.length">
                <td colspan="5" class="px-5 py-14 text-center">
                  <div class="mx-auto max-w-sm">
                    <div
                      class="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500"
                    >
                      <Utensils />
                    </div>
                    <p class="text-sm font-semibold text-slate-900">
                      Belum ada item FnB
                    </p>
                    <p class="mt-1 text-sm text-slate-500">
                      Tambahkan makanan atau minuman
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <Modal
      v-model="isModalOpen"
      title="Tambah Item FnB"
      description="Isi detail item yang akan tersedia di katalog."
    >
      <div class="space-y-4" @submit.prevent="saveData">
        <div>
          <label for="fnb-title" class="mb-1.5 block text-sm font-medium">
            Nama Item
          </label>
          <input
            id="fnb-title"
            v-model="title"
            type="text"
            required
            placeholder="Contoh: Es Teh Manis"
            class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label for="fnb-price" class="mb-1.5 block text-sm font-medium">
            Harga
          </label>
          <input
            id="fnb-price"
            v-model.number="price"
            type="number"
            required
            placeholder="0"
            class="h-10 w-full rounded-lg border border-gray-200 px-3.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label for="fnb-description" class="mb-1.5 block text-sm font-medium">
            Deskripsi
          </label>
          <textarea
            id="fnb-description"
            v-model="description"
            required
            rows="3"
            placeholder="Contoh: Minuman teh dingin dengan gula."
            class="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="closeModal"
        >
          Batal
        </button>
        <button
          type="button"
          class="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          :disabled="!isFormValid || isSaving"
          @click="saveData"
        >
          {{ isSaving ? "Menyimpan..." : "Simpan" }}
        </button>
      </template>
    </Modal>
    <Toaster />
  </BaseLayout>
</template>
