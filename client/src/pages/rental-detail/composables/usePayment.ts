import { onUnmounted, ref, watch } from "vue";
import { useAlertDialog } from "../../../composables/useAlertDialog";
import axios from "../../../helper/axios";

const { alert, confirm } = useAlertDialog();
const apiBaseUrl = import.meta.env.VITE_API_URL;

const usePayment = (orderId: number) => {
  const paymentMethod = ref<string>("");
  const paymentLink = ref<{
    snap_url: string;
    snap_expiry: string;
    status: string;
  }>({
    snap_url: "",
    snap_expiry: "",
    status: "",
  });
  const paymentSelectionMode = ref<boolean>(true);
  const showQrisModal = ref(false);
  const qrisUrl = ref<string>("");
  const isLoadingQris = ref(false);
  const paymentStatus = ref<string>("pending");
  const turnOffUnit = ref<boolean>(false);
  let paymentEventSource: EventSource | null = null;

  const closePaymentEventSource = () => {
    paymentEventSource?.close();
    paymentEventSource = null;
  };

  const listenForPaymentComplete = () => {
    closePaymentEventSource();

    paymentEventSource = new EventSource(
      `${apiBaseUrl}/transaction/payment/sse/${orderId}`,
    );

    paymentEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { status?: string };

        if (data.status === "complete") {
          paymentStatus.value = "complete";
          showQrisModal.value = false;
          paymentSelectionMode.value = false;
          closePaymentEventSource();
          alert({
            title: "Pembayaran Berhasil",
            message: "Pembayaran QRIS telah diterima.",
            variant: "success",
          });
        }
      } catch (error) {
        console.error("Invalid payment SSE message", error);
      }
    };

    paymentEventSource.onerror = () => {
      // EventSource akan mencoba terhubung kembali secara otomatis.
      if (paymentEventSource?.readyState === EventSource.CLOSED) {
        console.error("Payment SSE connection closed");
      }
    };
  };

  const handlePayment = async () => {
    if (paymentMethod.value == "") {
      return;
    }

    confirm({
      title: "Lanjutkan Pembayaran?",
      message: "Mohon siapkan uang tunai atau metode pembayaran yang dipilih",
      variant: "warning",
    }).then((result) => {
      if (result) {
        if (paymentMethod.value === "qris") {
          axios.post(
            "transaction/payment/generate-qris",
            {
              order_id: orderId,
            },
            (response: any) => {
              const { snap_url } = response.data.transaction;

              if (!snap_url) {
                throw new Error("Snap URL tidak ditemukan");
              }

              qrisUrl.value = snap_url;
              showQrisModal.value = true;
              paymentSelectionMode.value = false;
            },
            (err: any) => {
              console.log(err);
              // showToast("Gagal membuat QRIS. Silakan coba lagi.");
            },
          );
          isLoadingQris.value = false;
        } else {
          // Logic bayar tunai biasa
          axios.post(
            `transaction/payment/proceed-payment`,
            {
              order_id: orderId,
              payment_method: paymentMethod.value,
              turn_off_unit: turnOffUnit.value ? 1 : 0,
            },
            () => {
              alert({
                title: "Pembayaran Berhasil",
                message: "Terimakasih telah bermain!",
                variant: "success",
              });
              // router.push({ name: "rent" });
            },
            () => {
              // showToast("Gagal meyimpan pembayaran. Silakan coba lagi.");
            },
          );
        }
      }
    });
  };

  const switchPaymentMode = async () => {
    const isAccept = await confirm({
      title: "Ganti Metode Pembayaran?",
      message: "Apakah kamu yakin?",
      confirmText: "Ya, Ganti",
      cancelText: "Batal",
      variant: "warning",
    });

    if (isAccept) {
      paymentSelectionMode.value = true;
    }
  };

  watch(showQrisModal, (isVisible) => {
    if (isVisible && qrisUrl.value) {
      listenForPaymentComplete();
    } else if (!isVisible) {
      closePaymentEventSource();
    }
  });

  onUnmounted(closePaymentEventSource);

  return {
    paymentMethod,
    paymentLink,
    paymentSelectionMode,
    showQrisModal,
    qrisUrl,
    isLoadingQris,
    paymentStatus,
    handlePayment,
    switchPaymentMode,
    turnOffUnit,
    listenForPaymentComplete,
    closePaymentEventSource,
  };
};

export { usePayment };
