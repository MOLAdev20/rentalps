import { ref } from "vue";
import { useFnb } from "./useFnbDraft";
import { usePlaySession } from "./usePlaySessionDraft";

const useCreateOrder = (unitId: number) => {
  const { fnbTotal } = useFnb();
  const { unitTitle, grandTotal, startPlay, totalRentPrice, loadSession } =
    usePlaySession(unitId);

  const rentedHistorySidebarStatus = ref(false);

  const openRentHistorySidebar = () => {
    rentedHistorySidebarStatus.value = !rentedHistorySidebarStatus.value;
  };

  return {
    fnbTotal,
    unitTitle,
    grandTotal,
    startPlay,
    totalRentPrice,
    rentedHistorySidebarStatus,
    openRentHistorySidebar,
    loadSession,
  };
};

export { useCreateOrder };
