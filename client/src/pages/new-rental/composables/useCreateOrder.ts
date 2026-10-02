import { useRentedHistorySidebar } from "../../../composables/useRentedHistorySidebar";
import { useFnb } from "./useFnbDraft";
import { usePlaySession } from "./usePlaySessionDraft";
import { ref } from "vue";

const useCreateOrder = (unitId: number) => {
  const { fnbTotal } = useFnb();
  const { unitTitle, grandTotal, startPlay, totalRentPrice, loadSession } =
    usePlaySession(unitId);
  const { rentedHistorySidebarStatus, openRentHistorySidebar } =
    useRentedHistorySidebar();

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
