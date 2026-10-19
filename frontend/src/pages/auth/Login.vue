<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
    username: "",
    password: ""
})

const loading = ref(false)
const errorMessage = ref("")

const handleLogin = async () => {
    errorMessage.value = ""
    loading.value = true

    try {
        await authStore.login(form)

        router.push({
            name: "dashboards"
        })
    } catch (error: any) {
        errorMessage.value =
            error.response?.data?.message ??
            "Login gagal"
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1>Login</h1>

            <form
                @submit.prevent="handleLogin"
            >
                <div>
                    <label>
                        Username
                    </label>

                    <input
                        v-model="form.username"
                        type="text"
                        autocomplete="username"
                    />
                </div>

                <div>
                    <label>
                        Password
                    </label>

                    <input
                        v-model="form.password"
                        type="password"
                        autocomplete="current-password"
                    />
                </div>

                <p
                    v-if="errorMessage"
                    class="error"
                >
                    {{ errorMessage }}
                </p>

                <button
                    type="submit"
                    :disabled="loading"
                >
                    {{
                        loading
                            ? "Loading..."
                            : "Login"
                    }}
                </button>
            </form>
        </div>
    </div>
</template>