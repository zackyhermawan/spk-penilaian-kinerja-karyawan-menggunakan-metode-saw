import z, { number } from "zod";

export const createEvaluationSchema = z.object({
    employeeId: z.number(),
    periodId: z.number()
})

export const saveDraftEvaluationSchema = z.object({
     periodId: z
        .number()
        .int()
        .positive(),

    positionId: z
        .number()
        .int()
        .positive(),

    employees: z
        .array(
            z.object({
                employeeId: z
                    .number()
                    .int()
                    .positive(),

                details: z
                    .array(
                        z.object({
                            criteriaId: z
                                .number()
                                .int()
                                .positive(),

                            rawValue: z
                                .coerce.number()
                                .nonnegative()
                                .nullable()
                        })
                    ).min(1)
            })
        ).min(1)
});

export const calculateSchema = z.object({
    periodId: z.number({message: "Periode tidak boleh kosong"}),
    positionId: z.number({message: "Posisi tidak boleh kosong"}),
    employees: z.array(
        z.object({
            employeeId: z.number().int().positive(),

            details: z.array(
                z.object({
                    criteriaId: z.number().int().positive(),

                    rawValue: z
                        .coerce.number()
                        .nonnegative()
                        .nullable()
                })
            ).min(1)
        })
    ).min(1)
})