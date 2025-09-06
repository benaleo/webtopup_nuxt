<template>
  <div @click="navigateTo(`/${slug}`)" class="group relative rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white">
    <img :src="image" :alt="name" class="w-full h-40 object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end">
      <div class="p-3 text-white">
        <p class="font-semibold">{{ name }}</p>
        <p class="text-xs text-gray-200">{{ publisher }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ image: string; name: string; publisher: string, slug: string }>()
</script>
