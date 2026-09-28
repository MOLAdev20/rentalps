import { ref } from "vue";

const rentedHistorySidebarStatus = ref<boolean>(false);

const openRentHistorySidebar = () => {
  rentedHistorySidebarStatus.value = true;
};

export function useRentedHistorySidebar() {
  return {
    rentedHistorySidebarStatus,
    openRentHistorySidebar,
  };
}
