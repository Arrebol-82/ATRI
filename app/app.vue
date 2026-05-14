<template>
  <div>
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(3px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(2px);
}

.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}
</style>
