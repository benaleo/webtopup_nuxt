<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Vouchers</h1>
      <div class="flex items-center gap-2">
        <button @click="openCreate" class="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Tambah Voucher</button>
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
            <th class="px-3 py-2">Code</th>
            <th class="px-3 py-2">Stock</th>
            <th class="px-3 py-2">Amount</th>
            <th class="px-3 py-2">Type</th>
            <th class="px-3 py-2">Valid At</th>
            <th class="px-3 py-2">Valid Until</th>
            <th class="px-3 py-2">Active</th>
            <th class="px-3 py-2 w-40">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in items" :key="v.id" class="border-t">
            <td class="px-3 py-2">
              <div class="font-medium">{{ v.name }}</div>
            </td>
            <td class="px-3 py-2">{{ v.code }}</td>
            <td class="px-3 py-2">{{ v.stock }}</td>
            <td class="px-3 py-2">{{ v.type === 'AMOUNT' ? currency(v.amount) : v.amount + '%' }}</td>
            <td class="px-3 py-2">{{ v.type }}</td>
            <td class="px-3 py-2">{{ formatDate(v.valid_at) }}</td>
            <td class="px-3 py-2">{{ formatDate(v.valid_until) }}</td>
            <td class="px-3 py-2">
              <span :class="v.is_active ? 'text-emerald-600' : 'text-gray-400'">{{ v.is_active ? 'Yes' : 'No' }}</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <button @click="openEdit(v)" class="px-2 py-1 border rounded" title="Edit">✏️</button>
                <button @click="onDelete(v)" class="px-2 py-1 border rounded text-red-600" title="Delete">🗑️</button>
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
        <div class="px-4 py-3 border-b font-semibold">{{ editing ? 'Edit Voucher' : 'Tambah Voucher' }}</div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Nama</label>
            <input v-model="form.name" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Kode</label>
            <input v-model="form.code" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Tipe</label>
            <select v-model="form.type" class="w-full border rounded px-2 py-1">
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Amount</label>
            <input v-model.number="form.amount" type="number" step="0.01" min="0" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Minimum</label>
            <input v-model.number="form.minimum" type="number" step="0.01" min="0" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Stock</label>
            <input v-model.number="form.stock" type="number" step="0" min="0" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Valid At</label>
            <input v-model="form.valid_at" type="datetime-local" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm mb-1">Valid Until</label>
            <input v-model="form.valid_until" type="datetime-local" class="w-full border rounded px-2 py-1" />
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
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'cms' })

const pageSizeOptions = [10, 25, 50, 100]
const items = ref<any[]>([])
const meta = reactive({ page: 1, pageSize: 10, total: 0, pageCount: 1 })
const loading = ref(false)

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
    const res: any = await $fetch('/api/cms/vouchers', { params: { page: page.value, pageSize: pageSize.value } })
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
const types = ['AMOUNT', 'PERCENTAGE'] as const

type VoucherForm = {
  name: string
  code: string
  amount: number
  stock: number
  minimum: number
  type: typeof types[number]
  valid_at: string
  valid_until: string
  is_active: boolean
}

// we'll bind datetime-local as local string and convert to ISO on submit
const form = reactive<VoucherForm>({
  name: '',
  code: '',
  amount: 0,
  stock: 0,
  minimum: 0,
  type: types[0],
  valid_at: localNowInput(),
  valid_until: localNowInput(1),
  is_active: true,
})

function openCreate() {
  editing.value = false
  currentId.value = null
  Object.assign(form, { name: '', code: randomString(8), amount: 0, minimum: 0, type: types[0], valid_at: localNowInput(), valid_until: localNowInput(1), is_active: true })
  showForm.value = true
}

function openEdit(v: any) {
  editing.value = true
  currentId.value = v.id
  Object.assign(form, {
    name: v.name,
    code: v.code,
    amount: v.amount,
    stock: v.stock,
    minimum: v.minimum,
    type: v.type,
    valid_at: toLocalInput(v.valid_at),
    valid_until: toLocalInput(v.valid_until),
    is_active: v.is_active,
  })
  showForm.value = true
}

function closeForm() { showForm.value = false }

async function submitForm() {
  try {
    const payload = {
      name: form.name,
      code: form.code,
      amount: Number(form.amount || 0),
      stock: Number(form.stock || 0),
      minimum: Number(form.minimum || 0),
      type: form.type,
      valid_at: toISO(form.valid_at),
      valid_until: toISO(form.valid_until),
      is_active: !!form.is_active,
    }
    if (editing.value && currentId.value) {
      await $fetch(`/api/cms/vouchers/${currentId.value}`, { method: 'PUT', body: payload })
      toast.success(`Voucher "${form.name}" berhasil diperbarui`)
    } else {
      await $fetch(`/api/cms/vouchers`, { method: 'POST', body: payload })
      toast.success(`Voucher "${form.name}" berhasil ditambahkan`)
    }
    showForm.value = false
    fetchList()
  } catch (e: any) {
    toast.error(e?.data?.message || e.message || 'Error')
  }
}

async function onDelete(v: any) {
  if (!confirm(`Hapus voucher \"${v.name}\"?`)) return
  try {
    await $fetch(`/api/cms/vouchers/${v.id}`, { method: 'DELETE' })
    fetchList()
    toast.success(`Voucher \"${v.name}\" berhasil dihapus`)
  } catch (e: any) {
    toast.error(e?.data?.message || e.message || 'Error')
  }
}

function currency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleString('id-ID') } catch { return d }
}

function toLocalInput(d: string | Date) {
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0,16)
}

function toISO(local: string) {
  // local is yyyy-MM-ddTHH:mm from input
  const dt = new Date(local)
  // interpret as local; convert to real ISO
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString()
}

function localNowInput(addHours = 0): string {
  const now = new Date()
  now.setHours(now.getHours() + addHours)
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16) || ''
}

</script>
