import type { CreatePositionPayload, UpdatePositionPayload } from "../types/position";
import api from "./api";

class PositionService {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/positions", {params})

        return response.data.data
    }

    async findOption() {
        const response = await api.get("/positions/options")

        return response.data.data
    }

    async findCriteria(id: number) {
        const response = await api.get(`/positions/${id}/criteria`)

        return response.data.data
    }

    async create(data: CreatePositionPayload) {
        const response = await api.post("/positions", data)

        return response.data.data
    }

    async update(id: number, data: UpdatePositionPayload) {
        const response = await api.put(`/positions/${id}`, data)

        return response.data.data
    }

    async remove(id: number) {
        const response = await api.delete(`/positions/${id}`)

        return response.data.data
    }
}

export default new PositionService()