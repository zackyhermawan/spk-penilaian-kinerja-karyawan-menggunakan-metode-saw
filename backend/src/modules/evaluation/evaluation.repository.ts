import { prisma } from "../../lib/prisma.js";

export class EvaluationRepository {
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
    return prisma.$transaction(async (tx) => {
        const result = []

        for (const employee of data.employees) {
            let evaluation = await tx.evaluation.findUnique({
                where: {
                    employeeId_periodId: {
                        employeeId: employee.employeeId,
                        periodId: data.periodId
                    }
                }
            })

            if (!evaluation) {
                evaluation = await tx.evaluation.create({
                    data: {
                        employeeId: employee.employeeId,
                        positionId: data.positionId,
                        periodId: data.periodId
                    }
                })
            }

            for (const detail of employee.details) {
                const positionCriteria = await tx.positionCriteria.findUnique({
                    where: {
                        positionId_criteriaId: {
                            positionId: data.positionId,
                            criteriaId: detail.criteriaId
                        }
                    }
                })

                if (!positionCriteria) {
                    throw new Error(
                        `Kriteria ${detail.criteriaId} tidak terdaftar pada posisi`
                    )
                }

                const ratingScale = detail.rawValue !== null
                    ? await tx.ratingScale.findFirst({
                        where: {
                            criteriaId: detail.criteriaId,
                            minValue: {
                                lte: detail.rawValue
                            },
                            maxValue: {
                                gte: detail.rawValue
                            }
                        }
                    })
                    : null

                if (detail.rawValue !== null && !ratingScale) {
                    throw new Error(
                        `Nilai ${detail.rawValue} tidak memiliki skala penilaian untuk criteria ${detail.criteriaId}`
                    )
                }

                const evaluationDetail = await tx.evaluationDetail.findUnique({
                    where: {
                        evaluationId_criteriaId: {
                            evaluationId: evaluation.id,
                            criteriaId: detail.criteriaId
                        }
                    }
                })

                if (evaluationDetail) {
                    await tx.evaluationDetail.update({
                        where: {
                            id: evaluationDetail.id
                        },
                        data: {
                            rawValue: detail.rawValue,
                            ratingScore: ratingScale ? ratingScale.score : null,
                            normalizedValue: null,
                            weightedValue: null
                        }
                    })
                } else {
                    await tx.evaluationDetail.create({
                        data: {
                            evaluationId: evaluation.id,
                            criteriaId: detail.criteriaId,
                            weight: positionCriteria.weight,
                            rawValue: detail.rawValue,
                            ratingScore: ratingScale ? ratingScale.score : null,
                            normalizedValue: null,
                            weightedValue: null
                        }
                    })
                }
            }
        }
    })
}

    async findCalculatedByPeriodAndPosition(periodId: number, positionId: number) {
        return prisma.evaluation.findFirst({
            where: {
                periodId,
                positionId,
                finalScore: {
                    not: null
                }
            },
            select: {
                id: true
            }
        })
    }

    async findPeriodAndPosition(periodId: number, positionId: number) {
        return prisma.evaluation.findMany({
            where: {
                periodId,
                positionId
            },
            select: {
                id: true,
                employeeId: true,
                finalScore: true,
                rank: true,
                resultNote: true,

                employee: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },

                evaluationDetails: {
                    select: {
                        id: true,
                        criteriaId: true,
                        rawValue: true,
                        ratingScore: true,
                        normalizedValue: true,
                        weight: true,
                        weightedValue: true,
                        criteria: true
                    },
                    orderBy: {
                        criteriaId: "asc"
                    }
                }
            },
            orderBy: {
                employee: {
                    createdAt: "asc"
                }
            }
        })
    }

    async findForCalculate(periodId: number, positionId: number) {
        return await prisma.evaluation.findMany({
            where: {
                periodId,
                positionId
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                evaluationDetails: {
                    include: {
                        criteria: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    },
                    orderBy: {
                        criteriaId: "asc"
                    }
                }
            },
            orderBy: {
                employee: {
                    name: "asc"
                }
            }
        })
    }

    async calculate(
        periodId: number,
        positionId: number,
        details: {
            id: number
            normalizedValue: number
            weightedValue: number
        }[],
        results: {
            evaluationId: number
            finalScore: number
            rank: number
            resultNote: string
        }[]) {
        return await prisma.$transaction(async (tx) => {

            for (const detail of details) {
                await tx.evaluationDetail.update({
                    where: {
                        id: detail.id
                    },
                    data: {
                        normalizedValue: detail.normalizedValue,
                        weightedValue: detail.weightedValue
                    }
                })
            }

            for (const result of results) {
                await tx.evaluation.update({
                    where: {
                        id: result.evaluationId
                    },
                    data: {
                        finalScore: result.finalScore,
                        rank: result.rank,
                        resultNote: result.resultNote
                    }
                })
            }

            return await tx.evaluation.findMany({
                where: {
                    periodId,
                    positionId
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    evaluationDetails: {
                        include: {
                            criteria: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true
                                }
                            }
                        },
                        orderBy: {
                            criteriaId: "asc"
                        }
                    }
                },
                orderBy: {
                    rank: "asc"
                }
            })
        })
    }

    async countInCompleteEvaluations(periodId: number, positionId: number) {
        return prisma.evaluation.count({
            where: {
                periodId,
                positionId,
                finalScore: null
            }
        })
    }

    async findById(id: number) {
        return prisma.evaluation.findUnique({
            where: {id},
            include: {
                employee: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                position: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                period: {
                    select: {
                        id: true,
                        month: true,
                        year: true,
                        status: true
                    }
                },
                evaluationDetails: {
                    include: {
                        criteria: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    },
                    orderBy: {
                        id: "asc"
                    }
                }
            }
        })
    }

    async findEmployeeHistory(employeeId: number) {
        return await prisma.evaluation.findMany({
            where: {
                employeeId,
                finalScore: {
                    not: null
                }
            },
            select: {
                id: true,
                periodId: true,
                finalScore: true,
                rank: true,
                resultNote: true,
                period: {
                    select: {
                        id: true,
                        month: true,
                        year: true
                    }
                }
            },
            orderBy: [
                {
                    period: {
                        year: "desc"
                    }
                },
                {
                    period: {
                        month: "desc"
                    }
                }
            ]
        })
    }

    async findEmployeeHistoryDetail(employeeId: number, periodId: number) {
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
                period: {
                    select: {
                        id: true,
                        month: true,
                        year: true
                    }
                },
                position: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                evaluationDetails: {
                    select: {
                        id: true,
                        rawValue: true,
                        ratingScore: true,
                        normalizedValue: true,
                        weightedValue: true,
                        weight: true,
                        criteria: {
                            select: {
                                id: true,
                                name: true,
                                type: true
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