<script setup>
definePageMeta({
  layout: 'admin'
})

const isDark = useState('admin-dark-mode', () => false)

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<template>
  <section
    class="min-h-screen px-10 py-10 transition-colors duration-500"
    :class="isDark ? 'bg-[#07080d]' : 'bg-transparent'"
  >
    <AdminHeader
      title="Orders"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <p
      class="max-w-2xl text-sm leading-7 transition-colors duration-300"
      :class="isDark ? 'text-gray-400' : 'text-gray-500'"
    >
      订单管理区域，用于查看和处理用户提交的订单信息。
    </p>
  </section>
</template>
