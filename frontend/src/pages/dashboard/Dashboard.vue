<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import { Users, UserCheck, Award, AlertCircle } from 'lucide-vue-next'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, ArcElement, Filler, type TooltipItem } from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { alertError } from '../../utils/alert.ts'
import dashboardService from '../../services/dashboard.service.ts'
import type { AdminDashboard } from '../../types/dashboard.ts'
import type { Period } from '../../types/period.ts'
import type { Position } from '../../types/position.ts'
import periodService from '../../services/period.service.ts'
import positionService from '../../services/position.service.ts'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  ArcElement,
  Filler
)

const dashboard = ref<AdminDashboard | null>(null)
const periods = ref<Period[]>([])
const positions = ref<Position[]>([])
const selectedPeriodId = ref<number | null>(null)
const selectedPositionId = ref<number | null>(null)

const cards = computed(() => {
  return dashboard.value?.cards ?? {
    totalEmployees: 0,
    activeEmployees: 0,
    averageScore: 0,
    needDevelopment: 0
  }
})

const topEmployees = computed(() => {
  return dashboard.value?.topEmployees ?? []
})

const trend = computed(() => {
  return dashboard.value?.trend ?? []
})

const distribution = computed(() => {
  return dashboard.value?.distribution ?? []
})

const lineChartData = computed(() => ({
  labels: trend.value.map(item => item.label),

  datasets: [
    {
      label: "Rata-rata Skor",
      data: trend.value.map(item => Number(item.averageScore) || 0),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#2563eb",
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      cornerRadius: 10,
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<'line'>) => {
          const rawValue = (context.raw as number) ?? 0
          return `Skor: ${rawValue.toFixed(3)}`
        }
      }
    }
  },

  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: "#94a3b8",
        font: {
          size: 12
        }
      }
    },

    y: {
      min: 0,
      max: 1,
      grid: {
        color: "#f1f5f9"
      },
      ticks: {
        color: "#94a3b8",
        font: {
          size: 12
        }
      }
    }
  }
}))

const doughnutChartData = computed(() => ({
  labels: distribution.value.map(item => item.label),

  datasets: [
    {
      backgroundColor: [
        "#2563eb",
        "#10b981",
        "#f59e0b",
        "#f43f5e",
        "#64748b"
      ],
      borderWidth: 0,
      data: distribution.value.map(
        item => item.total
      ),
      hoverOffset: 6
    }
  ]
}))

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "75%",
  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      cornerRadius: 10
    }
  }
}

const loadDashboard = async () => {
  try {
    const response = await dashboardService.getAdminDashboard(
      selectedPeriodId.value ?? undefined, 
      selectedPositionId.value ?? undefined
    ) as any

    dashboard.value = response.data
    
    if (dashboard.value && !selectedPeriodId.value) {
      selectedPeriodId.value = dashboard.value.periodId
    }
  } catch (error) {
    alertError(error)
  }
}

const fetchPeriods = async () => {
  try {
    const response = await periodService.findOption()
    periods.value = response.data
  } catch (error) {
    alertError(error)
  }
}

const fetchPositions = async () => {
  try {
    const response = await positionService.findOption()
    positions.value = response
  } catch (error) {
    alertError(error)
  }
}

const handlePeriodChange = async () => {
  await loadDashboard()
}

const handlePositionChange = async () => {
  await loadDashboard()
}

onMounted(async () => {
  await Promise.all([fetchPeriods(), fetchPositions()])
  await loadDashboard()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-8 bg-gray-50/50 min-h-screen">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Selamat Datang, Owner! 👋</h1>
          <p class="text-sm text-gray-500 mt-1">Berikut adalah ringkasan kinerja dan data karyawan Anda hari ini.</p>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <div class="flex flex-col">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Periode</label>
              <select v-model="selectedPeriodId" @change="handlePeriodChange" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                <option :value="null">Semua Periode</option>
                <option v-for="item in periods" :key="item.id" :value="item.id">
                  {{ item.name }} {{ item.year }}
                </option>
              </select>
            </div>
            
            <div class="flex flex-col">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Posisi</label>
              <select v-model="selectedPositionId" @change="handlePositionChange" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
                <option :value="null">Semua Posisi</option>
                <option v-for="item in positions" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div class="p-3.5 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users :size="28" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500">Total Karyawan</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ cards.totalEmployees }}</h3>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div class="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <UserCheck :size="28" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500">Total Karyawan Aktif</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ cards.activeEmployees }}</h3>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div class="p-3.5 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Award :size="28" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500">Rata-rata Skor</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">
              {{ (Number(cards.averageScore) || 0).toFixed(3) }}
            </h3>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div class="p-3.5 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertCircle :size="28" />
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500">Perlu Pembinaan</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ cards.needDevelopment }}</h3>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-visible">
        <div class="overflow-x-auto overflow-y-visible">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-semibold text-white bg-blue-600 uppercase">
                <th class="py-4 px-6 rounded-tl-2xl">Rank</th>
                <th class="py-4 px-6">Nama Karyawan</th>
                <th class="py-4 px-6">Posisi</th>
                <th class="py-4 px-6 rounded-tr-2xl">Skor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              <tr v-for="emp in topEmployees" :key="emp.employeeId" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-3.5 px-6 text-gray-400 font-normal">{{ emp.rank }}</td>
                <td class="py-3.5 px-6 text-slate-900 font-semibold">{{ emp.name }}</td>
                <td class="py-3.5 px-6 text-gray-500">{{ emp.position }}</td>
                <td class="py-3.5 px-6 text-gray-500">
                  {{ (Number(emp.finalScore) || 0).toFixed(3) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-base font-bold text-gray-800">Tren Performa Rata-Rata</h2>
              <p class="text-xs text-gray-400 mt-0.5">Perkembangan skor performa bulanan</p>
            </div>
          </div>
          <div class="h-72">
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-gray-800">Kategori Performa</h2>
              <p class="text-xs text-gray-400 mt-0.5">Persentase tingkat evaluasi</p>
            </div>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
          </div>
          <div class="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 text-center">
            <div v-for="item in distribution" :key="item.label">
              <span class="block text-xs text-gray-400">{{ item.label }}</span>
              <span class="text-sm font-bold text-blue-600">{{ item.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>