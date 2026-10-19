import type { CreateRatingScalePayload, UpdateRatingScalePayload } from "../types/ratingScale";
import api from "./api";

class RatingScaleService {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/rating-scales", {params})

        return response.data.data
    }

    async create(data: CreateRatingScalePayload) {
        const response = await api.post("/rating-scales", data)

        return response.data.data
    }

    async update(id: number, data: UpdateRatingScalePayload) {
        const response = await api.put(`/rating-scales/${id}`, data)

        return response.data.data
    }

    async remove(id: number) {
        const response = await api.delete(`/rating-scales/${id}`)

        return response.data.data
    }
}

export default new RatingScaleService()