import { ref, onMounted, computed } from "vue";
import axios from "../../../helper/axios";
import { useFnbOrder } from "./useFnbOrder";
import { usePayment } from "./usePayment";
import { usePlaySessionOrder } from "./usePlaySessionOrder";
import { useRouter } from "vue-router";

const useOrderPage = (unitId: number, orderId: number) => {
  const router = useRouter();

  const fnb = useFnbOrder(orderId);
  const payment = usePayment(orderId);

  const playSession = usePlaySessionOrder();

  onMounted(() => {
    axios.get(
      `order/by-unit/${unitId}${orderId ? "?order=" + orderId : ""}`,
      (response: any) => {
        const { status, customer_name, rentedUnitOrder, transaction } =
          response.data;

        playSession.customerName.value = customer_name;
        playSession.rentedUnit.value = rentedUnitOrder[0].unitItem.title;
        playSession.rawStartTime.value = rentedUnitOrder[0].start_time;
        playSession.rawEndTime.value = rentedUnitOrder[0].end_time;
        payment.paymentStatus.value = status;

        if (transaction.length > 0) {
          if (transaction[0].payment_method != "pending_payment") {
            payment.paymentMethod.value = transaction[0].payment_method;
          }

          console.log(payment.paymentMethod.value);
          if (payment.paymentMethod.value === "qris") {
            payment.paymentLink.value = transaction[0];
            payment.qrisUrl.value = payment.paymentLink.value.snap_url;

            payment.paymentSelectionMode.value = false;
          }
        }

        playSession.playDuration.value = rentedUnitOrder[0].play_time;
        playSession.rentPricePerHour.value =
          rentedUnitOrder[0].unitItem.rent_price;

        const fnbItemOrder = response.data.fnbItemOrder;
        fnbItemOrder.forEach((item: any) => {
          fnb.fnbItems.value.push({
            id: item.id,
            fnb_item_id: item.fnbItem.id,
            name: item.fnbItem.title,
            price: item.fnbItem.price,
            qty: item.quantity,
          });
        });

        document.title = `Detail Sewa ${rentedUnitOrder[0].unitItem.title} - RentalPS`;
      },
      (err: any) => {
        console.log(err);
        router.replace({
          name: "NotFound",
        });
      },
    );
  });

  const rentedHistorySidebarStatus = ref<boolean>(false);

  const openRentHistorySidebar = () => {
    rentedHistorySidebarStatus.value = true;
  };

  const grandTotal = computed(
    () => playSession.unitRentTotal.value + fnb.fnbTotal.value,
  );

  return {
    ...fnb,
    ...payment,
    ...playSession,
    rentedHistorySidebarStatus,
    openRentHistorySidebar,
    grandTotal,
  };
};

export { useOrderPage };
