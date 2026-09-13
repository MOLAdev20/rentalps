import { useFnb } from "./useFnbDraft";
import { usePlaySession } from "./usePlaySessionDraft";

const useCreateOrder = (unitId: number) => {
  const { fnbTotal } = useFnb();
  const { unitTitle, grandTotal, startPlay, totalRentPrice } =
    usePlaySession(unitId);

  return {
    fnbTotal,
    unitTitle,
    grandTotal,
    startPlay,
    totalRentPrice,
  };
};

export { useCreateOrder };
