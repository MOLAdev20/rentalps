<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  nextTick,
} from "vue";
import BaseLayout from "../components/__Layout.vue";
import UnitCard from "../components/UnitCard.vue";
import axios from "../helper/axios.ts";
import formatRupiah from "../helper/currency.ts";
import Chart from "chart.js/auto";
import dayjs from "dayjs";
import toast, { Toaster } from "vue3-hot-toast";
import {
  Gamepad2,
  Wallet,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Plus,
  ShoppingBag,
  Box,
} from "@lucide/vue";

document.title = "Dasbor | Rent.Play!";

// ================= Types =================
interface UnitItem {
  id: number;
  title: string;
  rent_price: number;
  description: string;
  status: string;
  rentedUnitOrder?: {
    order_id: number;
    start_time: string;
    end_time: string;
  } | null;
}

interface UnitSummary {
  total: number;
  playing: number;
  finished: number;
  available: number;
}

interface FinancialSummary {
  totalTransaction: number;
  rentalTransaction: number;
  fnbTransaction: number;
  totalCash: number;
  totalQris: number;
  total: number;
}

interface RecapitulationRow {
  date: string;
  trx: number;
  rental: number;
  fnb: number;
  cash: number;
  qris: number;
  total: number;
}

interface RecentTransaction {
  id: number;
  transaction_no: string;
  customer_name: string;
  payment_method: string;
  status: string;
  subtotal: number;
  total: number;
  created_at: string;
  units: Array<{
    id: number;
    unit_id: number;
    title: string;
    play_time: number;
    rent_price: number;
    sub_total: number;
  }>;
  fnbs: Array<{
    id: number;
    fnb_id: number;
    title: string;
    price: number;
    quantity: number;
    sub_total: number;
  }>;
}

// ================= States =================
const isLoading = ref(true);
const unitList = ref<UnitItem[]>([]);
const unitSummary = ref<UnitSummary>({
  total: 0,
  playing: 0,
  finished: 0,
  available: 0,
});

const todayFinancial = ref<FinancialSummary>({
  totalTransaction: 0,
  rentalTransaction: 0,
  fnbTransaction: 0,
  totalCash: 0,
  totalQris: 0,
  total: 0,
});

const recentTransactions = ref<RecentTransaction[]>([]);
const recapitulation7Days = ref<RecapitulationRow[]>([]);
const activeUnitFilter = ref<"all" | "playing" | "finished" | "available">(
  "all",
);

// Chart Canvas Refs
const barChartCanvas = ref<HTMLCanvasElement | null>(null);
const donutChartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstances = shallowRef<{ bar: Chart | null; donut: Chart | null }>({
  bar: null,
  donut: null,
});

// Computed Units based on Filter
const filteredUnits = computed(() => {
  if (activeUnitFilter.value === "all") return unitList.value;
  if (activeUnitFilter.value === "available") {
    return unitList.value.filter((u) => u.status === "available");
  }
  if (activeUnitFilter.value === "playing") {
    const now = Date.now();
    return unitList.value.filter((u) => {
      if (u.status !== "rented" || !u.rentedUnitOrder) return false;
      const end = dayjs(u.rentedUnitOrder.end_time).valueOf();
      return end > now;
    });
  }
  if (activeUnitFilter.value === "finished") {
    const now = Date.now();
    return unitList.value.filter((u) => {
      if (u.status !== "rented" || !u.rentedUnitOrder) return false;
      const end = dayjs(u.rentedUnitOrder.end_time).valueOf();
      return end <= now;
    });
  }
  return unitList.value;
});

// ================= Data Fetching =================
const loadDashboardData = async () => {
  isLoading.value = true;
  const today = dayjs().format("YYYY-MM-DD");
  const sevenDaysAgo = dayjs().subtract(6, "day").format("YYYY-MM-DD");

  try {
    // 1. Fetch Unit Status & Live Summary
    await new Promise<void>((resolve) => {
      axios.get(
        "unit",
        (res: any) => {
          unitSummary.value = res.data.summary ?? unitSummary.value;
          unitList.value = res.data.unit ?? [];
          resolve();
        },
        () => resolve(),
      );
    });

    // 2. Fetch Today's Financial Summary
    await new Promise<void>((resolve) => {
      axios.getWithParams(
        "transaction/report/financial-statements",
        { start_date: today, end_date: today },
        (res: any) => {
          console.log(res.data);
          console.log(today);
          if (res.data?.summary) {
            todayFinancial.value = res.data.summary;
          }
          resolve();
        },
        () => resolve(),
      );
    });

    // 3. Fetch 7 Days Recapitulation for Chart
    await new Promise<void>((resolve) => {
      axios.getWithParams(
        "transaction/report/financial-statements",
        { start_date: sevenDaysAgo, end_date: today },
        (res: any) => {
          if (res.data?.recapitulation) {
            recapitulation7Days.value = res.data.recapitulation;
          }
          resolve();
        },
        () => resolve(),
      );
    });

    // 4. Fetch Recent Transactions
    await new Promise<void>((resolve) => {
      axios.get(
        "transaction",
        (res: any) => {
          if (Array.isArray(res.data)) {
            recentTransactions.value = res.data.slice(0, 5);
          }
          resolve();
        },
        () => resolve(),
      );
    });

    await nextTick();
    renderCharts();
  } catch (err) {
    toast.error("Gagal memuat beberapa data dasbor");
  } finally {
    isLoading.value = false;
  }
};

