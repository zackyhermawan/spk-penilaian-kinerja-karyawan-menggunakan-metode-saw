import { QueryParams } from "../../interface/query.js";
import { prisma } from "../../lib/prisma.js";
import { getPagination } from "../../utils/pagination.js";

export class PositionRepository {
    async create(data: {
        name: string;
        description?: string;
    }) {
        return prisma.position.create({
            data,
            include: {
                employees: true
            }
        })
    }

    async findAll(query: QueryParams) {
        const {page, limit, skip, take} = getPagination(query);

        const where = {
            ...(query.search && {
                name: {
                    contains: query.search,
                    mode: "insensitive" as const
                }
            })
        }

        const [rawPosition, total] = await Promise.all([
            prisma.position.findMany({
                where,
                skip,
                take,
                include: {
                    employees: true,
                    _count: {
                        select: {
                            employees: true
                        }
                    }
                },
                orderBy: {
                    name: "asc"
                }
            }),

            prisma.position.count({
                where
            })
        ])

        const data = rawPosition.map(({ _count, ...position }) => ({
            ...position,
            totalEmployee: _count.employees
        }));

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
        return prisma.position.findMany({
            include: {
                employees: true
            },
            orderBy: {
                name: "asc"
            }
        })
    }

    async findById(id: number) {
        return prisma.position.findUnique({
            where: {
                id
            },
            include: {
                employees: {
                    include: {
                        periodEmployees: true
                    }
                }
            },
        })
    }

    async findByName(name: string) {
        return prisma.position.findFirst({
            where: {
                name
            }
        })
    }

    async findCriteriaByPosition(positionId: number) {
        return prisma.positionCriteria.findMany({
            where: {positionId},
            select: {
                id: true,
                weight: true,
                criteria: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        ratingScales: true
                    }
                },

            },
            orderBy: {
                criteriaId: "asc"
            }
        })
    }

    async countEmployeesByPositionId(id: number) {
        return prisma.employee.count({
            where: {positionId: id}
        })
    }

    async update(id: number, data: {
        name: string;
        description?: string;
    }) {
        return prisma.position.update({
            where: {
                id
            },
            data,
            include: {
                employees: true
            }
        })
    }

    async delete(id: number) {
        return prisma.position.delete({
            where: {
                id
            }
        })
    }
}