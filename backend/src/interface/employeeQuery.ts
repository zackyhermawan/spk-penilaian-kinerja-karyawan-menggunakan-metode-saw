import { QueryParams } from "./query.js";

export interface EmployeeQuery extends QueryParams {
    status?: string
    positionId?: number
}