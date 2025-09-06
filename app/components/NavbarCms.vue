<template>
  <header
    class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200"
  >
    <div class="container mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex items-center gap-3 w-full">
          <NuxtLink to="/" class="font-bold text-lg">WebTopup</NuxtLink>
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
