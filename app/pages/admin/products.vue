<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <section class="min-h-screen px-10 py-10">
    <AdminHeader
      title="Products"
      :is-dark="false"
    />

    <p class="max-w-2xl text-sm leading-7 text-gray-500">
      商品管理区域，用于维护前台 Merchandise 页面展示的商品数据。
    </p>
  </section>
</template>
