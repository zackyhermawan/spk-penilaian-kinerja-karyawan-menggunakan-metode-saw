import { Router } from "express";
import { PositionController } from "./position.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const positionController = new PositionController()

router.post("/", authenticate, positionController.create)
router.get("/", authenticate, positionController.findAll)
router.get("/options", authenticate, positionController.findOption)
router.get("/:id/criteria", authenticate, positionController.findCriteriaByPosition)
router.put("/:id", authenticate, positionController.update)
router.delete("/:id", authenticate, positionController.delete)

export default router