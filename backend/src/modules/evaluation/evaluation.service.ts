import { getMonthName } from "../../common/helpers/date.helper.js";
import { getRecommendation, getResultNote } from "../../common/helpers/evaluation.helper.js";
import { AppError } from "../../errors/AppError.js";
import { DashboardRepository } from "../dashboard/dashboard.repository.js";
import { EmployeeRepository } from "../employee/employee.repository.js";
import { PeriodRepository } from "../period/period.repository.js";
import { PeriodEmployeeRepository } from "../periodEmployee/periodEmployee.repository.js";
import { PositionRepository } from "../position/position.repository.js";
import { EvaluationRepository } from "./evaluation.repository.js";

export class EvaluationService {
    private evaluationRepository = new EvaluationRepository()
    private employeeRepository = new EmployeeRepository()
    private periodRepository = new PeriodRepository()
    private positionRepository = new PositionRepository()
    private periodEmployeeRepository = new PeriodEmployeeRepository()
    private dashboardRepository = new DashboardRepository()

    async saveDraft(data: {
        periodId: number
        positionId: number
        employees: {
            employeeId: number
            details: {
                criteriaId: number
                rawValue: number | null
            }[]
        }[]
    }) {
        const period = await this.periodRepository.findById(data.periodId)
        if (!period) {
            throw new AppError("Periode tidak ditemukan", 404)
        }

        if (period.status !== "OPEN") {
            throw new AppError("Periode sudah ditutup", 400)
        }

        const existingCalculated = await this.evaluationRepository.findCalculatedByPeriodAndPosition(data.periodId, data.positionId)

        if(existingCalculated) {
            throw new AppError("Penilaian untuk posisi tersebut sudah dihitung dan tidak bisa diubah", 400)
        }

        const position = await this.positionRepository.findById(data.positionId)

        if (!position) {
            throw new AppError("Posisi tidak ditemukan", 400)
        }

        const positionCriteria = await this.positionRepository.findCriteriaByPosition(data.positionId)

        if (positionCriteria.length === 0) {
            throw new AppError("Posisi belum memiliki kriteria", 400)
        }

        const criteriaIds = positionCriteria.map(item => item.criteria.id)

        for (const employee of data.employees) {

            const periodEmployee = await this.periodEmployeeRepository.findUnique(data.periodId, employee.employeeId)

            if (!periodEmployee) {
                throw new AppError(`Karyawan ${employee.employeeId} tidak terdaftar pada periode tersebut`, 400)
            }

            const employeeData = await this.employeeRepository.findById(employee.employeeId)

            if (!employeeData) {
                throw new AppError(`Karyawan ${employee.employeeId} tidak ditemukan`, 404)
            }

            if (employeeData.positionId !== data.positionId) {
                throw new AppError(`Karayawan ${employeeData.name} bukan bagian dari posisi tersebut`, 400)
            }

            for (const detail of employee.details) {
                if (!criteriaIds.includes(detail.criteriaId)) {
                    throw new AppError(`Kriteria ${detail.criteriaId} tidak terdaftar pada posisi ${data.positionId}`, 400)
                }

                if (detail.rawValue !== null && detail.rawValue < 0) {
                    throw new AppError(`Nilai kriteria tidak boleh negatif`, 400)
                }
            }
        }

        return await this.evaluationRepository.saveDraft(data)
    }

