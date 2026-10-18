import { ref, type Ref, computed } from "vue";
import { useAlertDialog } from "../../../composables/useAlertDialog.ts";
import toast from "vue3-hot-toast";
import type { TransactionLogs } from "./useTransactionPage.ts";

export default function useFloatingMenu(
  transactionData: Ref<TransactionLogs[]>,
  openDetail: (t: TransactionLogs) => void,
  closeDetail: () => void,
  selectedTransaction: Ref<TransactionLogs | null>,
) {
  const { confirm } = useAlertDialog();

  const activeMenuId = ref<number | null>(null);
  const menuPosition = ref({ top: 0, left: 0 });

  const activeTransaction = computed(
    () =>
      transactionData.value.find((t) => t.id === activeMenuId.value) ?? null,
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

  function lihatDetail(transaction: TransactionLogs) {
    closeMenu();
    openDetail(transaction);
  }

  function cetakStruk(transaction: TransactionLogs) {
    closeMenu();
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
      transactionData.value = transactionData.value.filter(
        (t) => t.id !== transaction.id,
      );
      if (selectedTransaction.value?.id === transaction.id) closeDetail();
      toast.success("Transaksi berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus transaksi");
    }
  }

  return {
    handleClickOutside,
    lihatDetail,
    toggleMenu,
    activeMenuId,
    menuPosition,
    cetakStruk,
    hapusTransaksi,
    closeMenu,
    activeTransaction,
  };
}
