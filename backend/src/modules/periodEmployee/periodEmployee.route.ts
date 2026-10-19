import { Router } from "express";
import { PeriodEmployeeController } from "./periodEmployee.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const periodEmployeeController = new PeriodEmployeeController()

router.get("/", authenticate, periodEmployeeController.findAll)

export default router