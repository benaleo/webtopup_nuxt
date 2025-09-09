<template>
  <ClientOnly>
    <section class="container mx-auto px-4 py-6">
      <h1 class="text-xl font-semibold mb-4">Cek Transaksi</h1>
      <form @submit.prevent="onSearch" class="flex gap-2">
        <input
          v-model="invoice"
          type="text"
          placeholder="Masukkan kode invoice"
          class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button class="px-4 py-2 rounded-lg bg-blue-600 text-white">
          Cari
        </button>
      </form>

      <div class="mt-6">
        <div v-if="pending">Memuat...</div>
        <div v-else-if="error" class="text-red-600">
          {{ (error as any).data?.message || "Terjadi kesalahan" }}
        </div>
        
        <!-- Single item view -->
        <div v-else-if="item">
          <div :class="item.is_success ? 'bg-green-100' : (item.reason === '' || item.reason === null ? 'bg-yellow-100' : 'bg-red-100')" class="rounded-xl border p-4">
            <p><span class="font-medium">Invoice:</span> {{ item.invoice }}</p>
            <p><span class="font-medium">Email:</span> {{ item.email }}</p>
            <p><span class="font-medium">Phone:</span> {{ item.phone }}</p>
            <p>
              <span class="font-medium">Produk:</span> {{ item.product_name }} x {{ item.qty }} qty orders
            </p>
            <p>
              <span class="font-medium">Total:</span> Rp
              {{ new Intl.NumberFormat("id-ID").format(item.total_payment) }}
            </p>
            <p>
              <span class="font-medium">Status:</span> {{ item.is_success ? "Success" : (item.reason === "" || item.reason === null ? "Pending" : "Failed") }}
            </p>
            <!-- fail reason -->
            <p v-if="item.reason && !item.is_success">
              <span class="font-medium">Alasan:</span> {{ item.reason }}
            </p>
          </div>
        </div>
        
        <!-- Multiple items view -->
        <div v-else-if="items.length">
          <h2 class="text-lg font-semibold mb-4">Daftar Transaksi Terbaru</h2>
          <div v-for="transaction in items" :key="transaction.id" class="mb-4 p-4 border rounded-lg">
            <div :class="transaction.is_success ? 'bg-green-50' : (transaction.reason === '' || transaction.reason === null ? 'bg-yellow-50' : 'bg-red-50')">
              <p><span class="font-medium">Invoice:</span> {{ transaction.invoice }}</p>
              <p><span class="font-medium">Produk:</span> {{ transaction.product_name }} x {{ transaction.qty }}</p>
              <p><span class="font-medium">Total:</span> Rp {{ new Intl.NumberFormat("id-ID").format(transaction.total_payment) }}</p>
              <p><span class="font-medium">Status:</span> {{ transaction.is_success ? "Success" : (transaction.reason === "" || transaction.reason === null ? "Pending" : "Failed") }}</p>
              <button 
                @click="invoice = transaction.invoice; refresh()"
                class="mt-2 text-blue-600 hover:underline"
              >
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
        
        <!-- No results -->
        <div v-else class="text-gray-500">
          Tidak ada transaksi yang ditemukan
        </div>
      </div>

      <!-- inset modal update from websocket -->
      <teleport to="body">
        <div v-if="showModal" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Update Invoice</h2>
            <p>Invoice {{ item?.invoice }} berhasil diperbarui</p>
            <button @click="showModal = false" class="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white">Tutup</button>
          </div>
        </div>
      </teleport>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useFetch } from "#app";
import { useLogTrafic } from "~/composable/useLogTrafic";

const route = useRoute();
const invoice = ref<string>((route.query.invoice as string) || "");

const showModal = ref(false)

const { data, pending, error, refresh } = await useFetch("/api/transactions", {
  query: computed(() => ({ invoice: invoice.value })),
  immediate: !!invoice.value,
});

// Handle both single item and multiple items cases
const item = computed(() => {
  if (!data.value) return null;
  return 'item' in data.value ? data.value.item : null;
});

const items = computed(() => {
  if (!data.value) return [];
  return 'items' in data.value ? data.value.items : [];
});

function onSearch() {
  refresh();
}

useLogTrafic()

// SSE: auto-refresh when transaction is updated from CMS
let es: EventSource | null = null

function openStream() {
  closeStream()
  const inv = invoice.value?.trim()
  if (!inv) return
  try {
    es = new EventSource(`/api/transactions/stream?invoice=${encodeURIComponent(inv)}`)
    es.onmessage = () => {
      // Refresh current invoice data on any update event
      refresh()
      showModal.value = true
    }
    es.onerror = () => {
      // Reconnect after a short delay
      closeStream()
      setTimeout(() => openStream(), 2000)
    }
  } catch {
    // ignore
  }
}

function closeStream() {
  try { es?.close() } catch {}
  es = null
}

onMounted(() => {
  if (invoice.value) openStream()
})

watch(invoice, () => {
  // Re-open stream for new invoice
  openStream()
})

onBeforeUnmount(() => {
  closeStream()
})
</script>
