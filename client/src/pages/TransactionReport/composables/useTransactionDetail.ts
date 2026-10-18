import { ref, computed } from "vue";
import type { TransactionLogs } from "./useTransactionPage";

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

const useTransactionDetail = () => {
  return {
    isSidebarOpen,
    selectedTransaction,
    fnbTotal,
    sewaTotal,
    closeDetail,
    openDetail,
  };
};

export default useTransactionDetail;
