<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import { Lock, User } from "lucide-vue-next"

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errorMessage = ref("")

const form = reactive({
  username: "",
  password: ""
})

const handleLogin = async () => {
  errorMessage.value = ""
  loading.value = true

  try {
    await authStore.login(form)

    router.push({
      name: "dashboards"
    })
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Login Gagal"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-100/60 via-slate-50 to-indigo-100/80 p-5 font-sans">
    <div class="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white p-8 text-center shadow-xl shadow-indigo-100/50 border border-slate-100">
      
      <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
        <Lock class="h-6 w-6 text-amber-500" />
      </div>

      <h1 class="text-xl font-bold text-slate-800">Selamat Datang</h1>
      <p class="mt-1 text-xs text-slate-400">Silakan login untuk melanjutkan</p>

      <form @submit.prevent="handleLogin" class="mt-7 flex w-full flex-col gap-4">
        <div class="relative flex items-center">
          <span class="pointer-events-none absolute left-4 text-indigo-400">
            <User class="h-5 w-5" />
          </span>
          <input v-model="form.username" type="text" placeholder="Username" autocomplete="username" required class="w-full rounded-xl bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none border border-transparent transition duration-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/>
        </div>

        <div class="relative flex items-center">
          <span class="pointer-events-none absolute left-4 text-indigo-400">
            <Lock class="h-5 w-5" />
          </span>
          <input v-model="form.password" type="password" placeholder="Password" autocomplete="current-password" required class="w-full rounded-xl bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none border border-transparent transition duration-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"/>
        </div>

        <p v-if="errorMessage" class="text-left text-xs font-medium text-red-500">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading" class="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed">
          {{ loading ? "Loading..." : "Masuk Sekarang" }}
        </button>
      </form>

    </div>
  </div>
</template>