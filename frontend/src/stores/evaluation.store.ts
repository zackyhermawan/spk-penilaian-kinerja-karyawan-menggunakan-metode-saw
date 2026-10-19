import { defineStore } from "pinia";
import type { CalculatePayload, Evaluation, SaveDraftPayload } from "../types/evaluation";
import evaluationService from "../services/evaluation.service";

export const useEvaluationStore = defineStore("evaluation", {
    state: ()=> ({
        evaluations: [] as Evaluation[],
        loading: false,
        saving: false,
        calculating: false
    }),

    actions: {
        async fetchEvaluation(periodId: number, positionId: number) {
            this.loading = true

            try {
                this.evaluations = await evaluationService.findByPeriodAndPosition(periodId, positionId)
            } finally {
                this.loading = false
            }
        },

        async saveDraft(data: SaveDraftPayload) {
            this.saving = true

            try {
                return await evaluationService.saveDraft(data)
            } finally {
                this.saving = false
            }
        },

        async calculate(data: CalculatePayload) {
            this.calculating = true

            try {
                return await evaluationService.calculate(data)
            } finally {
                this.calculating = false
            }
        },

        clearEvaluations() {
            this.evaluations = []
        }
    }
})