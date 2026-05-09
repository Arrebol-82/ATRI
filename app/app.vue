<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '~/components/Footer.vue'

const route = useRoute()

const showFooter = computed(() => {
  return !route.path.startsWith('/admin')
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />

    <main class="flex-1">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <Footer v-if="showFooter" />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>