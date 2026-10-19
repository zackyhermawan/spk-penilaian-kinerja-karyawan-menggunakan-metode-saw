import { Router } from "express";
import { PeriodController } from "./period.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const periodController = new PeriodController()

router.post("/", authenticate, periodController.create)
router.get("/", authenticate, periodController.findAll)
router.get("/options", authenticate, periodController.findOption)
router.get("/active", authenticate, periodController.findActive)
router.get("/:id/positions", authenticate, periodController.findPositionsByPeriod)
router.get("/:id/employees", authenticate, periodController.findEmployeesByPeriodAndPosition)
router.get("/:id", authenticate, periodController.findById)
router.put("/:id", authenticate, periodController.update)
router.delete("/:id", authenticate, periodController.delete)

export default router