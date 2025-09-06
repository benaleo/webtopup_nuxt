<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Payment Methods</h1>
      <div class="flex items-center gap-2">
        <button @click="openCreate" class="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Tambah Metode</button>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between mb-3 gap-2">
      <div class="text-sm text-gray-600">Total: {{ meta.total }}</div>
      <div class="flex items-center gap-2">
        <label class="text-sm">Per page</label>
        <select v-model.number="pageSize" class="border rounded px-2 py-1 text-sm" @change="goPage(1)">
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>

    <!-- Datatable -->
    <div class="overflow-x-auto border rounded bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-3 py-2">Orders</th>
            <th class="px-3 py-2">Preview</th>
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Category</th>
            <th class="px-3 py-2">Biaya Layanan</th>
            <th class="px-3 py-2">Active</th>
            <th class="px-3 py-2 w-40">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in items" :key="m.id" class="border-t">
            <td class="px-3 py-2">{{ m.orders }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center" style="width: 4rem; height: 2.5rem;">
                <img v-if="m.image" :src="resolve(m.image)" :alt="m.name" class="w-full h-full object-contain rounded border bg-white" />
              </div>
            </td>
            <td class="px-3 py-2">
              <div class="font-medium">{{ m.name }}</div>
              <div class="text-xs text-gray-500 truncate max-w-[18rem]" v-if="m.description">{{ m.description }}</div>
            </td>
            <td class="px-3 py-2">{{ m.category }}</td>
            <td class="px-3 py-2">{{ currency(m.service_amount) }}</td>
            <td class="px-3 py-2">
              <span :class="m.is_active ? 'text-emerald-600' : 'text-gray-400'">{{ m.is_active ? 'Yes' : 'No' }}</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button @click="openEdit(m)" class="px-2 py-1 border rounded" title="Edit">✏️</button>
                <button @click="onDelete(m)" class="px-2 py-1 border rounded text-red-600" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="7" class="px-3 py-6 text-center text-gray-500">No data</td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="px-3 py-6 text-center text-gray-500">Loading...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-3">
      <div class="text-sm text-gray-600">Page {{ page }} / {{ meta.pageCount }}</div>
      <div class="flex items-center gap-2">
        <button :disabled="page<=1" @click="goPage(page-1)" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button :disabled="page>=meta.pageCount" @click="goPage(page+1)" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="bg-white rounded shadow w-full max-w-2xl">
        <div class="px-4 py-3 border-b font-semibold">{{ editing ? 'Edit Metode' : 'Tambah Metode' }}</div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Orders</label>
            <input v-model.number="form.orders" type="number" min="0" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Nama</label>
            <input v-model="form.name" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Kategori</label>
            <select v-model="form.category" class="w-full border rounded px-2 py-1">
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Biaya Layanan</label>
            <input v-model.number="form.service_amount" type="number" step="0.01" min="0" class="w-full border rounded px-2 py-1" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Deskripsi</label>
            <textarea v-model="form.description" class="w-full border rounded px-2 py-1" rows="2" />
          </div>
          <div class="md:col-span-2 space-y-2">
            <label class="block text-sm">Logo</label>
            <div class="flex items-center gap-3">
              <input type="file" accept="image/*" @change="onPickImage" class="text-sm" />
            </div>
            <div v-if="form.image" class="mt-2">
              <img :src="resolve(form.image)" alt="preview" class="h-16 rounded border object-contain bg-white p-1" />
              <input v-model="form.image" placeholder="paste path like /uploads/xxx.jpg or full URL" class="w-full mt-2 border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_active" /> Active
            </label>
          </div>
        </div>
        <div class="px-4 py-3 border-t flex justify-end gap-2">
          <button @click="closeForm" class="px-3 py-2 border rounded">Cancel</button>
          <button @click="submitForm" class="px-3 py-2 rounded bg-emerald-600 text-white">Save</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'cms' })

const pageSizeOptions = [10, 25, 50, 100]
const items = ref<any[]>([])
const meta = reactive({ page: 1, pageSize: 10, total: 0, pageCount: 1 })
const loading = ref(false)

const config = useRuntimeConfig()
const baseUrl = (config as any).public?.BASE_URL || ''
function resolve(path?: string) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${baseUrl}${path}`
}

const route = useRoute()
const router = useRouter()
const page = computed({
  get: () => Number(route.query.page || 1),
  set: (v: number) => router.replace({ query: { ...route.query, page: String(v) } }),
})
const pageSize = computed({
  get: () => Number(route.query.pageSize || 10),
  set: (v: number) => router.replace({ query: { ...route.query, pageSize: String(v) } }),
})

watchEffect(() => { fetchList() })

async function fetchList() {
  loading.value = true
  try {
    const res: any = await $fetch('/api/cms/payment-methods', { params: { page: page.value, pageSize: pageSize.value } })
    items.value = res.items
    Object.assign(meta, res.meta)
  } finally {
    loading.value = false
  }
}

function goPage(p: number) { page.value = p }

// form
const showForm = ref(false)
const editing = ref(false)
const currentId = ref<string | null>(null)
const categories = ['QRIS', 'E-WALLET', 'VIRTUAL_ACCOUNT', 'STORE']
const form = reactive<{ orders: number; name: string; category: string; service_amount: number; image?: string; description?: string; is_active: boolean }>({
  orders: 0,
  name: '',
  category: categories[0],
  service_amount: 0,
  image: '',
  description: '',
  is_active: true,
})

function openCreate() {
  editing.value = false
  currentId.value = null
  Object.assign(form, { orders: meta.total + 1, name: '', category: categories[0], service_amount: 0, image: '', description: '', is_active: true })
  showForm.value = true
}

function openEdit(m: any) {
  editing.value = true
  currentId.value = m.id
  Object.assign(form, {
    orders: m.orders,
    name: m.name,
    category: m.category,
    service_amount: m.service_amount,
    image: m.image || '',
    description: m.description || '',
    is_active: m.is_active,
  })
  showForm.value = true
}

function closeForm() { showForm.value = false }

async function submitForm() {
  try {
    if (editing.value && currentId.value) {
      await $fetch(`/api/cms/payment-methods/${currentId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await $fetch(`/api/cms/payment-methods`, { method: 'POST', body: { ...form } })
    }
    showForm.value = false
    fetchList()
  } catch (e: any) {
    alert(e?.data?.message || e.message || 'Error')
  }
}

async function onDelete(m: any) {
  if (!confirm(`Hapus metode "${m.name}"?`)) return
  try {
    await $fetch(`/api/cms/payment-methods/${m.id}`, { method: 'DELETE' })
    fetchList()
  } catch (e: any) {
    alert(e?.data?.message || e.message || 'Error')
  }
}

async function onPickImage(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0] as File
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res: any = await $fetch('/api/cms/upload', { method: 'POST', body: fd })
    form.image = res.path
  } catch (err: any) {
    alert(err?.data?.message || err.message || 'Upload failed')
  } finally {
    input.value = ''
  }
}

function currency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
}
</script>
