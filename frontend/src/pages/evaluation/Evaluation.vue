<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Calculator, Filter, Award, Upload, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import { useEvaluationStore } from '../../stores/evaluation.store.ts'
import { usePeriodStore } from '../../stores/period.store.ts'
import positionService from '../../services/position.service.ts'
import periodService from '../../services/period.service.ts'
import type { Evaluation, SaveDraftPayload } from '../../types/evaluation.ts'
import { alertError, alertSuccess } from '../../utils/alert.ts'
import type { PositionCriteria } from '../../types/positionCriteria.ts'
import type { Employee } from '../../types/employee.ts'

const route = useRoute()
const router = useRouter()

const evaluationStore = useEvaluationStore()
const periodStore = usePeriodStore()

const periodId = Number(route.params.id)

const activeTab = ref(1)

const selectedPositionId = ref<number | null>(null)

const criteria = ref<PositionCriteria[]>([])
const employees = ref<Employee[]>([])

const isModalOpen = ref(false)
const selectedItem = ref<any>(null)

const loadingPage = ref(false)
const loadingData = ref(false)

const steps = [
    { id: 1, title: 'Input Nilai' },
    { id: 2, title: 'Nilai & Konversi' },
    { id: 3, title: 'Normalisasi' },
    { id: 4, title: 'Perankingan' }
]

const periodData = ref<{ id: number; month: number; year: number; name?: string } | null>(null)

const loadPeriodDetail = async () => {
    try {
        const response = await periodService.findById(periodId)
        periodData.value = response 
    } catch (error) {
        console.error("Gagal memuat detail periode:", error)
    }
}

const positions = computed(() => periodStore.positions)
const selectedPosition = computed(() => {
    return positions.value.find(position => position.id === selectedPositionId.value)
})

const evaluations = computed(() => evaluationStore.evaluations)

const isPositionLocked = computed(() => {
    return evaluations.value.length > 0 && evaluations.value.every(evaluation => evaluation.finalScore !== null)
})

const loadPositions = async () => {
    await periodStore.fetchPositions(periodId)

    if (
        positions.value.length > 0 &&
        selectedPositionId.value === null
    ) {
        selectedPositionId.value = positions.value[0].id
    }
}

const loadPositionData = async() => {
    if(!selectedPositionId.value) return

    loadingData.value = true

    try {
        criteria.value = await positionService.findCriteria(selectedPositionId.value)
        employees.value = await periodService.findEmployees(periodId, selectedPositionId.value)

        await evaluationStore.fetchEvaluation(periodId, selectedPositionId.value)

        if(evaluationStore.evaluations.length === 0) {
            const emptyEvaluations: Evaluation[] = employees.value.map((employee: any) => ({
                id: 0,
                finalScore: null,
                rank: null,
                resultNote: null,
                employeeId: employee.id,
                employee: {
                    id: employee.id,
                    code: employee.code,
                    name: employee.name
                },
                evaluationDetails: criteria.value.map((item: any) => ({
                    id: 0,
                    rawValue: null,
                    ratingScore: null,
                    normalizedValue: null,
                    weight: Number(item.weight),
                    weightedValue: null,
                    criteriaId: item.criteria.id,
                    criteria: {
                        id: item.criteria.id,
                        name: item.criteria.name,
                        type: item.criteria.type
                    }
                }))
            }))

            evaluationStore.evaluations = emptyEvaluations
        }
    } finally {
        loadingData.value = false
    }
}

const getRatingScaleError = (c: any, rawValue: number | null) => {
    if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
        return ''
    }

    const ratingScales = c.criteria.ratingScales ?? []

    if (ratingScales.length === 0) return ''

    const value = Number(rawValue)

    const isValid = ratingScales.some((scale: any) => {
        return (
            value >= Number(scale.minValue) &&
            value <= Number(scale.maxValue)
        )
    })

    return isValid ? '' : `Nilai tidak sesuai skala konversi ${c.criteria.name}`
}

watch(selectedPositionId, async () => {
    activeTab.value = 1

    await loadPositionData()
})

