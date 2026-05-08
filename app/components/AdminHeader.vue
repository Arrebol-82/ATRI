<script setup lang="ts">
defineProps<{
  title: string
  isDark: boolean
}>()

defineEmits<{
  'toggle-theme': []
}>()
</script>

<template>
  <header class="mb-8 flex items-center justify-between stagger-card">
    <h1 class="text-3xl font-extrabold tracking-tight">{{ title }}</h1>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
        :class="isDark ? 'bg-[#171923] text-[#dbeafe]' : 'bg-white text-gray-600'"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="$emit('toggle-theme')"
      >
        <svg
          v-if="!isDark"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="h-5 w-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>

        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="h-5 w-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </button>

      <img
        src="https://api.dicebear.com/7.x/notionists/svg?seed=Alpenglow"
        alt="Avatar"
        class="h-10 w-10 rounded-full bg-white shadow-sm"
      >
    </div>
  </header>
</template>
