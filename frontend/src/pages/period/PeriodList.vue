<script setup lang="ts">
import { computed, onMounted, reactive, ref, Teleport } from 'vue'
import { Plus, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, Eye, X, Calendar, RotateCcw, CheckCircle2 } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import { useRouter } from 'vue-router'
import { usePeriodStore } from '../../stores/period.store.ts'
import type { CreatePeriodPayload, Period, PeroidStatus, UpdatePeriodPayload } from '../../types/period.ts'
import periodService from '../../services/period.service.ts'
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert.ts'

const router = useRouter()
const periodStore = usePeriodStore()

const periods = ref<Period[]>([])
const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const isFilterModalOpen = ref(false)
const saving = ref(false)
const errorMessage = ref("")

const formData = ref({
    id: 0,
    month: undefined as number | undefined,
    year: undefined as number | undefined
})

const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
})

const handleLimitChange = () => {
    pagination.page = 1 
    fetchPeriods()    
}

const appliedFilters = reactive({
    status: 'ALL',
    month: null as number | null,
    year: null as number | null
})

const filterStatus = ref<"ALL" | PeroidStatus>("ALL")
const filterMonth = ref<number | null>(null)
const filterYear = ref<number | null>(null)

const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
]

const getStatusLabel = (status: PeroidStatus) => {
    return status === "OPEN" ? "BUKA" : "TUTUP"
}

const getStatusClass = (status: string) => {
  switch (status) {
    case "OPEN": return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
    case "CLOSED": return 'bg-blue-50 text-blue-600 border border-blue-200'
    default: return ""
  }
}

