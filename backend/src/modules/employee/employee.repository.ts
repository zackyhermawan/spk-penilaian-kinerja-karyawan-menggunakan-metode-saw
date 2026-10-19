import { EmployeeStatus } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { EmployeeQuery } from "../../interface/employeeQuery.js"
import { getPagination } from "../../utils/pagination.js"
import { AppError } from "../../errors/AppError.js"
import bcrypt from "bcrypt"
import dayjs from "dayjs"

export class EmployeeRepository {
    async create(data: {
        code: string
        name: string
        phone?: string
        birthDate: Date
        status: EmployeeStatus
        positionId: number
        passwordHash: string
    }) {
        return prisma.$transaction(async(tx) => {
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    username: data.code,
                    password: data.passwordHash,
                    role: "EMPLOYEE"
                }
            })

            const employee = await tx.employee.create({
                data: {
                    code: data.code,
                    name: data.name,
                    phone: data.phone,
                    birthDate: new Date(data.birthDate),
                    status: data.status,
                    positionId: data.positionId,
                    userId: user.id
                },
                include: {
                    position: true,
                }
            })

            return {
                user,
                employee
            }
        })
    }

    async findAll(query: EmployeeQuery) {
        const {page, limit, skip, take} = getPagination(query)

        const where = {
            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains: query.search,
                            mode: "insensitive" as const
                        }
                    },
                    {
                        code: {
                            contains: query.search,
                            mode: "insensitive" as const
                        }
                    }
                ]
            }),

            ...(query.status && {
                status: query.status as EmployeeStatus
            }),

            ...(query.positionId && {
                positionId: Number(query.positionId)
            })
        }

        const [data, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                skip,
                take,
                include: {
                    position: true,
                    
                },
                orderBy: {
                    code: "desc"
                }
            }),

            prisma.employee.count({
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
        return prisma.employee.findMany({
            include: {
                position: true
            },
            orderBy: {
                code: "desc"
            }
        })
    }

    async findById(id: number) {
        return prisma.employee.findUnique({
            where: {id},
            include: {
                position: true,
            }
        })
    }

    async findByCode(code: string) {
        return prisma.employee.findUnique({
            where: {code},
            include: {
                position: true
            }
        })
    }

    async findInEvaluation(employeeId: number) {
        return prisma.evaluation.findFirst({
            where: {
                employeeId
            }
        })
    }

    async findInPeriodEmployee(employeeId: number) {
        return prisma.periodEmployee.findFirst({
            where: {
                employeeId
            }
        })
    }

    async updateStatus(id: number, status: EmployeeStatus) {
        return prisma.employee.update({
            where: {id},
            data: {
                status
            }
        })
    }

    async update(id: number, data: {
        code: string
        name: string
        phone?: string
        birthDate: Date
        status: EmployeeStatus
        positionId: number
    }) {
        return prisma.$transaction(async(tx) => {
            const employee = await tx.employee.update({
                where: { id },
                data: {
                    code: data.code,
                    name: data.name,
                    phone: data.phone,
                    birthDate: data.birthDate,
                    status: data.status,
                    positionId: data.positionId
                },
                include: {
                    position: true
                }
            })

            if (employee.userId) {
                await tx.user.update({
                    where: {
                        id: employee.userId
                    },
                    data: {
                        username: data.code,
                        role: "EMPLOYEE",
                        password: await bcrypt.hash(
                            dayjs(data.birthDate).format("YYYY-MM-DD"),
                            10
                        )
                    }
                })
            }

            return employee
        })
    }

    async delete(id: number) {
        return prisma.$transaction(async(tx) => {
            const employee = await tx.employee.findUnique({
                where: {id}
            })

            if(!employee) {
                throw new AppError("Karyawan tidak ditemukan", 404)
            }

            await tx.employee.delete({
                where: {id}
            })

            await tx.user.delete({
                where: {
                    id: Number(employee.userId)
                }
            })

            return employee
        })
    }
}