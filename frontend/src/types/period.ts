
export type PeroidStatus = "OPEN" | "CLOSED"

export interface Position {
    id: number
    name: string
}

export interface Period {
    id: number
    name?: string
    month: number
    year: number
    status: PeroidStatus
    _count: any
    createdAt?: string
    updatedAt?: string 
}

export interface CreatePeriodPayload {
    month: number
    year: number
}

export interface UpdatePeriodPayload {
    month?: number
    year?: number
    status?: PeroidStatus
}