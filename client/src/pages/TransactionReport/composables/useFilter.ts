import { ref, computed } from "vue";
import dayjs from "dayjs";

const useFilter = (onFilterChange: () => void) => {
  const isFilterOpen = ref(false);
  const filterType = ref<
    "today" | "7days" | "this_month" | "last_month" | "custom"
  >("this_month");
  const startDate = ref(dayjs().startOf("month").format("YYYY-MM-DD"));
  const endDate = ref(dayjs().endOf("month").format("YYYY-MM-DD"));

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
    onFilterChange();
  };

  const applyCustomDate = () => {
    filterType.value = "custom";
    isFilterOpen.value = false;
    onFilterChange();
  };

  // Filter by status, trigger dari klik score card

  const statusFilter = ref<"all" | "complete" | "cancel" | "pending">("all");

  const statusLabel = computed(() => {
    if (statusFilter.value === "complete") return "Berhasil";
    if (statusFilter.value === "cancel") return "Gagal";
    if (statusFilter.value === "pending") return "Menunggu Pembayaran";
    return "Semua Status";
  });

  const selectStatus = (status: "all" | "complete" | "cancel" | "pending") => {
    // Klik ulang score card yang sedang aktif = lepas filter
    statusFilter.value =
      statusFilter.value === status && status !== "all" ? "all" : status;
    onFilterChange();
  };

  const closeFilterOnOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".filter-dropdown-container")) {
      isFilterOpen.value = false;
    }
  };

  return {
    isFilterOpen,
    selectedPeriodLabel,
    formattedDateRange,
    selectPreset,
    filterType,
    startDate,
    endDate,
    applyCustomDate,
    selectStatus,
    statusFilter,
    statusLabel,
    closeFilterOnOutside,
  };
};

export default useFilter;
