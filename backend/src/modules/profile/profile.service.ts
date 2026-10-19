import { AppError } from "../../errors/AppError.js";
import { ProfileRepository } from "./profile.repository.js";
import bcrypt from "bcrypt"

export class ProfileService {
    private profileRepository = new ProfileRepository()

    async changePassword(userId: number, newPassword: string) {
        const user = await this.profileRepository.findByUserId(userId)
        if(!user) {
            throw new AppError("Pengguna tidak ditemukan", 404)
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await this.profileRepository.changePassword(userId, hashedPassword)

        return {
            message: "Kata sandi berhasil diubah"
        }
    }

    async getProfile(userId: number) {
        const user = await this.profileRepository.findByUserId(userId)
        if(!user) {
            throw new AppError("Pengguna tidak ditemukan", 404)
        }

        return this.profileRepository.findByUserId(userId)
    }
}