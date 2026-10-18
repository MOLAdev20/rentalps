<script setup lang="ts">
import BaseLayout from "../../components/__Layout.vue";
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
  Info,
  ChevronDown,
  Check,
  CircleCheck,
  CircleX,
  Receipt,
} from "@lucide/vue";
import formatRupiah from "../../helper/currency.ts";
import useTransactionPage from "./composables/useTransactionPage.ts";
import { Toaster } from "vue3-hot-toast";

const {
  isFilterOpen,
  selectedPeriodLabel,
  formattedDateRange,
  selectPreset,
  filterType,
  startDate,
  endDate,
  applyCustomDate,
  transactionData,
  selectedTransaction,
  formatDateTime,
  toggleMenu,
  isEmpty,
  activeMenuId,
  menuPosition,
  lihatDetail,
  cetakStruk,
  activeTransaction,
  isSidebarOpen,
  closeDetail,
  openDetail,
  hapusTransaksi,
  formatTime,
  fnbTotal,
  sewaTotal,
  summary,
  selectStatus,
  statusFilter,
  loadingRef,
  statusLabel,
} = useTransactionPage();
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

      <!-- ============ Score Cards Ringkasan Transaksi (klik untuk filter status) ============ -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          @click="selectStatus('all')"
          :aria-pressed="statusFilter === 'all'"
          title="Tampilkan semua status"
          class="group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :class="
            statusFilter === 'all'
              ? 'border-indigo-500 ring-2 ring-indigo-500/60 focus-visible:ring-indigo-500'
              : 'border-slate-200 hover:border-indigo-300'
          "
        >
          <div
            class="absolute -right-2.5 -top-2.5 rounded-full bg-indigo-50 p-4 transition-colors group-hover:bg-indigo-100"
          >
            <Receipt class="text-indigo-200" :size="40" />
          </div>
          <div class="flex items-center gap-1.5">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total Seluruh Transaksi
            </p>
            <span
              v-if="statusFilter === 'all'"
              class="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-indigo-600 text-white"
            >
              <Check :size="11" :stroke-width="3" />
            </span>
          </div>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ formatRupiah(summary.all.amount) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ summary.all.count }} transaksi
          </p>
        </button>

        <button
          type="button"
          @click="selectStatus('complete')"
          :aria-pressed="statusFilter === 'complete'"
          title="Tampilkan transaksi berhasil"
          class="group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :class="
            statusFilter === 'complete'
              ? 'border-emerald-500 ring-2 ring-emerald-500/60 focus-visible:ring-emerald-500'
              : 'border-slate-200 hover:border-emerald-300'
          "
        >
          <div
            class="absolute -right-2.5 -top-2.5 rounded-full bg-emerald-50 p-4 transition-colors group-hover:bg-emerald-100"
          >
            <CircleCheck class="text-emerald-200" :size="40" />
          </div>
          <div class="flex items-center gap-1.5">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Transaksi Berhasil
            </p>
            <span
              v-if="statusFilter === 'complete'"
              class="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"
            >
              <Check :size="11" :stroke-width="3" />
            </span>
          </div>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ formatRupiah(summary.complete.amount) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ summary.complete.count }} transaksi
          </p>
        </button>

        <button
          type="button"
          @click="selectStatus('cancel')"
          :aria-pressed="statusFilter === 'cancel'"
          title="Tampilkan transaksi gagal"
          class="group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :class="
            statusFilter === 'cancel'
              ? 'border-rose-500 ring-2 ring-rose-500/60 focus-visible:ring-rose-500'
              : 'border-slate-200 hover:border-rose-300'
          "
        >
          <div
            class="absolute -right-2.5 -top-2.5 rounded-full bg-rose-50 p-4 transition-colors group-hover:bg-rose-100"
          >
            <CircleX class="text-rose-200" :size="40" />
          </div>
          <div class="flex items-center gap-1.5">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Transaksi Gagal
            </p>
            <span
              v-if="statusFilter === 'cancel'"
              class="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rose-600 text-white"
            >
              <Check :size="11" :stroke-width="3" />
            </span>
          </div>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ formatRupiah(summary.cancel.amount) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ summary.cancel.count }} transaksi
          </p>
        </button>

        <button
          type="button"
          @click="selectStatus('pending')"
          :aria-pressed="statusFilter === 'pending'"
          title="Tampilkan transaksi menunggu pembayaran"
          class="group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :class="
            statusFilter === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/60 focus-visible:ring-amber-500'
              : 'border-slate-200 hover:border-amber-300'
          "
        >
          <div
            class="absolute -right-2.5 -top-2.5 rounded-full bg-amber-50 p-4 transition-colors group-hover:bg-amber-100"
          >
            <Clock class="text-amber-200" :size="40" />
          </div>
          <div class="flex items-center gap-1.5">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Menunggu Pembayaran
            </p>
            <span
              v-if="statusFilter === 'pending'"
              class="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-amber-500 text-white"
            >
              <Check :size="11" :stroke-width="3" />
            </span>
          </div>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ formatRupiah(summary.pending.amount) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ summary.pending.count }} transaksi
          </p>
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
              Data Transaksi
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Data transaksi yang terjadi
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- ================= ELEGANT DROPDOWN FILTER ================= -->
            <div class="relative filter-dropdown-container">
              <button
                @click="isFilterOpen = !isFilterOpen"
                class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
              >
                <Calendar :size="15" class="text-indigo-600" />
                <span>{{ selectedPeriodLabel }}</span>
                <span class="text-slate-400 font-normal"
                  >({{ formattedDateRange }})</span
                >
                <ChevronDown :size="14" class="text-slate-400" />
              </button>

              <!-- Dropdown Menu / Popover -->
              <Transition
                enter-active-class="transition-all duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div
                  v-if="isFilterOpen"
                  class="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
                >
                  <p
                    class="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Pilih Periode
                  </p>

                  <!-- Preset List -->
                  <div class="space-y-0.5">
                    <button
                      @click="selectPreset('today')"
                      class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>Hari Ini</span>
                      <Check
                        v-if="filterType === 'today'"
                        :size="14"
                        class="text-indigo-600"
                      />
                    </button>

                    <button
                      @click="selectPreset('7days')"
                      class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>7 Hari Terakhir</span>
                      <Check
                        v-if="filterType === '7days'"
                        :size="14"
                        class="text-indigo-600"
                      />
                    </button>

                    <button
                      @click="selectPreset('this_month')"
                      class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>Bulan Ini</span>
                      <Check
                        v-if="filterType === 'this_month'"
                        :size="14"
                        class="text-indigo-600"
                      />
                    </button>

                    <button
                      @click="selectPreset('last_month')"
                      class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>Bulan Lalu</span>
                      <Check
                        v-if="filterType === 'last_month'"
                        :size="14"
                        class="text-indigo-600"
                      />
                    </button>
                  </div>

                  <div class="my-2 border-t border-slate-100"></div>

                  <!-- Custom Range Section -->
                  <p
                    class="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Rentang Kustom
                  </p>
                  <div class="space-y-2 px-1">
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-[10px] text-slate-400 mb-0.5"
                          >Dari</label
                        >
                        <input
                          type="date"
                          v-model="startDate"
                          class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label class="block text-[10px] text-slate-400 mb-0.5"
                          >Sampai</label
                        >
                        <input
                          type="date"
                          v-model="endDate"
                          class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      @click="applyCustomDate"
                      class="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
                    >
                      Terapkan Rentang
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
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
                  {{ formatRupiah(transaction.total) }}
                </td>

                <td class="whitespace-nowrap px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      transaction.status === 'complete'
                        ? 'bg-emerald-50 text-emerald-600'
                        : transaction.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                    "
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="
                        transaction.status === 'complete'
                          ? 'bg-emerald-500'
                          : transaction.status === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      "
                    ></span>
                    {{
                      transaction.status === "complete"
                        ? "Selesai"
                        : transaction.status === "pending"
                          ? "Menunggu Pembayaran"
                          : "Dibatalkan"
                    }}
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
          <div v-if="!isEmpty" class="flex justify-center py-4">
            <div
              ref="loadingRef"
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
            ></div>
          </div>
          <div
            v-else="isEmpty"
            class="text-sm text-slate-500 p-4 flex items-center gap-1"
          >
            <Info :size="15" /> Data sudah ditampilkan seluruhnya
          </div>
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
            <div
              class="rounded-2xl p-5"
              :class="
                selectedTransaction.status === 'complete'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-amber-50 text-amber-500 border-amber-500 border'
              "
            >
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
                  {{
                    selectedTransaction.status === "complete"
                      ? "Selesai"
                      : "Menunggu Pembayaran"
                  }}
                </span>
              </div>
              <div class="mt-4 border-t border-white/20 pt-4">
                <p class="text-xs text-indigo-100">Total Pembayaran</p>
                <p class="mt-0.5 text-2xl font-bold">
                  {{ formatRupiah(selectedTransaction.total) }}
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
                      {{ formatRupiah(fnb.price) }} x {{ fnb.qty }}
                    </p>
                  </div>
                  <p class="ml-3 shrink-0 text-sm font-semibold text-slate-900">
                    {{ formatRupiah(fnb.price * fnb.qty) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Rincian Total -->
            <div class="space-y-2 rounded-2xl border border-slate-100 p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">
                  Sewa PS ({{ selectedTransaction.playDuration }} jam x
                  {{ formatRupiah(selectedTransaction.rent_price_per_hour) }})
                </span>
                <span class="font-medium text-slate-700">{{
                  formatRupiah(sewaTotal)
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Makanan & Minuman</span>
                <span class="font-medium text-slate-700">{{
                  formatRupiah(fnbTotal)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between border-t border-slate-100 pt-2"
              >
                <span class="text-sm font-semibold text-slate-900">TOTAL</span>
                <span class="text-lg font-bold text-indigo-600">{{
                  formatRupiah(selectedTransaction.total)
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
