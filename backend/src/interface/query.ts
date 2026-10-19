import { PaginationQuery } from "./pagination.js";

export interface QueryParams extends PaginationQuery {
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
}