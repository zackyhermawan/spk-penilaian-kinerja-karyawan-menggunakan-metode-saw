import { Router } from "express";
import { EvaluationController } from "./evaluation.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const evaluationController = new EvaluationController()

router.post("/", authenticate, evaluationController.saveDraft)
router.post("/calculate", authenticate, evaluationController.calculate)
router.get("/period/:periodId", authenticate, evaluationController.findByPeriodAndPosition)
router.get("/history", authenticate, evaluationController.getEmployeeHistory)
router.get("/history/:periodId", authenticate, evaluationController.getEmployeeHistoryDetail)
router.get("/:id", authenticate, evaluationController.findEvaluation)

// router.post("/", authenticate, evaluationController.create)

export default router