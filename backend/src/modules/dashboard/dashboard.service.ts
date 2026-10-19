import { AppError } from "../../errors/AppError.js"
import { DashboardRepository } from "./dashboard.repository.js"

const monthName = (month: number) => {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ]

    return months[month - 1]
}

export class DashboardService {
    private dasboardRepository = new DashboardRepository()

    async getAdminDashboard(periodId?: number, positionId?: number) {
        let selectedPeriodId = periodId

        if (!selectedPeriodId) {
            const latestPeriod = await this.dasboardRepository.findLatestClosedPeriod()

            if (!latestPeriod) {
                throw new AppError("Belum ada periode yang selesai dihitung", 404)
            }

            selectedPeriodId = latestPeriod.id
        }

        const totalEmployees = await this.dasboardRepository.countEmployees()

        const activeEmployees = await this.dasboardRepository.countActiveEmployees()

        const averageScore = await this.dasboardRepository.getAverageScore(selectedPeriodId, positionId)

        const needDevelopment = await this.dasboardRepository.countNeedDevelopment(selectedPeriodId, positionId)

        const distribution = await this.dasboardRepository.getPerformanceDistribution(selectedPeriodId, positionId)

        const trend = await this.dasboardRepository.getTrend(selectedPeriodId, positionId)

        const topEmployees = await this.dasboardRepository.getTopEmployees(selectedPeriodId, positionId)

        return {
            periodId: selectedPeriodId,

            cards: {
                totalEmployees,
                activeEmployees,
                averageScore: averageScore
                    ? Number(averageScore)
                    : 0,
                needDevelopment
            },

            distribution: distribution.map(item => ({
                label: item.resultNote ?? "Tidak ada status",
                total: item._count._all
            })),

            trend: trend.map(item => ({
                periodId: item.periodId,
                label: `${monthName(item.month)} ${item.year}`,
                averageScore: Number(item.averageScore)
            })),

            topEmployees: topEmployees.map(item => ({
                employeeId: item.employeeId,
                code: item.employee.code,
                name: item.employee.name,
                position: item.employee.position.name,
                finalScore: item.finalScore
                    ? Number(item.finalScore)
                    : 0,
                rank: item.rank,
                resultNote: item.resultNote
            }))
        }
    }

    async getEmployeeDashboard(userId: number, periodId?: number) {
        const employee = await this.dasboardRepository.findEmployeeByUserId(userId)

        if (!employee) {
            throw new AppError("Data karyawan tidak ditemukan", 404)
        }

        let selectedPeriodId = periodId

        if (!selectedPeriodId) {
            const latestPeriod = await this.dasboardRepository.findLatestClosedPeriod()

            if (!latestPeriod) {
                throw new AppError("Belum ada periode yang selesai dihitung", 404)
            }

            selectedPeriodId = latestPeriod.id
        }

        const evaluation = await this.dasboardRepository.findEmployeeEvaluation(employee.id, selectedPeriodId)

        if (!evaluation || evaluation.finalScore === null) {
            throw new AppError("Belum ada hasil penilaian pada periode tersebut", 404)
        }

        return {
            periodId: selectedPeriodId,

            employee: {
                id: employee.id,
                code: employee.code,
                name: employee.name,
                position: employee.position
            },

            cards: {
                score: Number(evaluation.finalScore),
                status: evaluation.resultNote,
                rank: evaluation.rank,
                totalCriteria: evaluation.evaluationDetails.length
            },

            performanceByCriteria: evaluation.evaluationDetails.map(detail => ({
                criteriaId: detail.criteriaId,
                criteriaName: detail.criteria.name,
                ratingScore: detail.ratingScore
            }))
        }
    }
}