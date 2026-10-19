import { prisma } from "../../lib/prisma.js";

export class PeriodEmployeeRepository {
    async findAll() {
        return prisma.periodEmployee.findMany()
    }

    async findUnique(periodId: number, employeeId: number) {
        return prisma.periodEmployee.findUnique({
            where: {
                periodId_employeeId: {
                    periodId,
                    employeeId
                }
            }
        })
    }

    async countByPeriodAndPosition(periodId: number, positionId: number) {
        return await prisma.periodEmployee.count({
            where: {
                periodId,
                employee: {
                    positionId
                }
            }
        })
    }

    async countCompletedByPeriodAndPosition(
        periodId: number,
        positionId: number
    ) {
        return await prisma.evaluation.count({
            where: {
                periodId,
                positionId,
                finalScore: {
                    not: null
                }
            }
        })
    }
}