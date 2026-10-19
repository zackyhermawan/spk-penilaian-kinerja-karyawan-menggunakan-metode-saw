const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export const getMonthName = (month: number): string => {
    return MONTH_NAMES[month - 1] ?? "-"
}