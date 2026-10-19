import z from "zod";

export const changePasswordSchema = z.object({
    newPassword: z.string({message: "Password tidak boleh kosong"}).min(6, {message: "Password minimal harus 6 karakter"})
})