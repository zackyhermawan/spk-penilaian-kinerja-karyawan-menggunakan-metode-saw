import { NextFunction, Request, Response } from "express";
import { PeriodEmployeeService } from "./periodEmployee.service.js";
import { success } from "../../utils/response.js";

const periodEmployeeService = new PeriodEmployeeService()

export class PeriodEmployeeController {
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodEmployeeService.findAll()

            return success(res, result, "Periode karyawan berhasil diambil", 200)
        } catch (error) {

        }
    }
}