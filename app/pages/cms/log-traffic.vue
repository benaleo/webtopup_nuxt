<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Log Traffic</h1>
      <div class="flex items-center gap-2">
        <label class="text-sm">Per page</label>
        <select v-model.number="pageSize" class="border rounded px-2 py-1 text-sm" @change="goPage(1)">
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto border rounded bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-3 py-2">#</th>
            <th class="px-3 py-2">Waktu</th>
            <th class="px-3 py-2">Browser</th>
            <th class="px-3 py-2">OS</th>
            <th class="px-3 py-2">Country</th>
            <th class="px-3 py-2">IP</th>
            <th class="px-3 py-2">URL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in items" :key="row.id" class="border-t">
            <td class="px-3 py-2">{{ (meta.page - 1) * meta.pageSize + idx + 1 }}</td>
            <td class="px-3 py-2 text-gray-600">{{ formatDate(row.createdAt || row.created_at) }}</td>
            <td class="px-3 py-2">{{ row.browser }}</td>
            <td class="px-3 py-2">{{ row.os }}</td>
            <td class="px-3 py-2">{{ row.country || '-' }}</td>
            <td class="px-3 py-2">{{ row.ip || '-' }}</td>
            <td class="px-3 py-2 max-w-[380px] truncate" :title="row.url">{{ row.url }}</td>
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

    <div class="flex items-center justify-between mt-3">
      <div class="text-sm text-gray-600">Page {{ page }} / {{ meta.pageCount }}</div>
      <div class="flex items-center gap-2">
        <button :disabled="page<=1" @click="goPage(page-1)" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button :disabled="page>=meta.pageCount" @click="goPage(page+1)" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'cms' })

const route = useRoute()
const router = useRouter()

const pageSizeOptions = [10, 25, 50, 100]
const loading = ref(false)
const items = ref<any[]>([])
const meta = reactive({ page: 1, pageSize: 10, total: 0, pageCount: 1 })

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
    const res: any = await $fetch('/api/cms/log-trafic', { params: { page: page.value, pageSize: pageSize.value } })
    items.value = res.items || []
    Object.assign(meta, res.meta || {})
  } finally {
    loading.value = false
  }
}

function goPage(p: number) { page.value = p }

function formatDate(v: any) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID')
}
</script>