onMounted(async () => {
    loadingPage.value = true

    try {
        await loadPositions()
        await loadPeriodDetail()
    } finally {
        loadingPage.value = false
    }
})

const handleSaveDraft = async() => {
    if(!selectedPositionId.value) {
        alertError("Silahkan pilih posisi terlebih dahulu")
        return
    }

    if(isPositionLocked.value) {
        alertError("Penilaian untuk posisi ini sudah dihitung dan tidak dapat diubah")
        return
    }

    const data: SaveDraftPayload = {
        periodId,
        positionId: selectedPositionId.value,
        employees: evaluations.value.map(evaluation => ({
            employeeId: evaluation.employeeId,
            details: evaluation.evaluationDetails.map(detail => ({
                criteriaId: detail.criteriaId,
                rawValue: detail.rawValue
            }))
        }))
    }

    try {
        await evaluationStore.saveDraft(data)

        await loadPositionData()
        alertSuccess("Draft penilaian berhasil disimpan")
    } catch (error: any) {
        alertError(error?.response?.data?.message || "Gagal menyimpan draft penilaian")
    }
}

const handleCalculate = async() => {
    if (!selectedPositionId.value) {
        alertError("Silakan pilih posisi terlebih dahulu")
        return
    }

    if (isPositionLocked.value) {
        alertError("Penilaian untuk posisi ini sudah dihitung")
        return
    }

    try {
        const payload = {
            periodId,
            positionId: selectedPositionId.value,

            employees: evaluationStore.evaluations.map(
                (evaluation) => ({
                    employeeId: evaluation.employeeId,

                    details:
                        evaluation.evaluationDetails.map(
                            (detail) => ({
                                criteriaId: detail.criteriaId,
                                rawValue: detail.rawValue
                            })
                        )
                })
            )
        }
        await evaluationStore.calculate(payload)

        await loadPositionData()

        activeTab.value = 5

        alertSuccess("Perhitungan berhasil")
    } catch (error: any) {
        alertError(error?.response?.data?.message || "Gagal melakukan perhitungan")
    }
}

const isCalculated = computed(() => {
    return evaluations.value.length > 0 && evaluations.value.some(e => e.finalScore !== null)
})

const getDetail = (evaluationItem: any, criteriaId: number | string) => {
    return evaluationItem.evaluationDetails?.find((d: any) => d.criteriaId === criteriaId);
};

const formatNumber = (value: number | string | null, decimal = 3) => {
    if(value === null || value === undefined) {
        return "-"
    }

    return Number(value).toFixed(decimal)
}

const getRecommendationCount = (evaluation: Evaluation) => {
    return evaluation.recommendations?.length ?? 0
}

const openRecommendation = (evaluation: Evaluation) => {
    selectedItem.value = evaluation
    isModalOpen.value = true
}

const getStatusEvaluation = (resultNote: string) => {
    switch(resultNote) {
        case "Terbaik": return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
        case "Baik": return 'bg-blue-50 text-blue-600 border border-blue-200'
        case "Cukup": return 'bg-yellow-50 text-yellow-600 border border-yellow-200'
        case "Kurang": return 'bg-orange-50 text-orange-600 border border-orange-200'
        case "Sangat Kurang": return 'bg-red-50 text-red-600 border border-red-200'
        default: return ""
    }
} 

const sortedEvaluations = computed(() => {
    return [...evaluations.value].sort((a, b) => {
        const rankA = a.rank ?? Infinity
        const rankB = b.rank ?? Infinity
        return rankA - rankB
    })
})
</script>

