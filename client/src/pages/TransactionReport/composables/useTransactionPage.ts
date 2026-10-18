import { onMounted, onUnmounted, ref, watch } from "vue";
import toast from "vue3-hot-toast";
import axios from "../../../helper/axios.ts";
import dayjs from "dayjs";
import useFilter from "./useFilter.ts";
import useTransactionDetail from "./useTransactionDetail.ts";
import useFloatingMenu from "./useFloatingMenu.ts";

interface FnbOrderItem {
  id: number;
  title: string;
  price: number;
  qty: number;
  subTotal: number;
}

export interface TransactionLogs {
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

const loadingRef = ref<HTMLElement | null>(null);
const isEmpty = ref<boolean>(false);
const page = ref<number>(1);
const isFetching = ref<boolean>(false);

// ================= Ringkasan Score Card =================
const summary = ref({
  all: { count: 0, amount: 0 },
  complete: { count: 0, amount: 0 },
  cancel: { count: 0, amount: 0 },
  pending: { count: 0, amount: 0 },
});

const filterComposable = useFilter(() => {
  transactionData.value = [];
  page.value = 1;
  isEmpty.value = false;
  isFetching.value = false;
  fetchTransactionData();
});
const transactionDetailComposable = useTransactionDetail();
const floatingMenuComposable = useFloatingMenu(
  transactionData,
  transactionDetailComposable.openDetail,
  transactionDetailComposable.closeDetail,
  transactionDetailComposable.selectedTransaction,
);

// ================= Filter Status (klik Score Card) =================

const fetchTransactionData = () => {
  if (isFetching.value || isEmpty.value) return;
  isFetching.value = true;

  axios.getWithParams(
    "transaction",
    {
      page: page.value,
      start_date: filterComposable.startDate.value,
      end_date: filterComposable.endDate.value,
      status:
        filterComposable.statusFilter.value === "all"
          ? undefined
          : filterComposable.statusFilter.value,
    },
    (response: any) => {
      const payload = response.data;
      const rows = payload.data ?? [];

      if (payload.summary) {
        summary.value = payload.summary;
      }

      if (rows.length === 0) {
        isEmpty.value = true;
        isFetching.value = false;
        return;
      }

      rows.forEach((item: any) => {
        transactionData.value.push({
          id: item.id,
          transaction_no: item.transaction_no,
          customer_name: item.customer_name,
          playDuration: item.units[0].play_time,
          total: item.total,
          created_at: item.created_at,
          unit_ps: item.units[0].title,
          payment_method: item.payment_method,
          status: item.status,
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

      page.value += 1;
      isFetching.value = false;
    },
    () => {
      isFetching.value = false;
      toast.error("Data gagal dimuat. Harap coba lagi");
    },
  );
};

watch(loadingRef, (newEl: HTMLElement | null, oldEl: HTMLElement | null) => {
  if (oldEl) {
    observer.unobserve(oldEl);
  }

  if (newEl) {
    observer.observe(newEl);
  }
});

const formatDateTime = (value: string) =>
  dayjs(value).format("DD-MM-YYYY HH:mm");
const formatTime = (value: string) => dayjs(value).format("HH:mm");

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !isEmpty.value) {
      fetchTransactionData();
    }
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  },
);

const useTransactionPage = () => {
  onMounted(() => {
    document.title = "Laporan Transaksi | Rent.Play!";

    if (loadingRef.value && !isEmpty.value) {
      observer.observe(loadingRef.value);
    }

    window.addEventListener("click", floatingMenuComposable.handleClickOutside);
    window.addEventListener("click", filterComposable.closeFilterOnOutside);
    window.addEventListener("scroll", floatingMenuComposable.closeMenu, true);
    window.addEventListener("resize", floatingMenuComposable.closeMenu);
  });

  onUnmounted(() => {
    window.removeEventListener(
      "click",
      floatingMenuComposable.handleClickOutside,
    );
    window.removeEventListener("click", filterComposable.closeFilterOnOutside);
    window.removeEventListener(
      "scroll",
      floatingMenuComposable.closeMenu,
      true,
    );
    window.removeEventListener("resize", floatingMenuComposable.closeMenu);
  });

  return {
    ...filterComposable,
    ...transactionDetailComposable,
    ...floatingMenuComposable,
    transactionData,
    formatDateTime,
    isEmpty,
    formatTime,
    summary,
    loadingRef,
  };
};

export default useTransactionPage;
