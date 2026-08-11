<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import BaseLayout from "../components/__Layout.vue";
import Chart from "chart.js/auto";
import {
  TrendingUp,
  Gamepad2,
  UtensilsCrossed,
  CreditCard,
  Download,
  Wallet,
  Activity,
} from "@lucide/vue";

// ================= Formatter =================
const currencyFormat = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s+/g, "");

// ================= Dummy Data Agregat =================
// Nanti lu ganti pakai data hasil fetch API dari backend lu ya
const summary = ref({
  totalOmset: 3850000,
  pendapatanSewa: 2600000,
  pendapatanFnb: 1250000,
  totalTransaksi: 142,
  totalCash: 2150000,
  totalQris: 1700000,
});

const recapitulationData = ref([
  {
    date: "11/08/2026",
    trx: 20,
    rental: 600000,
    fnb: 350000,
    cash: 400000,
    qris: 550000,
    total: 950000,
  },
  {
    date: "10/08/2026",
    trx: 15,
    rental: 450000,
    fnb: 200000,
    cash: 300000,
    qris: 350000,
    total: 650000,
  },
  {
    date: "09/08/2026",
    trx: 22,
    rental: 800000,
    fnb: 300000,
    cash: 600000,
    qris: 500000,
    total: 1100000,
  },
  {
    date: "08/08/2026",
    trx: 18,
    rental: 500000,
    fnb: 200000,
    cash: 400000,
    qris: 300000,
    total: 700000,
  },
  {
    date: "07/08/2026",
    trx: 10,
    rental: 250000,
    fnb: 200000,
    cash: 450000,
    qris: 0,
    total: 450000,
  },
]);

// ================= Refs untuk Chart =================
const lineChartCanvas = ref<HTMLCanvasElement | null>(null);
const donutChartCanvas = ref<HTMLCanvasElement | null>(null);
const barChartCanvas = ref<HTMLCanvasElement | null>(null);

const charts = shallowRef<{ [key: string]: Chart | null }>({
  line: null,
  donut: null,
  bar: null,
});

onMounted(() => {
  document.title = "Laporan Keuangan | Reno Rental";
  initCharts();
});

onUnmounted(() => {
  // Clean up memory biar gak bocor pas pindah halaman
  Object.values(charts.value).forEach((chart) => chart?.destroy());
});