const fetchPeriods = async() => {
    try {
        const query: {
            page: number
            limit: number
            status?: string
            month?: number | string
            year?: number | string
        } = {
            page: pagination.page,
            limit: pagination.limit
        }

        if (appliedFilters.status && appliedFilters.status !== 'ALL') {
            query.status = appliedFilters.status
        }

        if (appliedFilters.month) {
            query.month = appliedFilters.month
        }

        if (appliedFilters.year) {
            query.year = appliedFilters.year
        }

        const response = await periodService.findAll(query)
        periods.value = response.data
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
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const goToPage = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
        pagination.page = newPage
        fetchPeriods()
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

const handleEvaluation = (item: Period) => {
    router.push(`/periods/${item.id}/evaluation`)
}

const openCreateModal = () => {
    isEditMode.value = false

    formData.value = {
        id: 0,
        month: undefined,
        year: undefined
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const openEditModal = (item: Period) => {
    if (item.status === 'CLOSED' || (item._count?.evaluations ?? 0) > 0) {
        const message = item.status === 'CLOSED'
            ? 'Periode ini sudah ditutup tidak dapat diedit.'
            : 'Periode ini tidak bisa diedit, karena sudah memiliki data evaluasi'
        
        alertError(message)
        return
    }
    isEditMode.value = true

    formData.value = {
        id: item.id,
        month: item.month,
        year: item.year
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const handleSaveForm = async() => {
    errorMessage.value = ""

    if(!formData.value.month || !formData.value.year) {
        errorMessage.value = "Bulan dan tahun wajib diisi"

        return
    }

    saving.value = true

    try {
        if(isEditMode.value) {
            const payload: UpdatePeriodPayload = {
                month: formData.value.month,
                year: formData.value.year
            }

            await periodStore.updatePeriod(formData.value.id, payload)

            await fetchPeriods()

            alertSuccess("Periode berhasil diperbarui")
        } else {
            const payload: CreatePeriodPayload = {
                month: formData.value.month,
                year: formData.value.year
            }

            await periodStore.createPeriod(payload)

            await fetchPeriods()

            alertSuccess("Periode berhasil dibuat")
        }

        await fetchPeriods()

        isFormModalOpen.value = false
    } catch (error: any) {
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    } finally {
        saving.value = false
    }
}

const handleDelete = async(item: Period) => {
    if (item.status === 'CLOSED' || (item._count?.evaluations ?? 0) > 0) {
        const message = item.status === 'CLOSED'
            ? 'Periode ini sudah ditutup tidak dapat dihapus.'
            : 'Periode ini tidak bisa dihapus, karena sudah memiliki data evaluasi'
        
        alertError(message)
        return
    }

    const confirmed = await alertConfirm(`Apakah anda yakin ingin menghapus periode tersebut?`, async() => {
        await periodStore.deletePeriod(item.id)
    })

    if(!confirmed.isConfirmed) {
        return
    }
    
    if(pagination.page > 1 && periods.value.length === 1) {
        pagination.page -= 1
    }

    await fetchPeriods()

    alertSuccess("Periode berhasil dihapus")
}

const applyFilter = () => {
    appliedFilters.status = filterStatus.value
    appliedFilters.month = filterMonth.value
    appliedFilters.year = filterYear.value

    pagination.page = 1
    isFilterModalOpen.value = false
    fetchPeriods()
}

const resetFilter = () => {
    filterStatus.value = 'ALL'
    filterMonth.value = null
    filterYear.value = null

    appliedFilters.status = 'ALL'
    appliedFilters.month = null
    appliedFilters.year = null

    pagination.page = 1;
    isFilterModalOpen.value = false;
    fetchPeriods();
}

onMounted(() => {
    fetchPeriods()
})

</script>

<template>
    <MainLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Periode</h1>
                    <p class="text-sm text-gray-500 mt-1">Pilih atau buat periode untuk mengelola penilaian.</p>
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
                        Tambah Periode
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
                                    <div class="flex items-center gap-1.5 cursor-pointer">Periode</div>
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
                            <tr v-if="periods.length > 0" v-for="(item, index) in periods" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.name }} {{ item.year }}</td>
                                <td class="py-3.5 px-6">
                                    <span :class="[getStatusClass(item.status), 'px-4 py-1.5 rounded-full text-xs font-semibold inline-block text-center']">
                                    {{ getStatusLabel(item.status) }}
                                    </span>
                                </td>
                                <td class="py-3.5 px-6 text-right">
                                    <div class="flex items-center gap-2">
                                        <button @click="handleEvaluation(item)" :title="item.status === 'CLOSED' ? 'Lihat' : 'Kelola Penilaian'" class="p-1.5 rounded-lg cursor-pointer transition-colors">
                                            <Eye v-if="item.status === 'CLOSED'" class="w-4 h-4 text-green-500 hover:text-green-600 hover:bg-green-50" />
                                            <Calendar v-else class="w-4 h-4 text-orange-400 hover:text-orange-500 hover:bg-orange-50" />
                                        </button>

                                        <button @click="openEditModal(item)" title="Edit" class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors">
                                            <Pencil class="w-4 h-4" />
                                        </button>

                                        <button @click="handleDelete(item)" title="Delete" class="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>

                                <!-- <td class="py-3.5 px-6 text-right relative action-dropdown">
                                    <button @click.stop="toggleDropdown(item.id)" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                        <MoreHorizontal class="w-5 h-5" />
                                    </button>

                                    <div v-if="activeDropdown === item.id" class="absolute right-6 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 text-left">
                                        <button @click="handleKelola(item)" class="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                            <Settings class="w-4 h-4 text-gray-400" />
                                            Kelola
                                        </button>
                                        <button @click="handleEdit(item)" class="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                            <Pencil class="w-4 h-4 text-amber-500" />
                                            Edit
                                        </button>
                                        <button @click="handleDelete(item)" class="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                            <Trash2 class="w-4 h-4 text-red-500" />
                                            Delete
                                        </button>
                                    </div>
                                </td> -->
                            </tr>
                            <tr v-else>
                                <td colspan="4" class="py-3.5 px-6 text-center text-gray-500 italic font-normal">Tidak ada data</td>
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
                        <button @click="isFormModalOpen = false" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors cursor-pointer">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1.5">Bulan</label>
                            <select v-model.number="formData.month" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                                <option :value="undefined">--Pilih Bulan--</option>
                                <option v-for="item in months" :key="item.value" :value="item.value">{{ item.label }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1.5">Tahun</label>
                            <input v-model.number="formData.year" type="number" placeholder="Contoh: 2026" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
                            <button type="button" @click="isFormModalOpen = false" class="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                                Batal
                            </button>
                            <button type="submit" class="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer">
                                {{ isEditMode ? 'Simpan Perubahan' : 'Buat Periode' }}
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
                                        {label: 'Semua', value: 'ALL'},
                                        {label: 'Buka', value: 'OPEN'},
                                        {label: 'Tutup', value: 'CLOSED'},
                                    ]" type="button"@click="filterStatus = st.value" class="px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer" :class="[filterStatus === st.value ? 'bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100/80']">
                                        <span>{{ st.label }}</span>
                                        <CheckCircle2 v-if="filterStatus === st.value" class="w-3.5 h-3.5 text-blue-600" />
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-3 pt-2">
                                <label class="block text-xs font-bold text-gray-700">Bulan & Tahun</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <span class="block text-[10px] font-semibold text-gray-400 mb-1">BULAN</span>
                                        <select v-model="filterMonth" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
                                            <option :value="null">Semua</option>
                                            <option v-for="item in months" :key="item.value" :value="item.value">{{ item.label }}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <span class="block text-[10px] font-semibold text-gray-400 mb-1">TAHUN</span>
                                        <input v-model="filterYear" type="number" placeholder="Contoh (2026)" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"/>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                                <button type="button" @click="resetFilter" class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                                    <RotateCcw class="w-3.5 h-3.5" />
                                    Reset Filter
                                </button>

                                <button type="button" @click="applyFilter" class="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer">
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </Teleport>
    </MainLayout>
</template>