import { ref, computed } from "vue";
import dayjs from "dayjs";

const usePlaySessionOrder = () => {
  const customerName = ref<string>("");
  const rentedUnit = ref<string>("");
  const rawStartTime = ref<dayjs.Dayjs>(dayjs());
  const rawEndTime = ref<dayjs.Dayjs>(dayjs());
  const playDuration = ref<number>(0);
  const rentPricePerHour = ref<number>(0);

  const unitRentTotal = computed(
    () => rentPricePerHour.value * playDuration.value,
  );

  return {
    customerName,
    rentedUnit,
    rawStartTime,
    rawEndTime,
    playDuration,
    rentPricePerHour,
    unitRentTotal,
  };
};

export { usePlaySessionOrder };
