export const getResultNote = (finalScore: number) => {
    if (finalScore >= 0.81) {
        return "Terbaik"
    }

    if (finalScore >= 0.61) {
        return "Baik"
    }

    if (finalScore >= 0.41) {
        return "Cukup"
    }

    if (finalScore >= 0.21) {
        return "Kurang"
    }

    return "Sangat Kurang"
}

export const getRecommendation = (criteriaName: string, ratingScore: number) => {
    if (ratingScore === 3) {
        return {
            criteriaName,
            recommendation:
                `Perlu meningkatkan kinerja pada aspek ${criteriaName}.`
        }
    }

    if (ratingScore === 2) {
        return {
            criteriaName,
            recommendation:
                `Perlu pembinaan pada aspek ${criteriaName} untuk meningkatkan kinerja.`
        }
    }

    if (ratingScore === 1) {
        return {
            criteriaName,
            recommendation:
                `Perlu pembinaan intensif pada aspek ${criteriaName} untuk meningkatkan kinerja.`
        }
    }

    return null
}