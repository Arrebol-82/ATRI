<script setup>
definePageMeta({
  layout: 'admin'
})

const isDark = useState('admin-dark-mode', () => false)
</script>

<template>
  <section
    class="min-h-screen px-10 py-10 transition-colors duration-500"
    :class="isDark ? 'bg-[#07080d]' : 'bg-transparent'"
  >
    <AdminHeader
      title="Products"
      :is-dark="isDark"
    />

    <p
      class="max-w-2xl text-sm leading-7 transition-colors duration-300"
      :class="isDark ? 'text-gray-400' : 'text-gray-500'"
    >
      商品管理区域，用于维护前台 Merchandise 页面展示的商品数据。
    </p>
  </section>
</template>
