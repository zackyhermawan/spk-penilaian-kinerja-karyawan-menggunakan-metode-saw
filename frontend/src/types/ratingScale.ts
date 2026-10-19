import type { Criteria } from "./criteria"

export interface RatingScale {
    id: number
    minValue: number
    maxValue: number
    label?: string
    score: number
    criteriaId: number
    criteria: Criteria
}

export interface CreateRatingScalePayload {
    criteriaId: number
    minValue: number
    maxValue: number
    label?: string
    score: number
}

export interface UpdateRatingScalePayload {
    criteriaId?: number
    minValue?: number
    maxValue?: number
    label?: string
    score?: number
}