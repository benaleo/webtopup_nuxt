<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <button @click="logout" class="px-3 py-2 rounded bg-gray-800 text-white text-sm">Logout</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>Loading user data...</p>
    </div>
    
    <template v-else>
      <!-- Show Admin Dashboard -->
      <DashboardAdmin v-if="hasAdminAccess" />
      
      <!-- Show User Dashboard -->
      <DashboardUser v-else-if="hasUserAccess" />
      
      <!-- No Access Message -->
      <div v-else class="bg-red-50 border-l-4 border-red-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              You don't have permission to access this dashboard.
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardAdmin from '~/components/DashboardAdmin.vue'
import DashboardUser from '~/components/DashboardUser.vue'
import { type User } from '~~/types/app.types';

// Using definePageMeta with proper type annotation
definePageMeta({
  layout: 'cms',
  // Middleware is handled in the auth plugin
})

const config = useRuntimeConfig()
const baseUrl = config.public.BASE_URL
const loading = ref(true)
const user = ref<User | null>(null)

// Check if user has admin access
const hasAdminAccess = computed(() => {
  const role = user.value?.role
  return role === 'ADMIN' || role === 'SUPERADMIN'
})

// Check if user has basic user access
const hasUserAccess = computed(() => {
  return user.value?.role ? ['ADMIN', 'USER'].includes(user.value.role) : false
})

// Fetch user data
onMounted(async () => {
  try {
    const res = await $fetch<{ user: User | null }>('/api/auth/me')
    user.value = res?.user || null
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    navigateTo('/cms/login')
  } finally {
    loading.value = false
  }
})

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/cms/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

function currency(n: number): string {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(n || 0)
}
</script>
