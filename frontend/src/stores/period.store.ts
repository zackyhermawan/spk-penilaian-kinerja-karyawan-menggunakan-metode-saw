import { defineStore } from "pinia";
import type { CreatePeriodPayload, Period, Position, UpdatePeriodPayload } from "../types/period";
import periodService from "../services/period.service"

export const usePeriodStore = defineStore("period", {
    state: ()=> ({
        periods: [] as Period[],
        positions: [] as Position[],
        loading: false
    }),

    actions: {
        async fetchPeriods(params?: Record<string, unknown>) {
            this.loading = true

            try {
                this.periods = await periodService.findAll(params)
            } finally {
                this.loading = false
            }
        },

        async createPeriod(data: CreatePeriodPayload) {
            return await periodService.create(data)
        },

        async updatePeriod(id: number, data: UpdatePeriodPayload) {
            return await periodService.update(id, data)
        },

        async fetchPositions(periodId: number) {
            this.positions = await periodService.findPositions(periodId)
        },

        async fetchEmployees(periodId: number, positionId: number) {
            return await periodService.findEmployees(periodId, positionId)
        },

        async deletePeriod(id: number) {
            return await periodService.remove(id)
        }
    }
})