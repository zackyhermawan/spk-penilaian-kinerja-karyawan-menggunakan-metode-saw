<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue';

const isMobileOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    <Sidebar :is-mobile-open="isMobileOpen" @close-mobile="isMobileOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <button @click="isMobileOpen = true" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu class="w-6 h-6" />
          </button>
          <span class="font-semibold text-gray-900 text-sm">SPK Kinerja</span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>