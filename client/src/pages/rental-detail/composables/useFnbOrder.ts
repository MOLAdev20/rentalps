/**
 * ============================================================================
 * DEVELOPMENT GUIDE: FnB Live Order Composable
 * ============================================================================
 *
 * 📌 FUNGSI:
 * Composable ini digunakan untuk mengelola item FnB yang TERHUBUNG LANGSUNG (Sync)
 * ke database/backend pada sesi transaksi yang sedang aktif (e.g. Halaman Detail Sesi / index.vue).
 *
 * ⚠️ PERBEDAAN DENGAN `useFnbDraft`:
 * - Setiap aksi (increment, decrement, add, remove) LANGSUNG mengirim request API/Axios
 *   ke endpoint backend (`order/fnb-item/...`).
 * - Membutuhkan `order_id` aktif untuk mengeksekusi aksi.
 * - Digunakan saat transaksi sudah memiliki ID di database.
 *
 * 💡 KAPAN MENGGUNAKAN INI:
 * Digunakan pada halaman detail rental / detail order di mana perubahanan item FnB
 * harus langsung ter-reflect/tersimpan di server secara real-time.
 *
 * ============================================================================
 */
import { ref, computed } from "vue";
import axios from "../../../helper/axios";
import { useAlertDialog } from "../../../composables/useAlertDialog";

export function useFnbOrder(orderId: number) {
  interface FnbItem {
    id: number;
    name: string;
    price: number;
  }

  interface OrderedFnbItem {
    id: number; // order id
    fnb_item_id: number;
    name: string;
    price: number;
    qty: number;
  }

  const { confirm } = useAlertDialog();
  const fnbItems = ref<OrderedFnbItem[]>([]);
  const sidebarStatus = ref<boolean>(false);

  const modifyFnbQty = async (orderId: number, type: "increase" | "decrease") =>
    axios.patch(`order/fnb-item/change-qty/${orderId}/${type}`, () => {});

  async function incrementQty(item: OrderedFnbItem) {
    try {
      await modifyFnbQty(item.id, "increase");
      item.qty += 1;
    } catch (err) {}
  }

  async function decrementQty(item: OrderedFnbItem) {
    if (item.qty <= 1) {
      removeFnbItem(item.id);
      return;
    }
    await modifyFnbQty(item.id, "decrease");
    item.qty -= 1;
  }

  const pickFnbItem = async (catalogItem: FnbItem) => {
    console.log("pickFnbItem", catalogItem);
    axios.post(
      "order/fnb-item/add",
      {
        order_id: orderId,
        fnb_id: catalogItem.id,
      },
      (response: any) => {
        const existing = fnbItems.value.find(
          (i) => i.fnb_item_id === catalogItem.id,
        );
        if (existing) {
          existing.qty += 1;
        } else {
          fnbItems.value.push({
            ...catalogItem,
            id: response.data.newFnbOrder.id,
            fnb_item_id: catalogItem.id,
            qty: 1,
          });
          console.log(fnbItems.value);
        }

        console.log(`${catalogItem.name} ditambahkan`);
      },
    );

    setTimeout(() => (sidebarStatus.value = false), 250);
  };

  function removeFnbItem(id: number) {
    confirm({
      title: "Hapus Item?",
      message: "Apakah kamu yakin?",
      variant: "warning",
    }).then((result) => {
      if (result) {
        fnbItems.value = fnbItems.value.filter((i) => i.id !== id);
        axios.delete("order/fnb-item/" + id, () => {});
      }
    });
  }

  const fnbTotal = computed(() =>
    fnbItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
  );
  return {
    fnbItems,
    pickFnbItem,
    incrementQty,
    decrementQty,
    removeFnbItem,
    fnbTotal,
    sidebarStatus,
  };
}
