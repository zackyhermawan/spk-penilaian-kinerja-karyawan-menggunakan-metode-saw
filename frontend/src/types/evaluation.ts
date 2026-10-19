import type { CriteriaType } from "./criteria"

export interface EvaluationDetail {
    id: number
    rawValue: number | null
    ratingScore: number | null
    normalizedValue: number | null
    weight: number
    weightedValue: number | null
    criteriaId: number

    criteria: {
        id: number
        name: string
        type: CriteriaType
    }
}

export interface Recommendation {
    criteriaName: string
    recommendation: string
}

export interface Evaluation {
    id: number
    finalScore: number | null
    rank: number | null
    resultNote: string | null
    employeeId: number
    
    employee: {
        id: number
        code: string
        name: string
    }

    evaluationDetails: EvaluationDetail[]
    recommendations?: Recommendation[]
}

export interface SaveDraftDetail {
    criteriaId: number
    rawValue: number | null
}

export interface SaveDraftEmployee {
    employeeId: number
    details: SaveDraftDetail[]
}

export interface SaveDraftPayload {
    periodId: number
    positionId: number
    employees: SaveDraftEmployee[]
}

export interface CalculatePayload {
    periodId: number
    positionId: number
    employees: SaveDraftEmployee[]
}