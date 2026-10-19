import z from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username harus diisi"),
    password: z.string().min(6, "Password harus memiliki minimal 6 karakter")
})