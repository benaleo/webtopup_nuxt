<template>
  <ClientOnly>
    <div class="w-full">
      <Swiper
        :modules="[Navigation, Autoplay]"
        :slides-per-view="1"
        :autoplay="{ delay: 2000 }"
        class="rounded-xl overflow-hidden"
      >
        <SwiperSlide v-for="item in items" :key="item.id">
          <img :src="item.file_url" :alt="item.name" class="w-full h-[60vh] object-cover" />
        </SwiperSlide>
      </Swiper>
    </div>
    <template #fallback>
      <div class="w-full h-[60vh] bg-gray-200 animate-pulse rounded-xl" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/autoplay'

defineProps<{ items: { id: string; name: string; file_url: string }[] }>()
</script>
