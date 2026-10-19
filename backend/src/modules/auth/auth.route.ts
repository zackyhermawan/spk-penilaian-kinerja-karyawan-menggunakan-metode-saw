import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const authController = new AuthController()

router.post("/login", authController.login)
router.get("/profile", authenticate, authController.getProfile)

export default router