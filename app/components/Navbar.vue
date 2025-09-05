<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
    <div class="container mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-bold text-lg">WebTopup</NuxtLink>
      <nav class="hidden md:flex gap-6 text-sm">
        <NuxtLink to="/" class="hover:text-blue-600">Beranda</NuxtLink>
        <NuxtLink to="/invoices" class="hover:text-blue-600">Cek Transaksi</NuxtLink>
        <NuxtLink to="/cms/login" class="hover:text-blue-600">CMS</NuxtLink>
      </nav>
    </div>
  </header>
</template>
