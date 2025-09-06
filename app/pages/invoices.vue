<template>
  <section class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">Cek Transaksi</h1>
    <form @submit.prevent="onSearch" class="flex gap-2">
      <input v-model="invoice" type="text" placeholder="Masukkan kode invoice" class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button class="px-4 py-2 rounded-lg bg-blue-600 text-white">Cari</button>
    </form>

    <div class="mt-6">
      <div v-if="pending">Memuat...</div>
      <div v-else-if="error" class="text-red-600">{{ (error as any).data?.message || 'Terjadi kesalahan' }}</div>
      <div v-else-if="item">
        <div class="bg-white rounded-xl border p-4">
          <p><span class="font-medium">Invoice:</span> {{ item.invoice }}</p>
          <p><span class="font-medium">Email:</span> {{ item.email }}</p>
          <p><span class="font-medium">Phone:</span> {{ item.phone }}</p>
          <p><span class="font-medium">Produk:</span> {{ item.product_name }}</p>
          <p><span class="font-medium">Total:</span> Rp {{ new Intl.NumberFormat('id-ID').format(item.total_payment) }}</p>
          <p><span class="font-medium">Approved:</span> {{ item.is_approved ? 'Ya' : 'Belum' }}</p>
          <p><span class="font-medium">Success:</span> {{ item.is_success ? 'Ya' : 'Belum' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch } from '#app'

const route = useRoute()
const invoice = ref<string>((route.query.invoice as string) || '')

const { data, pending, error, refresh } = await useFetch('/api/transactions', {
  query: computed(() => ({ invoice: invoice.value })),
  immediate: !!invoice.value,
})

const item = computed(() => data.value?.item)

function onSearch() {
  refresh()
}
</script>
