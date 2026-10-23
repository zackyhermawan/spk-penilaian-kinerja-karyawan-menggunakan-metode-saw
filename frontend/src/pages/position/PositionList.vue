<script setup lang="ts">
import { computed, onMounted, reactive, ref, Teleport } from 'vue'
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X, Search } from 'lucide-vue-next'
import MainLayout from '../../layouts/MainLayout.vue'
import type { CreatePositionPayload, Position, UpdatePositionPayload } from '../../types/position.ts'
import positionService from '../../services/position.service.ts'
import { alertConfirm, alertError, alertSuccess } from '../../utils/alert.ts'

const positions = ref<Position[]>([])
const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const loading = ref(false)
const errorMessage = ref("")
const searchQuery = ref("")

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});

const handleLimitChange = () => {
    pagination.page = 1 
    fetchPositions()    
}

const formData = ref({
    id: 0,
    name: ""
})

const openCreateModal = () => {
    isEditMode.value = false

    formData.value = {
        id: 0,
        name: ""
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const openEditModal = (item: Position) => {
    isEditMode.value = true

    formData.value = {
        id: item.id,
        name: item.name
    }

    errorMessage.value = ""
    isFormModalOpen.value = true
}

const fetchPositions = async() => {
    loading.value = true

    try {
        const query = {
            page: pagination.page,
            limit: pagination.limit,
            ...(searchQuery.value && {search: searchQuery.value}),
        }
        const response = await positionService.findAll(query)
        positions.value = response?.data ?? response ?? []
        if (response?.pagination) {
            pagination.total = response.pagination.total ?? 0
            pagination.totalPages = Math.ceil((response.pagination.total || 0) / (response.pagination.limit || 1))
        } else if (response?.meta) { 
            pagination.total = response.meta.total ?? 0
            pagination.totalPages = Math.ceil((response.meta.total || 0) / (response.meta.limit || 1))
        }
    } catch (error: any) {
        console.log('Detail Error:', error)
        alertError(error?.response?.data?.message ?? 'Gagal mengambil data posisi')
    } finally {
        loading.value = false
    }
}

let timeoutId: any = null
const handleSearchInput = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
        pagination.page = 1
        fetchPositions()
    }, 400)
}

const goToPage = (newPage: number) => {
    if(newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
        pagination.page = newPage
        fetchPositions()
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

const handleSaveForm = async() => {
    errorMessage.value = ""

    if(!formData.value.name) {
        errorMessage.value = "Nama posisi wajib diisi"
        return
    }

    saving.value = true

    try {
        if(isEditMode.value) {
            const payload: UpdatePositionPayload = {
                name: formData.value.name
            }

            await positionService.update(formData.value.id, payload)
            
            alertSuccess("Posisi berhasil diperbarui")
        } else {
            const payload: CreatePositionPayload = {
                name: formData.value.name
            }

            await positionService.create(payload)

            alertSuccess("Posisi berhasil dibuat")
        }

        await fetchPositions()

        isFormModalOpen.value = false
    } catch (error: any) {
        console.log(error)
        alertError(error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Terjadi kesalahan")
    }
}

const handleDelete = async(item: Position) => {
    const confirmed = await alertConfirm(`Apakah anda yakin ingin menghapus posisi ${item.name}?`, async() => {
        await positionService.remove(item.id)
    })

    if(!confirmed.isConfirmed) return

    if(pagination.page > 1 && positions.value.length === 1) {
        pagination.page -= 1
    }
    
    await fetchPositions()
    alertSuccess("Posisi berhasil dihapus")
}

onMounted(() => {
    fetchPositions()
})


</script>

<template>
    <MainLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Posisi</h1>
                    <p class="text-sm text-gray-500 mt-1">Kelola struktur posisi/jabatan kerja karyawan.</p>
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

                    <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer">
                        <Plus class="w-4 h-4" />
                        Tambah Posisi
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
                                    <div class="flex items-center gap-1.5 cursor-pointer">Nama Posisi</div>
                                </th>
                                <th class="py-4 px-6">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Total Karyawan</div>
                                </th>
                                <th class="py-4 px-6 rounded-tr-2xl">
                                    <div class="flex items-center gap-1.5 cursor-pointer">Aksi</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                            <tr v-if="positions.length > 0" v-for="(item, index) in positions" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ item.name }}</td>
                                <td class="py-3.5 px-6">
                                    <span :class="['px-4 py-1.5 rounded-full text-xs font-semibold inline-block text-center']">
                                    {{ item.totalEmployee }}
                                    </span>
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
                                {{ isEditMode ? 'Edit Posisi' : 'Tambah Posisi Baru' }}
                            </h3>
                        </div>
                        <button @click="isFormModalOpen = false" class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer hover:bg-gray-200/50 rounded-xl transition-colors">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1.5">Nama Posisi</label>
                            <input v-model="formData.name" type="text" placeholder="Contoh: Teknisi Las" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6">
                            <button type="button" @click="isFormModalOpen = false" class="px-5 py-2.5 text-xs cursor-pointer font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Batal
                            </button>
                            <button type="submit" class="px-6 cursor-pointer py-2.5 text-xs font-semibold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20">
                                {{ isEditMode ? 'Simpan Perubahan' : 'Buat Posisi' }}
                            </button>
                        </div>
                    </form>

                    </div>
                </div>
            </Teleport>
    </MainLayout>
</template>