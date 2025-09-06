<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
import SiteFooter from "~/components/SiteFooter.vue";
</script>

<template>
    <Navbar />
    <slot />
    <SiteFooter />
</template>
