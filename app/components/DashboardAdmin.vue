<template>
  <!-- Top Games -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-white border rounded p-4">
      <h2 class="font-semibold mb-2">Top Games · Hari Ini</h2>
      <ul class="space-y-2">
        <li
          v-for="(g, i) in topGames.today"
          :key="g.game_id"
          class="flex items-center justify-between text-sm"
        >
          <span class="truncate">{{ i + 1 }}. {{ g.game_name }}</span>
          <span class="font-medium"
            >{{ currency(g.total_payment) }} ({{ g.count }})</span
          >
        </li>
        <li
          v-if="!loadingTop && topGames.today.length === 0"
          class="text-gray-500 text-sm"
        >
          Tidak ada data
        </li>
        <li v-if="loadingTop" class="text-gray-500 text-sm">Memuat...</li>
      </ul>
    </div>
    <div class="bg-white border rounded p-4">
      <h2 class="font-semibold mb-2">Top Games · Bulan Ini</h2>
      <ul class="space-y-2">
        <li
          v-for="(g, i) in topGames.month"
          :key="g.game_id"
          class="flex items-center justify-between text-sm"
        >
          <span class="truncate">{{ i + 1 }}. {{ g.game_name }}</span>
          <span class="font-medium"
            >{{ currency(g.total_payment) }} ({{ g.count }})</span
          >
        </li>
        <li
          v-if="!loadingTop && topGames.month.length === 0"
          class="text-gray-500 text-sm"
        >
          Tidak ada data
        </li>
        <li v-if="loadingTop" class="text-gray-500 text-sm">Memuat...</li>
      </ul>
    </div>
    <div class="bg-white border rounded p-4">
      <h2 class="font-semibold mb-2">Top Games · Tahun Ini</h2>
      <ul class="space-y-2">
        <li
          v-for="(g, i) in topGames.year"
          :key="g.game_id"
          class="flex items-center justify-between text-sm"
        >
          <span class="truncate">{{ i + 1 }}. {{ g.game_name }}</span>
          <span class="font-medium"
            >{{ currency(g.total_payment) }} ({{ g.count }})</span
          >
        </li>
        <li
          v-if="!loadingTop && topGames.year.length === 0"
          class="text-gray-500 text-sm"
        >
          Tidak ada data
        </li>
        <li v-if="loadingTop" class="text-gray-500 text-sm">Memuat...</li>
      </ul>
    </div>
  </div>

  <!-- Popular Links from Log Traffic -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-white border rounded p-4">
      <h2 class="font-semibold mb-2">Popular Links · Harian</h2>
      <ul class="space-y-2">
        <li
          v-for="(l, i) in popular.daily"
          :key="l.url + i"
          class="flex items-center justify-between text-sm"
        >
          <a
            class="truncate text-blue-700 hover:underline"
            :href="l.url"
            target="_blank"
            rel="noopener"
            >{{ i + 1 }}. {{ l.url.replace(baseUrl, "") }}</a
          >
          <span class="font-medium">{{ l.count }}</span>
        </li>
        <li
          v-if="!loadingLinks && popular.daily.length === 0"
          class="text-gray-500 text-sm"
        >
          Tidak ada data
        </li>
        <li v-if="loadingLinks" class="text-gray-500 text-sm">Memuat...</li>
      </ul>
    </div>
    <div class="bg-white border rounded p-4">
      <h2 class="font-semibold mb-2">Popular Links · Bulanan</h2>
      <ul class="space-y-2">
        <li
          v-for="(l, i) in popular.monthly"
          :key="l.url + i"
          class="flex items-center justify-between text-sm"
        >
          <a
            class="truncate text-blue-700 hover:underline"
            :href="l.url"
            target="_blank"
            rel="noopener"
            >{{ i + 1 }}. {{ l.url.replace(baseUrl, "") }}</a
          >
          <span class="font-medium">{{ l.count }}</span>
        </li>
        <li
          v-if="!loadingLinks && popular.monthly.length === 0"
          class="text-gray-500 text-sm"
        >
          Tidak ada data
        </li>
        <li v-if="loadingLinks" class="text-gray-500 text-sm">Memuat...</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "cms" });
import { onMounted } from "vue";

const config = useRuntimeConfig();
const baseUrl = config.public.BASE_URL;

const loadingTop = ref(true);
const loadingLinks = ref(true);
const topGames = reactive<{ today: any[]; month: any[]; year: any[] }>({
  today: [],
  month: [],
  year: [],
});
const popular = reactive<{ daily: any[]; monthly: any[] }>({
  daily: [],
  monthly: [],
});

onMounted(async () => {
  try {
    const [top, links] = await Promise.all([
      $fetch("/api/cms/dashboard/top-games"),
      $fetch("/api/cms/dashboard/popular-links"),
    ]);
    Object.assign(topGames, top as any);
    Object.assign(popular, links as any);
  } finally {
    loadingTop.value = false;
    loadingLinks.value = false;
  }
});

async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await navigateTo("/cms/login");
}

function currency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
</script>
