<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="flex">
      <!-- Sidebar -->
      <aside
        class="w-64 hidden md:flex flex-col border-r bg-white min-h-screen sticky top-0"
      >
        <div class="px-4 py-4 border-b">
          <NuxtLink
            to="/cms/dashboard"
            class="flex items-center gap-2 font-semibold"
          >
            <span
              class="inline-block w-2 h-2 rounded-full bg-emerald-500"
            ></span>
            WebTopup CMS
          </NuxtLink>
        </div>
        <nav class="flex-1 p-2">
          <ul class="space-y-1 text-sm">
            <li v-for="menu in filteredMenu" :key="menu.name" v-if="!loading">
              <NuxtLink
                :to="menu.link"
                class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                active-class="bg-gray-100 font-medium"
              >
                <span><i :class="`fa-solid fa-${menu.icon}`"></i></span>
                <span>{{ menu.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="p-3 border-t">
          <button
            @click="logout"
            class="w-full px-3 py-2 rounded bg-gray-900 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 min-w-0">
        <!-- Top bar for mobile -->
        <div
          class="md:hidden flex items-center justify-between p-3 border-b bg-white sticky top-0 z-10"
        >
          <div class="font-semibold">WebTopup CMS</div>
          <NuxtLink
            to="/cms/games"
            class="text-sm px-2 py-1 bg-gray-100 rounded"
            >Menu</NuxtLink
          >
        </div>
        <NavbarCms />
        <ClientOnly>
          <slot />
        </ClientOnly>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import NavbarCms from '~/components/NavbarCms.vue';
import { type User } from '~~/types/app.types';

interface MenuItem {
  name: string;
  icon: string;
  link: string;
  role: string[];
}

const user = ref<User | null>(null);
const loading = ref(true);
const role = ref<string | null>(null)

const ListMenu: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: 'house',
    link: '/cms/dashboard',
    role: ['SUPERADMIN', 'ADMIN', 'USER']
  },
  {
    name: 'Profile',
    icon: 'user',
    link: '/cms/profile',
    role: ['SUPERADMIN', 'ADMIN', 'USER']
  },
  {
    name: 'Users',
    icon: 'users',
    link: '/cms/users',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Transactions',
    icon: 'money-bill-transfer',
    link: '/cms/transactions',
    role: ['SUPERADMIN', 'ADMIN']
  },  
  {
    name: 'Vouchers',
    icon: 'ticket',
    link: '/cms/vouchers',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Gallery',
    icon: 'image',
    link: '/cms/gallery',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Games',
    icon: 'gamepad',
    link: '/cms/games',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Payment Methods',
    icon: 'credit-card',
    link: '/cms/payment-methods',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Invoices',
    icon: 'receipt',
    link: '/cms/invoices',
    role: ['SUPERADMIN', 'ADMIN']
  },
  {
    name: 'Log Traffic',
    icon: 'chart-line',
    link: '/cms/log-traffic',
    role: ['SUPERADMIN', 'ADMIN']
  }
]

// Fetch current user data
onMounted(async () => {
  try {
    const res = await $fetch<{ user: User | null }>('/api/auth/me');
    user.value = res?.user || null;
    role.value = res?.user?.role || null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  } finally {
    loading.value = false;
  }
});

// Filter menu items based on user role
const filteredMenu = computed<MenuItem[]>(() => {
  if (!user.value?.role) return [];
  return ListMenu.filter(menu => menu.role.includes(user.value?.role || ''));
});

// Logout function
async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await navigateTo("/cms/login");
}
</script>
