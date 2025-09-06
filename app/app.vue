<template>
  <NuxtLayout>
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <NuxtRouteAnnouncer />
      <main class="flex-1">
        <NuxtPage />
      </main>
      <SiteFooter />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global layout components
</script>
