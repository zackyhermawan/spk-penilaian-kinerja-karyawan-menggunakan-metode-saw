import type { LoginPayload } from "../types/auth";
import api from "./api";

class AuthService {
    async login(data: LoginPayload) {
        const response = await api.post("/auth/login", data)

        return response.data.data
    }
}

export default new AuthService()