<script setup lang="ts">
import { onMounted, ref } from "vue";

const loaderRef = ref<HTMLElement | null>(null);

const items = ref<string[]>(
  Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
);

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      console.log("Elemen sentinel terlihat di viewport. Memuat data baru...");
    }
  },
  {
    root: null, // Menggunakan viewport sebagai root
    rootMargin: "0px",
  },
);

onMounted(() => {
  observer.observe(loaderRef.value as HTMLElement);
});

const loading = ref<boolean>(true);
</script>
<template>
  <div style="max-width: 400px; margin: 0 auto; padding: 20px">
    <h2>Infinite Scroll Demo (Vue 3)</h2>

    <ul>
      <li
        v-for="(item, index) in items"
        :key="index"
        style="
          padding: 15px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
          list-style: none;
        "
      >
        {{ item }}
      </li>
    </ul>

    <!-- 3. Elemen Sentinel yang dipantau oleh IntersectionObserver -->
    <div ref="loaderRef" style="text-align: center; padding: 10px">
      <p v-if="loading">Loading data baru...</p>
    </div>
  </div>
</template>
