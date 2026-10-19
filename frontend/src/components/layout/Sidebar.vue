<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard,
  Users, 
  BarChart3,
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen,
  X,
  Briefcase,
  ListChecks,
  GitFork,
  Calendar
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth.store';

// Props & Emit untuk mengontrol state dari parent (MainLayout)
defineProps<{
  isMobileOpen: boolean
}>()

const emit = defineEmits(['close-mobile'])

const route = useRoute()
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboards' },
  { name: 'Posisi', icon: Briefcase, path: '/positions' },
  { name: 'Karyawan', icon: Users, path: '/employees' },
  { name: 'Kriteria', icon: ListChecks, path: '/criterias' },
  { name: 'Posisi Kriteria', icon: GitFork, path: '/position-criterias' },
  { name: 'Skala Penilaian', icon: BarChart3, path: '/rating-scales' },
  { name: 'Periode', icon: Calendar, path: '/periods' },
]

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  const confirmed = confirm(`Apakah anda yakin ingin keluar?`)

  if(!confirmed) {
    return
  }

  authStore.logout()

  router.push({
    name: 'login'
  })
}
</script>

<template>
  <div v-if="isMobileOpen" @click="emit('close-mobile')" class="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity"/>

  <aside class="bg-white border-r border-gray-200 h-screen flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 z-50 fixed md:static top-0 left-0" :class="[isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0', isCollapsed ? 'md:w-20' : 'md:w-64']">
    <div class="p-4 flex flex-col gap-4">
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            B
          </div>
          <div v-if="!isCollapsed || isMobileOpen" class="flex flex-col whitespace-nowrap">
            <span class="font-semibold text-gray-900 text-sm leading-tight">Berkah Logam</span>
            <span class="text-xs text-gray-500">Owner</span>
          </div>
        </div>

        <button @click="emit('close-mobile')" class="md:hidden text-gray-500 hover:text-gray-700 p-1">
          <X class="w-5 h-5" />
        </button>
      </div>

      <button @click="toggleSidebar" class="hidden md:flex items-center gap-3 px-2 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors w-full text-left cursor-pointer" :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
        <component :is="isCollapsed ? PanelLeftOpen : PanelLeftClose" class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed" class="text-sm font-medium whitespace-nowrap">Collapse</span>
      </button>

      <div v-if="!isCollapsed || isMobileOpen" class="px-2 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Menu
      </div>

      <nav class="flex flex-col gap-1 mt-1">
        <RouterLink v-for="item in menuItems" :key="item.name" :to="item.path" @click="emit('close-mobile')" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" :class="route.path === item.path ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'">
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed || isMobileOpen" class="whitespace-nowrap">{{ item.name }}</span>
        </RouterLink>
      </nav>
    </div>

    <div class="p-4 border-t border-gray-100">
      <button @click="handleLogout" class="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
        <LogOut class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed || isMobileOpen" class="whitespace-nowrap">Keluar</span>
      </button>
    </div>
  </aside>
</template>