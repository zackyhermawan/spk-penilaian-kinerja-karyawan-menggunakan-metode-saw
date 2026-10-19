import { Router } from "express";
import { PositionCriteriaController } from "./positionCriteria.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const positionCriteriaController = new PositionCriteriaController()

router.post("/", authenticate, positionCriteriaController.create)
router.get("/", authenticate, positionCriteriaController.findAll)
router.get("/weight-summary", authenticate, positionCriteriaController.weightSummary)
router.put("/:id", authenticate, positionCriteriaController.update)
router.delete("/:id", authenticate, positionCriteriaController.delete)

export default router