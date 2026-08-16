<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  computed,
  nextTick,
} from "vue";
import Axios from "axios";
import toast from "vue3-hot-toast";
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
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
} from "@lucide/vue";
import dayjs from "dayjs";

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

// ================= State Filter Tanggal =================
const isFilterOpen = ref(false);
const filterType = ref<
  "today" | "7days" | "this_month" | "last_month" | "custom"
>("this_month");
const startDate = ref(dayjs().startOf("month").format("YYYY-MM-DD"));
const endDate = ref(dayjs().endOf("month").format("YYYY-MM-DD"));

// Label Periode Aktif untuk Tombol Trigger Header
const selectedPeriodLabel = computed(() => {
  if (filterType.value === "today") return "Hari Ini";
  if (filterType.value === "7days") return "7 Hari Terakhir";
  if (filterType.value === "this_month") return "Bulan Ini";
  if (filterType.value === "last_month") return "Bulan Lalu";
  return "Kustom Tanggal";
});

const formattedDateRange = computed(() => {
  return `${dayjs(startDate.value).format("DD MMM YYYY")} - ${dayjs(endDate.value).format("DD MMM YYYY")}`;
});

const selectPreset = (
  type: "today" | "7days" | "this_month" | "last_month",
) => {
  filterType.value = type;
  if (type === "today") {
    startDate.value = dayjs().format("YYYY-MM-DD");
    endDate.value = dayjs().format("YYYY-MM-DD");
  } else if (type === "7days") {
    startDate.value = dayjs().subtract(6, "day").format("YYYY-MM-DD");
    endDate.value = dayjs().format("YYYY-MM-DD");
  } else if (type === "this_month") {
    startDate.value = dayjs().startOf("month").format("YYYY-MM-DD");
    endDate.value = dayjs().endOf("month").format("YYYY-MM-DD");
  } else if (type === "last_month") {
    const lastMonth = dayjs().subtract(1, "month");
    startDate.value = lastMonth.startOf("month").format("YYYY-MM-DD");
    endDate.value = lastMonth.endOf("month").format("YYYY-MM-DD");
  }
  isFilterOpen.value = false;
  fetchFinancialData();
};

const applyCustomDate = () => {
  filterType.value = "custom";
  isFilterOpen.value = false;
  fetchFinancialData();
};

// Handle Click Outside Dropdown
const closeFilterOnOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".filter-dropdown-container")) {
    isFilterOpen.value = false;
  }
};

// ================= Data State =================
const loading = ref(false);
const summary = ref({
  totalTransaction: 0,
  rentalTransaction: 0,
  fnbTransaction: 0,
  total: 0,
  totalCash: 0,
  totalQris: 0,
});

interface RecapitulationRow {
  date: string;
  trx: number;
  rental: number;
  fnb: number;
  cash: number;
  qris: number;
  total: number;
}

const recapitulationData = ref<RecapitulationRow[]>([]);

// ================= Refs & Init Chart =================
const lineChartCanvas = ref<HTMLCanvasElement | null>(null);
const donutChartCanvas = ref<HTMLCanvasElement | null>(null);
const barChartCanvas = ref<HTMLCanvasElement | null>(null);

const charts = shallowRef<{ [key: string]: Chart | null }>({
  line: null,
  donut: null,
  bar: null,
});

const isEmpty = ref<boolean>(false);
const fetchFinancialData = async () => {
  recapitulationData.value = [];
  loading.value = true;
  try {
    const response = await Axios.get(
      `${import.meta.env.VITE_API_URL}/transaction/report/financial-statements`,
      {
        params: {
          start_date: startDate.value,
          end_date: endDate.value,
        },
      },
    );

    const resData = response.data;

    if (resData.summary.totalTransaction === 0) {
      isEmpty.value = true;
    } else {
      isEmpty.value = false;
      summary.value = resData.summary;
      resData.recapitulation.map((item: any) => {
        recapitulationData.value.push({
          date: dayjs(item.date).format("DD-MM-YYYY").toString(),
          trx: item.trx,
          rental: item.rental,
          fnb: item.fnb,
          cash: item.cash,
          qris: item.qris,
          total: item.total,
        });
      });

      await nextTick();
      renderCharts();
    }
  } catch (err) {
    toast.error("Gagal memuat data laporan keuangan.");
  } finally {
    loading.value = false;
  }
};