const initCharts = () => {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { family: "Inter" } },
      },
    },
  };

  // 1. Line Chart (Tren Pendapatan)
  if (lineChartCanvas.value) {
    charts.value.line = new Chart(lineChartCanvas.value, {
      type: "line",
      data: {
        labels: [...recapitulationData.value].reverse().map((d) => d.date),
        datasets: [
          {
            label: "Total Omset (Rp)",
            data: [...recapitulationData.value].reverse().map((d) => d.total),
            borderColor: "#4f46e5", // indigo-600
            backgroundColor: "#4f46e520",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: "#4f46e5",
          },
        ],
      },
      options: {
        ...commonOptions,
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // 2. Donut Chart (Metode Pembayaran)
  if (donutChartCanvas.value) {
    charts.value.donut = new Chart(donutChartCanvas.value, {
      type: "doughnut",
      data: {
        labels: ["Cash", "QRIS"],
        datasets: [
          {
            data: [summary.value.totalCash, summary.value.totalQris],
            backgroundColor: ["#10b981", "#3b82f6"], // emerald & blue
            borderWidth: 0,
          },
        ],
      },
      options: {
        ...commonOptions,
        cutout: "70%",
      },
    });
  }

  // 3. Bar Chart (Sewa PS vs FnB)
  if (barChartCanvas.value) {
    charts.value.bar = new Chart(barChartCanvas.value, {
      type: "bar",
      data: {
        labels: ["Sewa PS", "FnB"],
        datasets: [
          {
            label: "Pendapatan",
            data: [summary.value.pendapatanSewa, summary.value.pendapatanFnb],
            backgroundColor: ["#6366f1", "#f59e0b"], // indigo & amber
            borderRadius: 6,
          },
        ],
      },
      options: {
        ...commonOptions,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } },
        },
      },
    });
  }
};
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl pb-10">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1
            class="font-display text-2xl font-bold tracking-tight text-slate-900"
          >
            Laporan Keuangan
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Ringkasan eksekutif dan performa omset rental PlayStation
          </p>
        </div>
        <button
          class="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.97] cursor-pointer"
        >
          <Download :size="18" />
          <span>Export Excel</span>
        </button>
      </div>

      <!-- A. Bagian Atas: Ringkasan Angka Kunci -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Card 1 -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
        >
          <div
            class="absolute right-[-10px] top-[-10px] p-4 bg-indigo-50 rounded-full"
          >
            <Activity class="text-indigo-200" :size="40" />
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Total Omset Gross
          </p>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ currencyFormat(summary.totalOmset) }}
          </p>
        </div>

        <!-- Card 2 -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
        >
          <div
            class="absolute right-[-10px] top-[-10px] p-4 bg-indigo-50 rounded-full"
          >
            <Gamepad2 class="text-indigo-200" :size="40" />
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Pendapatan Sewa PS
          </p>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ currencyFormat(summary.pendapatanSewa) }}
          </p>
        </div>

        <!-- Card 3 -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
        >
          <div
            class="absolute right-[-10px] top-[-10px] p-4 bg-indigo-50 rounded-full"
          >
            <UtensilsCrossed class="text-indigo-200" :size="40" />
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Penjualan FnB
          </p>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ currencyFormat(summary.pendapatanFnb) }}
          </p>
        </div>

        <!-- Card 4 -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
        >
          <div
            class="absolute right-[-10px] top-[-10px] p-4 bg-indigo-50 rounded-full"
          >
            <TrendingUp class="text-indigo-200" :size="40" />
          </div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Total Transaksi
          </p>
          <p class="mt-2 font-display text-2xl font-bold text-slate-900">
            {{ summary.totalTransaksi }}
            <span class="text-sm font-medium text-slate-500">Trx</span>
          </p>
        </div>
      </div>

      <!-- B. Bagian Tengah: Visualisasi & Breakdown -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Line Chart: Tren Pendapatan -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <div class="mb-4">
            <h2 class="font-display text-[15px] font-semibold text-slate-900">
              Tren Pendapatan Harian
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Melihat pergerakan omset bisnis
            </p>
          </div>
          <div class="relative h-[250px] w-full">
            <canvas ref="lineChartCanvas"></canvas>
          </div>
        </div>

        <!-- Donut Chart & Cash Drawer Detail -->
        <div class="flex flex-col gap-4">
          <!-- Donut -->
          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex-1"
          >
            <div class="mb-4">
              <h2 class="font-display text-[15px] font-semibold text-slate-900">
                Metode Pembayaran
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">
                Komparasi Cash vs QRIS
              </p>
            </div>
            <div class="relative h-[180px] w-full">
              <canvas ref="donutChartCanvas"></canvas>
            </div>
          </div>

          <!-- Cash Breakdown (Untuk closing kasir) -->
          <div
            class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 shadow-sm"
          >
            <div class="flex items-center gap-2 mb-2">
              <Wallet class="text-emerald-600" :size="16" />
              <h3 class="font-semibold text-emerald-800 text-sm">
                Validasi Kasir Fisik
              </h3>
            </div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-emerald-700">Total Cash di Laci:</span>
              <span class="font-bold text-emerald-900">{{
                currencyFormat(summary.totalCash)
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-emerald-700">Total Masuk QRIS:</span>
              <span class="font-bold text-emerald-900">{{
                currencyFormat(summary.totalQris)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart Kategori (Extra Row if needed, but lets put it in a separate card above table) -->
      <div
        class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="mb-4">
          <h2 class="font-display text-[15px] font-semibold text-slate-900">
            Pendapatan per Kategori
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">
            Perbandingan pemasukan unit PS dan Food & Beverage
          </p>
        </div>
        <div class="relative h-[200px] w-full">
          <canvas ref="barChartCanvas"></canvas>
        </div>
      </div>

      <!-- C. Bagian Bawah: Tabel Rekapitulasi -->
      <section
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-white"
        >
          <div>
            <h2
              class="font-display text-[15px] font-semibold text-slate-900 flex items-center gap-2"
            >
              <CreditCard :size="18" class="text-slate-500" />
              Rekapitulasi Pendapatan Harian
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Data agregat yang digabungkan per tanggal transaksi.
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead class="bg-slate-50/80">
              <tr class="text-xs uppercase tracking-wide text-slate-500">
                <th class="px-5 py-3 font-medium">Tanggal</th>
                <th class="px-5 py-3 font-medium text-center">Total Trx</th>
                <th class="px-5 py-3 font-medium text-right">
                  Pendapatan Sewa
                </th>
                <th class="px-5 py-3 font-medium text-right">Pendapatan FnB</th>
                <th class="px-5 py-3 font-medium text-right">Cash</th>
                <th class="px-5 py-3 font-medium text-right">QRIS</th>
                <th class="px-5 py-3 font-medium text-right">Total Omset</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr
                v-for="(row, index) in recapitulationData"
                :key="index"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td
                  class="px-5 py-4 whitespace-nowrap font-medium text-slate-700"
                >
                  {{ row.date }}
                </td>
                <td class="px-5 py-4 text-center text-slate-600">
                  {{ row.trx }}
                </td>
                <td class="px-5 py-4 text-right text-slate-600">
                  {{ currencyFormat(row.rental) }}
                </td>
                <td class="px-5 py-4 text-right text-slate-600">
                  {{ currencyFormat(row.fnb) }}
                </td>
                <td class="px-5 py-4 text-right text-emerald-600 font-medium">
                  {{ currencyFormat(row.cash) }}
                </td>
                <td class="px-5 py-4 text-right text-blue-600 font-medium">
                  {{ currencyFormat(row.qris) }}
                </td>
                <td class="px-5 py-4 text-right text-slate-900 font-bold">
                  {{ currencyFormat(row.total) }}
                </td>
              </tr>
            </tbody>
            <!-- Baris Total Semua -->
            <tfoot class="bg-slate-50 border-t border-slate-200">
              <tr>
                <td class="px-5 py-4 font-bold text-slate-900">TOTAL REKAP</td>
                <td class="px-5 py-4 text-center font-bold text-slate-900">
                  {{ summary.totalTransaksi }}
                </td>
                <td class="px-5 py-4 text-right font-bold text-slate-900">
                  {{ currencyFormat(summary.pendapatanSewa) }}
                </td>
                <td class="px-5 py-4 text-right font-bold text-slate-900">
                  {{ currencyFormat(summary.pendapatanFnb) }}
                </td>
                <td class="px-5 py-4 text-right font-bold text-emerald-600">
                  {{ currencyFormat(summary.totalCash) }}
                </td>
                <td class="px-5 py-4 text-right font-bold text-blue-600">
                  {{ currencyFormat(summary.totalQris) }}
                </td>
                <td
                  class="px-5 py-4 text-right font-bold text-indigo-600 text-base"
                >
                  {{ currencyFormat(summary.totalOmset) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  </BaseLayout>
</template>
