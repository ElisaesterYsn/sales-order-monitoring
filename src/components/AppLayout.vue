<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Sales Orders', path: '/orders', icon: 'orders' },
]

function isActive(path) {
  return route.path === path
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/40 lg:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 bg-navy-900 flex flex-col transform transition-transform duration-200 ease-in-out',
        'lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-navy-800">
        <!-- Logo mark -->
        <div class="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                 M9 5a2 2 0 002 2h2a2 2 0 002-2
                 M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-white font-semibold text-sm leading-tight truncate">Sales Order</p>
          <p class="text-navy-300 text-xs leading-tight truncate">Monitor</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="closeSidebar"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.path)
              ? 'bg-blue-600 text-white'
              : 'text-navy-300 hover:bg-navy-800 hover:text-white',
          ]"
        >
          <!-- Dashboard icon -->
          <svg v-if="item.icon === 'dashboard'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3
                 m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <!-- Orders icon -->
          <svg v-if="item.icon === 'orders'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                 a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-navy-800">
        <p class="text-navy-400 text-xs">Harrisons Sabah Sdn Bhd</p>
        <p class="text-navy-500 text-xs mt-0.5">IT Assessment 2026</p>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- Top bar (mobile) -->
      <header class="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          @click="toggleSidebar"
          class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="text-navy-900 font-semibold text-sm">Sales Order Monitor</span>
      </header>

      <!-- Page content slot -->
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
