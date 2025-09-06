<template>
  <section class="container mx-auto px-4 py-6" v-if="game">
    <div class="flex flex-col gap-6">
      <div class="w-full">
        <img :src="resolve(game.image)" :alt="game.name" class="w-full md:max-w-[400px] h-56 object-cover rounded" />
        <h1 class="mt-3 text-2xl font-semibold">{{ game.name }}</h1>
        <p class="text-sm text-gray-600">{{ game.publisher }}</p>
      </div>
      <div class="w-full">
        <!-- Steps -->
        <div class="space-y-6">
          <!-- Step 1: Nominal -->
          <div class="p-4 border rounded bg-white">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">1. Pilih Nominal</h2>
              <span class="text-xs text-gray-500" v-if="productsLoading">Loading...</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              <button
                v-for="p in products"
                :key="p.id"
                @click="selectProduct(p)"
                :class="['border rounded p-3 text-left hover:border-blue-500', selectedProduct?.id===p.id ? 'ring-2 ring-blue-600 border-blue-600' : '']"
              >
                <div class="font-medium">{{ p.name }}</div>
                <div class="text-xs text-gray-500">{{ p.value }}</div>
                <div class="mt-1 font-semibold">{{ currency(p.price) }}</div>
                <div class="text-[10px] text-gray-400" v-if="p.is_instant">Instant</div>
              </button>
            </div>
          </div>

          <!-- Step 2: Data Akun -->
          <div class="p-4 border rounded bg-white">
            <h2 class="font-semibold">2. Masukan Data Akun</h2>
            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input v-model="user_id" placeholder="User ID" class="border rounded px-3 py-2" />
              <input v-model="server_id" placeholder="Server ID" class="border rounded px-3 py-2" />
            </div>
          </div>

          <!-- Step 3: Jumlah -->
          <div class="p-4 border rounded bg-white">
            <h2 class="font-semibold">3. Masukan Jumlah Pembelian</h2>
            <div class="mt-3 flex items-center gap-3">
              <input v-model.number="qty" type="number" min="1" class="w-24 border rounded px-3 py-2" />
            </div>
          </div>

          <!-- Step 4: Pembayaran -->
          <div class="p-4 border rounded bg-white">
            <h2 class="font-semibold">4. Pilih Pembayaran</h2>
            <div class="mt-3" v-if="pmLoading">Loading payment methods...</div>
            <div class="mt-3 space-y-2" v-else>
              <details v-for="pm in paymentMethods" :key="pm.id" class="border rounded">
                <summary class="cursor-pointer px-3 py-2 flex items-center gap-2">
                  <img v-if="pm.image" :src="resolve(pm.image)" alt="" class="w-6 h-6 object-cover rounded" />
                  <span class="font-medium">{{ pm.name }}</span>
                  <span class="ml-auto text-xs text-gray-500">Biaya layanan: {{ currency(pm.service_amount) }}</span>
                </summary>
                <div class="px-3 py-2 border-t text-sm text-gray-600">
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" name="payment_id" :value="pm.id" v-model="payment_id" />
                    <span>Pilih {{ pm.name }}</span>
                  </label>
                </div>
              </details>
            </div>
          </div>

          <!-- Step 5: Kode Promo -->
          <div class="p-4 border rounded bg-white">
            <h2 class="font-semibold">5. Kode Promo (Optional)</h2>
            <div class="mt-3 flex gap-2">
              <input v-model="voucherCode" placeholder="Masukkan kode voucher" class="flex-1 border rounded px-3 py-2" />
              <button @click="applyVoucher" class="px-3 py-2 rounded bg-gray-900 text-white">Terapkan</button>
            </div>
            <div v-if="voucherApplied" class="mt-2 text-sm text-emerald-700">
              Voucher diterapkan: -{{ currency(voucher_value) }}
            </div>
          </div>

          <!-- Step 6: Detail Kontak -->
          <div class="p-4 border rounded bg-white">
            <h2 class="font-semibold">6. Detail Kontak</h2>
            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input v-model="email" type="email" placeholder="Email" class="border rounded px-3 py-2" />
              <input v-model="phone" type="tel" placeholder="Nomor HP" class="border rounded px-3 py-2" />
            </div>
          </div>

          <!-- Summary & Submit -->
          <div class="p-4 border rounded bg-white">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm">Harga: {{ currency(selectedProduct?.price || 0) }} x {{ qty }}</div>
                <div class="text-sm">Biaya layanan: {{ currency(selectedPayment?.service_amount || 0) }}</div>
                <div class="text-sm" v-if="voucher_value">Voucher: -{{ currency(voucher_value) }}</div>
                <div class="mt-1 font-semibold">Total: {{ currency(total) }}</div>
              </div>
              <button @click="submit" class="px-4 py-2 rounded bg-blue-600 text-white" :disabled="submitting">
                {{ submitting ? 'Memproses...' : 'Buat Pesanan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section v-else class="container mx-auto px-4 py-12 text-center text-gray-500">Memuat...</section>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const config = useRuntimeConfig()
const baseUrl = (config as any).public?.BASE_URL || ''
function resolve(path?: string | null) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${baseUrl}${path}`
}

const { data: gameRes } = await useFetch(`/api/games/${slug}`)
const game = computed(() => gameRes.value?.item)

// Step 1: products
const products = ref<any[]>([])
const productsLoading = ref(false)
const selectedProduct = ref<any | null>(null)

watch(game, async (g) => {
  if (!g) return
  productsLoading.value = true
  try {
    const res: any = await $fetch('/api/products', { params: { gameSlug: g.slug } })
    products.value = res.items
  } finally { productsLoading.value = false }
})

function selectProduct(p: any) {
  selectedProduct.value = p
}

// Step 2 & 3
const user_id = ref('')
const server_id = ref('')
const qty = ref(1)

// Step 4: payment methods
const paymentMethods = ref<any[]>([])
const pmLoading = ref(true)
const payment_id = ref<string | null>(null)
const selectedPayment = computed(() => paymentMethods.value.find(p => p.id === payment_id.value) || null)

onMounted(async () => {
  const res: any = await $fetch('/api/payment-methods')
  paymentMethods.value = res.items
  pmLoading.value = false
})

// Step 5: voucher
const voucherCode = ref('')
const voucher_value = ref(0)
const voucherApplied = ref(false)

async function applyVoucher() {
  if (!selectedProduct.value) { alert('Pilih nominal dahulu'); return }
  const res: any = await $fetch('/api/vouchers/apply', {
    method: 'POST',
    body: { code: voucherCode.value, productId: selectedProduct.value.id, qty: qty.value }
  })
  voucher_value.value = res.amount || 0
  voucherApplied.value = !!res.applied
}

// Step 6: contact
const email = ref('')
const phone = ref('')

// Summary
const total = computed(() => {
  const price = (selectedProduct.value?.price || 0) * qty.value
  const service = selectedPayment.value?.service_amount || 0
  return Math.max(0, price + service - (voucher_value.value || 0))
})

const submitting = ref(false)
async function submit() {
  if (!selectedProduct.value) { alert('Pilih nominal'); return }
  if (!payment_id.value) { alert('Pilih pembayaran'); return }
  if (!email.value || !phone.value) { alert('Isi email dan nomor HP'); return }

  submitting.value = true
  try {
    const res: any = await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        slug,
        productId: selectedProduct.value.id,
        qty: qty.value,
        user_id: user_id.value,
        server_id: server_id.value,
        email: email.value,
        phone: phone.value,
        paymentId: payment_id.value,
        voucherCode: voucherApplied.value ? voucherCode.value : undefined,
      }
    })
    if (res?.invoice) {
      navigateTo({ path: '/invoices', query: { invoice: res.invoice } })
    }
  } catch (e: any) {
    alert(e?.data?.message || e.message || 'Gagal membuat transaksi')
  } finally { submitting.value = false }
}

function currency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
</script>
