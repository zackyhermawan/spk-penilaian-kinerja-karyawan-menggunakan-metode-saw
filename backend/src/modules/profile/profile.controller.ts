import { NextFunction, Request, Response } from "express";
import { ProfileService } from "./profile.service.js";
import { success } from "../../utils/response.js";
import { changePasswordSchema } from "./profile.validator.js";

const profileService = new ProfileService()

export class ProfileController {
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await profileService.getProfile(Number(req.user?.id))

            return success(res, result, "Profile berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const {newPassword} = changePasswordSchema.parse(req.body)

            await profileService.changePassword(Number(req.user?.id), newPassword)

            return success(res, null, "Kata sandi berhasil diubah", 200)
        } catch (error) {
            next(error)
        }
    }
}