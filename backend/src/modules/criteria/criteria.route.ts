import { Router } from "express";
import { CriteriaController } from "./criteria.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const criteriaController = new CriteriaController()

router.post("/", authenticate, criteriaController.create)
router.get("/", authenticate, criteriaController.findAll)
router.get("/options", authenticate, criteriaController.findOption)
router.get("/position", authenticate, criteriaController.findOption)
router.put("/:id", authenticate, criteriaController.update)
router.patch("/:id/status", authenticate, criteriaController.updateStatus)
router.delete("/:id", authenticate, criteriaController.delete)

export default router