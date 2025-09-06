<template>
  <section class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <button @click="logout" class="px-3 py-2 rounded bg-gray-800 text-white text-sm">Logout</button>
    </div>
    <p>Welcome to CMS. (Route protected: hanya SUPERADMIN/ADMIN)</p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'cms' })
import { onMounted } from 'vue'

const user = ref<any>(null)

onMounted(async () => {
  const res = await $fetch('/api/auth/me')
  user.value = (res as any).user
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/cms/login')
}
</script>
