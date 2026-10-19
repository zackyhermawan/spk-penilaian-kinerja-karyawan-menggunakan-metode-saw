import { defineStore } from "pinia";
import { getToken, getUser, removeToken, removeUser, setToken, setUser } from "../utils/storage";
import type { LoginPayload } from "../types/auth"
import authService from "../services/auth.service"

export const useAuthStore = defineStore("auth", {
    state: ()=> ({
        token: getToken(),
        user: getUser(),
        isAuthenticate: !!getToken()
    }),

    actions: {
       async login(data: LoginPayload) {
        const result = await authService.login(data)

        this.token = result.token
        this.user = result.user
        this.isAuthenticate = true

        setToken(result.token)
        setUser(result.user)

        return result
       },

       async logout() {
        this.token = null
        this.user = null
        this.isAuthenticate = false

        removeToken()
        removeUser()
       }
    }
})
