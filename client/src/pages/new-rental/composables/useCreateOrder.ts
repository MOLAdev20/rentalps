import { useRentedHistorySidebar } from "../../../composables/useRentedHistorySidebar";
import { useFnb } from "./useFnbDraft";
import { usePlaySession } from "./usePlaySessionDraft";

const useCreateOrder = (unitId: number) => {
  const { fnbTotal } = useFnb();
  const { unitTitle, grandTotal, startPlay, totalRentPrice, loadSession } =
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
    loadSession,
  };
};

export { useCreateOrder };
