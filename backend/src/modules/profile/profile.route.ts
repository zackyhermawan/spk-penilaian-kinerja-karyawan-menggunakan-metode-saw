import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const profileController = new ProfileController()

router.get("/", authenticate, profileController.getProfile)
router.patch("/password", authenticate, profileController.changePassword)

export default router