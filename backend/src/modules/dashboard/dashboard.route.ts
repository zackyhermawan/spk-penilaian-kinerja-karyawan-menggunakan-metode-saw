import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const dashboardController = new DashboardController()

router.get("/admin", authenticate, dashboardController.getDashboardAdmin)
router.get("/employee", authenticate, dashboardController.getDashboardEmployee)

export default router