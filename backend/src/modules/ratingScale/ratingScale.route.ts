import { Router } from "express";
import { RatingScaleController } from "./ratingScale.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const ratingScaleController = new RatingScaleController()

router.post("/", authenticate, ratingScaleController.create)
router.get("/", authenticate, ratingScaleController.findAll)
router.put("/:id", authenticate, ratingScaleController.update)
router.delete("/:id", authenticate, ratingScaleController.delete)

export default router