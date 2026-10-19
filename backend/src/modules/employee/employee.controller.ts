import { NextFunction, Request, Response } from "express";
import { EmployeeService } from "./employee.service.js";
import { createEmployeeSchema, updateStatusEmployeeSchema } from "./employee.validator.js";
import { success } from "../../utils/response.js";

const employeeService = new EmployeeService()

export class EmployeeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createEmployeeSchema.parse(req.body)
    
            const result = await employeeService.create({
                ...data,
                birthDate: new Date(data.birthDate),
            })
    
            return success(res, result, "Karyawan berhasil dibuat", 201)
        } catch (error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await employeeService.findAll(req.query)

            return success(res, result, "Karyawan berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await employeeService.findById(Number(req.params.id))

            return success(res, result, "Karyawan berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findOption(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await employeeService.findOption()

            return success(res, result, "Opsi karyawan berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const {status} = updateStatusEmployeeSchema.parse(req.body)

            const result = await employeeService.updateStatus(Number(req.params.id), status)

            return success(res, result, "Status karyawan berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createEmployeeSchema.parse(req.body)

            const result = await employeeService.update(Number(req.params.id), {
                ...data,
                birthDate: new Date(data.birthDate)
            })

            return success(res, result, "Karyawan berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await employeeService.delete(Number(req.params.id))

            return success(res, null, "Karyawan berhasil dihapus", 200)
        } catch (error) {
            next(error)
        }
    }
}