<template>
    <MainLayout>
        <div class="space-y-6 max-w-7xl mx-auto pb-10">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                        <ArrowLeft class="w-5 h-5" />
                    </button>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Penilaian & Analisis</h1>
                        <p class="text-xs text-gray-500">Kelola penilaian dan kalkulasi peringkat per periode</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <Filter class="w-4 h-4 text-gray-400" />
                    <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">Posisi:</span>
                    <select v-model="selectedPositionId" class="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer">
                        <option :value="null" disabled>--Pilih Posisi--</option>
                        <option v-for="pos in positions" :key="pos.id" :value="pos.id">{{ pos.name }}</option>
                    </select>
                </div>
            </div>

            <div class="bg-indigo-900 text-white p-5 rounded-2xl shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                    <span class="text-indigo-200 block">Periode:</span>
                    <span class="font-bold text-sm text-white">{{ periodData?.name }} {{ periodData?.year }}</span>
                </div>
                <div>
                    <span class="text-indigo-200 block">Posisi Terpilih:</span>
                    <span class="font-bold text-sm text-white">{{ selectedPosition?.name ?? "-" }}</span>
                </div>
                <div>
                    <span class="text-indigo-200 block">Total Karyawan:</span>
                    <span class="font-bold text-sm text-white">{{ evaluations.length }} Karyawan</span>
                </div>
                <div>
                    <span class="text-indigo-200 block">Metode SPK:</span>
                    <span class="font-bold text-sm text-amber-300">Simple Additive Weighting (SAW)</span>
                </div>
            </div>

            <div class="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button v-for="step in steps" :key="step.id" @click="activeTab = step.id" :class="['py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer', activeTab === step.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900']">
                        <span :class="['w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0', activeTab === step.id ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600']">
                            {{ step.id }}
                        </span>
                        <span class="truncate">{{ step.title }}</span>
                    </button>
                </div>
            </div>

            <div v-if="loadingPage || loadingData" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                <div class="text-sm text-gray-500">
                    Memuat data penilaian...
                </div>
            </div>

            <div v-else class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                
                    <table v-if="activeTab === 1" class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 bg-gray-50/50">
                                <th class="py-4 px-6">NAMA KARYAWAN</th>
                                <th v-for="item in criteria" :key="item.criteria.id" class="py-4 px-6">
                                    {{ item.criteria.name }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-for="item in evaluations" :key="item.employeeId" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                    {{ item.employee.name }}
                                </td>
                                <td v-for="c in criteria" :key="c.criteria.id" class="py-3 px-6">
                                    <template v-if="getDetail(item, c.criteria.id)">
                                        <input type="number" v-model.number="getDetail(item, c.criteria.id).rawValue" :disabled="isPositionLocked" :class="['w-28 px-3 py-1.5 bg-gray-50 border rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed',getRatingScaleError(c, getDetail(item, c.criteria.id).rawValue)? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20']"/>

                                        <p v-if="getRatingScaleError(c, getDetail(item, c.criteria.id).rawValue)" class="mt-1 text-xs text-red-500">
                                            {{ getRatingScaleError(c, getDetail(item, c.criteria.id).rawValue) }}
                                        </p>
                                    </template>

                                    <span v-else class="text-xs text-gray-400 font-normal italic">
                                        -
                                    </span>
                                </td>
                            </tr>

                            <tr v-if="evaluations.length === 0">
                                <td :colspan="criteria.length + 1" class="py-10 text-center text-sm text-gray-400">
                                    Tidak ada karyawan pada posisi ini.
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table v-if="activeTab === 2" class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 bg-gray-50/50">
                                <th class="py-4 px-6">NAMA KARYAWAN</th>
                                <th v-for="item in criteria" :key="item.criteria.id" class="py-4 px-6">{{ item.criteria.name }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-for="item in evaluations" :key="item.employeeId" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-4 px-6 font-bold text-gray-900">{{ item.employee.name }}</td>
                                <td v-for="detail in item.evaluationDetails" :key="detail.criteriaId" class="py-4 px-6 text-gray-600 font-mono">
                                    {{ detail.rawValue ?? "-" }}

                                    <span class="mx-1 text-gray-400">
                                        →
                                    </span>

                                    {{ detail.ratingScore ?? "-" }}
                                </td>                              
                            </tr>
                        </tbody>
                    </table>

                    <template v-if="activeTab === 3" >
                        <div v-if="!isCalculated" class="py-12 text-center">
                            <AlertTriangle class="w-10 h-10 text-amber-500 mx-auto mb-3" />
                            <p class="text-sm font-bold text-gray-700">Data Normalisasi Belum Dihitung</p>
                            <p class="text-xs text-gray-500 mt-1">Silakan klik tombol "Hitung & Hasil" di Tab 1 terlebih dahulu.</p>
                        </div>
                        <table v-else class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 bg-gray-50/50">
                                    <th class="py-4 px-6">NAMA KARYAWAN</th>
                                    <th v-for="item in criteria" :key="item.criteria.id" class="py-4 px-6">{{ item.criteria.name }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                <tr v-for="item in evaluations" :key="item.employeeId" class="hover:bg-gray-50/50 transition-colors">
                                    <td class="py-4 px-6 font-bold text-gray-900">{{ item.employee.name }}</td>
                                    <td v-for="detail in item.evaluationDetails" :key="detail.criteriaId" class="py-4 px-6 text-gray-600 font-mono">{{ formatNumber(detail.normalizedValue)}}</td>                              
                                </tr>
                            </tbody>
                        </table>
                    </template>

                    <!-- <template v-if="activeTab === 4">
                        <div v-if="!isCalculated" class="py-12 text-center">
                            <AlertTriangle class="w-10 h-10 text-amber-500 mx-auto mb-3" />
                            <p class="text-sm font-bold text-gray-700">Nilai Preferensi Belum Dihitung</p>
                            <p class="text-xs text-gray-500 mt-1">Silakan klik tombol "Hitung & Hasil" di Tab 1 terlebih dahulu.</p>
                        </div>
                        <table v-else class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 bg-gray-50/50">
                                    <th class="py-4 px-6">NAMA KARYAWAN</th>
                                    <th v-for="item in criteria" :key="item.criteria.id" class="py-4 px-6">{{ item.criteria.name }}</th>
                                    <th class="py-4 px-6">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                <tr v-for="item in evaluations" :key="item.employeeId" class="hover:bg-gray-50/50 transition-colors">
                                    <td class="py-4 px-6 font-bold text-gray-900">{{ item.employee.name }}</td>
                                    <td v-for="detail in item.evaluationDetails" :key="detail.criteriaId" class="py-4 px-6 text-gray-600 font-mono">{{ formatNumber(detail.weightedValue) }}</td>                            
                                    <td class="py-4 px-6 text-center font-bold text-blue-600 font-mono">
                                        {{ formatNumber(item.finalScore) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </template> -->

                    <template v-if="activeTab === 4">
                        <div v-if="!isCalculated" class="py-12 text-center">
                                <AlertTriangle class="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                <p class="text-sm font-bold text-gray-700">Hasil Perankingan Belum Ada</p>
                                <p class="text-xs text-gray-500 mt-1">Silakan klik tombol "Hitung & Hasil" di Tab 1 terlebih dahulu.</p>
                            </div>
                        <table v-else class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 bg-gray-50/50">
                                    <th class="py-4 px-6 text-center w-24">RANK</th>
                                    <th class="py-4 px-6">NAMA KARYAWAN</th>
                                    <th v-for="item in criteria" :key="item.criteria.id" class="py-4 px-6">{{ item.criteria.name }}</th>
                                    <th class="py-4 px-6 text-center">SKOR AKHIR (V)</th>
                                    <th class="py-4 px-6 text-right">HASIL EVALUASI</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                <tr v-for="item in sortedEvaluations" :key="item.employeeId" class="hover:bg-gray-50/50 transition-colors">
                                
                                    <td class="py-4 px-6 text-center">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                        <Award class="w-3.5 h-3.5" :class="item.rank === 1 ? 'text-yellow-500' : ''" />
                                        #{{ item.rank ?? "-" }}
                                        </span>
                                    </td>
    
                                    <td class="py-4 px-6">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-gray-900">{{ item.employee.name }}</span>
                                            <span class="text-xs text-gray-400">{{ item.employee.code }}</span>
                                        </div>
                                    </td>
    
                                    <td v-for="detail in item.evaluationDetails" :key="detail.criteriaId" class="py-4 px-6 text-gray-600 font-mono">{{ formatNumber(detail.weightedValue) }}</td>     
                                    
                                    <td class="py-4 px-6 text-center font-bold text-blue-600 font-mono">
                                        {{ formatNumber(item.finalScore) }}
                                    </td>
    
                                    <td class="py-4 px-6 text-right">
                                        <div class="inline-flex items-center justify-end gap-2">
                                            <span :class="[getStatusEvaluation(item.resultNote ?? ''), 'px-3 py-1 rounded-full text-xs font-bold border']">
                                                {{ item.resultNote ?? "-" }}
                                            </span>
    

                                            <button v-if="getRecommendationCount(item) > 0" @click="openRecommendation(item)" title="Lihat Rekomendasi Pembinaan" class="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95 cursor-pointer">
                                                <AlertTriangle class="w-4 h-4 animate-bounce" />
                                            </button>
    
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </template>
                </div>
            </div>

            <Teleport to="body">
                <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-all">
                    <div class="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div class="flex items-center gap-2.5">
                                <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                    <Sparkles class="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 class="text-base font-bold text-gray-900">Rekomendasi Pembinaan</h3>
                                    <p class="text-xs text-gray-500 mt-0.5">Catatan otomatis dari sistem berdasarkan hasil kriteria</p>
                                </div>
                            </div>

                            <button @click="isModalOpen = false" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="p-6 pb-2">
                            <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Karyawan</span>
                                    <h4 class="text-sm font-bold text-gray-900 mt-0.5">
                                        {{ selectedItem.employee.name }}
                                        <span class="text-xs font-normal text-gray-500">{{ selectedItem.employee.code }}</span>
                                    </h4>
                                </div>
                                
                                <div class="text-right">
                                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Skor & Rank</span>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-xs font-bold text-blue-600 font-mono">
                                            {{ formatNumber(selectedItem.finalScore, 3) }}
                                        </span>
                                        <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold">
                                            Rank #{{ selectedItem.rank ?? "-" }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-6 pt-2 space-y-3 max-h-[380px] overflow-y-auto">
                            <label class="block text-xs font-bold text-gray-700 mb-1">
                                Daftar Catatan Per Kriteria:
                            </label>

                            <div v-for="item in selectedItem.recommendations ?? []" :key="item.criteriaName" class="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-1.5 transition-all hover:bg-amber-50">
                                <div  class="flex items-center gap-2 text-amber-800 font-bold text-xs">
                                    <AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{{ item.criteriaName }}</span>
                                </div>
                                <p class="text-xs text-amber-900/80 leading-relaxed pl-5 font-medium">
                                    {{ item.recommendation }}
                                </p>
                            </div>
                            <div v-if="!selectedItem.recommendations || selectedItem.recommendations.length === 0 "class="py-6 text-center text-xs text-gray-400">
                                Tidak ada rekomendasi pembinaan.
                            </div>
                        </div>

                        <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button type="button" @click="isModalOpen = false" class="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all cursor-pointer shadow-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </Teleport>

            <template v-if="activeTab === 1">
                <div v-if="isPositionLocked" class="flex items-center justify-end gap-3 pt-2">
                    <button class="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-green-500/20 cursor-pointer">
                        <CheckCircle2 class="w-4 h-4" />
                        Sudah dinilai
                    </button>
                </div>
                <div v-else class="flex items-center justify-end gap-3 pt-2">
                    <button @click="handleSaveDraft" :disabled="evaluationStore.saving || isPositionLocked"  class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                        <Save class="w-4 h-4 text-gray-500" />
                        {{ evaluationStore.saving ? "Menyimpan..." : "Simpan Draft" }}
                    </button>
    
                    <button @click="handleCalculate" class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20 cursor-pointer">
                        <Calculator class="w-4 h-4" />
                        {{ evaluationStore.calculating ? "Menghitung..." : "Hitung" }}
                    </button>
                </div>
            </template>

            <!-- <div v-if="activeTab === 4 && isCalculated" class="flex items-center justify-end gap-3 pt-2">
                <button class="flex items-center gap-2 px-4 py-2 bg-green-500 border border-gray-200 rounded-xl text-sm font-medium text-white hover:bg-green-600 transition-colors shadow-sm cursor-pointer">
                    <Upload class="w-4 h-4 text-white" />
                    Export
                </button>
            </div> -->
            
        </div>
    </MainLayout>
</template>