import { reactive, readonly } from "vue";

export type AlertVariant = "default" | "success" | "danger" | "warning";

export interface AlertOptions {
  title: string;
  message?: string;
  variant?: AlertVariant;
  confirmText?: string;
  cancelText?: string;
}

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: AlertVariant;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  resolve: ((value: boolean) => void) | null;
}

// state singleton di luar setup() → sengaja, biar bisa dipanggil
// dari komponen manapun tanpa perlu passing props/emit berjenjang
const state = reactive<AlertState>({
  isOpen: false,
  title: "",
  message: "",
  variant: "default",
  confirmText: "Konfirmasi",
  cancelText: "Batal",
  showCancel: false,
  resolve: null,
});

function open(options: AlertOptions, showCancel: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    state.title = options.title;
    state.message = options.message ?? "";
    state.variant = options.variant ?? "default";
    state.confirmText = options.confirmText ?? "Konfirmasi";
    state.cancelText = options.cancelText ?? "Batal";
    state.showCancel = showCancel;
    state.resolve = resolve;
    state.isOpen = true;
  });
}

/** Alert satu tombol, buat notifikasi/informasi. Resolve true begitu ditutup. */
function alertDialog(options: AlertOptions) {
  return open(options, false);
}

/** Alert dua tombol, buat konfirmasi aksi. Resolve true (konfirmasi) / false (batal). */
function confirmDialog(options: AlertOptions) {
  return open(options, true);
}

function handleConfirm() {
  state.resolve?.(true);
  state.isOpen = false;
  state.resolve = null;
}

function handleCancel() {
  state.resolve?.(false);
  state.isOpen = false;
  state.resolve = null;
}

export function useAlertDialog() {
  return {
    state: readonly(state),
    alert: alertDialog,
    confirm: confirmDialog,
    handleConfirm,
    handleCancel,
  };
}
