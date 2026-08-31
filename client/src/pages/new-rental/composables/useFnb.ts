import { ref, type ComputedRef, computed } from "vue";
import { useAlertDialog } from "../../../composables/useAlertDialog";

interface FnBItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export const useFnb = () => {
  const { confirm } = useAlertDialog();
  const selectedFnBItems = ref<FnBItem[]>([]);
  const sidebarStatus = ref(false);

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
