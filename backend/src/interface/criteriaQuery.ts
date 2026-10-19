import { QueryParams } from "./query.js";

export interface CriteriaQuery extends QueryParams {
    isActive?: boolean
    type?: "COST" | "BENEFIT"
    positionId?: number
}