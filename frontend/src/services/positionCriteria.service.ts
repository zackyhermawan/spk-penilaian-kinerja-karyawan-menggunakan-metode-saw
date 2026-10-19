import type { CreatePositionCriteriaPayload, UpdatePositionCriteriaPayload } from "../types/positionCriteria";
import api from "./api";

class PositionCriteria {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/position-criterias", {params})

        return response.data.data
    }

    async getWeightSummary() {
        const response = await api.get("/position-criterias/weight-summary")

        return response.data.data
    }

    async create(data: CreatePositionCriteriaPayload) {
        const response = await api.post("/position-criterias", data)

        return response.data.data
    }

    async update(id: number, data: UpdatePositionCriteriaPayload) {
        const response = await api.put(`/position-criterias/${id}`, data)

        return response.data.data
    }

    async remove(id: number) {
        const response = await api.delete(`/position-criterias/${id}`)

        return response.data.data
    }
}

export default new PositionCriteria()