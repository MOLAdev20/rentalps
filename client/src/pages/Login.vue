<script setup lang="ts">
import { ref } from "vue";
import Axios from "axios";
import { useRouter } from "vue-router";
import screen from "../../public/screen.jpeg";
import { Gamepad2, User, Lock, Eye, EyeOff, LoaderCircle } from "@lucide/vue";
import { onMounted } from "vue";

const router = useRouter();

const username = ref<string>("");
const password = ref<string>("");
const showPassword = ref<boolean>(false);
const rememberMe = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");

onMounted(() => {
  document.title = "Login | Reno Rental";
});

async function handleLogin() {
  errorMessage.value = "";

  if (!username.value || !password.value) {
    errorMessage.value = "Username dan password wajib diisi";
    return;
  }

  isLoading.value = true;

  try {
    const response = await Axios.post(`${import.meta.env.VITE_API_URL}/auth`, {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", response.data.token);

    router.replace("/dashboard");
  } catch (err: any) {
    console.log(err);
    const message = err.response.data.message;

    if (message == "invalid-credentials") {
      errorMessage.value = "Username atau password salah";
    } else {
      errorMessage.value = "Error";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen grid grid-cols-3 bg-white">
    <!-- ============ Kolom 2: Ilustrasi ============ -->
    <div
      class="hidden lg:flex col-span-1 relative overflow-hidden bg-indigo-950"
    >
      <!-- gambar -->
      <img :src="screen" class="absolute inset-0 w-full h-full object-cover" />

      <!-- overlay gelap, warna khas aplikasi -->
      <div class="absolute inset-0 bg-black/50"></div>

      <!-- dot pattern tipis di atas overlay -->
      <div
        class="absolute inset-0"
        style="
          background-image: radial-gradient(
            circle at 1px 1px,
            #fff 1px,
            transparent 0
          );
          background-size: 26px 26px;
          opacity: 0.08;
        "
      ></div>

      <!-- brand mark kecil -->
      <div class="absolute z-10 top-8 left-8 flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center"
        >
          <Gamepad2 :size="16" class="text-white" />
        </div>
        <span class="font-display font-semibold text-white text-sm"
          >Reno Rental POS</span
        >
      </div>

      <!-- testimoni -->
      <div class="absolute z-10 bottom-8 left-8 right-8">
        <div
          class="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5"
        >
          <p class="text-white text-sm leading-relaxed">
            "Semua kebutuhan buat ngatur sewa PS, dari billing sampe laporan
            keuangan, kekumpul rapi di satu tempat."
          </p>
          <div class="mt-4 flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold"
            >
              A
            </div>
            <div>
              <p class="text-white text-xs font-semibold">Ahmad Maulana</p>
              <p class="text-indigo-100 text-[11px]">Owner Rental PS</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ Kolom 1: Form Login ============ -->
    <div
      class="col-span-2 flex items-center justify-center px-6 py-12 sm:px-10"
    >
      <div class="w-full max-w-sm">
        <!-- Brand -->
        <div class="flex items-center gap-2.5 mb-10">
          <div
            class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0"
          >
            <Gamepad2 :size="18" class="text-white" />
          </div>
          <span class="font-display font-bold text-gray-900 text-[15px]"
            >Reno Rental POS</span
          >
        </div>

        <h1
          class="font-display text-2xl font-bold tracking-tight text-gray-900"
        >
          Selamat Datang Kembali
        </h1>
        <p class="mt-1.5 text-sm text-gray-500">
          Masuk ke dashboard buat kelola rental PS kamu
        </p>

        <!-- Alert error -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="errorMessage"
            class="mt-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
            {{ errorMessage }}
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" class="mt-7 space-y-4">
          <!-- Username -->
          <div>
            <label class="text-xs font-medium text-gray-600 mb-1.5 block"
              >Username</label
            >
            <div class="relative">
              <User
                class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                v-model="username"
                type="text"
                autocomplete="username"
                placeholder="Masukkan username"
                class="w-full h-11 pl-10 pr-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="text-xs font-medium text-gray-600 mb-1.5 block"
              >Password</label
            >
            <div class="relative">
              <Lock
                class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Masukkan password"
                class="w-full h-11 pl-10 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                :aria-label="
                  showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                "
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- Remember me + forgot password -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer"
              />
              <span class="text-xs text-gray-600">Ingat saya</span>
            </label>
            <a
              href="#"
              class="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Lupa password?
            </a>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            <LoaderCircle v-if="isLoading" :size="16" class="animate-spin" />
            {{ isLoading ? "Memproses..." : "Masuk" }}
          </button>
        </form>

        <p class="mt-7 text-center text-xs text-gray-400">
          Butuh akses? Hubungi admin sistem kamu.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(-4deg);
  }
  50% {
    transform: translateY(-12px) rotate(-1deg);
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
.pop-dot {
  opacity: 0;
  transform: scale(0);
  transform-origin: center;
  animation: popIn 3.2s ease-in-out infinite;
}
.pop-dot:nth-last-child(1) {
  animation-delay: 0s;
}
.pop-dot:nth-last-child(2) {
  animation-delay: 0.8s;
}
.pop-dot:nth-last-child(3) {
  animation-delay: 1.6s;
}
.pop-dot:nth-last-child(4) {
  animation-delay: 2.4s;
}
</style>
