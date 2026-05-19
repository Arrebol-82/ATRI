<script setup>
const newsReturnMaskVisible = useState('news-return-mask-visible', () => false)
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <div
      v-if="newsReturnMaskVisible"
      class="news-return-mask"
      aria-hidden="true"
    />

    <NuxtLayout>
      <Transition name="page-fade" mode="out-in">
        <NuxtPage />
      </Transition>
    </NuxtLayout>
  </div>
</template>

<style>
.news-return-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  background: white;
  pointer-events: none;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
