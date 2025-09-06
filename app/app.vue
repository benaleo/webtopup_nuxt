<template>
<Toaster richColors />
  <NuxtLayout>
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <NuxtRouteAnnouncer />
      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
// Global layout components
</script>
