import { NextFunction, Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";
import { success } from "../../utils/response.js";

const dashboardService = new DashboardService()

export class DashboardController {
    async getDashboardAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await dashboardService.getAdminDashboard(Number(req.query.periodId), Number(req.query.positionId))

            return success(res, result, "Dashboard admin berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async getDashboardEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await dashboardService.getEmployeeDashboard(Number(req.user?.id), Number(req.query.periodId))

            return success(res, result, "Dashboard karyawan berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }
}