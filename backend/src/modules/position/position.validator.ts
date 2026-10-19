import z from "zod";

export const createPositionSchema = z.object({
    name: z.string().min(3, "Nama posisi minimal 3 karakter"),
    description: z.string().optional()
})