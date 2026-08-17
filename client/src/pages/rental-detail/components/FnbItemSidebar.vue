<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Axios from "axios";
import { CircleX, PlusCircleIcon, Search, Utensils } from "@lucide/vue";
import { formatRupiah } from "../../../helper";

type Item = {
  id: number;
  name: string;
  price: number;
};

const searchQuery = ref<String>("");
const fnbItems = ref<Item[]>([]);
const sidebarStatus = defineModel("sidebar-status", {
  type: Boolean,
  default: false,
});

const emit = defineEmits<{
  pickFnbItem: [Item: Item];
}>();

onMounted(async () => {
  try {
    const response = await Axios.get("http://localhost:8080/fnb");

    const responseItems = response.data.fnb;

    if (responseItems.length > 0) {
      responseItems.forEach((el: any) => {
        fnbItems.value.push({
          id: el.id,
          name: el.title,
          price: el.price,
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

const closeSidebar = () => {
  sidebarStatus.value = false;
};

const filteredFnbItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return fnbItems.value;
  return fnbItems.value.filter((item) => item.name.toLowerCase().includes(q));
});
</script>
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarStatus"
        @click="closeSidebar"
        class="fixed inset-0 bg-black/40 z-40"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="sidebarStatus"
        class="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
      >
        <div
          class="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0"
        >
          <h3 class="font-display font-semibold text-[15px] text-gray-900">
            Pilih Item FnB
          </h3>
          <button
            @click="closeSidebar"
            class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer"
          >
            <CircleX :size="20" />
          </button>
        </div>

        <div class="px-5 py-3 border-b border-gray-100 shrink-0">
          <div class="relative">
            <Search
              :size="20"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari Makanan/Minuman"
              class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          <button
            v-for="item in filteredFnbItems"
            :key="item.id"
            @click="emit('pickFnbItem', item)"
            class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-indigo-50 active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div
              class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-xl shrink-0"
            >
              <Utensils />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ item.name }}
              </p>
              <p class="text-xs text-gray-400">
                {{ formatRupiah(item.price) }}
              </p>
            </div>
            <PlusCircleIcon :size="20" class="text-gray-500" />
          </button>

          <div
            v-if="filteredFnbItems.length === 0"
            class="text-center py-10 text-sm text-gray-400"
          >
            Item "{{ searchQuery }}" tidak ditemukan
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
