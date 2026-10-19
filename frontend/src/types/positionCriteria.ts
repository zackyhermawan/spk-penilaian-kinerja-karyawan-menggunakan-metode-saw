import type { Criteria } from "./criteria"
import type { Position } from "./position"

export interface PositionCriteria {
    id: number
    weight: number
    positionId: number,
    criteriaId: number
    criteria: Criteria
    position: Position
}

export interface CreatePositionCriteriaPayload {
    weight: number
    positionId: number
    criteriaId: number
}

export interface UpdatePositionCriteriaPayload {
    weight?: number
    positionId?: number
    criteriaId?: number
}

export interface PositionWeightSummary {
    positionId: number
    positionName: string
    totalWeight: number
    remainingWeight: number
    isValid: boolean
}
