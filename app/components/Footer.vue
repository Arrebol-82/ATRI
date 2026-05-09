<template>
  <footer class="relative mt-24 overflow-hidden text-[#17263a]">
    <!-- 蓝色背景 -->
    <div class="footer-blue-bg absolute inset-0"></div>

    <!-- 顶部弧线 -->
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-24 w-[140%] -translate-x-1/2 rounded-[0_0_50%_50%] border-t border-white/80"
    ></div>

    <div class="relative z-10 mx-auto max-w-[1100px] px-6 pb-20 pt-24">
      <!-- 导航 -->
      <nav class="mx-auto max-w-[850px]">
        <ul
          class="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 text-sm font-black tracking-[0.08em] md:text-base"
        >
          <li v-for="item in navList" :key="item.name">
            <a :href="item.link" class="transition hover:text-sky-600">
              <span v-if="item.name === 'HOME'" class="mr-1">♥</span>
              {{ item.name }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- 虚线 -->
      <div class="mx-auto my-12 max-w-[860px] border-t border-dotted border-[#7faeca]"></div>

      <!-- 底部信息 -->
      <div class="grid grid-cols-1 items-center gap-10 md:grid-cols-3">
        <!-- 左侧 -->
        <div class="flex flex-col items-center gap-5 md:items-start">
          <div class="flex items-center gap-5">
            <span class="text-sm font-black tracking-[0.08em]">
              OFFICIAL
            </span>

            <a
              v-for="item in officialLinks"
              :key="item.name"
              :href="item.link"
              class="text-xl font-black transition hover:text-sky-600"
            >
              {{ item.icon }}
            </a>
          </div>

          <a
            href="#contact"
            class="group flex items-center gap-2 rounded-full bg-[#10265d] px-8 py-3 text-xs font-black tracking-[0.12em] text-white shadow-md transition hover:-translate-y-1 hover:bg-sky-500"
          >
            <span>企業様のお問い合わせ</span>
            <span class="transition group-hover:translate-x-1">→</span>
          </a>
        </div>

        <!-- 中间 logo -->
        <div class="flex justify-center">
          <a href="/" class="group text-center">
            <div
              class="text-5xl font-black leading-none tracking-[-0.04em] text-[#1f4f9c] drop-shadow-sm transition group-hover:scale-105"
            >
              ATRI
            </div>

            <div
              class="mt-2 rounded-full border-2 border-[#1f4f9c] px-4 py-1 text-xs font-black tracking-[0.18em] text-[#1f4f9c]"
            >
              MY DEAR MOMENTS
            </div>
          </a>
        </div>

        <!-- 右侧 -->
        <div class="flex flex-col items-center gap-8 md:items-end">
          <div class="flex items-center gap-5">
            <span class="text-sm font-black tracking-[0.08em]">
              SHARE
            </span>

            <a
              v-for="item in shareLinks"
              :key="item.name"
              :href="item.link"
              class="flex h-8 w-8 items-center justify-center rounded-full text-xl font-black transition hover:bg-white/80 hover:text-sky-600"
            >
              {{ item.icon }}
            </a>
          </div>

          <p class="text-center text-[11px] font-bold tracking-[0.08em] text-[#29465c] md:text-right">
            ©ATRI PROJECT / SAMPLE WEBSITE
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const navList = [
  { name: 'HOME', link: '/' },
  { name: 'MOVIE', link: '#movie' },
  { name: 'NEWS', link: '/news' },
  { name: 'STAFF&CAST', link: '#staff' },
  { name: 'INTRODUCTION', link: '#introduction' },
  { name: 'CHARACTER', link: '/characters' },
  { name: 'BOOKS', link: '#books' },
  { name: 'STORY', link: '/story' },
  { name: 'ON AIR', link: '#onair' },
  { name: 'MUSIC', link: '#music' },
  { name: 'PRODUCTS', link: '/merchandise' },
  { name: 'SPECIAL', link: '#special' },
]

const officialLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'TikTok', icon: '♪', link: '#' },
]

const shareLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'LINE', icon: '●', link: '#' },
]
</script>

<style scoped>
.footer-blue-bg {
  background: linear-gradient(
    180deg,
    #eefaff 0%,
    #d9f2ff 35%,
    #b9e7ff 100%
  );
  border-top-left-radius: 50% 90px;
  border-top-right-radius: 50% 90px;
}
</style>