import type { Position } from "./position"

export type EmployeeStatus = "ACTIVE" | "INACTIVE"

export interface Employee {
    id: number
    code: string
    name: string
    phone?: string
    birthDate: string
    status: EmployeeStatus
    positionId: number
    position: Position
}

export interface CreateEmployeePayload {
    code: string
    name: string
    phone?: string
    birthDate: string
    status: EmployeeStatus
    positionId: number
}

export interface UpdateEmployeePayload {
    code?: string
    name?: string
    phone?: string
    birthDate?: string
    status?: EmployeeStatus
    positionId?: number
}