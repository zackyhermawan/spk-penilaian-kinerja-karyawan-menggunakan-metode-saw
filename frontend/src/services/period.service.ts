import type { CreatePeriodPayload, UpdatePeriodPayload } from "../types/period";
import api from "./api";

class PeriodService {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/periods", {params})

        return response.data.data
    }

    async findOption() {
        const response = await api.get("/periods/options")

        return response.data.data
    }

    async findActive() {
        const response = await api.get("/periods/active")

        return response.data.data
    }

    async findById(id: number) {
        const response = await api.get(`/periods/${id}`)

        return response.data.data
    }

    async create(data: CreatePeriodPayload) {
        const response = await api.post("/periods", data)

        return response.data.data
    }

    async update(id: number, data: UpdatePeriodPayload) {
        const response = await api.put(`/periods/${id}`, data)

        return response.data.data
    }

    async remove(id: number) {
        const response = await api.delete(`/periods/${id}`)

        return response.data.data
    }

    async findPositions(periodId: number) {
        const response = await api.get(`/periods/${periodId}/positions`)

        return response.data.data
    }

    async findEmployees(periodId: number, positionId: number) {
        const response = await api.get(`/periods/${periodId}/employees`, {params: {positionId}})

        return response.data.data
    }
}

export default new PeriodService()