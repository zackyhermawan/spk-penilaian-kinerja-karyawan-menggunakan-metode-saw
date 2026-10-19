import type { CreateEmployeePayload, EmployeeStatus, UpdateEmployeePayload } from "../types/employee";
import api from "./api";

class EmployeeService {
    async findAll(params?: Record<string, unknown>) {
        const response = await api.get("/employees", {params})

        return response.data.data
    }

    async findOption() {
        const response = await api.get("/employees/options")

        return response.data.data
    }

    async create(data: CreateEmployeePayload) {
        const response = await api.post("/employees", data)

        return response.data.data
    }

    async update(id: number, data: UpdateEmployeePayload) {
        const response = await api.put(`/employees/${id}`, data)

        return response.data.data
    }

    async updateStatus(id: number, status: EmployeeStatus) {
        const response = await api.patch(`/employees/${id}/status`, {status})

        return response.data.data
    }

    async remove(id: number) {
        const response = await api.delete(`/employees/${id}`)

        return response.data.data
    }
}

export default new EmployeeService()