import { useRentedHistorySidebar } from "../../../composables/useRentedHistorySidebar";
import { useFnb } from "./useFnbDraft";
import { usePlaySession } from "./usePlaySessionDraft";
import { ref } from "vue";

const useCreateOrder = (unitId: number) => {
  const { fnbTotal } = useFnb();
  const { unitTitle, grandTotal, startPlay, totalRentPrice } =
    usePlaySession(unitId);
  const { rentedHistorySidebarStatus, openRentHistorySidebar } =
    useRentedHistorySidebar();

  return {
    fnbTotal,
    unitTitle,
    grandTotal,
    startPlay,
    totalRentPrice,
    rentedHistorySidebarStatus,
    openRentHistorySidebar,
  };
};

export { useCreateOrder };
