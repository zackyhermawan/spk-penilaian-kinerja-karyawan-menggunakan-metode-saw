import { prisma } from "../../lib/prisma.js"

export class DashboardRepository {
    async findLatestClosedPeriod(){
        return await prisma.period.findFirst({
            where: {
                status: "CLOSED"
            },
            orderBy: [
                { year: "desc" },
                { month: "desc" }
            ],
            select: {
                id: true,
                month: true,
                year: true,
                status: true
            }
        })
    }

    async countEmployees(){
        return await prisma.employee.count()
    }

    async countActiveEmployees(){
        return await prisma.employee.count({
            where: {
                status: "ACTIVE"
            }
        })
    }

    async getAverageScore(periodId: number, positionId?: number) {
        const result = await prisma.evaluation.aggregate({
            where: {
                periodId,
                finalScore: {
                    not: null
                },
                ...(positionId
                    ? { positionId }
                    : {})
            },
            _avg: {
                finalScore: true
            }
        })

        return result._avg.finalScore
    }

    async countNeedDevelopment(periodId: number, positionId?: number) {
        return await prisma.evaluation.count({
            where: {
                periodId,
                finalScore: {
                    not: null
                },
                resultNote: "Perlu Pembinaan",
                ...(positionId
                    ? { positionId }
                    : {})
            }
        })
    }

    async getPerformanceDistribution(periodId: number, positionId?: number){
        return await prisma.evaluation.groupBy({
            by: ["resultNote"],
            where: {
                periodId,
                finalScore: {
                    not: null
                },
                ...(positionId
                    ? { positionId }
                    : {})
            },
            _count: {
                _all: true
            }
        })
    }

    async getTrend(periodId: number, positionId?: number) {
        const periods = await prisma.period.findMany({
            where: {
                status: "CLOSED"
            },
            orderBy: [
                { year: "desc" },
                { month: "desc" }
            ],
            take: 12,
            select: {
                id: true,
                month: true,
                year: true
            }
        })

        const orderedPeriods = [...periods].reverse()

        const result = []

        for (const period of orderedPeriods) {
            const aggregate = await prisma.evaluation.aggregate({
                where: {
                    periodId: period.id,
                    finalScore: {
                        not: null
                    },
                    ...(positionId
                        ? { positionId }
                        : {})
                },
                _avg: {
                    finalScore: true
                }
            })

            result.push({
                periodId: period.id,
                month: period.month,
                year: period.year,
                averageScore: aggregate._avg.finalScore
                    ? Number(aggregate._avg.finalScore)
                    : 0
            })
        }

        return result
    }

    async getTopEmployees(periodId: number, positionId?: number) {
        return await prisma.evaluation.findMany({
            where: {
                periodId,
                finalScore: {
                    not: null
                },
                ...(positionId
                    ? { positionId }
                    : {})
            },
            orderBy: {
                finalScore: "desc"
            },
            take: 3,
            select: {
                employeeId: true,
                finalScore: true,
                rank: true,
                resultNote: true,
                employee: {
                    select: {
                        code: true,
                        name: true,
                        position: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
    }

    async findEmployeeByUserId(userId: number) {
        return await prisma.employee.findFirst({
            where: {
                userId
            },
            select: {
                id: true,
                code: true,
                name: true,
                positionId: true,
                position: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    }

    async findEmployeeEvaluation(employeeId: number, periodId: number) {
        return await prisma.evaluation.findUnique({
            where: {
                employeeId_periodId: {
                    employeeId,
                    periodId
                }
            },
            select: {
                id: true,
                finalScore: true,
                rank: true,
                resultNote: true,
                evaluationDetails: {
                    select: {
                        criteriaId: true,
                        ratingScore: true,
                        normalizedValue: true,
                        weightedValue: true,
                        criteria: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        criteriaId: "asc"
                    }
                }
            }
        })
    }
}
