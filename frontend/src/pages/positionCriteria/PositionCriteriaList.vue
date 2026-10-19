<script setup lang="ts">
import { computed, onMounted, reactive, ref, Teleport } from 'vue'
import { Plus, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, X, RotateCcw } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert.ts'
import type { Criteria } from '../../types/criteria.ts'
import criteriaService from '../../services/criteria.service.ts'
import type { Position } from '../../types/position.ts'
import type { CreatePositionCriteriaPayload, PositionCriteria, PositionWeightSummary, UpdatePositionCriteriaPayload } from '../../types/positionCriteria.ts'
import positionCriteriaService from '../../services/positionCriteria.service.ts'
import positionService from '../../services/position.service.ts'

const positionCriterias = ref<PositionCriteria[]>([])
const criterias = ref<Criteria[]>([])
const positions = ref<Position[]>([])

const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const isFilterModalOpen = ref(false)
const loading = ref(false)
const errorMessage = ref("")

const filterPosition = ref<number | null>(null)
const filterCriteria = ref<number | null>(null)
const weightSummaries = ref<PositionWeightSummary[]>([])

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});

const appliedFilters = reactive({
    positionId: null as number | null,
    criteriaId: null as number | null
})

const handleLimitChange = () => {
    pagination.page = 1 
    fetchPositionCriterias()    
}

const formData = ref({
    id: 0,
    weight: null as number | null,
    positionId: null as number | null,
    criteriaId: null as number | null
})

