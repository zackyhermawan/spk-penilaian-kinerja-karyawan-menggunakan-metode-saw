import z from "zod";

export const createEmployeeSchema = z.object({
    code: z.string().min(6, {message: "Kode karyawan minimal 6 karakter"}),
    name: z.string().min(1, {message: "Nama karyawan tidak boleh kosong"}),
    phone: z.string().regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor telepon tidak valid (contoh: 0812345678)").optional(),
    birthDate: z.string({message: "Tanggal lahir tidak boleh kosong"}),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    positionId: z.number({message: "Posisi tidak boleh kosong"}),
})

export const updateStatusEmployeeSchema = z.object({
    status: z.enum(["ACTIVE", "INACTIVE"])
})