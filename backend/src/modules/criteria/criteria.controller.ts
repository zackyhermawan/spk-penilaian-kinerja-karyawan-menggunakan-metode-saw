import { NextFunction, Request, Response } from "express";
import { CriteriaService } from "./criteria.service.js";
import { createCriteriaSchema, updateStatusCriteriaSchema } from "./criteria.validator.js";
import { success } from "../../utils/response.js";

const criteriaService = new CriteriaService()

export class CriteriaController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createCriteriaSchema.parse(req.body)

            const result = await criteriaService.create(data)

            return success(res, result, "Kriteria berhasil dibuat", 201)
        } catch (error) {
            next(error)
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = {
                ...req.query,
                isActive:
                    req.query.isActive !== undefined
                        ? req.query.isActive === "true"
                        : undefined
            }
            const result = await criteriaService.findAll(query)

            return success(res, result, "Kriteria berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findOption(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await criteriaService.findOption()

            return success(res, result, "Opsi kriteria berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const {isActive} = updateStatusCriteriaSchema.parse(req.body)

            const result = await criteriaService.updateStatus(Number(req.params.id), isActive)

            return success(res, result, "Status kriteria berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createCriteriaSchema.parse(req.body)

            const result = await criteriaService.update(Number(req.params.id), data)

            return success(res, result, "Kriteria berhasil diperbarui", 200)
        } catch (error) {
            next(error)
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await criteriaService.delete(Number(req.params.id))

            return success(res, null, "Kriteria berhasil dihapus", 200)
        } catch (error) {
            next(error)
        }
    }
}