const openCreateModal = () => {
    isEditMode.value = false

    formData.value = {
        id: 0,
        weight: null,
        positionId: null,
        criteriaId: null
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const openEditModal = (item: PositionCriteria) => {
    isEditMode.value = true

    formData.value = {
        id: item.id,
        weight: item.weight * 100,
        positionId: item.positionId,
        criteriaId: item.criteriaId
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const fetchPositionCriterias = async() => {
    loading.value = true

    try {
        const query: {
            page: number
            limit: number
            positionId?: number
            criteriaId?: number
        } = {
            page: pagination.page,
            limit: pagination.limit
        }

        if(appliedFilters.positionId !== null) {
            query.positionId = appliedFilters.positionId
        }

        if(appliedFilters.criteriaId) {
            query.criteriaId = appliedFilters.criteriaId
        }

        const response = await positionCriteriaService.findAll(query)
        positionCriterias.value = response.data
        if (response?.pagination) {
            pagination.total = response.pagination.total ?? 0
            pagination.totalPages = Math.ceil(
                (response.pagination.total || 0) / (response.pagination.limit || 1)
            )
        } else if (response?.meta) { 
            pagination.total = response.meta.total ?? 0
            pagination.totalPages = Math.ceil(
                (response.meta.total || 0) / (response.meta.limit || 1)
            )
        }
    } catch (error: any) {
        alertError(error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const fetchPositions = async() => {
    try {
        const response = await positionService.findOption()

        positions.value = response
    } catch (error: any) {
        alertError(error)
    }
}

const fetchCriterias = async() => {
    try {
        const response = await criteriaService.findOption()

        criterias.value = response
    } catch (error: any) {
        alertError(error)
    }
}

const fetchWeightSummary = async () => {
    try {
        weightSummaries.value = await positionCriteriaService.getWeightSummary()
    } catch (error: any) {
        alertError(error?.response?.data?.message || "Gagal mengambil ringkasan bobot")
    }
}

const selectedWeightSummary = computed(() =>
    weightSummaries.value.find(
        (item) => item.positionId === formData.value.positionId
    )
)

const maxAvailableWeight = computed(() => {
    const summary = selectedWeightSummary.value
    if (!summary) return 0

    let remaining = summary.remainingWeight * 100

    if (
        isEditMode.value &&
        formData.value.positionId ===
            positionCriterias.value.find(
                (item) => item.id === formData.value.id
            )?.positionId
    ) {
        const current = positionCriterias.value.find(
            (item) => item.id === formData.value.id
        )

        remaining += (current?.weight ?? 0) * 100
    }

    return Number(remaining.toFixed(2))
})

const goToPage = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
        pagination.page = newPage
        fetchPositionCriterias()
    }
}

const displayedPages = computed(() => {
  const total = pagination.totalPages
  const current = pagination.page
  const delta = 1 
  
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | null = null

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const applyFilter = () => {
    appliedFilters.positionId = filterPosition.value
    appliedFilters.criteriaId = filterCriteria.value

    pagination.page = 1
    isFilterModalOpen.value = false
    fetchPositionCriterias()
}

const resetFilter = () => {
    filterPosition.value = null
    filterCriteria.value = null

    appliedFilters.positionId = null
    appliedFilters.criteriaId = null

    pagination.page = 1;
    isFilterModalOpen.value = false;
    fetchPositionCriterias();
}

const handleSaveForm = async() => {
    const weight = formData.value.weight

    if (weight === null || weight <= 0) {
        alertError("Bobot harus lebih dari 0")
        return
    }

    if (weight > maxAvailableWeight.value) {
        alertError(`Bobot melebihi batas. Maksimal bobot yang dapat digunakan adalah ${maxAvailableWeight.value}%`)
        return
    }
    try {
        if(isEditMode.value) {
            const payload: UpdatePositionCriteriaPayload = {
                weight: formData.value.weight! / 100,
                positionId: formData.value.positionId!,
                criteriaId: formData.value.criteriaId!
            }

            await positionCriteriaService.update(formData.value.id, payload)

            await Promise.all([
                fetchPositionCriterias(),
                fetchWeightSummary()
            ])

            alertSuccess("Posisi kriteria berhasil diperbarui")
        } else {
            const payload: CreatePositionCriteriaPayload = {
                weight: formData.value.weight! / 100,
                positionId: formData.value.positionId!,
                criteriaId: formData.value.criteriaId!
            }

            await positionCriteriaService.create(payload)

            await fetchPositionCriterias()

            alertSuccess("Posisi kriteria berhasil dibuat")
        }

        await fetchPositionCriterias()

        isFormModalOpen.value = false
    } catch (error: any) {
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const handleDelete = async(item: PositionCriteria) => {
    const confirmed = await alertConfirm(`Apakah anda yakin ingin menghapus posisi kriteria tersebut?`, async() => {
        await positionCriteriaService.remove(item.id)
    })
    
    if (!confirmed.isConfirmed) {
        return
    }

    if(pagination.page > 1 && criterias.value.length === 1) {
        pagination.page -= 1
    }
    
    await Promise.all([
        fetchPositionCriterias(),
        fetchWeightSummary()
    ])

    alertSuccess("Posisi kriteria berhasil dihapus")
}

onMounted(() => {
    fetchPositionCriterias()
    fetchPositions()
    fetchWeightSummary()
    fetchCriterias()
})
</script>

<template>
    <MainLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Posisi Kriteria</h1>
                    <p class="text-sm text-gray-500 mt-1">Sesuaikan pemetaan kriteria dan proporsi bobot nilai secara spesifik berdasarkan tingkat kepentingan setiap posisi.</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                        <span>Showing</span>
                        <select v-model="pagination.limit" @change="handleLimitChange" class="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer">
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                        </select>
                    </div>

                    <button @click="isFilterModalOpen = true" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                        <Filter class="w-4 h-4 text-gray-500" />
                        Filter
                    </button>

                    <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer">
                        <Plus class="w-4 h-4" />
                        Atur Posisi Kriteria
                    </button>
                </div>
            </div>
        
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="item in weightSummaries" :key="item.positionId" class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="text-sm text-gray-500">
                                Total Bobot {{ item.positionName }}
                            </p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">
                                {{ item.totalWeight * 100}}%
                                <span class="text-sm font-medium text-gray-400">
                                    / 100%
                                </span>
                            </p>
                        </div>

                        <span :class="['px-3 py-1.5 rounded-lg text-xs font-semibold', item.isValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700']">
                            {{ item.isValid ? 'Bobot Valid' : 'Belum Lengkap' }}
                        </span>
                    </div>

                    <div class="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div class="h-full rounded-full transition-all" :class="item.isValid ? 'bg-green-500' : 'bg-amber-500' ":style="{width: `${Math.min(item.totalWeight * 100, 100)}%`}"/>
                    </div>

                    <p class="text-xs text-gray-500 mt-2">
                        Sisa bobot:
                        <span class="font-semibold text-gray-700">
                            {{ item.remainingWeight * 100 }}%
                        </span>
                    </p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-visible">
                <div class="overflow-x-auto overflow-y-visible">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-gray-100 text-xs font-semibold text-white bg-blue-600 uppercase">
                                <th class="py-4 px-6 rounded-tl-2xl">
                                    <div class="flex items-center gap-1.5 cursor-pointer">No</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Posisi</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Nama Kriteria</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Bobot</div>
                                </th>
                                <th class="py-4 px-6 rounded-tr-2xl">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Aksi</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-if="criterias.length > 0" v-for="(item, index) in positionCriterias" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.position.name }}</td>
                                <td class="py-3.5 px-6 text-gray-500">{{ item.criteria.name }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.weight * 100 }}%</td>
                                <td class="py-3.5 px-6 text-right">
                                    <div class="flex items-center gap-2">
                                        <button @click="openEditModal(item)" title="Edit" class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors">
                                            <Pencil class="w-4 h-4" />
                                        </button>

                                        <button @click="handleDelete(item)" title="Delete" class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else>
                                <td colspan="5" class="py-3.5 px-6 text-center text-gray-500 italic font-normal">Tidak ada data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="pagination.total > pagination.limit" class="flex items-center justify-between pt-2 px-1">

                <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page === 1" class="flex items-center gap-1 text-sm font-medium text-gray-700 disabled:text-gray-300 transition-colors cursor-pointer">
                    <ChevronLeft class="w-4 h-4" />
                    Previous
                </button>
                
                <div class="flex items-center gap-1.5">
                    <template v-for ="(item, index) in displayedPages" :key="index">
                    <button v-if="typeof item === 'number'" @click="goToPage(item)" :class="['w-8 h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors', pagination.page === item  ? 'font-bold text-white bg-blue-500 shadow-sm'  : 'font-medium text-gray-400 hover:text-gray-700']">
                        {{ item < 10 ? `0${item}` : item }}
                    </button>

                    <span v-else class="px-1 text-gray-300 text-sm">...</span>
                    </template>
                </div>

                <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="flex items-center gap-1 text-sm font-medium text-gray-700 disabled:text-gray-300 transition-colors cursor-pointer">
                    Next
                    <ChevronRight class="w-4 h-4" />
                </button>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="isFormModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-all">
                <div class="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                    <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h3 class="text-base font-bold text-gray-900">
                                {{ isEditMode ? 'Edit Posisi Kriteria' : 'Tambah Posisi Kriteria Baru' }}
                            </h3>
                        </div>
                        <button @click="isFormModalOpen = false" class="p-2 cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Posisi</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <select v-model="formData.positionId" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option :value="null">--Pilih Posisi--</option>
                                <option v-for="item in positions" :key="item.id" :value="item.id">{{ item.name }}</option>
                            </select>
                        </div>

                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Kriteria</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <select v-model="formData.criteriaId" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option :value="null">--Pilih Kriteria--</option>
                                <option v-for="item in criterias" :key="item.id" :value="item.id">{{ item.name }}</option>
                            </select>
                        </div>

                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Bobot (%)</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <input v-model="formData.weight" type="number" required placeholder="Contoh (35)" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                            <div v-if="selectedWeightSummary" class="rounded-xl border p-3 text-xs space-y-1 mt-4":class="maxAvailableWeight > 0 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-amber-50 border-amber-100 text-amber-700'">
                                <p>
                                    Total bobot saat ini:
                                    <strong>{{ selectedWeightSummary.totalWeight * 100 }}%</strong>
                                </p>
                                <p>
                                    Maksimal bobot yang dapat digunakan:
                                    <strong>{{ maxAvailableWeight }}%</strong>
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
                            <button type="button" @click="isFormModalOpen = false" class="px-5 py-2.5 text-xs font-semibold cursor-pointer text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Batal
                            </button>
                            <button type="submit" class="px-6 py-2.5 text-xs font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20">
                                {{ isEditMode ? 'Simpan Perubahan' : 'Buat Kriteria' }}
                            </button>
                        </div>
                    </form>

                    </div>
                </div>
            </Teleport>

            <Teleport to="body">
                <div v-if="isFilterModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-all">
                    <div class="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div class="flex items-center gap-2.5">
                                <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Filter class="w-4 h-4" />
                                </div>
                                <h3 class="text-base font-bold text-gray-900">Filter Data Periode</h3>
                            </div>

                            <button type="button" @click="isFilterModalOpen = false" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" title="Tutup Modal">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                        <div class="p-6 space-y-5">
                            <div class="space-y-3 pt-2">
                                <label class="block text-xs font-bold text-gray-700">Posisi</label>
                                <div>
                                    <select v-model="filterPosition" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500">
                                        <option :value="null">--Pilih Posisi--</option>
                                        <option v-for="item in positions" :key="item.id" :value="item.id">{{ item.name }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="space-y-3 pt-2">
                                <label class="block text-xs font-bold text-gray-700">Kriteria</label>
                                <div>
                                    <select v-model="filterCriteria" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500">
                                        <option :value="null">--Pilih Kriteria--</option>
                                        <option v-for="item in criterias" :key="item.id" :value="item.id">{{ item.name }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                                <button type="button" @click="resetFilter" class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer text-gray-500 hover:text-gray-900 transition-colors">
                                    <RotateCcw class="w-3.5 h-3.5" />
                                    Reset Filter
                                </button>

                                <button type="button" @click="applyFilter" class="px-6 py-2.5 text-xs font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20">
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </Teleport>
    </MainLayout>
</template>