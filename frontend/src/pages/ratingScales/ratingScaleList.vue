<script setup lang="ts">
import { computed, onMounted, reactive, ref, Teleport } from 'vue'
import { Plus, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, X, RotateCcw } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert.ts'
import type { Criteria } from '../../types/criteria.ts'
import criteriaService from '../../services/criteria.service.ts'
import type { CreateRatingScalePayload, RatingScale, UpdateRatingScalePayload } from '../../types/ratingScale.ts'
import ratingScaleService from '../../services/ratingScale.service.ts'

const ratingScales = ref<RatingScale[]>([])
const criterias = ref<Criteria[]>([])

const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const isFilterModalOpen = ref(false)
const loading = ref(false)
const errorMessage = ref("")

const filterScore = ref<number | null>(null)
const filterCriteria = ref<number | null>(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});

const appliedFilters = reactive({
    score: null as number | null,
    criteriaId: null as number | null
})

const handleLimitChange = () => {
    pagination.page = 1 
    fetchRatingScales()    
}

const formData = ref({
    id: 0,
    minValue: null as number | null,
    maxValue: null as number | null,
    label: null as string | null,
    score: null as number | null,
    criteriaId: null as number | null
})

const openCreateModal = () => {
    isEditMode.value = false

    formData.value = {
        id: 0,
        minValue: null,
        maxValue: null,
        label: "",
        score: null,
        criteriaId: null
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const openEditModal = (item: RatingScale) => {
    isEditMode.value = true

    formData.value = {
        id: item.id,
        minValue: item.minValue,
        maxValue: item.maxValue,
        label: item.label ?? "",
        score: item.score,
        criteriaId: item.criteriaId
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const fetchRatingScales = async() => {
    loading.value = true

    try {
        const query: {
            page: number
            limit: number
            score?: number
            criteriaId?: number
        } = {
            page: pagination.page,
            limit: pagination.limit
        }

        if(appliedFilters.score) {
            query.score = appliedFilters.score
        }

        if(appliedFilters.criteriaId) {
            query.criteriaId = appliedFilters.criteriaId
        }

        const response = await ratingScaleService.findAll(query)
        ratingScales.value = response.data
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

const fetchCriterias = async() => {
    try {
        const response = await criteriaService.findOption()

        criterias.value = response
    } catch (error: any) {
        alertError(error)
    }
}

const goToPage = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
        pagination.page = newPage
        fetchRatingScales()
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
    appliedFilters.score = filterScore.value
    appliedFilters.criteriaId = filterCriteria.value

    pagination.page = 1
    isFilterModalOpen.value = false
    fetchRatingScales()
}

const resetFilter = () => {
    filterScore.value = null
    filterCriteria.value = null

    appliedFilters.score = null
    appliedFilters.criteriaId = null

    pagination.page = 1;
    isFilterModalOpen.value = false;
    fetchRatingScales();
}

const handleSaveForm = async() => {
    try {
        if(isEditMode.value) {
            const payload: UpdateRatingScalePayload = {
                minValue: formData.value.minValue!,
                maxValue: formData.value.maxValue!,
                label: formData.value.label!,
                score: formData.value.score!,
                criteriaId: formData.value.criteriaId!
            }

            await ratingScaleService.update(formData.value.id, payload)

            await fetchRatingScales()

            alertSuccess("Skala penilaian berhasil diperbarui")
        } else {
            const payload: CreateRatingScalePayload = {
                minValue: formData.value.minValue!,
                maxValue: formData.value.maxValue!,
                label: formData.value.label!,
                score: formData.value.score!,
                criteriaId: formData.value.criteriaId!
            }

            await ratingScaleService.create(payload)

            await fetchRatingScales()

            alertSuccess("Skala penilaian berhasil dibuat")
        }

        await fetchRatingScales()

        isFormModalOpen.value = false
    } catch (error: any) {
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const handleDelete = async(item: RatingScale) => {
    const confirmed = await alertConfirm(`Apakah anda yakin ingin menghapus posisi kriteria tersebut?`, async() => {
        await ratingScaleService.remove(item.id)
    })
    
    if (!confirmed.isConfirmed) {
        return
    }

    if(pagination.page > 1 && criterias.value.length === 1) {
        pagination.page -= 1
    }
    
    await fetchRatingScales()
    alertSuccess("Skala penilaian berhasil dihapus")
}

onMounted(() => {
    fetchRatingScales()
    fetchCriterias()
})
</script>

<template>
    <MainLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Skala Penilaian</h1>
                    <p class="text-sm text-gray-500 mt-1">Konfigurasi skor untuk standarisasi konversi nilai mentah karyawan.</p>
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
                        Atur Skala Penilaian
                    </button>
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
                                    <div class="flex items-center gap-1.5 cursor-pointer">Nama Kriteria</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Rentang Nilai</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Skor</div>
                                </th>
                                <th class="py-4 px-6 rounded-tr-2xl">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Aksi</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-if="criterias.length > 0" v-for="(item, index) in ratingScales" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.criteria.name }}</td>
                                <td class="py-3.5 px-6 text-gray-500">{{ item.minValue }} - {{ item.maxValue }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.score }}</td>
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
                    <button v-if="typeof item === 'number'" @click="goToPage(item)" :class="['w-8 h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors', pagination.page === item ? 'font-bold text-white bg-blue-500 shadow-sm' : 'font-medium text-gray-400 hover:text-gray-700']">
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
                                {{ isEditMode ? 'Edit Posisi Kriteria' : 'Tambah Skala Penilaian Baru' }}
                            </h3>
                        </div>
                        <button @click="isFormModalOpen = false" class="p-2 cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
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
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Nilai Minimal</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <input v-model="formData.minValue" type="decimal" required placeholder="Contoh (0.10 atau 15)" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Nilai Maksimal</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <input v-model="formData.maxValue" type="decimal" required placeholder="Contoh (0.10 atau 15)" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Skor</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <input v-model="formData.score" type="number" required placeholder="1 - 5" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
                            <button type="button" @click="isFormModalOpen = false" class="px-5 py-2.5 text-xs font-semibold cursor-pointer text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Batal
                            </button>
                            <button type="submit" class="px-6 py-2.5 text-xs font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20">
                                {{ isEditMode ? 'Simpan Perubahan' : 'Buat Skala Penilaian' }}
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
                                <label class="block text-xs font-bold text-gray-700">Skor</label>
                                <div>
                                    <select v-model="filterScore" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500">
                                        <option :value="null">--Pilih Skor--</option>
                                        <option value="1">Skor 1</option>
                                        <option value="2">Skor 2</option>
                                        <option value="3">Skor 3</option>
                                        <option value="4">Skor 4</option>
                                        <option value="5">Skor 5</option>
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