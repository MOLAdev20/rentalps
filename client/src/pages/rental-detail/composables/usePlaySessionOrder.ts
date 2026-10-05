import { ref, computed } from "vue";
import dayjs from "dayjs";
import axios from "../../../helper/axios";
import { useAlertDialog } from "../../../composables/useAlertDialog";
import { useRouter } from "vue-router";

const usePlaySessionOrder = (unitId: number, orderId: number) => {
  const { alert, confirm } = useAlertDialog();
  const router = useRouter();

  const customerName = ref<string>("");
  const rentedUnit = ref<string>("");
  const rawStartTime = ref<dayjs.Dayjs>(dayjs());
  const rawEndTime = ref<dayjs.Dayjs>(dayjs());
  const playDuration = ref<number>(0);
  const rentPricePerHour = ref<number>(0);

  // Guard lokal biar tombol gak nge-trigger request dobel
  let isAddingPlayTime = false;
  let isReducingPlayTime = false;
  let isCancellingOrder = false;

  const unitRentTotal = computed(
    () => rentPricePerHour.value * playDuration.value,
  );

  /**
   * Minta konfirmasi ke pegawai, lalu tambah durasi main penyewa 1 jam.
   * Backend akan menambah `play_time` & `end_time` pada RentedUnitOrder
   * (beserta sub_total dan total order).
   */
  const addPlayTime = async () => {
    if (isAddingPlayTime) return;

    const isConfirmed = await confirm({
      title: "Tambah 1 Jam?",
      message: "Durasi main dan tagihan sewa akan bertambah",
      variant: "warning",
      confirmText: "Ya, Tambah 1 Jam",
      cancelText: "Batal",
    });

    if (!isConfirmed) return;

    isAddingPlayTime = true;

    axios.post(
      "order/add-play-time",
      {
        order_id: orderId,
        unit_item_id: unitId,
      },
      (response: any) => {
        isAddingPlayTime = false;

        const updated = response.data.data;
        playDuration.value = updated.play_time;
        rawEndTime.value = dayjs(updated.end_time);

        alert({
          title: "Berhasil",
          message: "Durasi main berhasil ditambah 1 jam.",
          variant: "success",
        });
      },
      () => {
        isAddingPlayTime = false;

        alert({
          title: "Gagal Menambah Durasi",
          message: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "danger",
        });
      },
    );
  };

  /**
   * Minta konfirmasi ke pegawai, lalu kurangi durasi main penyewa 1 jam.
   * Backend akan mengurangi `play_time` & `end_time` pada RentedUnitOrder
   * (beserta sub_total dan total order).
   */
  const reducePlayTime = async () => {
    if (isReducingPlayTime) return;

    const isConfirmed = await confirm({
      title: "Kurangi 1 Jam?",
      message: "Durasi main dan tagihan sewa akan berkurang",
      variant: "warning",
      confirmText: "Ya, Kurangi 1 Jam",
      cancelText: "Batal",
    });

    if (!isConfirmed) return;

    isReducingPlayTime = true;

    axios.post(
      "order/reduce-play-time",
      {
        order_id: orderId,
        unit_item_id: unitId,
      },
      (response: any) => {
        isReducingPlayTime = false;

        const updated = response.data.data;
        playDuration.value = updated.play_time;
        rawEndTime.value = dayjs(updated.end_time);

        alert({
          title: "Berhasil",
          message: "Durasi main berhasil dikurangi 1 jam.",
          variant: "success",
        });
      },
      (err: any) => {
        isReducingPlayTime = false;

        if (err?.response?.data?.message === "minimum-play-time-reached") {
          alert({
            title: "Durasi Sudah Minimal",
            message: "Durasi sewa minimal 1 jam, tidak bisa dikurangi lagi.",
            variant: "warning",
          });
          return;
        }

        alert({
          title: "Gagal Mengurangi Durasi",
          message: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "danger",
        });
      },
    );
  };

  /**
   * Minta konfirmasi ke pegawai, lalu batalkan order sewa.
   * Backend akan mengubah status order ke `cancel` dan status unit ke `available`.
   * Setelah berhasil, pengguna diarahkan kembali ke halaman daftar sewa.
   */
  const cancelOrder = async () => {
    if (isCancellingOrder) return;

    const isConfirmed = await confirm({
      title: "Batalkan Sewa?",
      message:
        "Order akan dibatalkan dan unit akan kembali tersedia. Tindakan ini tidak bisa diurungkan.",
      variant: "warning",
      confirmText: "Ya, Batalkan Sewa",
      cancelText: "Tidak",
    });

    if (!isConfirmed) return;

    isCancellingOrder = true;

    axios.patchWithData(
      "order/cancel",
      { order_id: orderId },
      () => {
        isCancellingOrder = false;
        router.replace({ name: "rent" });
      },
      (err: any) => {
        isCancellingOrder = false;

        if (err?.response?.data?.message === "order-already-completed") {
          alert({
            title: "Tidak Bisa Dibatalkan",
            message: "Order ini sudah selesai atau sudah dibatalkan sebelumnya.",
            variant: "warning",
          });
          return;
        }

        alert({
          title: "Gagal Membatalkan Sewa",
          message: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "danger",
        });
      },
    );
  };

  return {
    customerName,
    rentedUnit,
    rawStartTime,
    rawEndTime,
    playDuration,
    rentPricePerHour,
    unitRentTotal,
    addPlayTime,
    reducePlayTime,
    cancelOrder,
  };
};

export { usePlaySessionOrder };

