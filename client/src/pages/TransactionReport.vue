<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import Axios from "axios";
import toast, { Toaster } from "vue3-hot-toast";

import BaseLayout from "../components/__Layout.vue";
import {
  EllipsisVertical,
  Printer,
  X,
  Eye,
  Trash2,
  Calendar,
  Clock,
  CreditCard,
  Gamepad2,
  UtensilsCrossed,
  Play,
} from "@lucide/vue";
import dayjs from "dayjs";
import { useAlertDialog } from "../composables/useAlertDialog";

const { confirm } = useAlertDialog();

interface FnbOrderItem {
  id: number;
  title: string;
  price: number;
  qty: number;
  subTotal: number;
}

interface TransactionLogs {
  id: number;
  transaction_no: string;
  customer_name: string;
  playDuration: string;
  total: number;
  created_at: string;
  unit_ps: string;
  payment_method: string;
  status: string;
  // ==== field tambahan buat kebutuhan sidebar detail ====
  rent_price_per_hour: number;
  start_time: string;
  end_time: string;
  fnb_items: FnbOrderItem[];
}

const transactionData = ref<TransactionLogs[]>([]);

onMounted(async () => {
  document.title = "Laporan Transaksi | Reno Rental";

  try {
    const response = await Axios.get("http://localhost:8080/transaction")!;

    response.data.map((item: any) => {
      transactionData.value.push({
        id: item.id,
        transaction_no: item.transaction_no,
        customer_name: item.customer_name,
        playDuration: item.units[0].play_time,
        total: item.total,
        created_at: item.created_at,
        unit_ps: item.units[0].title,
        // TODO: sesuaikan nama field-field di bawah ini dengan response API asli kamu
        payment_method: "cash",
        status: "selesai",
        rent_price_per_hour: item.units[0].rent_price ?? 0,
        start_time: item.units[0].start_time ?? item.created_at,
        end_time: item.units[0].end_time ?? item.created_at,
        fnb_items: item.fnbs.map((fnb: any) => ({
          id: fnb.id,
          title: fnb.title,
          price: fnb.price,
          qty: fnb.quantity,
          subTotal: fnb.sub_total,
        })),
      });
    });

    console.log(transactionData.value);
  } catch (err) {
    toast.error("Data gagal dimuat. Harap coba lagi");
  }
});

const currencyFormat = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/\s+/g, "");

const formatDateTime = (value: string) =>
  dayjs(value).format("DD-MM-YYYY HH:mm");
const formatTime = (value: string) => dayjs(value).format("HH:mm");

// ================= Sidebar Detail Transaksi =================
const isSidebarOpen = ref(false);
const selectedTransaction = ref<TransactionLogs | null>(null);

const fnbTotal = computed(() =>
  (selectedTransaction.value?.fnb_items ?? []).reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  ),
);

const sewaTotal = computed(() => {
  if (!selectedTransaction.value) return 0;
  return selectedTransaction.value.total - fnbTotal.value;
});

function openDetail(transaction: TransactionLogs) {
  selectedTransaction.value = transaction;
  isSidebarOpen.value = true;
}

function closeDetail() {
  isSidebarOpen.value = false;
}

// ================= Floating Menu per Row =================
const activeMenuId = ref<number | null>(null);
const menuPosition = ref({ top: 0, left: 0 });

const activeTransaction = computed(
  () => transactionData.value.find((t) => t.id === activeMenuId.value) ?? null,
);

function toggleMenu(event: MouseEvent, transaction: TransactionLogs) {
  event.stopPropagation();
  if (activeMenuId.value === transaction.id) {
    activeMenuId.value = null;
    return;
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const menuWidth = 190;
  menuPosition.value = {
    top: rect.bottom + 6,
    left: Math.max(8, rect.right - menuWidth),
  };
  activeMenuId.value = transaction.id;
}

function closeMenu() {
  activeMenuId.value = null;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".floating-menu") && !target.closest(".menu-trigger")) {
    closeMenu();
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu);
});
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", closeMenu, true);
  window.removeEventListener("resize", closeMenu);
});

function lihatDetail(transaction: TransactionLogs) {
  closeMenu();
  openDetail(transaction);
}

