import z from "zod";

export const createPeriodSchema = z.object({
    month: z.number({message: "Bulan tidak boleh kosong"}),
    year: z.number({error: "Tahun harus berupa angka"}).min(1, {message: "Tahun tidak boleh kosong"}),
})