import { Router } from "express";
import { EmployeeController } from "./employee.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router()
const employeeController = new EmployeeController()

router.post("/", authenticate, employeeController.create)
router.get("/", authenticate, employeeController.findAll)
router.get("/options", authenticate, employeeController.findOption)
router.get("/:id", authenticate, employeeController.findById)
router.put("/:id", authenticate, employeeController.update)
router.patch("/:id/status", authenticate, employeeController.updateStatus)
router.delete("/:id", authenticate, employeeController.delete)

export default router