import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { loginSchema } from "./auth.validator.js";
import { success } from "../../utils/response.js";

const authService = new AuthService()

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = loginSchema.parse(req.body)

            const result = await authService.login(username, password)

            return success(res, result, "Login berhasil", 200)
        } catch (error) {
            next(error)
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.getProfile(Number(req.user?.id))

            return success(res, result, "Berhasil mengambil profil", 200)
        } catch (error) {
            next(error)
        }
    }
}