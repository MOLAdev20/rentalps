<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useAlertDialog } from "../composables/useAlertDialog";

const { state, handleConfirm, handleCancel } = useAlertDialog();

const variantMap = {
  default: {
    ring: "bg-indigo-50 text-indigo-600",
    btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  success: {
    ring: "bg-emerald-50 text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  danger: {
    ring: "bg-red-50 text-red-500",
    btn: "bg-red-600 hover:bg-red-700 shadow-red-200",
    path: "M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    ring: "bg-amber-50 text-amber-500",
    btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
} as const;

const style = computed(() => variantMap[state.variant]);

function onBackdropClick() {
  // backdrop diklik = dianggap batal (aman buat confirm dialog),
  // buat alert satu tombol tetep bakal resolve(false) — caller cukup
  // pakai `await alert(...)` tanpa peduli return value-nya
  handleCancel();
}

function onKeydown(e: KeyboardEvent) {
  if (!state.isOpen) return;
  if (e.key === "Escape") handleCancel();
  if (e.key === "Enter") handleConfirm();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.isOpen"
        @click="onBackdropClick"
        class="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      >
        <Transition
          enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.34,1.8,0.64,1.8)]"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="state.isOpen"
            @click.stop
            role="alertdialog"
            aria-modal="true"
            class="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div class="p-6 text-center">
              <div
                class="mx-auto w-18 h-18 rounded-full flex items-center justify-center"
                :class="style.ring"
              >
                <svg
                  class="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :d="style.path"
                  />
                </svg>
              </div>

              <h3
                class="font-display font-semibold text-[16px] text-gray-900 mt-4"
              >
                {{ state.title }}
              </h3>
              <p
                v-if="state.message"
                class="text-sm text-gray-500 mt-2 leading-relaxed"
              >
                {{ state.message }}
              </p>
            </div>

            <div class="px-6 pb-6 flex items-center gap-3">
              <button
                v-if="state.showCancel"
                @click="handleCancel"
                class="flex-1 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer"
              >
                {{ state.cancelText }}
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 h-10 rounded-xl text-white text-sm font-semibold active:scale-[0.97] transition-all cursor-pointer"
                :class="style.btn"
              >
                {{ state.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
