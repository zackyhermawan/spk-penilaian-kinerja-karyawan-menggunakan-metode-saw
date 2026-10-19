<script setup lang="ts">
import { computed, onMounted, reactive, ref, Teleport } from 'vue'
import { Plus, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, X, Search, RotateCcw, CheckCircle2 } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert.ts'
import type { CreateCriteriaPayload, Criteria, CriteriaType, UpdateCriteriaPayload } from '../../types/criteria.ts'
import criteriaService from '../../services/criteria.service.ts'

const criterias = ref<Criteria[]>([])

const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const isFilterModalOpen = ref(false)
const loading = ref(false)
const errorMessage = ref("")

const searchQuery = ref("")
const filterIsActive = ref<boolean | null>(null)
const filterType = ref<CriteriaType | null>(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});

const appliedFilters = reactive({
    isActive: null as boolean | null,
    type: null as CriteriaType | null
})

const handleLimitChange = () => {
    pagination.page = 1 
    fetchCriterias()    
}

const formData = ref({
    id: 0,
    name: "",
    groupName: null as string | null,
    type: ""
})

const openCreateModal = () => {
    isEditMode.value = false

    formData.value = {
        id: 0,
        name: "",
        groupName: null,
        type: ""
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const openEditModal = (item: Criteria) => {
    isEditMode.value = true

    formData.value = {
        id: item.id,
        name: item.name,
        groupName: item.groupName || null,
        type: item.type
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const fetchCriterias = async() => {
    loading.value = true

    try {
        const query: {
            page: number
            limit: number
            isActive?: boolean
            type?: CriteriaType
            search?: string
        } = {
            page: pagination.page,
            limit: pagination.limit
        }

        if(searchQuery.value.trim() !== '') {
            query.search = searchQuery.value.trim()
        }

        if(appliedFilters.isActive !== null) {
            query.isActive = appliedFilters.isActive
        }

        if(appliedFilters.type) {
            query.type = appliedFilters.type
        }

        const response = await criteriaService.findAll(query)
        criterias.value = response.data
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

const goToPage = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
        pagination.page = newPage
        fetchCriterias()
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
    appliedFilters.isActive = filterIsActive.value
    appliedFilters.type = filterType.value

    pagination.page = 1
    isFilterModalOpen.value = false
    fetchCriterias()
}

const resetFilter = () => {
    filterIsActive.value = null
    filterType.value = null

    appliedFilters.isActive = null
    appliedFilters.type = null

    pagination.page = 1;
    isFilterModalOpen.value = false;
    fetchCriterias();
}

let timeoutId: any = null
const handleSearchInput = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
        pagination.page = 1
        fetchCriterias()
    }, 400)
}

const handleSaveForm = async() => {
    try {
        if(isEditMode.value) {
            const payload: UpdateCriteriaPayload = {
                name: formData.value.name,
                groupName: formData.value.groupName || undefined,
                type: formData.value.type as CriteriaType
            }

            await criteriaService.update(formData.value.id, payload)

            await fetchCriterias()

            alertSuccess("Kriteria berhasil diperbarui")
        } else {
            const payload: CreateCriteriaPayload = {
                name: formData.value.name,
                groupName: formData.value.groupName || undefined,
                type: formData.value.type as CriteriaType
            }

            await criteriaService.create(payload)

            await fetchCriterias()

            alertSuccess("Kriteria berhasil dibuat")
        }

        await fetchCriterias()

        isFormModalOpen.value = false
    } catch (error: any) {
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const handleStatusChange = async (
    item: Criteria,
    isActive: boolean
) => {
    try {

        if (isActive === item.isActive) return
    
        const confirmed = await alertConfirm(
            `Apakah anda yakin ingin mengubah status ${item.name} menjadi ${
                isActive ? "Aktif" : "Nonaktif"
            }?`,
            async () => {
                await criteriaService.updateStatus(item.id, isActive)
            }
        )
    
        if (!confirmed.isConfirmed) {
            return
        }
    
        await fetchCriterias()
    
        alertSuccess(
            `Status ${item.name} berhasil diubah menjadi ${
                isActive ? "Aktif" : "Nonaktif"
            }`
        )
    } catch (error: any) {
        console.log(error)
        throw error
    }
}

const handleDelete = async(item: Criteria) => {
    const confirmed = await alertConfirm(`Apakah anda yakin ingin menghapus kriteria ${item.name}?`, async() => {
        await criteriaService.remove(item.id)
    })
    
    if (!confirmed.isConfirmed) {
        return
    }

    if(pagination.page > 1 && criterias.value.length === 1) {
        pagination.page -= 1
    }
    
    await fetchCriterias()
    alertSuccess("Kriteria berhasil dihapus")
}

const getStatusLabel = (type: CriteriaType) => {
    return type === "BENEFIT" ? "Benefit" : "Cost"
}

const getStatusClass = (isActive?: boolean) => {
  switch (isActive) {
    case true: return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
    default: return 'bg-gray-50 text-gray-600 border border-gray-200'
  }
}

onMounted(() => {
    fetchCriterias()
})
</script>

<template>
    <MainLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Kriteria</h1>
                    <p class="text-sm text-gray-500 mt-1">Atur parameter dan tipe penilaian untuk standarisasi kalkulasi keputusan.</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <div class="relative flex-1 min-w-[240px]">
                        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input v-model="searchQuery" @input="handleSearchInput" type="text" placeholder="Cari..." class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"/>
                    </div>
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
                        Tambah Kriteria
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
                                    <div class="flex items-center gap-1.5 cursor-pointer">Posisi</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Tipe</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Status</div>
                                </th>
                                <th class="py-4 px-6 rounded-tr-2xl">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Aksi</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-if="criterias.length > 0" v-for="(item, index) in criterias" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.name }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.positionCriterias?.[0]?.position?.name ?? '-' }}</td>
                                <td class="py-3.5 px-6 text-gray-500">{{ getStatusLabel(item.type) }}</td>
                                <td class="py-3.5 px-6">
                                    <select :value="item.isActive" @change="handleStatusChange(item, ($event.target as HTMLSelectElement).value === 'true')" :class="[getStatusClass(item.isActive), 'px-4 py-1.5 rounded-full text-xs font-semibold text-center cursor-pointer border-0 outline-none']">
                                        <option value="true">Aktif</option>
                                        <option value="false">Nonaktif</option>
                                    </select>
                                </td>
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
                                {{ isEditMode ? 'Edit Periode' : 'Tambah Periode Baru' }}
                            </h3>
                        </div>
                        <button @click="isFormModalOpen = false" class="p-2 cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Nama Kriteria</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <input v-model="formData.name" type="text" placeholder="Contoh: Kehadiran" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div>
                            <div class="flex items-center gap-1">
                                <label class="block text-xs font-bold text-gray-700 mb-1.5">Tipe</label>
                                <span class="text-red-500">*</span>
                            </div>
                            <select v-model="formData.type" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option value="">--Pilih Tipe--</option>
                                <option value="BENEFIT">Benefit</option>
                                <option value="COST">Cost</option>
                            </select>
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
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-2.5">Status Periode</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <button v-for="st in [
                                        {label: 'Semua', value: null},
                                        {label: 'Aktif', value: true},
                                        {label: 'Non Aktif', value: false},
                                    ]" type="button" @click="filterIsActive = st.value" class="px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer" :class="[filterIsActive === st.value ? 'bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100/80']">
                                        <span>{{ st.label }}</span>
                                        <CheckCircle2 v-if="filterIsActive === st.value" class="w-3.5 h-3.5 text-blue-600" />
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-3 pt-2">
                                <label class="block text-xs font-bold text-gray-700">Tipe</label>
                                <div>
                                    <select v-model="filterType" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500">
                                        <option :value="null">--Pilih Tipe--</option>
                                        <option value="BENEFIT">Benefit</option>
                                        <option value="COST">Cost</option>
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