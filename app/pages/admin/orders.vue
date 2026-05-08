<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <section class="min-h-screen px-10 py-10">
    <AdminHeader
      title="Orders"
      :is-dark="false"
    />

    <p class="max-w-2xl text-sm leading-7 text-gray-500">
      订单管理区域，用于查看和处理用户提交的订单信息。
    </p>
  </section>
</template>
