import z from "zod";

export const createCriteriaSchema = z.object({
    name: z.string().min(3, {message: "Nama kriteria minimal 3 karakter"}),
    groupName: z.string().min(3, {message: "Nama grup kriteria harus lebih dari 2 karakter"}).optional(),
    type: z.enum(["COST", "BENEFIT"])
})

export const updateStatusCriteriaSchema = z.object({
    isActive: z.boolean()
})