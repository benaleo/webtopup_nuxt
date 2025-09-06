<template>
  <section class="min-h-[70vh] grid place-items-center px-4">
    <form @submit.prevent="onLogin" class="w-full max-w-sm bg-white border rounded-xl p-6 shadow">
      <h1 class="text-lg font-semibold mb-4">Login CMS</h1>
      <div class="space-y-3">
        <input v-model="username" type="text" placeholder="Username" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none" />
        <input v-model="password" type="password" placeholder="Password" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none" />
        <button :disabled="pending" class="w-full px-4 py-2 rounded-lg bg-blue-600 text-white">{{ pending ? 'Memproses...' : 'Masuk' }}</button>
        <p v-if="error" class="text-red-600 text-sm">{{ (error as any).data?.message || 'Gagal login' }}</p>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const username = ref('')
const password = ref('')

const pending = ref(false)
const error = ref<any>(null)

async function onLogin() {
  pending.value = true
  error.value = null
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await navigateTo('/cms/dashboard')
  } catch (e: any) {
    error.value = e
  } finally {
    pending.value = false
  }
}
</script>
