import { CriteriaType } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { CriteriaQuery } from "../../interface/criteriaQuery.js"
import { getPagination } from "../../utils/pagination.js"

export class CriteriaRepository {
    async create(data: {
        name: string
        groupName?: string
        isActive?: boolean
        type: CriteriaType
    }) {
        return prisma.criteria.create({
            data,
            include: {
                positionCriterias: true
            }
        })
    }

    async findAll(query: CriteriaQuery) {
        const {page, limit, skip, take} = getPagination(query)

        const where = {
            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains: query.search,
                            mode: "insensitive" as const
                        }
                    }
                ]
            }),
            
            ...(query.isActive !== undefined && {
                isActive: query.isActive
            }),

            ...(query.type && {
                type: query.type
            }),

            ...(query.positionId && {
                positionCriterias: {
                    some: {
                        positionId: Number(query.positionId)
                    }
                }
            })
        }

        const [data, total] = await Promise.all([
            prisma.criteria.findMany({
                where,
                skip,
                take,
                include: {
                    positionCriterias: {
                        include: {
                            position: true
                        }
                    },
                    ratingScales: true,
                },
                orderBy: {
                    name: "asc"
                }
            }),

            prisma.criteria.count({
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

    async findOption() {
        return prisma.criteria.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                groupName: true,
                isActive: true,
                type: true
            },
            orderBy: {
                name: "asc"
            }
        })
    }

    async findById(id: number) {
        return prisma.criteria.findUnique({
            where: {id},
            include: {
                positionCriterias: true
            }
        })
    }

    async findByName(name: string) {
        return prisma.criteria.findFirst({
            where: {name},
            include: {
                positionCriterias: true
            }
        })
    }

    async findInEvaluationDetail(criteriaId: number) {
        return prisma.evaluationDetail.findFirst({
            where: {
                criteriaId
            }
        })
    }

    async findInPositionCriteria(criteriaId: number) {
        return prisma.positionCriteria.findFirst({
            where: {
                criteriaId
            }
        })
    }

    async findInRatingScale(criteriaId: number) {
        return prisma.ratingScale.findFirst({
            where: {
                criteriaId
            }
        })
    }

    async updateStatus(id: number, isActive: boolean) {
        return prisma.criteria.update({
            where: {id},
            data: {
                isActive
            }
        })
    }

    async update(id: number, data: {
        name: string
        groupName?: string
        type: CriteriaType
    }) {
        return prisma.criteria.update({
            where: {id},
            data,
            include: {
                positionCriterias: true
            }
        })
    }

    async delete(id: number) {
        return prisma.criteria.delete({
            where: {id}
        })
    }
}