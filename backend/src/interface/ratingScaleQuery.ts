import { QueryParams } from "./query.js";

export interface RatingScaleQuery extends QueryParams {
    score?: number
    criteriaId?: number
}