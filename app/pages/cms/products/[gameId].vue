<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Products · {{ game?.name || '...' }}</h1>
      <div class="flex items-center gap-2">
        <NuxtLink to="/cms/games" class="px-3 py-2 border rounded text-sm">← Kembali</NuxtLink>
        <button @click="openCreate" class="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Tambah Product</button>
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
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Value</th>
            <th class="px-3 py-2">Price</th>
            <th class="px-3 py-2">Instant</th>
            <th class="px-3 py-2">Active</th>
            <th class="px-3 py-2 w-40">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-t">
            <td class="px-3 py-2">{{ p.name }}</td>
            <td class="px-3 py-2">{{ p.value }}</td>
            <td class="px-3 py-2">{{ p.price }}</td>
            <td class="px-3 py-2">{{ p.is_instant ? 'Yes' : 'No' }}</td>
            <td class="px-3 py-2">{{ p.is_active ? 'Yes' : 'No' }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button @click="openEdit(p)" class="px-2 py-1 border rounded" title="Edit">✏️</button>
                <button @click="onDelete(p)" class="px-2 py-1 border rounded text-red-600" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-3 py-6 text-center text-gray-500">No data</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="px-3 py-6 text-center text-gray-500">Loading...</td>
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
      <div class="bg-white rounded shadow w-full max-w-lg">
        <div class="px-4 py-3 border-b font-semibold">{{ editing ? 'Edit Product' : 'Tambah Product' }}</div>
        <div class="p-4 space-y-3">
          <div>
            <label class="block text-sm mb-1">Name</label>
            <input v-model="form.name" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Value</label>
            <input v-model="form.value" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Price</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" />
          </div>
          <div class="flex items-center gap-4">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_instant" /> Instant
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_active" /> Active
            </label>
          </div>

          <!-- Metadata Editor -->
          <div class="pt-2">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium">Metadata (opsional)</label>
              <button type="button" @click="addMetaPair" class="px-2 py-1 text-xs rounded border">+ Tambah Attribute</button>
            </div>
            <div class="space-y-2">
              <div v-for="(pair, idx) in metadataPairs" :key="idx" class="flex items-center gap-2">
                <input v-model="pair.key" placeholder="key" class="flex-1 border rounded px-2 py-1 text-sm" />
                <input v-model="pair.value" placeholder="value" class="flex-1 border rounded px-2 py-1 text-sm" />
                <button type="button" @click="removeMetaPair(idx)" class="px-2 py-1 text-xs border rounded">Hapus</button>
              </div>
              <div v-if="!metadataPairs.length" class="text-xs text-gray-500">Belum ada metadata. Klik "Tambah Attribute" untuk menambah.</div>
            </div>
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

const route = useRoute()
const router = useRouter()
const gameId = computed(() => String(route.params.gameId || ''))

const pageSizeOptions = [10, 25, 50, 100]
const items = ref<any[]>([])
const meta = reactive({ page: 1, pageSize: 10, total: 0, pageCount: 1 })
const loading = ref(false)
const game = ref<any>(null)

const page = computed({
  get: () => Number(route.query.page || 1),
  set: (v: number) => router.replace({ query: { ...route.query, page: String(v) } }),
})
const pageSize = computed({
  get: () => Number(route.query.pageSize || 10),
  set: (v: number) => router.replace({ query: { ...route.query, pageSize: String(v) } }),
})

watchEffect(() => {
  fetchGame()
  fetchList()
})

async function fetchGame() {
  if (!gameId.value) return
  const res: any = await $fetch(`/api/cms/games/${gameId.value}`)
  game.value = res.item
}

async function fetchList() {
  if (!gameId.value) return
  loading.value = true
  try {
    const res: any = await $fetch('/api/cms/products', { params: { game_id: gameId.value, page: page.value, pageSize: pageSize.value } })
    items.value = res.items
    Object.assign(meta, res.meta)
  } finally {
    loading.value = false
  }
}

function goPage(p: number) { page.value = p }

// CRUD modal
const showForm = ref(false)
const editing = ref(false)
const currentId = ref<string | null>(null)
const form = reactive({ name: '', value: '', price: 0, is_instant: false, is_active: true })

// Metadata editor state
type MetaPair = { key: string; value: string }
const metadataPairs = ref<MetaPair[]>([])

function addMetaPair() {
  metadataPairs.value.push({ key: '', value: '' })
}
function removeMetaPair(idx: number) {
  metadataPairs.value.splice(idx, 1)
}
function buildMetadataObject(): Record<string, any> | undefined {
  const obj: Record<string, any> = {}
  for (const { key, value } of metadataPairs.value) {
    const k = String(key || '').trim()
    if (!k) continue
    obj[k] = value
  }
  return Object.keys(obj).length ? obj : undefined
}

function openCreate() {
  editing.value = false
  currentId.value = null
  Object.assign(form, { name: '', value: '', price: 0, is_instant: false, is_active: true })
  metadataPairs.value = []
  showForm.value = true
}

function openEdit(p: any) {
  editing.value = true
  currentId.value = p.id
  Object.assign(form, { name: p.name, value: p.value, price: p.price, is_instant: p.is_instant, is_active: p.is_active })
  // Initialize metadata pairs from existing metadata object if present
  const metaObj = (p as any).metadata as Record<string, any> | null | undefined
  if (metaObj && typeof metaObj === 'object') {
    metadataPairs.value = Object.entries(metaObj).map(([k, v]) => ({ key: String(k), value: String(v as any) }))
  } else {
    metadataPairs.value = []
  }
  showForm.value = true
}

function closeForm() { showForm.value = false }

async function submitForm() {
  try {
    const metadata = buildMetadataObject()
    if (editing.value && currentId.value) {
      await $fetch(`/api/cms/products/${currentId.value}`, { method: 'PUT', body: { ...form, metadata } })
    } else {
      await $fetch(`/api/cms/products`, { method: 'POST', body: { ...form, game_id: gameId.value, metadata } })
    }
    showForm.value = false
    fetchList()
  } catch (e: any) {
    alert(e?.data?.message || e.message || 'Error')
  }
}

async function onDelete(p: any) {
  if (!confirm(`Hapus product "${p.name}"?`)) return
  try {
    await $fetch(`/api/cms/products/${p.id}`, { method: 'DELETE' })
    fetchList()
  } catch (e: any) {
    alert(e?.data?.message || e.message || 'Error')
  }
}
</script>
