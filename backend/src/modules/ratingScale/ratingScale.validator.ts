import z from "zod";

export const createRatingScaleSchema = z.object({
    minValue: z.coerce.number({error: "Nilai minimal harus berupa angka"}),
    maxValue: z.coerce.number({error: "Nilai maksimal harus berupa angka"}),
    label: z.string().optional(),
    score: z.coerce.number({error: "Skor harus berupa angka"}),
    criteriaId: z.coerce.number({message: "Kriteria tidak boleh kosong"})
})