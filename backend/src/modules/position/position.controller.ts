import { NextFunction, Request, Response } from "express";
import { PositionService } from "./position.service.js";
import { createPositionSchema } from "./position.validator.js";
import { success } from "../../utils/response.js";

const positionService = new PositionService()

export class PositionController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPositionSchema.parse(req.body)

            const result = await positionService.create(data)

            return success(res, result, "Posisi berhasil dibuat", 201)
        } catch(error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await positionService.findAll(req.query)

            return success(res, result, "Posisi berhasil diambil", 200)
        } catch(error) {
            next(error)
        }
    }

    async findOption(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await positionService.findOption()

            return success(res, result, "Opsi posisi berhasil diambil", 200)
        } catch(error) {
            next(error)
        }
    }

    async findCriteriaByPosition(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await positionService.findCriteriaByPosition(Number(req.params.id))

            return success(res, result, "Kriteria berhasil diambil", 200)
        } catch(error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createPositionSchema.parse(req.body)

            const result = await positionService.update(Number(req.params.id), data)

            return success(res, result, "Posisi berhasil diperbarui", 200)
        } catch(error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await positionService.delete(Number(req.params.id))

            return success(res, null, "Posisi berhasil dihapus", 200)
        } catch(error) {
            next(error)
        }
    }
}