export interface DashboardPeriod {
    id: number
    month: number
    year: number
    status: "OPEN" | "CLOSED"
}

export interface DashboardPosition {
    id: number
    name: string
}

export interface AdminDashboardCards {
    totalEmployees: number
    activeEmployees: number
    averageScore: number
    needDevelopment: number
}

export interface PerformanceDistribution {
    label: string
    total: number
}

export interface PerformanceTrend {
    periodId: number
    label: string
    averageScore: number
}

export interface TopEmployee {
    employeeId: number
    code: string
    name: string
    position: string
    finalScore: number
    rank: number | null
    resultNote: string | null
}

export interface AdminDashboard {
    periodId: number
    cards: AdminDashboardCards
    distribution: PerformanceDistribution[]
    trend: PerformanceTrend[]
    topEmployees: TopEmployee[]
}