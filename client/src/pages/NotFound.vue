<script setup lang="ts"></script>
<template>
  <body class="min-h-screen flex items-center justify-center px-6 py-16">
    <div class="w-full max-w-md">
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden fade-up fade-up-1"
      >
        <!-- Status bar ala header aplikasi -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <svg
            class="w-4 h-4 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <h3 class="font-display font-semibold text-[15px] text-gray-900">
            Status Halaman
          </h3>
        </div>

        <!-- Ilustrasi: joystick "kosong sinyal" -->
        <div class="pt-10 pb-6 flex justify-center fade-up fade-up-2">
          <svg
            width="130"
            height="110"
            viewBox="0 0 130 110"
            fill="none"
            class="float-controller"
          >
            <ellipse cx="65" cy="102" rx="46" ry="6" fill="#E5E7EB" />
            <path
              d="M30 46c0-9 8-16 18-16h34c10 0 18 7 18 16l6 30c2 10-6 19-16 19-6 0-11-3-14-8l-3-5a10 10 0 00-8-5H65a10 10 0 00-8 5l-3 5c-3 5-8 8-14 8-10 0-18-9-16-19l6-30z"
              fill="#EEF2FF"
              stroke="#6366F1"
              stroke-width="2.5"
            />
            <circle
              cx="46"
              cy="52"
              r="9"
              fill="white"
              stroke="#6366F1"
              stroke-width="2.5"
            />
            <path
              d="M46 47.5v9M41.5 52h9"
              stroke="#6366F1"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <circle cx="85" cy="48" r="4" fill="#C7D2FE" class="blink-dot" />
            <circle cx="94" cy="56" r="4" fill="#C7D2FE" class="blink-dot" />
            <circle cx="85" cy="64" r="4" fill="#C7D2FE" class="blink-dot" />
            <circle cx="76" cy="56" r="4" fill="#C7D2FE" class="blink-dot" />
          </svg>
        </div>

        <!-- Isi pesan -->
        <div class="px-8 pb-8 text-center">
          <p
            class="font-mono text-6xl font-extrabold tracking-wider text-gray-900 tabular-nums fade-up fade-up-2"
          >
            404
          </p>
          <h1
            class="font-display text-lg font-bold text-gray-900 mt-3 fade-up fade-up-3"
          >
            Sesi Halaman Terputus
          </h1>
          <p
            class="text-sm text-gray-500 mt-2 leading-relaxed fade-up fade-up-3"
          >
            Halaman yang kamu cari nggak ketemu di sistem. Mungkin link-nya
            salah, unit-nya udah dipindah, atau halamannya emang belum tersedia.
          </p>

          <div class="mt-7 flex items-center gap-3 fade-up fade-up-4">
            <a
              href="/"
              class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-[0.97] transition-all"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Kembali ke Dashboard
            </a>
            <button
              onclick="window.history.back()"
              class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-[0.97] transition-all"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Halaman Sebelumnya
            </button>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 mt-5 fade-up fade-up-4">
        PS Rental POS &middot; Kode error 404
      </p>
    </div>
  </body>
</template>
<style>
* {
  font-family: "Plus Jakarta Sans", sans-serif;
}
.font-display {
  font-family: "Plus Jakarta Sans", sans-serif;
}

body {
  background-color: #f9fafb;
  background-image: radial-gradient(
    circle at 1px 1px,
    #e5e7eb 1px,
    transparent 0
  );
  background-size: 28px 28px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(-6deg);
  }
  50% {
    transform: translateY(-10px) rotate(-2deg);
  }
}
.float-controller {
  animation: float 4s ease-in-out infinite;
}

@keyframes popIn {
  0%,
  75%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  15%,
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.blink-dot {
  opacity: 0;
  transform: scale(0);
  transform-origin: center;
  animation: popIn 3.2s ease-in-out infinite;
}

/* muncul gantian satu-satu, jeda 0.8s tiap titik */
.blink-dot:nth-last-child(1) {
  animation-delay: 0s;
}
.blink-dot:nth-last-child(2) {
  animation-delay: 0.8s;
}
.blink-dot:nth-last-child(3) {
  animation-delay: 1.6s;
}
.blink-dot:nth-last-child(4) {
  animation-delay: 2.4s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-up {
  animation: fadeUp 0.6s ease-out both;
}
.fade-up-1 {
  animation-delay: 0.05s;
}
.fade-up-2 {
  animation-delay: 0.15s;
}
.fade-up-3 {
  animation-delay: 0.25s;
}
.fade-up-4 {
  animation-delay: 0.35s;
}
</style>
