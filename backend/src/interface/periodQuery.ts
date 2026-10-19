import { PeriodStatus } from "@prisma/client";
import { QueryParams } from "./query.js";

export interface PeriodQuery extends QueryParams {
    month?: number
    year?: number
    status?: PeriodStatus
}