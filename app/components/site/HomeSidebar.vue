<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <nav class="flex flex-col gap-2">
    <NuxtLink
      v-for="(item, index) in items"
      :key="item.label"
      :to="item.to"
      class="sidebar-link group relative flex items-center gap-3 rounded-[14px] px-2.5 py-[11px] text-[#102a3a] transition duration-300 hover:-translate-x-1.5 hover:bg-[#a5e1fa]/20"
    >
      <span class="text-xs text-[#102a3a]/40">{{ String(index + 1).padStart(2, '0') }}</span>
      <span>
        <strong class="block text-sm font-bold tracking-[0.08em]">{{ item.label }}</strong>
        <small class="mt-0.5 block text-[11px] text-[#102a3a]/55">{{ item.text }}</small>
      </span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.sidebar-link::before {
  position: absolute;
  left: 0;
  top: 50%;
  height: 0;
  width: 3px;
  content: "";
  border-radius: 999px;
  background: #73c8ef;
  transform: translateY(-50%);
  transition: 0.28s ease;
}

.sidebar-link:hover::before {
  height: 60%;
}
</style>
