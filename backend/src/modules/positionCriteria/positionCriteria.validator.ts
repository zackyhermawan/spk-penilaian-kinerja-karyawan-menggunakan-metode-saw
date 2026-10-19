import z from "zod";

export const createPositionCriteriaSchema = z.object({
    weight: z.coerce.number({error: "Bobot harus berupa angka"}).min(0.1, {message: "Bobot tidak boleh 0"},).max(100, {message: "Bobot tidak boleh lebih dari 100%"}),
    positionId: z.coerce.number({message: "Posisi tidak boleh kosong"}),
    criteriaId: z.coerce.number({message: "Kriteria tidak boleh kosong"})
})