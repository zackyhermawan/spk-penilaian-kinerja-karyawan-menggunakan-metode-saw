import { NextFunction, Request, Response } from "express";
import { PositionCriteriaService } from "./positionCriteria.service.js";
import { createPositionCriteriaSchema } from "./positionCriteria.validator.js";
import { success } from "../../utils/response.js";

const positionCriteriaService = new PositionCriteriaService()

export class PositionCriteriaController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPositionCriteriaSchema.parse(req.body)

            const result = await positionCriteriaService.create(data)

            return success(res, result, "Posisi kriteria berhasil dibuat", 201)
        } catch (error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await positionCriteriaService.findAll(req.query)

            return success(res, result, "Posisi kriteria berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async weightSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await positionCriteriaService.getWeightSummary()

            return success(res, result, "Total bobot kriteria berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPositionCriteriaSchema.parse(req.body)

            const result = await positionCriteriaService.update(Number(req.params.id), data)

            return success(res, result, "Posisi kriteria berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await positionCriteriaService.delete(Number(req.params.id))

            return success(res, null, "Posisi kriteria berhasil dihapus", 200)
        } catch (error) {
            next(error)
        }
    }
}