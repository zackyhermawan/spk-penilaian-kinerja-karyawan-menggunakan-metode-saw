import { NextFunction, Request, Response } from "express";
import { RatingScaleService } from "./ratingScale.service.js";
import { createRatingScaleSchema } from "./ratingScale.validator.js";
import { success } from "../../utils/response.js";

const ratingScaleService = new RatingScaleService()

export class RatingScaleController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createRatingScaleSchema.parse(req.body)

            const result = await ratingScaleService.create(data)

            return success(res, result, "Skala penilaian berhasil dibuat", 201)
        } catch (error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await ratingScaleService.findAll(req.query)

            return success(res, result, "Skala penilaian berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createRatingScaleSchema.parse(req.body)

            const result = await ratingScaleService.update(Number(req.params.id), data)

            return success(res, result, "Skala penilaian berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await ratingScaleService.delete(Number(req.params.id))

            return success(res, null, "Skala penilaian berhasil dihapus", 200)
        } catch (error) {
            next(error)
        }
    }
}