import { AuthRepository } from "./auth.repository.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { AppError } from "../../errors/AppError.js";

export class AuthService {
    private authRepository = new AuthRepository()

    async login(username: string, password: string) {
        const user = await this.authRepository.findUserByUsername(username)
        if (!user) {
            throw new AppError("Pengguna tidak ditemukan", 404)
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new AppError("Kata sandi salah", 400)
        }
        
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
        })
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        }
    }

    async getProfile(id: number) {
        return await this.authRepository.findProfile(id)
    }
}