function cetakStruk(transaction: TransactionLogs) {
  closeMenu();
  // TODO: sambungin ke fitur cetak struk / generate PDF
  toast.success(`Menyiapkan struk ${transaction.transaction_no}`);
}

async function hapusTransaksi(transaction: TransactionLogs) {
  closeMenu();
  const ok = await confirm({
    title: "Hapus transaksi ini?",
    message: `Transaksi ${transaction.transaction_no} akan dihapus permanen dan gak bisa dikembaliin.`,
    variant: "danger",
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
  });
  if (!ok) return;

  try {
    // TODO: sesuaikan endpoint hapus transaksi
    await Axios.delete(`http://localhost:8080/transaction/${transaction.id}`);
    transactionData.value = transactionData.value.filter(
      (t) => t.id !== transaction.id,
    );
    if (selectedTransaction.value?.id === transaction.id) closeDetail();
    toast.success("Transaksi berhasil dihapus");
  } catch (err) {
    toast.error("Gagal menghapus transaksi");
  }
}
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold tracking-tight">
            Laporan Transaksi
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Kelola riwayat transaksi yang sudah terjadi
          </p>
        </div>
        <button
          class="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
        >
          <Printer />
          <span>Cetak Laporan</span>
        </button>
      </div>

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
            {{ transactionData.length }} unit
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead class="bg-slate-50/80">
              <tr class="text-xs uppercase tracking-wide text-slate-500">
                <th class="px-5 py-3 font-medium">TGL Transaksi</th>
                <th class="px-5 py-3 font-medium">Unit</th>
                <th class="px-5 py-3 font-medium">Durasi Main</th>
                <th class="px-5 py-3 font-medium">Metode Bayar</th>
                <th class="px-5 py-3 font-medium">Total</th>
                <th class="px-5 py-3 font-medium">Status</th>
                <th class="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr
                v-for="transaction in transactionData"
                :key="transaction.id"
                @click="openDetail(transaction)"
                class="cursor-pointer transition-colors hover:bg-slate-50/70"
                :class="
                  selectedTransaction?.id === transaction.id && isSidebarOpen
                    ? 'bg-indigo-200'
                    : ''
                "
              >
                <td class="px-5 py-4">
                  <p class="truncate text-slate-600">
                    {{ formatDateTime(transaction.created_at) }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ transaction.unit_ps }}
                </td>

                <td class="px-5 py-4 text-slate-600">
                  <p class="max-w-sm line-clamp-2">
                    {{ transaction.playDuration }} Jam
                  </p>
                </td>

                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ transaction.payment_method }}
                </td>

                <td
                  class="whitespace-nowrap px-5 py-4 text-slate-900 font-semibold"
                >
                  {{ currencyFormat(transaction.total) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      transaction.status === 'Selesai'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    "
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="
                        transaction.status === 'Selesai'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      "
                    ></span>
                    {{ transaction.status }}
                  </span>
                </td>

                <td class="px-5 py-4 text-slate-500">
                  <button
                    @click="toggleMenu($event, transaction)"
                    class="menu-trigger p-2 rounded-full cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    <EllipsisVertical :size="12" />
                  </button>
                </td>
              </tr>

              <tr v-if="!transactionData.length">
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
                    <p class="mt-1 text-sm text-slate-600">
                      Tambahkan unit baru untuk mulai mengelola daftar PS.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- ============ Floating Menu (per row) ============ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="activeMenuId !== null && activeTransaction"
          class="floating-menu fixed z-60 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg"
          :style="{
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px',
          }"
        >
          <button
            @click="lihatDetail(activeTransaction)"
            class="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye :size="15" /> Lihat Detail
          </button>
          <button
            @click="cetakStruk(activeTransaction)"
            class="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer :size="15" /> Cetak Struk
          </button>
          <div class="my-1 border-t border-slate-100"></div>
          <button
            @click="hapusTransaksi(activeTransaction)"
            class="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 :size="15" /> Hapus Transaksi
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- ============ Sidebar Detail Transaksi ============ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSidebarOpen"
          @click="closeDetail"
          class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        ></div>
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isSidebarOpen && selectedTransaction"
          class="fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5"
          >
            <div>
              <h3 class="font-display text-lg font-bold text-slate-900">
                {{ selectedTransaction.transaction_no }}
              </h3>
            </div>
            <button
              @click="closeDetail"
              class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600 cursor-pointer bg-slate-100"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <!-- Hero: penyewa + total -->
            <div class="rounded-2xl bg-indigo-500 p-5 text-white">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs text-indigo-100">Pelanggan</p>
                  <p class="mt-0.5 text-lg font-bold">
                    {{ selectedTransaction.customer_name }}
                  </p>
                </div>
                <span
                  class="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold"
                >
                  {{ selectedTransaction.status }}
                </span>
              </div>
              <div class="mt-4 border-t border-white/20 pt-4">
                <p class="text-xs text-indigo-100">Total Pembayaran</p>
                <p class="mt-0.5 text-2xl font-bold">
                  {{ currencyFormat(selectedTransaction.total) }}
                </p>
              </div>
            </div>

            <!-- Info Sesi -->
            <div>
              <p
                class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 flex gap-1 items-center"
              >
                <Play :size="12" /> Sesi Main
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl bg-slate-50 p-3.5">
                  <p
                    class="flex items-center gap-1.5 text-[11px] text-slate-400"
                  >
                    <Calendar :size="12" /> Tanggal Main
                  </p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">
                    {{ formatDateTime(selectedTransaction.created_at) }}
                  </p>
                </div>
                <div class="rounded-xl bg-slate-50 p-3.5">
                  <p
                    class="flex items-center gap-1.5 text-[11px] text-slate-400"
                  >
                    <Gamepad2 :size="12" /> Unit
                  </p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">
                    {{ selectedTransaction.unit_ps }}
                  </p>
                </div>
                <div class="rounded-xl bg-slate-50 p-3.5">
                  <p
                    class="flex items-center gap-1.5 text-[11px] text-slate-400"
                  >
                    <Clock :size="12" /> Waktu Main
                  </p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">
                    {{ formatTime(selectedTransaction.start_time) }} -
                    {{ formatTime(selectedTransaction.end_time) }}
                    ({{ selectedTransaction.playDuration }}
                    Jam)
                  </p>
                </div>
                <div class="rounded-xl bg-slate-50 p-3.5">
                  <p
                    class="flex items-center gap-1.5 text-[11px] text-slate-400"
                  >
                    <CreditCard :size="12" /> Metode Bayar
                  </p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">
                    {{ selectedTransaction.payment_method }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Item FnB -->
            <div>
              <div class="mb-3 flex items-center justify-between">
                <p
                  class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  <UtensilsCrossed :size="12" /> Makanan & Minuman
                </p>
                <span class="text-xs text-slate-400"
                  >{{ selectedTransaction.fnb_items.length }} item</span
                >
              </div>

              <div
                v-if="selectedTransaction.fnb_items.length === 0"
                class="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400"
              >
                Tidak ada Makanan/Minuman yang dipesan
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="fnb in selectedTransaction.fnb_items"
                  :key="fnb.id"
                  class="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-800">
                      {{ fnb.title }}
                    </p>
                    <p class="text-xs text-slate-400">
                      {{ currencyFormat(fnb.price) }} x {{ fnb.qty }}
                    </p>
                  </div>
                  <p class="ml-3 shrink-0 text-sm font-semibold text-slate-900">
                    {{ currencyFormat(fnb.price * fnb.qty) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Rincian Total -->
            <div class="space-y-2 rounded-2xl border border-slate-100 p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">
                  Sewa PS ({{ selectedTransaction.playDuration }} jam x
                  {{ currencyFormat(selectedTransaction.rent_price_per_hour) }})
                </span>
                <span class="font-medium text-slate-700">{{
                  currencyFormat(sewaTotal)
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Makanan & Minuman</span>
                <span class="font-medium text-slate-700">{{
                  currencyFormat(fnbTotal)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between border-t border-slate-100 pt-2"
              >
                <span class="text-sm font-semibold text-slate-900">TOTAL</span>
                <span class="text-lg font-bold text-indigo-600">{{
                  currencyFormat(selectedTransaction.total)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="shrink-0 border-t border-slate-100 px-6 py-4">
            <button
              @click="cetakStruk(selectedTransaction)"
              class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              <Printer :size="16" /> Cetak Struk
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Toaster />
  </BaseLayout>
</template>
