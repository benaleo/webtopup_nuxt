<template>
  <section class="container mx-auto px-4 py-6">
    <!-- Hero -->
    <HeroSlider :items="gallery" />

    <!-- Search + Tabs -->
    <div class="mt-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input v-model="q" type="text" placeholder="Cari game (nama/publisher)" class="w-full md:max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div class="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button :class="tab==='topup' ? activeTab : tabCls" @click="tab='topup'">Topup</button>
          <button :class="tab==='cek' ? activeTab : tabCls" @click="tab='cek'">Cek Transaksi</button>
        </div>
      </div>

      <div v-if="tab==='cek'" class="mt-4">
        <form @submit.prevent="goCheck" class="flex gap-2">
          <input v-model="invoice" type="text" placeholder="Masukkan kode invoice" class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button class="px-4 py-2 rounded-lg bg-blue-600 text-white">Cek</button>
        </form>
      </div>
    </div>

    <!-- Game Populer -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-3">Game Populer</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <GameCard v-for="g in popularGames" :key="g.id" :image="g.image" :name="g.name" :publisher="g.publisher" />
      </div>
    </div>

    <!-- All Games -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-3">Semua Game</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <GameCard v-for="g in filteredGames" :key="g.id" :image="g.image" :name="g.name" :publisher="g.publisher" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFetch, navigateTo } from '#app'
const tabCls = 'px-3 py-2 text-sm'
const activeTab = 'px-3 py-2 text-sm bg-blue-600 text-white'

const q = ref('')
const tab = ref<'topup'|'cek'>('topup')
const invoice = ref('')

const { data: galleryRes } = await useFetch('/api/gallery')
const gallery = computed(() => galleryRes.value?.items || [])

const { data: gamesRes, refresh } = await useFetch('/api/games', {
  query: computed(() => ({ q: q.value })),
})
const games = computed(() => gamesRes.value?.items || [])

watch(q, async () => {
  await refresh()
})

const filteredGames = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return games.value
  return games.value.filter((g: any) => g.name.toLowerCase().includes(term) || g.publisher.toLowerCase().includes(term))
})

const popularGames = computed(() => games.value.slice(0, 6))

function goCheck() {
  if (!invoice.value) return
  navigateTo({ path: '/invoices', query: { invoice: invoice.value } })
}
</script>
