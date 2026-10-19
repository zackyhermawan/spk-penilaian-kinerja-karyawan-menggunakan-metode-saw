import type { Position } from "./position"

export type CriteriaType = "BENEFIT" | "COST" 

export interface PositionCriteria {
    id: number
    weight: number
    position: Position
}

export interface Criteria {
    id: number
    name: string
    groupName?: string
    isActive: boolean
    type: CriteriaType
    positionCriterias: PositionCriteria[]
}

export interface CreateCriteriaPayload {
    name: string
    groupName?: string
    type: CriteriaType
}

export interface UpdateCriteriaPayload {
    name?: string
    groupName?: string
    isActive?: boolean
    type?: CriteriaType
}