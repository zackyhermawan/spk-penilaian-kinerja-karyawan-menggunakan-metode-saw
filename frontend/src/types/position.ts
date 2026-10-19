export interface Position {
    id: number
    name: string
    description?: string
    totalEmployee?: number
    createdAt?: string
    updatedAt?: string
}

export interface CreatePositionPayload {
    name: string
    description?: string
}

export interface UpdatePositionPayload {
    name?: string
    description?: string
}