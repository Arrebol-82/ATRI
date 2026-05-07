<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside class="w-64 bg-slate-800 text-white p-6">
      <h2 class="text-xl font-bold mb-4">ATRI Admin</h2>
      <ul>
        <li class="mb-2"><NuxtLink to="/admin">概览</NuxtLink></li>
        <li><NuxtLink to="/admin/users">用户管理</NuxtLink></li>
      </ul>
    </aside>

    <main class="flex-1 p-8">
      <slot /> </main>
  </div>
</template> 