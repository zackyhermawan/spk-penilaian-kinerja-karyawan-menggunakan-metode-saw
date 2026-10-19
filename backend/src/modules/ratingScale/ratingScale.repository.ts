import { RatingScaleQuery } from "../../interface/ratingScaleQuery.js"
import { prisma } from "../../lib/prisma.js"
import { getPagination } from "../../utils/pagination.js"

export class RatingScaleRepository {
    async create(data: {
        minValue: number
        maxValue: number
        label?: string
        score: number
        criteriaId: number
    }) {
        return prisma.ratingScale.create({
            data,
            include: {
                criteria: {
                    include: {
                        positionCriterias: {
                            include: {
                                position: true
                            }
                        }
                    }
                }
            }
        })
    }

    async findAll(query: RatingScaleQuery) {
        const {page, limit, skip, take} = getPagination(query)

        const where = {
            ...(query.score && {
                score: Number(query.score)
            }),

            ...(query.criteriaId && {
                criteriaId: Number(query.criteriaId)
            })
        }

        const [data, total] = await Promise.all([
            prisma.ratingScale.findMany({
                where,
                skip,
                take,
                include: {
                    criteria: {
                        include: {
                            positionCriterias: {
                                include: {
                                    position: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.ratingScale.count({
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
        return prisma.ratingScale.findUnique({
            where: {id}
        })
    }

    async update(id: number, data: {
        minValue: number
        maxValue: number
        label?: string
        score: number
        criteriaId: number
    }) {
        return prisma.ratingScale.update({
            where: {id},
            data,
            include: {
                criteria: {
                    include: {
                        positionCriterias: {
                            include: {
                                position: true
                            }
                        }
                    }
                }
            }
        })
    }

    async delete(id: number) {
        return prisma.ratingScale.delete({
            where: {id}
        })
    }
}