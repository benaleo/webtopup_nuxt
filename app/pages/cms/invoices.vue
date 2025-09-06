<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <h1 class="text-xl font-semibold">Invoices</h1>
      <div class="flex flex-1 md:flex-none items-center gap-3">
        <div class="flex-1 relative max-w-md">
          <input
            v-model="q"
            type="text"
            placeholder="Search invoice / email / phone..."
            class="w-full pl-9 pr-3 py-2 border rounded bg-white text-sm"
          />
          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">🔎</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Rows per page</label>
          <select
            v-model.number="limit"
            class="border rounded px-2 py-1 text-sm bg-white"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <div class="overflow-auto border rounded-md bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-700 border-b">
          <tr>
            <th class="text-left px-3 py-2">Invoice</th>
            <th class="text-left px-3 py-2">Created</th>
            <th class="text-left px-3 py-2">Email</th>
            <th class="text-left px-3 py-2">Phone</th>
            <th class="text-left px-3 py-2">Product</th>
            <th class="text-right px-3 py-2">Total</th>
            <th class="text-left px-3 py-2">Payment</th>
            <th class="text-center px-3 py-2">Approved</th>
            <th class="text-center px-3 py-2">Success</th>
            <th class="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody v-if="items.length">
          <tr v-for="t in items" :key="t.id" class="border-b last:border-0">
            <td class="px-3 py-2 font-medium">{{ t.invoice }}</td>
            <td class="px-3 py-2 text-gray-600">{{ formatDate(t.created_at) }}</td>
            <td class="px-3 py-2">{{ t.email }}</td>
            <td class="px-3 py-2">{{ t.phone }}</td>
            <td class="px-3 py-2">{{ t.product_name }} (x{{ t.qty }})</td>
            <td class="px-3 py-2 text-right">{{ formatCurrency(t.total_payment) }}</td>
            <td class="px-3 py-2">{{ t.payment_name || t.payment?.name }}</td>
            <td class="px-3 py-2 text-center">
              <span
                class="px-2 py-0.5 rounded text-xs font-medium"
                :class="t.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'"
              >
                {{ t.is_approved ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-3 py-2 text-center">
              <span
                class="px-2 py-0.5 rounded text-xs font-medium cursor-pointer"
                :class="t.is_success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                @click="t.reason && t.reason !== '-' ? openReasonDialog(t) : null"
              >
                {{ t.is_success ? 'Success' : 'Fail' }}
                <span v-if="t.reason && t.reason !== '-'" class="ml-1">ℹ️</span>
              </span>
            </td>
            <td class="px-3 py-2">
              <div class="flex justify-end gap-2">
                <button
                  v-if="t.reason === '' || t.reason === null"
                  class="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  @click="openDialog('approve', t)"
                  :disabled="pendingAction"
                >Approve</button>
                <button
                  v-if="t.reason === '' || t.reason === null"
                  class="px-2 py-1 text-xs rounded border border-rose-600 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  @click="openDialog('reject', t)"
                  :disabled="pendingAction"
                >Reject</button>
                <span v-else class="text-xs text-gray-500 self-center">
                  {{ t.is_approved ? 'Approved' : 'Rejected' }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="10" class="px-3 py-10 text-center text-gray-500">
              <div v-if="pending">Loading...</div>
              <div v-else>No data</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 mt-4">
      <div class="text-sm text-gray-600">
        <span v-if="total > 0">
          Showing
          <strong>{{ startIndex }}</strong>
          -
          <strong>{{ endIndex }}</strong>
          of
          <strong>{{ total }}</strong>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 border rounded disabled:opacity-50"
          :disabled="page <= 1 || pending"
          @click="page--"
        >
          Prev
        </button>
        <span class="text-sm text-gray-700">Page {{ page }} / {{ pageCount }}</span>
        <button
          class="px-3 py-1.5 border rounded disabled:opacity-50"
          :disabled="page >= pageCount || pending"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="dialog.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="closeDialog"></div>
      <div class="relative bg-white rounded-md shadow-lg w-[95%] max-w-md p-4">
        <h3 class="font-semibold mb-2">
          {{ dialog.mode === 'approve' ? 'Approve Transaction' : 'Reject Transaction' }}
        </h3>
        <p class="text-sm text-gray-600 mb-3">
          {{ dialog.mode === 'approve' ? 'Setujui transaksi ini. Success akan menjadi true.' : 'Tolak transaksi ini.' }}
        </p>
        <div class="mb-3">
          <label class="text-sm text-gray-700">Reason <span class="text-rose-600">*</span></label>
          <textarea v-model="dialog.reason" rows="3" class="mt-1 w-full border rounded px-2 py-1 text-sm" placeholder="Alasan..."></textarea>
          <p v-if="dialogError" class="text-xs text-rose-600 mt-1">{{ dialogError }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-1.5 border rounded hover:bg-gray-50" @click="closeDialog" :disabled="pendingAction">Batal</button>
          <button
            class="px-3 py-1.5 rounded text-white"
            :class="dialog.mode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
            @click="confirmDialog"
            :disabled="pendingAction"
          >
            {{ pendingAction ? 'Processing...' : (dialog.mode === 'approve' ? 'Approve' : 'Reject') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reason Dialog -->
    <div v-if="reasonDialog.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="closeReasonDialog"></div>
      <div class="relative bg-white rounded-md shadow-lg w-[95%] max-w-md p-4">
        <h3 class="font-semibold mb-3">Alasan</h3>
        <div class="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
          {{ reasonDialog.reason }}
        </div>
        <div class="mt-4 flex justify-end">
          <button 
            @click="closeReasonDialog"
            class="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ layout: 'cms' })

type Payment = { id: string; name: string }
type Transaction = {
  id: string
  invoice: string
  email: string
  phone: string
  product_name: string
  qty: number
  total_payment: number
  payment_name?: string | null
  payment?: Payment | null
  is_approved: boolean
  is_success: boolean
  reason?: string | null
  created_at: string | Date
}

const page = ref(1)
const limit = ref(10)
const q = ref('')
const qDebounced = ref('')

const { data, pending, error, refresh } = await useFetch('/api/cms/transactions', {
  query: computed(() => ({ page: page.value, limit: limit.value, q: qDebounced.value })),
  watch: [page, limit],
})

const items = computed<Transaction[]>(() => data.value?.items ?? [])
const total = computed<number>(() => data.value?.total ?? 0)
const pageCount = computed<number>(() => data.value?.pageCount ?? 1)

const startIndex = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1))
const endIndex = computed(() => Math.min(page.value * limit.value, total.value))

// Reset to first page when page size changes
watch(limit, () => {
  page.value = 1
})

// Debounce search and reset to first page
let qTimer: any
watch(q, (val) => {
  page.value = 1
  clearTimeout(qTimer)
  qTimer = setTimeout(() => {
    qDebounced.value = val.trim()
  }, 400)
})

// Dialogs state
const reasonDialog = reactive<{ open: boolean; reason: string | null }>({
  open: false,
  reason: null
})

// Approve/Reject dialog state and actions
type DialogMode = 'approve' | 'reject'
const dialog = reactive<{ open: boolean; mode: DialogMode; item: Transaction | null; reason: string }>({
  open: false,
  mode: 'approve',
  item: null,
  reason: '',
})
const dialogError = ref('')
const pendingAction = ref(false)

function openDialog(mode: DialogMode, item: Transaction) {
  dialog.open = true
  dialog.mode = mode
  dialog.item = item
  dialog.reason = ''
  dialogError.value = ''
}

function openReasonDialog(transaction: Transaction) {
  reasonDialog.reason = transaction.reason || 'No reason provided'
  reasonDialog.open = true
}

function closeReasonDialog() {
  reasonDialog.open = false
  reasonDialog.reason = null
}

function closeDialog() {
  if (pendingAction.value) return
  dialog.open = false
  dialog.item = null
  dialog.reason = ''
  dialogError.value = ''
}

async function confirmDialog() {
  if (!dialog.reason.trim()) {
    dialogError.value = 'Reason wajib diisi.'
    return
  }
  if (!dialog.item) return
  pendingAction.value = true
  dialogError.value = ''
  try {
    const id = dialog.item.id
    const approve = dialog.mode === 'approve'
    await $fetch(`/api/cms/transactions/${id}`, {
      method: 'PUT',
      body: {
        is_approved: approve,
        is_success: approve, // set success true if approve, false if reject
        reason: dialog.reason.trim() ? dialog.reason.trim() : '-',
      },
    })
    // Refresh list
    await refresh()
    closeDialog()
    toast.success(approve ? 'Transaksi berhasil di-approve.' : 'Transaksi berhasil di-reject.')
    dialog.open = false
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Gagal memproses aksi.'
    dialogError.value = msg
    toast.error(msg)
  } finally {
    pendingAction.value = false
  }
}

function formatDate(input: string | Date) {
  const d = new Date(input)
  return d.toLocaleString()
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  } catch {
    return `Rp ${Math.round(n).toLocaleString('id-ID')}`
  }
}
</script>

