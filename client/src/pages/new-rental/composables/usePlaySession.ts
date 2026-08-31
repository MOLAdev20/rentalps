import { ref, computed, type ComputedRef } from "vue";
import axios from "../../../helper/axios.ts";
import { useRouter } from "vue-router";
import { useAlertDialog } from "../../../composables/useAlertDialog.ts";
import { useFnb } from "./useFnb.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

const { fnbTotal, selectedFnBItems } = useFnb();

export const usePlaySession = (unitId: number) => {
  const customerName = ref<string>();
  const currentTime = ref<string>(dayjs().format("HH:mm:ss"));
  const playDuration = ref<number>(1);
  const unitTitle = ref<string>();
  const unitRentPrice = ref<number>(0);
  const todaysFormattedDate = ref<string>(
    dayjs().locale("id").format("DD MMMM YYYY"),
  );

  const router = useRouter();
  const { alert, confirm } = useAlertDialog();
  let tick = 0;

  const loadSession = () => {
    axios.get(
      `unit/available/${unitId}`,
      (response: any) => {
        unitTitle.value = response.data.title;
        unitRentPrice.value = response.data.rent_price;

        tick = setInterval(() => {
          currentTime.value = dayjs().format("HH:mm:ss");
          todaysFormattedDate.value = dayjs()
            .locale("id")
            .format("DD MMMM YYYY");
        }, 1000);
      },
      () => {
        router.replace({ name: "NotFound" });
      },
    );
  };

  const resetInterval = () => {
    clearInterval(tick);
  };

  const estimatedEndTime: ComputedRef<string> = computed(() => {
    if (!playDuration.value) return "-";

    // Ambil jam hari ini dengan waktu dari startTime
    const baseTime = dayjs(`2026-08-09 ${currentTime.value}`);

    // Tambahkan durasi berdasarkan state playDuration
    return baseTime.add(playDuration.value, "hour").format("HH:mm:ss");
  });

  const decreasePlayDuration = () => {
    if (playDuration.value > 0) {
      playDuration.value--;
    }
  };

  const increasePlayDuration = () => {
    playDuration.value++;
  };

  const startPlay = async () => {
    if (!customerName.value) {
      alert({
        title: "Nama penyewa belum diisi",
        message: "Silahkan isi nama penyewa",
        variant: "warning",
      });
      return;
    }

    const askProceed: Boolean = await confirm({
      title: "Mulai Main?",
      message: "Unit dimainkan sampai waktu yang ditentukan",
      variant: "warning",
      confirmText: "Oke, Lanjut",
      cancelText: "Batal",
    });

    if (askProceed) {
      dayjs.extend(utc);

      let transactionFnb = selectedFnBItems.value.map((item) => ({
        fnb_item: item.id,
        quantity: item.qty,
      }));

      const endTime = dayjs().add(playDuration.value, "hour").utc().format();

      const payload = {
        customer_name: customerName.value,
        transaction_rental: [
          {
            unit_item: Number(unitId),
            play_time: playDuration.value,
            start_time: dayjs().utc().format(),
            end_time: endTime,
          },
        ],
        transaction_fnb: transactionFnb,
      };

      axios.post(
        "order",
        payload,
        (response: any) => {
          if (response.status === 200)
            router.replace({
              name: "rent-detail",
              params: { id: String(unitId) },
            });
        },
        () => {
          return alert({
            title: "Terjadi Kesalahan",
            message: "Harap coba lagi",
            variant: "danger",
          });
        },
      );
    }
  };

  const totalRentPrice: ComputedRef<number> = computed(() => {
    return playDuration.value * unitRentPrice.value;
  });

  const grandTotal = computed(() => totalRentPrice.value + fnbTotal.value);

  return {
    customerName,
    playDuration,
    currentTime,
    todaysFormattedDate,
    unitTitle,
    unitRentPrice,
    loadSession,
    estimatedEndTime,
    decreasePlayDuration,
    increasePlayDuration,
    resetInterval,
    startPlay,
    grandTotal,
    totalRentPrice,
  };
};
