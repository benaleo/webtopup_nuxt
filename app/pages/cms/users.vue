<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">Users</h1>
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          type="text"
          placeholder="Search name or username..."
          class="border rounded px-3 py-2 text-sm w-64"
          @keyup.enter="applySearch"
        />
        <button class="px-3 py-2 text-sm border rounded" @click="applySearch">Search</button>
        <button class="px-3 py-2 text-sm border rounded" @click="resetSearch">Reset</button>
      </div>
    </div>

    <div class="bg-white border rounded overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left">
          <tr>
            <th class="px-4 py-2 border-b">Name</th>
            <th class="px-4 py-2 border-b">Username</th>
            <th class="px-4 py-2 border-b">Role</th>
            <th class="px-4 py-2 border-b">Is Joki</th>
            <th class="px-4 py-2 border-b">Popular Joki</th>
            <th class="px-4 py-2 border-b">Active</th>
            <th class="px-4 py-2 border-b">Created</th>
            <th class="px-4 py-2 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b">
            <td class="px-4 py-2">{{ u.name }}</td>
            <td class="px-4 py-2">{{ u.username }}</td>
            <td class="px-4 py-2">
              <span :class="roleClass(u.role)" class="px-2 py-1 rounded text-xs">{{ u.role }}</span>
            </td>
            <td class="px-4 py-2">
              <span :class="u.is_open_joki ? 'text-green-700' : 'text-red-700'">{{ u.is_open_joki ? 'Yes' : 'No' }}</span>
            </td>
            <td class="px-4 py-2">
              <span :class="u.is_popular_joki ? 'text-green-700' : 'text-red-700'">{{ u.is_popular_joki ? 'Yes' : 'No' }}</span>
            </td>
            <td class="px-4 py-2">
              <span :class="u.is_active ? 'text-green-700' : 'text-red-700'">{{ u.is_active ? 'Yes' : 'No' }}</span>
            </td>
            <td class="px-4 py-2">{{ formatDate(u.created_at) }}</td>
            <td class="px-4 py-2 text-right">
              <div class="inline-flex items-center gap-2">
                <button
                  class="px-2 py-1 text-xs rounded border"
                  :class="u.is_active ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'"
                  @click="toggleActive(u)"
                  :disabled="togglingId === u.id"
                >
                  {{ u.is_active ? 'Deactivate' : 'Activate' }}
                </button>
                <button
                  v-if="u.role === 'USER'"
                  class="px-2 py-1 text-xs rounded border"
                  :class="[
                    u.is_open_joki
                      ? (u.is_popular_joki ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-blue-300 text-blue-700 hover:bg-blue-50')
                      : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  ]"
                  :title="u.is_open_joki ? '' : 'User is not open to Joki'"
                  @click="u.is_open_joki && togglePopular(u)"
                  :disabled="togglingPopularId === u.id || !u.is_open_joki"
                >
                  {{ u.is_popular_joki ? 'Unmark Popular' : 'Mark Popular' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">No users found</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">Loading...</td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between p-3">
        <div class="text-sm text-gray-600">
          Page {{ page }} of {{ totalPages }} · {{ total }} users
        </div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 border rounded text-sm" :disabled="page <= 1 || loading" @click="goTo(page - 1)">Prev</button>
          <select class="px-2 py-1 border rounded text-sm" v-model.number="page" @change="applyPage">
            <option v-for="p in totalPages" :key="p" :value="p">{{ p }}</option>
          </select>
          <button class="px-2 py-1 border rounded text-sm" :disabled="page >= totalPages || loading" @click="goTo(page + 1)">Next</button>

          <select class="ml-3 px-2 py-1 border rounded text-sm" v-model.number="pageSize" @change="applyPageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'cms' })

// state
const users = ref<Array<{ id:string; name:string; username:string; role:string; is_open_joki:boolean; is_popular_joki:boolean; is_active:boolean; created_at:string }>>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const search = ref('')
const loading = ref(true)
const togglingId = ref<string | null>(null)
const togglingPopularId = ref<string | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function roleClass(role: string) {
  if (role === 'SUPERADMIN') return 'bg-purple-100 text-purple-800 border border-purple-200'
  if (role === 'ADMIN') return 'bg-blue-100 text-blue-800 border border-blue-200'
  return 'bg-gray-100 text-gray-800 border border-gray-200'
}

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await $fetch<{ page:number; pageSize:number; total:number; items:any[] }>(`/api/cms/users`, {
      query: { page: page.value, pageSize: pageSize.value, search: search.value || undefined }
    })
    users.value = res.items as any
    total.value = res.total
    page.value = res.page
    pageSize.value = res.pageSize
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to load users')
  } finally {
    loading.value = false
  }
}

function applySearch() {
  page.value = 1
  fetchUsers()
}

function resetSearch() {
  search.value = ''
  applySearch()
}

function applyPage() {
  fetchUsers()
}

function goTo(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchUsers()
}

function applyPageSize() {
  page.value = 1
  fetchUsers()
}

async function toggleActive(u: { id:string; is_active:boolean }) {
  if (togglingId.value) return
  togglingId.value = u.id
  try {
    const res = await $fetch<{ id:string; is_active:boolean }>(`/api/cms/users/${u.id}/toggle-active`, { method: 'PUT' })
    u.is_active = res.is_active
    toast.success(`User ${res.is_active ? 'activated' : 'deactivated'}`)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to toggle user')
  } finally {
    togglingId.value = null
  }
}

async function togglePopular(u: { id:string; is_open_joki:boolean; is_popular_joki:boolean }) {
  if (!u.is_open_joki) return
  if (togglingPopularId.value) return
  togglingPopularId.value = u.id
  try {
    const res = await $fetch<{ id:string; is_popular_joki:boolean }>(`/api/cms/users/${u.id}/toggle-popular`, { method: 'PUT' })
    u.is_popular_joki = res.is_popular_joki
    toast.success(`User ${res.is_popular_joki ? 'marked as popular' : 'unmarked from popular'}`)
  } catch (e: any) {
    toast.error(e?.data?.message || e?.message || 'Failed to toggle popular joki')
  } finally {
    togglingPopularId.value = null
  }
}

onMounted(fetchUsers)
</script>
