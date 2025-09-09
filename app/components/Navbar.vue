<template>
  <header
    class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200"
  >
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex items-center gap-3 w-full">
          <NuxtLink to="/" class="font-bold text-lg">WebTopup</NuxtLink>
          <!-- Search + Tabs -->
          <div class="w-full relative" ref="searchBoxEl">
            <input
              v-model="q"
              type="text"
              placeholder="Cari game (nama/publisher)"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @focus="openDropdown"
            />
            <!-- Dropdown -->
            <div
              v-if="showDropdown && (loading || results.length || q.trim().length)"
              class="absolute left-0 right-0 mt-2 rounded-lg shadow-lg border border-gray-200 bg-white max-h-96 overflow-auto z-50"
            >
              <div v-if="loading" class="px-4 py-3 text-sm text-gray-500">Mencari...</div>
              <template v-else>
                <div v-if="!results.length" class="px-4 py-3 text-sm text-gray-500">
                  Tidak ada game untuk "{{ q }}"
                </div>
                <ul v-else class="py-2">
                  <li v-for="g in results" :key="g.id">
                    <NuxtLink
                      :to="'/' + g.slug"
                      class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                      @click="closeDropdown"
                    >
                      <img :src="resolve(g.image)" :alt="g.name" class="w-10 h-10 rounded object-cover" />
                      <div class="min-w-0">
                        <div class="font-medium truncate">{{ g.name }}</div>
                        <div class="text-xs text-gray-500 truncate">{{ g.publisher }}</div>
                      </div>
                    </NuxtLink>
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
        <div
          class="inline-flex gap-2 rounded-lg overflow-hidden"
        >
          <button
            class="px-2 py-1 text-[10px] bg-gray-200 rounded-xl"
            @click="goTopup()"
          >
            Topup & Joki
          </button>
          <button
            class="px-2 py-1 text-[10px] bg-gray-200 rounded-xl"
            @click="goCheck()"
          >
            Cek Transaksi
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Navigation shortcuts
const goTopup = () => {
  navigateTo('/')
}
const goCheck = () => {
  navigateTo('/invoices')
}

// Runtime config for resolving relative image URLs
const config = useRuntimeConfig()
const baseUrl = (config as any).public?.BASE_URL || ''
function resolve(path?: string | null) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${baseUrl}${path}`
}

// Search state
const q = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const showDropdown = ref(false)
const searchBoxEl = ref<HTMLElement | null>(null)

function openDropdown() { showDropdown.value = true }
function closeDropdown() { showDropdown.value = false }

// Debounce logic
let t: any = null
watch(q, (val) => {
  clearTimeout(t)
  if (!val || !val.trim()) { results.value = []; return }
  loading.value = true
  t = setTimeout(async () => {
    try {
      const res: any = await $fetch('/api/games', { params: { q: val.trim() } })
      results.value = res?.items || []
    } finally {
      loading.value = false
    }
  }, 300)
})

// Close when clicking outside
function onDocClick(e: MouseEvent) {
  const el = searchBoxEl.value
  if (!el) return
  if (!el.contains(e.target as Node)) {
    closeDropdown()
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
