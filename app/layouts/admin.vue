<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 真实的路由路径，注意加上 path 字段
const navItems = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard', // 对应 pages/admin/dashboard.vue
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6 M14 5l5-2m0 0l-2 5m2-5l-6 6" />`
  },
  {
    name: 'Store',
    path: '/admin/products', // 对应 pages/admin/products.vue
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H6.75A.75.75 0 006 15v3.75c0 .414.336.75.75.75z" />`
  },
  {
    name: 'Tasks',
    path: '/admin/orders', // 对应 pages/admin/orders.vue
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />`
  }
]
</script>

<template>
  <div class="flex h-screen w-full bg-[#f8f9fa] overflow-hidden">
    
    <aside class="flex h-screen w-[84px] shrink-0 flex-col items-center border-r border-gray-100 bg-white py-10 z-10">
      <nav class="mt-5 flex flex-col gap-6">
        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="group flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition-all duration-300 ease-out"
          :class="[
            route.path === item.path 
              ? 'bg-[#f3f0fd] text-[#5b4097]' 
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          ]"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.8" 
            stroke="currentColor" 
            class="h-6 w-6"
            :class="{ 'stroke-2': route.path === item.path }"
            v-html="item.icon"
          ></svg>
        </NuxtLink>
      </nav>

      <div class="mt-auto flex flex-col items-center pb-4">
        <button class="group flex h-[52px] w-[52px] items-center justify-center rounded-[18px] text-gray-400 transition-all duration-300 ease-out hover:bg-red-50 hover:text-red-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.8" 
            stroke="currentColor" 
            class="h-6 w-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
    
  </div>
</template>

<style scoped>
a, button {
  -webkit-tap-highlight-color: transparent;
}
</style>
