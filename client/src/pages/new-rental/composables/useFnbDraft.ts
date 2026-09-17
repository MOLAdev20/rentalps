/**
 * ============================================================================
 * DEVELOPMENT GUIDE: FnB Draft Composable
 * ============================================================================
 *
 * 📌 FUNGSI:
 * Composable ini digunakan khusus untuk mengelola state FnB secara LOCAL (Client-side)
 * pada skenario sebelum order tersimpan ke database.
 *
 * ⚠️ PERBEDAAN DENGAN `useFnbOrder`:
 * - Komposable ini HANYA mengubah reactive state di memory.
 * - TIDAK ADA komunikasi / sync HTTP Request (Axios) ke API backend di dalamnya.
 * - Semua penambahan/pengurangan item dilakukan di array lokal.
 *
 * 💡 KAPAN MENGGUNAKAN INI:
 * Digunakan ketika user masih memilih/merancang orderan (Drafting) dan belum
 * memiliki `order_id` resmi dari database.
 *
 * ============================================================================
 */

import { ref, type ComputedRef, computed } from "vue";
import { useAlertDialog } from "../../../composables/useAlertDialog";

interface FnBItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const selectedFnBItems = ref<FnBItem[]>([]);
const sidebarStatus = ref(false);
export const useFnb = () => {
  const { confirm } = useAlertDialog();

  const removeFnbItem = (item: FnBItem) => {
    confirm({
      title: "Hapus item ini?",
      message: `Buang ${item.name}?`,
      cancelText: "Batal",
      confirmText: "Ya, Hapus",
      variant: "warning",
    }).then((result) => {
      if (result)
        selectedFnBItems.value = selectedFnBItems.value.filter(
          (i) => i !== item,
        );
    });
  };

  const incrementQty = (item: FnBItem) => {
    item.qty += 1;
  };

  const decrementQty = (item: FnBItem) => {
    if (item.qty <= 1) {
      removeFnbItem(item);
      return;
    }
    item.qty -= 1;
  };

  const pickFnbItem = (catalogItem: {
    id: number;
    name: string;
    price: number;
  }) => {
    const existing = selectedFnBItems.value.find(
      (i) => i.id === catalogItem.id,
    );
    if (existing) {
      existing.qty += 1;
    } else {
      selectedFnBItems.value.push({ ...catalogItem, qty: 1 });
    }

    setTimeout(() => (sidebarStatus.value = false), 250);
  };

  const fnbTotal: ComputedRef<number> = computed(() =>
    selectedFnBItems.value.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    ),
  );

  return {
    selectedFnBItems,
    sidebarStatus,
    removeFnbItem,
    incrementQty,
    decrementQty,
    pickFnbItem,
    fnbTotal,
  };
};