    async findByPeriodAndPosition(periodId: number, positionId: number) {
        const period = await this.periodRepository.findById(periodId)
        if (!period) {
            throw new AppError("Periode tidak ditemukan", 404)
        }

        const position = await this.positionRepository.findById(positionId)

        if (!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const evaluations = await this.evaluationRepository.findPeriodAndPosition(periodId, positionId)
        
        return evaluations.map(evaluation => {
            const recommendations =
                evaluation.evaluationDetails
                    .map(detail => {
                        if (detail.ratingScore === null) {
                            return null
                        }

                        return getRecommendation(detail.criteria.name, detail.ratingScore)
                    }).filter(recommendation => recommendation !== null)

            return {
                ...evaluation,
                recommendations
            }
        })
    }

    async calculate(
        periodId: number,
        positionId: number,
        employees: {
            employeeId: number
            details: {
                criteriaId: number
                rawValue: number | null
            }[]
        }[]
    ) {
        const period = await this.periodRepository.findById(periodId)

        if (!period) {
            throw new AppError("Periode tidak ditemukan", 404)
        }

        if (period.status !== "OPEN") {
            throw new AppError("Periode sudah ditutup", 400)
        }

        const existingCalculated = await this.evaluationRepository.findCalculatedByPeriodAndPosition(periodId, positionId)

        if(existingCalculated) {
            throw new AppError("Penilaian untuk posisi tersebut sudah dihitung", 400)
        }

        const position = await this.positionRepository.findById(positionId)

        if (!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        await this.evaluationRepository.saveDraft({periodId, positionId, employees})

        const totalEmployee = await this.periodEmployeeRepository.countByPeriodAndPosition(periodId, positionId)

        if (totalEmployee === 0) {
            throw new AppError("Tidak ada karayawan pada posisi tersebut", 400)
        }

        const evaluations = await this.evaluationRepository.findForCalculate(periodId, positionId)

        if (evaluations.length !== totalEmployee) {
            throw new AppError("Belum semua karyawan memiliki evaluasi", 400)
        }

        for (const evaluation of evaluations) {

            if (evaluation.evaluationDetails.length === 0) {
                throw new AppError(`Evaluasi ${evaluation.employee.name} belum memiliki detail`, 400)
            }

            for (const detail of evaluation.evaluationDetails) {

                if (detail.rawValue === null || detail.ratingScore === null) {
                    throw new AppError(`Penilaian ${evaluation.employee.name} belum lengkap`, 400)
                }
            }
        }

        const calculationDetails: {
            id: number
            normalizedValue: number
            weightedValue: number
        }[] = []

        for (const evaluation of evaluations) {

            for (const detail of evaluation.evaluationDetails) {

                const values = evaluations.map(item => {

                    const criteriaDetail = item.evaluationDetails.find(itemDetail => itemDetail.criteriaId === detail.criteriaId)

                    return Number(criteriaDetail?.ratingScore ?? 0)
                })

                const currentValue = Number(detail.ratingScore)

                const maxValue = Math.max(...values)

                const normalizedValue = maxValue === 0 ? 0 : currentValue / maxValue

                const weightedValue = normalizedValue * Number(detail.weight)

                calculationDetails.push({
                    id: detail.id,
                    normalizedValue,
                    weightedValue
                })
            }
        }

        const results = evaluations.map(evaluation => {

            const evaluationDetails = calculationDetails.filter(detail => evaluation.evaluationDetails.some(evaluationDetail =>evaluationDetail.id === detail.id))

            const finalScore = evaluationDetails.reduce((total, detail) => total + detail.weightedValue, 0)

            return {
                evaluationId: evaluation.id,
                finalScore
            }
        })

        results.sort((a, b) => b.finalScore - a.finalScore)

        const rankedResults = results.map((result, index) => ({
            ...result,
            rank: index + 1,
            resultNote: getResultNote(result.finalScore)
        }))

        const calculated = await this.evaluationRepository.calculate(periodId, positionId, calculationDetails, rankedResults)

        const positions = await this.periodRepository.findPositionsByPeriod(periodId)

        let allPositionsCompleted = true

        for (const item of positions) {

            const total = await this.periodEmployeeRepository.countByPeriodAndPosition(periodId, item.id)

            const completed = await this.periodEmployeeRepository.countCompletedByPeriodAndPosition(periodId,item.id)

            if (total !== completed) {
                allPositionsCompleted = false
                break
            }
        }

        if (allPositionsCompleted) {
            await this.periodRepository.updateStatus(periodId,"CLOSED")
        }

        return {
            periodId,
            positionId,
            positionName: position.name,
            totalEmployee,
            periodStatus: allPositionsCompleted
                ? "CLOSED"
                : "OPEN",
            data: calculated
        }
    }

    async findEvaluation(id: number) {
        const evaluation = await this.evaluationRepository.findById(id)
        if(!evaluation) {
            throw new AppError("Evaluasi tidak ditemukan", 404)
        }

        return evaluation
    }

    async getEmployeeHistory(userId: number) {
        const employee = await this.dashboardRepository.findEmployeeByUserId(userId)

        if (!employee) {
            throw new AppError("Data karyawan tidak ditemukan", 404)
        }

        const history = await this.evaluationRepository.findEmployeeHistory(employee.id)

        return history.map(item => ({
            periodId: item.periodId,
            month: item.period.month,
            name: getMonthName(item.period.month),
            year: item.period.year,
            finalScore: item.finalScore
                ? Number(item.finalScore)
                : null,
            rank: item.rank,
            resultNote: item.resultNote
        }))
    }

    async getEmployeeHistoryDetail(userId: number, periodId: number) {
        const employee = await this.dashboardRepository.findEmployeeByUserId(userId)

        if (!employee) {
            throw new AppError("Data karyawan tidak ditemukan", 404)
        }

        const evaluation = await this.evaluationRepository.findEmployeeHistoryDetail(employee.id, periodId)

        if (!evaluation || evaluation.finalScore === null) {
            throw new AppError("Hasil penilaian tidak ditemukan", 404)
        }

        return {
            period: {
                ...evaluation.period,
                name: getMonthName(evaluation.period.month),
            },
            position: evaluation.position,
            finalScore: Number(evaluation.finalScore),
            rank: evaluation.rank,
            resultNote: evaluation.resultNote,
            details: evaluation.evaluationDetails.map(detail => ({
                criteriaId: detail.criteria.id,
                criteriaName: detail.criteria.name,
                rawValue: detail.rawValue !== null ? Number(detail.rawValue) : null,
                ratingScore: detail.ratingScore,
                normalizedValue: detail.normalizedValue !== null ? Number(detail.normalizedValue) : null,
                weight: Number(detail.weight),
                weightedValue: detail.weightedValue !== null ? Number(detail.weightedValue) : null
            }))
        }
    }
}