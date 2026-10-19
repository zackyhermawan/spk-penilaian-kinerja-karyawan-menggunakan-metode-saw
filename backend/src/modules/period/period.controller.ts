import { NextFunction, Request, Response } from "express";
import { PeriodService } from "./period.service.js";
import { createPeriodSchema } from "./period.validator.js";
import { success } from "../../utils/response.js";

const periodService = new PeriodService()

export class PeriodController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPeriodSchema.parse(req.body)

            const result = await periodService.create(data)

            return success(res, result, "Periode berhasil dibuat", 201)
        } catch (error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findAll(req.query)

            return success(res, result, "Periode berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findById(Number(req.params.id))

            return success(res, result, "Periode berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findOption(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findOption()

            return success(res, result, "Opsi periode berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findActive(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findActive()

            return success(res, result, "Periode aktif berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findPositionsByPeriod(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findPositionsByPeriod(Number(req.params.id))
    
            return success(res, result, "Posisi berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findEmployeesByPeriodAndPosition(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.findEmployeesByPeriodAndPosition(Number(req.params.id), Number(req.query.positionId))

            return success(res, result, "Karyawan berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPeriodSchema.parse(req.body)

            const result = await periodService.update(Number(req.params.id), data)

            return success(res, result, "Periode berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await periodService.delete(Number(req.params.id))

            return success(res, null, "Periode berhasil dihapus", 200)
        } catch (error) {
            next(error)
        }
    }
}