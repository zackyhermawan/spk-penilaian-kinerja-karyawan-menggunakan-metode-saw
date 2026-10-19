import { NextFunction, Request, Response } from "express";
import { EvaluationService } from "./evaluation.service.js";
import { calculateSchema, saveDraftEvaluationSchema } from "./evaluation.validator.js";
import { success } from "../../utils/response.js";

const evaluationService = new EvaluationService()

export class EvaluationController {
    async saveDraft(req: Request, res: Response, next: NextFunction) {
        try {
            const {periodId, positionId, employees} = saveDraftEvaluationSchema.parse(req.body)

            const result = await evaluationService.saveDraft({
                periodId: Number(periodId),
                positionId: Number(positionId),
                employees
            })

            return success(res, result, "Draft evaluasi berhasil disimpan", 200)
        } catch (error) {
            next(error)
        }
    }

    async findByPeriodAndPosition(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await evaluationService.findByPeriodAndPosition(Number(req.params.periodId), Number(req.query.positionId))

            return success(res, result, "Evaluasi berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async calculate(req: Request, res: Response, next: NextFunction) {
        try {
            const {periodId, positionId, employees} = calculateSchema.parse(req.body)

            const result = await evaluationService.calculate(periodId, positionId, employees)

            return success(res, result, "Perhitungan SPK berhasil", 200)
        } catch (error) {
            next(error)
        }
    }

    async findEvaluation(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await evaluationService.findEvaluation(Number(req.params.id))

            return success(res, result, "Evaluasi berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async getEmployeeHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await evaluationService.getEmployeeHistory(Number(req.user?.id))

            return success(res, result, "Riwayat evaluasi berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }

    async getEmployeeHistoryDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await evaluationService.getEmployeeHistoryDetail(Number(req.user?.id), Number(req.params.periodId))

            return success(res, result, "Riwayat evaluasi detail berhasil diambil", 200)
        } catch (error) {
            next(error)
        }
    }
}