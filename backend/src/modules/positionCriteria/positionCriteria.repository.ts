import { PositionCriteriaQuery } from "../../interface/positionCriteriaQuery.js"
import { prisma } from "../../lib/prisma.js"
import { getPagination } from "../../utils/pagination.js"

export class PositionCriteriaRepository {
    async create(data: {
        weight: number
        positionId: number
        criteriaId: number
    }) {
        return prisma.positionCriteria.create({
            data,
            include: {
                criteria: true,
                position: true
            }
        })
    }

    async findAll(query: PositionCriteriaQuery) {
        const {page, limit, skip, take} = getPagination(query)

        const where = {
            ...(query.positionId && {
                positionId: Number(query.positionId)
            }),

            ...(query.criteriaId && {
                criteriaId: Number(query.criteriaId)
            })
        }

        const [data, total] = await Promise.all([
            prisma.positionCriteria.findMany({
                where,
                skip,
                take,
                include: {
                    position: true,
                    criteria: true
                },
                orderBy: {
                    criteria: {
                        createdAt: "asc"
                    }
                }
            }),

            prisma.positionCriteria.count({
                where
            })
        ])

        return {
            data,
            pagination: {
                page,
                limit,
                total
            }
        }
    }

    async findById(id: number) {
        return prisma.positionCriteria.findUnique({
            where: {id},
            include: {
                position: true,
                criteria: true
            }
        })
    }
    
    async getWeightSummary() {
        const positions = await prisma.position.findMany({
            select: {
                id: true,
                name: true,
                positionCriterias: {
                    select: {
                        weight: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        })

        return positions.map((position) => {
            const totalWeight = position.positionCriterias.reduce((total, item) => total + Number(item.weight), 0)

            return {
                positionId: position.id,
                positionName: position.name,
                totalWeight: Number(totalWeight.toFixed(2)),
                remainingWeight: Number(Math.max(0, 1 - totalWeight).toFixed(2)),
                isValid: Math.abs(totalWeight - 1) < 0.001
            }
        })
    }

    async findUnique(positionId: number, criteriaId: number) {
        return prisma.positionCriteria.findUnique({
            where: {
                positionId_criteriaId: {
                    positionId,
                    criteriaId
                }
            }
        })
    }

    async findInEvaluation(positionId: number, criteriaId: number) {
        return prisma.evaluation.findFirst({
            where: {
                positionId,
                evaluationDetails: {
                    some: {
                        criteriaId
                    }
                }
            }
        })
    }

    async update(id: number, data: {
        weight: number
        positionId: number
        criteriaId: number
    }) {
        return prisma.positionCriteria.update({
            where: {id},
            data,
            include: {
                position: true,
                criteria: true
            }
        })
    }

    async delete(id: number) {
        return prisma.positionCriteria.delete({
            where: {id}
        })
    }
}