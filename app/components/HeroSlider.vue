<template>
  <ClientOnly>
    <div class="w-full">
      <Swiper :modules="[]" :slides-per-view="1" class="rounded-xl overflow-hidden">
        <SwiperSlide v-for="item in items" :key="item.id">
          <img :src="item.file_url" :alt="item.name" class="w-full h-56 md:h-80 object-cover" />
        </SwiperSlide>
      </Swiper>
    </div>
    <template #fallback>
      <div class="w-full h-56 md:h-80 bg-gray-200 animate-pulse rounded-xl" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

defineProps<{ items: { id: string; name: string; file_url: string }[] }>()
</script>
