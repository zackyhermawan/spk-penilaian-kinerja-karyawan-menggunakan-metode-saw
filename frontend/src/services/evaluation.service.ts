import type { CalculatePayload, SaveDraftPayload } from "../types/evaluation";
import api from "./api";

class EvaluationService {
    async findByPeriodAndPosition(periodId: number, positionId: number) {
        const response = await api.get(`/evaluations/period/${periodId}`, {params: {positionId}})

        return response.data.data
    }

    async saveDraft(data: SaveDraftPayload) {
        const response = await api.post("/evaluations", data)

        return response.data.data
    }

    async calculate(data: CalculatePayload) {
        const response = await api.post("/evaluations/calculate", data)

        return response.data.data
    }
}

export default new EvaluationService()