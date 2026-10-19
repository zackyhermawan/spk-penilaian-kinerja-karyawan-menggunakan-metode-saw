import type { CreateCriteriaPayload, UpdateCriteriaPayload } from "../types/criteria";
import api from "./api";

class CriteriaService {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/criterias", {params})

        return response.data.data
    }

    async findOption() {
        const response = await api.get("/criterias/options")

        return response.data.data
    }

    async create(data: CreateCriteriaPayload) {
        const response = await api.post("/criterias", data)

        return response.data.data
    }

    async update(id: number, data: UpdateCriteriaPayload) {
        const responsee = await api.put(`/criterias/${id}`, data)

        return responsee.data.data
    }

    async updateStatus(id: number, isActive: boolean) {
        const responsee = await api.patch(`/criterias/${id}/status`, {isActive})

        return responsee.data.data
    }

    async remove(id: number) {
        const responsee = await api.delete(`/criterias/${id}`)

        return responsee.data.data
    }
}

export default new CriteriaService()