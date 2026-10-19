import type { AdminDashboard, DashboardPeriod, DashboardPosition } from "../types/dashboard"
import api from "./api"

class DashboardService {
    async getAdminDashboard (
        periodId?: number,
        positionId?: number
    ) {
        const response = await api.get<AdminDashboard>(
            "/dashboards/admin",
            {
                params: {
                    periodId,
                    positionId
                }
            }
        )

        return response.data
    }

    async getDashboardPeriods() {
        const response = await api.get<DashboardPeriod[]>(
            "/periods/options"
        )

        return response.data
    }

    async getDashboardPositions() {
        const response = await api.get<DashboardPosition[]>(
            "/positions/options"
        )

        return response.data
    }
}

export default new DashboardService()