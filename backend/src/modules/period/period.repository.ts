import { PeriodStatus } from "@prisma/client"
import { PeriodQuery } from "../../interface/periodQuery.js"
import { prisma } from "../../lib/prisma.js"
import { getPagination } from "../../utils/pagination.js"
import { getMonthName } from "../../common/helpers/date.helper.js"

export class PeriodRepository {
    async create(data: {
        month: number
        year: number
    }) {
        return prisma.$transaction(async(tx) => {
            const period = await tx.period.create({
                data
            })

            const employees = await tx.employee.findMany({
                where: {
                    status: "ACTIVE"
                }
            })

            if(employees.length > 0) {
                const periodEmployee = employees.map((emp) => ({
                    periodId: period.id,
                    employeeId: emp.id
                }))

                await tx.periodEmployee.createMany({
                    data: periodEmployee
                })
            }
            
            return {
                period,
                employees
            }
        })
    }

    async findAll(query: PeriodQuery) {
        const {page, limit, skip, take} = getPagination(query)

        const where = {
            ...(query.month && {
                month: Number(query.month)
            }),

            ...(query.year && {
                year: Number(query.year)
            }),

            ...(query.status && {
                status: query.status
            })
        }

        const [data, total] = await Promise.all([
            prisma.period.findMany({
                where,
                skip,
                take,
                orderBy: [
                    {year: "desc"},
                    {month: "desc"}
                ],
                include: {
                    _count: true,
                    evaluations: true
                }
            }),

            prisma.period.count({
                where
            })
        ])

        const formattedData = data.map((period) => ({
            ...period,
            name: getMonthName(period.month)
        }))

        return {
            data: formattedData,
            pagination: {
                page,
                limit,
                total
            }
        }
    }

    async findOption() {
        const data = await prisma.period.findMany({
            where: {
                status: "CLOSED"
            },
            orderBy: [
                {year: "desc"},
                {month: "desc"}
            ]
        })

        const formattedData = data.map((period) => ({
            ...period,
            name: getMonthName(period.month)
        }))

        return {
            data: formattedData
        }
    }

    async findActive() {
        return prisma.period.findFirst({
            where: {
                status: "OPEN"
            }
        })
    }

    async findById(id: number) {
        const data = await prisma.period.findUnique({
            where: {id}
        })

        return {
            ...data,
            name: getMonthName(Number(data?.month))
        }

        
    }

    async findUnique(month: number, year: number) {
        return prisma.period.findUnique({
            where: {
                month_year: {
                    month,
                    year
                }
            }
        })
    }

    async findInEvaluation(periodId: number) {
        return prisma.evaluation.findFirst({
            where: {
                periodId
            }
        })
    }

    async findInPeriodEmployee(periodId: number) {
        return prisma.periodEmployee.findFirst({
            where: {
                periodId
            }
        })
    }

    async findPositionsByPeriod(periodId: number) {
        return prisma.position.findMany({
            where: {
                employees: {
                    some: {
                        periodEmployees: {
                            some: {
                                periodId
                            }
                        }
                    }
                },
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                id: "asc"
            }
        })
    }

    async findEmployeesByPeriodAndPosition(periodId: number, positionId: number) {
        return prisma.employee.findMany({
            where: {
                positionId,
                periodEmployees: {
                    some: {
                        periodId
                    }
                }
            },
            select: {
                id: true,
                code: true,
                name: true,
                position: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                evaluations: {
                    where: {
                        periodId
                    },
                    select: {
                        id: true,
                        finalScore: true,
                        rank: true,
                        resultNote: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    }

    async updateStatus(id: number, status: PeriodStatus) {
        return prisma.period.update({
            where: {id},
            data: {
                status
            }
        })
    }

    async update(id: number, data: {
        month: number
        year: number
    }) {
        return prisma.period.update({
            where: {id},
            data
        })
    }

    async delete(id: number) {
        return prisma.$transaction(async(tx) => {
            await tx.periodEmployee.deleteMany({
                where: {
                    periodId: id
                }
            })

            await tx.period.delete({
                where: {id}
            })
        })
    }
}