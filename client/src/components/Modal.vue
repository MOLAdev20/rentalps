<script setup lang="ts">
import { X } from "@lucide/vue";
import { onBeforeUnmount, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    description?: string;
    maxWidth?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
  }>(),
  {
    description: "",
    maxWidth: "max-w-md",
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const close = () => emit("update:modelValue", false);

const handleKeydown = (event: KeyboardEvent) => {
  if (props.closeOnEscape && props.modelValue && event.key === "Escape")
    close();
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
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
        v-if="modelValue"
        class="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`modal-title-${title}`"
        @click="closeOnBackdrop && close()"
      >
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          class="relative w-full rounded-2xl bg-white shadow-2xl"
          :class="maxWidth"
          @click.stop
        >
          <div
            class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
          >
            <div>
              <h2
                :id="`modal-title-${title}`"
                class="font-display text-[15px] font-semibold"
              >
                {{ title }}
              </h2>
              <p v-if="description" class="mt-0.5 text-xs text-gray-500">
                {{ description }}
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup modal"
              class="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              @click="close"
            >
              <X />
            </button>
          </div>

          <div class="px-5 py-5">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2.5 border-t border-gray-100 px-5 py-4"
          >
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