// ================= Charts Rendering =================
const renderCharts = () => {
  // Destroy existing charts
  if (chartInstances.value.bar) chartInstances.value.bar.destroy();
  if (chartInstances.value.donut) chartInstances.value.donut.destroy();

  // 1. Render Bar Chart (Pendapatan 7 Hari Terakhir)
  if (barChartCanvas.value && recapitulation7Days.value.length > 0) {
    // Urutkan tanggal dari terlama ke terbaru
    const sortedData = [...recapitulation7Days.value].reverse();
    const labels = sortedData.map((d) => dayjs(d.date).format("DD MMM"));
    const rentalData = sortedData.map((d) => d.rental);
    const fnbData = sortedData.map((d) => d.fnb);

    chartInstances.value.bar = new Chart(barChartCanvas.value, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Sewa PS",
            data: rentalData,
            backgroundColor: "#4f46e5", // Indigo-600
            borderRadius: 6,
          },
          {
            label: "F&B",
            data: fnbData,
            backgroundColor: "#10b981", // Emerald-500
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: ${formatRupiah(Number(ctx.raw))}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                const val = Number(value);
                if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
                return val;
              },
            },
          },
        },
      },
    });
  }

  // 2. Render Donut Chart (Komposisi Pendapatan Rental vs FnB Hari Ini)
  if (donutChartCanvas.value) {
    const rentalTotal = todayFinancial.value.rentalTransaction;
    const fnbTotal = todayFinancial.value.fnbTransaction;
    const isZero = rentalTotal === 0 && fnbTotal === 0;

    chartInstances.value.donut = new Chart(donutChartCanvas.value, {
      type: "doughnut",
      data: {
        labels: isZero ? ["Belum Ada Transaksi"] : ["Sewa PS", "F&B"],
        datasets: [
          {
            data: isZero ? [1] : [rentalTotal, fnbTotal],
            backgroundColor: isZero ? ["#e5e7eb"] : ["#6366f1", "#10b981"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 },
            },
          },
          tooltip: {
            enabled: !isZero,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatRupiah(Number(ctx.raw))}`,
            },
          },
        },
      },
    });
  }
};

let autoRefreshInterval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  loadDashboardData();
  // Auto refresh every 30 seconds to keep unit status & timer accurate
  autoRefreshInterval = setInterval(() => {
    loadDashboardData();
  }, 30_000);
});

onUnmounted(() => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  if (chartInstances.value.bar) chartInstances.value.bar.destroy();
  if (chartInstances.value.donut) chartInstances.value.donut.destroy();
});
</script>

<template>
  <BaseLayout>
    <Toaster position="top-right" />
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Header Bar -->
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1
            class="font-display text-2xl font-bold tracking-tight text-gray-900"
          >
            Dasbor Operasional
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Ringkasan aktivitas rental PS & penjualan F&B hari ini secara
            real-time.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95"
            :disabled="isLoading"
            @click="loadDashboardData"
          >
            <RefreshCw
              class="h-4 w-4 text-gray-500"
              :class="{ 'animate-spin': isLoading }"
            />
            <span>Refresh</span>
          </button>

          <RouterLink
            to="/rent"
            class="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Plus class="h-4 w-4" />
            <span>Sewa Unit Baru</span>
          </RouterLink>
        </div>
      </div>

      <!-- Top KPI Stat Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Card 1: Omzet Hari Ini -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Pendapatan Hari Ini
            </span>
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
            >
              <Wallet class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-3">
            <p
              class="font-display text-2xl font-bold tracking-tight text-gray-900"
            >
              {{ formatRupiah(todayFinancial.total) }}
            </p>
            <div
              class="mt-2 flex flex-col justify-between text-xs text-gray-500"
            >
              <span
                >Sewa Konsol:
                <strong class="text-indigo-600">{{
                  formatRupiah(todayFinancial.rentalTransaction)
                }}</strong></span
              >
              <span
                >Food & Beverage:
                <strong class="text-emerald-600">{{
                  formatRupiah(todayFinancial.fnbTransaction)
                }}</strong></span
              >
            </div>
          </div>
        </div>

        <!-- Card 2: Konsol Main saat ini -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Unit Bermain
            </span>
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white"
            >
              <Gamepad2 class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-3">
            <p
              class="font-display text-2xl font-bold tracking-tight text-gray-900"
            >
              {{ unitSummary.playing }}
              <span class="text-sm font-normal text-gray-500"
                >/ {{ unitSummary.total }} Unit</span
              >
            </p>
            <p class="mt-2 text-xs font-medium text-emerald-600">
              {{ unitSummary.available }} Unit Siap Disewa
            </p>
          </div>
        </div>

        <!-- Card 3: Waktu Main Habis / Selesai -->
        <div
          class="group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          :class="
            unitSummary.finished > 0
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-gray-200 bg-white'
          "
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider"
              :class="
                unitSummary.finished > 0 ? 'text-amber-800' : 'text-gray-500'
              "
            >
              Waktu Habis / Checkout
            </span>
            <span
              class="grid h-10 w-10 place-items-center rounded-xl transition-colors"
              :class="
                unitSummary.finished > 0
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
              "
            >
              <AlertCircle class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-3">
            <p
              class="font-display text-2xl font-bold tracking-tight text-gray-900"
            >
              {{ unitSummary.finished }}
              <span class="text-sm font-normal text-gray-500">Sesi</span>
            </p>
            <p
              class="mt-2 text-xs font-medium"
              :class="
                unitSummary.finished > 0
                  ? 'text-amber-700 font-semibold'
                  : 'text-gray-500'
              "
            >
              {{
                unitSummary.finished > 0
                  ? "Perlu proses checkout & bayar"
                  : "Semua sesi terpantau aman"
              }}
            </p>
          </div>
        </div>

        <!-- Card 4: Transaksi Hari Ini -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Transaksi Selesai
            </span>
            <span
              class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
            >
              <ShoppingBag class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-3">
            <p
              class="font-display text-2xl font-bold tracking-tight text-gray-900"
            >
              {{ todayFinancial.totalTransaction }}
              <span class="text-sm font-normal text-gray-500">Order</span>
            </p>
            <div
              class="mt-2 flex items-center justify-between text-xs text-gray-500"
            >
              <span
                >Cash:
                <strong class="text-gray-800">{{
                  formatRupiah(todayFinancial.totalCash)
                }}</strong></span
              >
              <span
                >QRIS:
                <strong class="text-blue-600">{{
                  formatRupiah(todayFinancial.totalQris)
                }}</strong></span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Bar Chart: Pendapatan 7 Hari Terakhir -->
        <div
          class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="font-display text-base font-bold text-gray-900">
                Performa Omzet 7 Hari Terakhir
              </h3>
              <p class="mt-0.5 text-xs text-gray-500">
                Perbandingan hasil sewa konsol vs penjualan F&B harian
              </p>
            </div>
            <RouterLink
              to="/financial-statements"
              class="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Laporan Lengkap</span>
              <ArrowRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>
          <div class="relative w-full" v-if="todayFinancial.total != 0">
            <canvas ref="barChartCanvas"></canvas>
          </div>
          <div
            class="flex flex-col h-64 justify-center items-center w-full"
            v-else
          >
            <Box class="text-indigo-500 mb-3" :size="64" />
            <h1>Belum ada transaksi</h1>
          </div>
        </div>

        <!-- Donut Chart: Komposisi Omzet Hari Ini -->
        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-4">
            <h3 class="font-display text-base font-bold text-gray-900">
              Komposisi Omzet Hari Ini
            </h3>
            <p class="mt-0.5 text-xs text-gray-500">
              Rasio sumber pendapatan sewa vs makanan
            </p>
          </div>
          <div class="relative flex h-64 items-center justify-center">
            <canvas ref="donutChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Live Monitoring Konsol PS -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4"
        >
          <div>
            <h3 class="font-display text-lg font-bold text-gray-900">
              Monitoring Unit Konsol Real-time
            </h3>
            <p class="text-xs text-gray-500">
              Pantau waktu main unit yang sedang aktif atau mulai sewa pada unit
              yang kosong
            </p>
          </div>

          <!-- Unit Filter Tabs -->
          <div
            class="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-100 p-1 text-xs font-medium text-gray-600"
          >
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 transition-all"
              :class="
                activeUnitFilter === 'all'
                  ? 'bg-white font-semibold text-gray-900 shadow-sm'
                  : 'hover:text-gray-900'
              "
              @click="activeUnitFilter = 'all'"
            >
              Semua ({{ unitSummary.total }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 transition-all"
              :class="
                activeUnitFilter === 'playing'
                  ? 'bg-white font-semibold text-emerald-700 shadow-sm'
                  : 'hover:text-gray-900'
              "
              @click="activeUnitFilter = 'playing'"
            >
              Bermain ({{ unitSummary.playing }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 transition-all"
              :class="
                activeUnitFilter === 'finished'
                  ? 'bg-white font-semibold text-amber-700 shadow-sm'
                  : 'hover:text-gray-900'
              "
              @click="activeUnitFilter = 'finished'"
            >
              Waktu Habis ({{ unitSummary.finished }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 transition-all"
              :class="
                activeUnitFilter === 'available'
                  ? 'bg-white font-semibold text-indigo-700 shadow-sm'
                  : 'hover:text-gray-900'
              "
              @click="activeUnitFilter = 'available'"
            >
              Tersedia ({{ unitSummary.available }})
            </button>
          </div>
        </div>

        <!-- Unit Grid -->
        <div
          v-if="filteredUnits.length > 0"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <UnitCard
            v-for="unit in filteredUnits"
            :key="unit.id"
            :id="unit.id"
            :name="unit.title"
            :price-per-hour="formatRupiah(unit.rent_price)"
            :status="unit.status"
            :rented-session="unit.rentedUnitOrder"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 text-center text-gray-400"
        >
          <Gamepad2 class="h-12 w-12 stroke-[1.5] text-gray-300" />
          <p class="mt-2 text-sm font-medium text-gray-600">
            Tidak ada unit konsol pada kategori ini
          </p>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
        >
          <div>
            <h3 class="font-display text-base font-bold text-gray-900">
              Transaksi Terkini
            </h3>
            <p class="text-xs text-gray-500">
              5 Transaksi pembayaran sewa & F&B terbaru
            </p>
          </div>

          <RouterLink
            to="/transaction-report"
            class="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Semua Transaksi</span>
            <ArrowRight class="h-3.5 w-3.5" />
          </RouterLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead
              class="bg-gray-50/75 text-xs uppercase tracking-wider text-gray-400"
            >
              <tr>
                <th class="px-5 py-3.5 font-semibold">No. Transaksi</th>
                <th class="px-5 py-3.5 font-semibold">Pelanggan</th>
                <th class="px-5 py-3.5 font-semibold">Detail Order</th>
                <th class="px-5 py-3.5 font-semibold">Metode</th>
                <th class="px-5 py-3.5 font-semibold">Total Biaya</th>
                <th class="px-5 py-3.5 font-semibold">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-normal">
              <tr
                v-for="trx in recentTransactions"
                :key="trx.id"
                class="transition-colors hover:bg-gray-50/80"
              >
                <td
                  class="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-600"
                >
                  {{ trx.transaction_no }}
                </td>
                <td class="px-5 py-3.5 font-medium text-gray-900">
                  {{ trx.customer_name }}
                </td>
                <td class="px-5 py-3.5 text-xs text-gray-500">
                  <div class="flex flex-col gap-0.5">
                    <span
                      v-if="trx.units.length > 0"
                      class="font-medium text-gray-700"
                    >
                      🎮 {{ trx.units.map((u) => u.title).join(", ") }} ({{
                        trx.units[0]?.play_time
                      }}
                      Jam)
                    </span>
                    <span v-if="trx.fnbs.length > 0" class="text-emerald-700">
                      🥤
                      {{
                        trx.fnbs
                          .map((f) => `${f.title} x${f.quantity}`)
                          .join(", ")
                      }}
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-xs">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase"
                    :class="
                      trx.payment_method.toLowerCase() === 'qris'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    "
                  >
                    {{ trx.payment_method }}
                  </span>
                </td>
                <td class="px-5 py-3.5 font-semibold text-gray-900">
                  {{ formatRupiah(trx.total) }}
                </td>
                <td class="px-5 py-3.5 text-xs text-gray-400">
                  {{ dayjs(trx.created_at).format("DD/MM/YYYY HH:mm") }}
                </td>
              </tr>

              <tr v-if="recentTransactions.length === 0">
                <td
                  colspan="6"
                  class="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Belum ada riwayat transaksi recorded.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
