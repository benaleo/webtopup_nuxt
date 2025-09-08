<template>
  <section class="container mx-auto px-4 py-6">
    <!-- Hero -->
    <HeroSlider :items="gallery" />

    <div class="grid lg:grid-cols-2 lg:gap-4">
      <!-- Game Populer -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold mb-3">Game Populer</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <GameCard
            v-for="g in popularGames"
            :key="g.id"
            :image="`${baseUrl}${g.image}`"
            :name="g.name"
            :slug="g.slug"
            :publisher="g.publisher"
          />
        </div>
      </div>

       <!-- Joki Populer -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold mb-3">Joki Populer</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <GameCard
            v-for="g in jokiGames"
            :key="g.id"
            :image="`${baseUrl}${g.avatar}`"
            :name="g.name"
            :slug="g.username"
            :publisher="''"
          />
        </div>
      </div>

      
    </div>

    <!-- All Games -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-3">Semua Game</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <GameCard
          v-for="g in filteredGames"
          :key="g.id"
          :image="`${baseUrl}${g.image}`"
          :name="g.name"
          :slug="g.slug"
          :publisher="g.publisher"
        />
      </div>
    </div>

    <!-- All Joki -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-3">Semua Joki</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <GameCard
          v-for="g in filteredJoki"
          :key="g.id"
          :image="`${baseUrl}${g.avatar}`"
          :name="g.name"
          :slug="g.username"
          :publisher="''"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useFetch, navigateTo } from "#app";
import { useRuntimeConfig } from "#imports";
import { useLogTrafic } from "~/composable/useLogTrafic";

const tabCls = "px-3 py-2 text-sm";
const activeTab = "px-3 py-2 text-sm bg-blue-600 text-white";

const q = ref("");
const tab = ref<"topup" | "cek">("topup");
const invoice = ref("");

const config = useRuntimeConfig();
const baseUrl = config.public.BASE_URL;

const { data: galleryRes } = await useFetch("/api/gallery");
const gallery = computed(() => galleryRes.value?.items || []);

const { data: gamesRes, refresh } = await useFetch("/api/games", {
  query: computed(() => ({ q: q.value })),
});
const games = computed(() => gamesRes.value?.items || []);

// Joki data
const { data: jokiPopularRes } = await useFetch("/api/joki/popular");
const jokiGames = computed(() => jokiPopularRes.value?.items || []);

const { data: jokiRes } = await useFetch("/api/joki");
const jokis = computed(() => jokiRes.value?.items || []);

watch(q, async () => {
  await refresh();
});

const filteredGames = computed(() => {
  const term = q.value.trim().toLowerCase();
  if (!term) return games.value;
  return games.value.filter(
    (g: any) =>
      g.name.toLowerCase().includes(term) ||
      g.publisher.toLowerCase().includes(term)
  );
});

const filteredJoki = computed(() => {
  const term = q.value.trim().toLowerCase();
  if (!term) return jokis.value;
  return jokis.value.filter(
    (u: any) =>
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term)
  );
});

const popularGames = computed(() =>
  games.value.filter((g: any) => g.metadata?.is_popular)
);

function goCheck() {
  if (!invoice.value) return;
  navigateTo({ path: "/invoices", query: { invoice: invoice.value } });
}

definePageMeta({ layout: "default" });

useLogTrafic();
</script>