const renderCharts = () => {
  Object.values(charts.value).forEach((chart) => chart?.destroy());

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

  // 1. Line Chart
  if (lineChartCanvas.value) {
    charts.value.line = new Chart(lineChartCanvas.value, {
      type: "line",
      data: {
        labels: [...recapitulationData.value].reverse().map((d) => d.date),
        datasets: [
          {
            label: "Total Omset (Rp)",
            data: [...recapitulationData.value].reverse().map((d) => d.total),
            borderColor: "#4f46e5",
            backgroundColor: "#4f46e520",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
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

  // 2. Donut Chart
  if (donutChartCanvas.value) {
    charts.value.donut = new Chart(donutChartCanvas.value, {
      type: "doughnut",
      data: {
        labels: ["Cash", "QRIS"],
        datasets: [
          {
            data: [summary.value.totalCash, summary.value.totalQris],
            backgroundColor: ["#10b981", "#3b82f6"],
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

  // 3. Bar Chart
  if (barChartCanvas.value) {
    charts.value.bar = new Chart(barChartCanvas.value, {
      type: "bar",
      data: {
        labels: ["Sewa PS", "FnB"],
        datasets: [
          {
            label: "Pendapatan",
            data: [
              summary.value.rentalTransaction,
              summary.value.fnbTransaction,
            ],
            backgroundColor: ["#6366f1", "#f59e0b"],
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

onMounted(() => {
  document.title = "Laporan Keuangan | Reno Rental";
  window.addEventListener("click", closeFilterOnOutside);
  fetchFinancialData();
});

onUnmounted(() => {
  window.removeEventListener("click", closeFilterOnOutside);
  Object.values(charts.value).forEach((chart) => chart?.destroy());
});
</script>

<template>
  <BaseLayout>
    <div class="mx-auto max-w-7xl pb-10">
      <!-- Header dengan Integrated Filter Dropdown -->
      <div
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1
            class="font-display text-2xl font-bold tracking-tight text-slate-900"
          >
            Laporan Keuangan
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Ringkasan eksekutif & omset rental PlayStation
          </p>
        </div>

        <!-- Group Actions (Filter + Export) -->
        <div class="flex items-center gap-3">
          <!-- ================= ELEGANT DROPDOWN FILTER ================= -->
          <div class="relative filter-dropdown-container">
            <button
              @click="isFilterOpen = !isFilterOpen"
              class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
            >
              <CalendarIcon :size="15" class="text-indigo-600" />
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

          <!-- Export Button -->
          <button
            class="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.97] cursor-pointer"
          >
            <Download :size="16" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div v-if="!isEmpty">
        <!-- A. Bagian Atas: Ringkasan Angka Kunci -->
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute -right-2.5 -top-2.5 p-4 bg-indigo-50 rounded-full"
            >
              <Activity class="text-indigo-200" :size="40" />
            </div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total Omset Gross
            </p>
            <p class="mt-2 font-display text-2xl font-bold text-slate-900">
              {{ currencyFormat(summary.total) }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute -right-2.5 -top-2.5 p-4 bg-indigo-50 rounded-full"
            >
              <Gamepad2 class="text-indigo-200" :size="40" />
            </div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Pendapatan Sewa PS
            </p>
            <p class="mt-2 font-display text-2xl font-bold text-slate-900">
              {{ currencyFormat(summary.rentalTransaction) }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute -right-2.5 -top-2.5 p-4 bg-indigo-50 rounded-full"
            >
              <UtensilsCrossed class="text-indigo-200" :size="40" />
            </div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Penjualan FnB
            </p>
            <p class="mt-2 font-display text-2xl font-bold text-slate-900">
              {{ currencyFormat(summary.fnbTransaction) }}
            </p>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute -right-2.5 -top-2.5 p-4 bg-indigo-50 rounded-full"
            >
              <TrendingUp class="text-indigo-200" :size="40" />
            </div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total Transaksi
            </p>
            <p class="mt-2 font-display text-2xl font-bold text-slate-900">
              {{ summary.totalTransaction }}
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
                Tren Pendapatan
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">
                Grafik omset harian pada periode terfilter
              </p>
            </div>
            <div class="relative h-62.5 w-full">
              <canvas ref="lineChartCanvas"></canvas>
            </div>
          </div>

          <!-- Donut Chart & Cash Drawer Detail -->
          <div class="flex flex-col gap-4">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex-1"
            >
              <div class="mb-4">
                <h2
                  class="font-display text-[15px] font-semibold text-slate-900"
                >
                  Metode Pembayaran
                </h2>
                <p class="mt-0.5 text-xs text-slate-500">
                  Komparasi Cash vs QRIS
                </p>
              </div>
              <div class="relative h-45 w-full">
                <canvas ref="donutChartCanvas"></canvas>
              </div>
            </div>

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
                <span class="text-sm text-emerald-700"
                  >Total Cash di Laci:</span
                >
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

        <!-- Bar Chart Kategori -->
        <div
          class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="mb-4">
            <h2 class="font-display text-[15px] font-semibold text-slate-900">
              Pendapatan per Kategori
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Sewa PS vs Food & Beverage
            </p>
          </div>
          <div class="relative h-50 w-full">
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
                Data terkelompokkan per tanggal dalam rentang periode pilihan
              </p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-slate-100 text-left text-sm"
            >
              <thead class="bg-slate-50/80">
                <tr class="text-xs uppercase tracking-wide text-slate-500">
                  <th class="px-5 py-3 font-medium">Tanggal</th>
                  <th class="px-5 py-3 font-medium text-center">Total Trx</th>
                  <th class="px-5 py-3 font-medium text-right">
                    Pendapatan Sewa
                  </th>
                  <th class="px-5 py-3 font-medium text-right">
                    Pendapatan FnB
                  </th>
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
                <tr v-if="!recapitulationData.length">
                  <td colspan="7" class="px-5 py-10 text-center text-slate-500">
                    Tidak ada data transaksi pada periode ini.
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td class="px-5 py-4 font-bold text-slate-900">
                    TOTAL REKAP
                  </td>
                  <td class="px-5 py-4 text-center font-bold text-slate-900">
                    {{ summary.totalTransaction }}
                  </td>
                  <td class="px-5 py-4 text-right font-bold text-slate-900">
                    {{ currencyFormat(summary.rentalTransaction) }}
                  </td>
                  <td class="px-5 py-4 text-right font-bold text-slate-900">
                    {{ currencyFormat(summary.fnbTransaction) }}
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
                    {{ currencyFormat(summary.total) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <div v-else>
        <div
          class="relative flex min-h-120 w-full flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-center"
        >
          <!-- Animated SVG Custom Illustration -->
          <div class="relative mb-6 flex h-36 w-36 items-center justify-center">
            <svg
              class="h-full w-full select-none"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Shadow Bawah Melayang -->
              <ellipse
                cx="100"
                cy="165"
                rx="50"
                ry="8"
                class="animate-pulse fill-indigo-900/10"
              />

              <!-- Floating Group: Kalender + Dokumen -->
              <g class="animate-bounce-slow">
                <!-- Backing Sheet / Document -->
                <rect
                  x="60"
                  y="40"
                  width="80"
                  height="100"
                  rx="16"
                  class="fill-white stroke-slate-200"
                  stroke-width="3"
                />
                <line
                  x1="75"
                  y1="60"
                  x2="105"
                  y2="60"
                  class="stroke-slate-200"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <line
                  x1="75"
                  y1="75"
                  x2="125"
                  y2="75"
                  class="stroke-slate-200"
                  stroke-width="3"
                  stroke-linecap="round"
                />

                <!-- Main Calendar Box (Rotated Accent) -->
                <rect
                  x="50"
                  y="55"
                  width="100"
                  height="90"
                  rx="20"
                  class="fill-indigo-600 shadow-xl"
                />

                <!-- Top Header Line -->
                <path
                  d="M50 75C50 63.9543 58.9543 55 70 55H130C141.046 55 150 63.9543 150 75V80H50V75Z"
                  class="fill-indigo-700"
                />

                <!-- Binder Pins -->
                <circle cx="75" cy="55" r="4" class="fill-white" />
                <circle cx="125" cy="55" r="4" class="fill-white" />

                <!-- Calendar Empty Ring Cross -->
                <circle
                  cx="100"
                  cy="110"
                  r="18"
                  class="fill-indigo-500/50 stroke-indigo-200"
                  stroke-width="2"
                />
                <path
                  d="M93 103L107 117M107 103L93 117"
                  class="stroke-white"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </g>

              <!-- Floating Particles/Stars -->
              <g class="animate-pulse">
                <path
                  d="M155 45L157 50L162 52L157 54L155 59L153 54L148 52L153 50L155 45Z"
                  class="fill-amber-400"
                />
                <path
                  d="M40 120L41 123L44 124L41 125L40 128L39 125L36 124L39 123L40 120Z"
                  class="fill-indigo-400"
                />
                <circle cx="160" cy="130" r="3" class="fill-indigo-300" />
              </g>
            </svg>
          </div>

          <!-- Title & Description (Text Diperbesar) -->
          <h3
            class="font-display text-xl font-bold tracking-tight text-slate-900"
          >
            Data Transaksi Tidak Ditemukan
          </h3>

          <p class="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Sistem tidak menemukan adanya riwayat transaksi atau rekapitulasi
            omset pada periode tanggal
            <br />
            <span
              v-if="startDate && endDate"
              class="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm"
            >
              <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ startDate }} &nbsp;—&nbsp; {{ endDate }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
<style>
@keyframes bounceSlow {
  0%,
  100% {
    transform: translateY(-20px);
  }
  50% {
    transform: translateY(12px);
  }
}

.animate-bounce-slow {
  animation: bounceSlow 3.5s ease-in-out infinite;
}
</style>
