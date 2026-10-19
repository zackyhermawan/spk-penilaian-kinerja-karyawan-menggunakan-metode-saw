import { QueryParams } from "./query.js";

export interface PositionCriteriaQuery extends QueryParams {
    positionId?: number
    criteriaId?: number
}