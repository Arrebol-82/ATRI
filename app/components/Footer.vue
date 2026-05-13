<template>
  <footer class="relative mt-32 min-h-[680px] overflow-hidden text-[#10213a]">
    <!-- 蓝色背景 -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#eef9ff] via-[#d7efff] to-[#a8d9ff]"></div>

    <!-- 白色大椭圆：制造“凹下去”的弧形 -->
    <div class="absolute left-1/2 top-[-250px] h-[430px] w-[150%] -translate-x-1/2 rounded-[50%] bg-white"></div>

    <!-- 凹弧形细线装饰 -->
    <div class="pointer-events-none absolute left-1/2 top-[-232px] h-[430px] w-[154%] -translate-x-1/2 rounded-[50%] border-b border-sky-100/80"></div>
    <div class="pointer-events-none absolute left-1/2 top-[-214px] h-[430px] w-[158%] -translate-x-1/2 rounded-[50%] border-b border-white/90"></div>

    <!-- 内容 -->
    <div class="relative z-10 mx-auto max-w-[980px] px-6 pb-24 pt-60">
      <!-- 导航 -->
      <nav>
        <ul class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[13px] font-black tracking-[0.12em] md:text-[15px]">
          <li v-for="item in navList" :key="item.name">
            <NuxtLink
              :to="item.link"
              class="transition hover:text-sky-600"
            >
              <span v-if="item.name === 'HOME'" class="mr-1 text-[11px]">♥</span>
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 虚线分割线 -->
      <div class="mx-auto my-12 max-w-[820px] border-t border-dotted border-[#82aac4]"></div>

      <!-- 底部信息区 -->
      <div class="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_1.1fr_1fr]">
        <!-- 左侧 OFFICIAL -->
        <div class="flex flex-col items-center gap-6 md:items-start">
          <div class="flex items-center gap-5">
            <span class="text-[12px] font-black tracking-[0.15em]">
              OFFICIAL
            </span>

            <a
              v-for="item in officialLinks"
              :key="item.name"
              :href="item.link"
              class="text-xl font-black leading-none transition hover:scale-110 hover:text-sky-600"
            >
              {{ item.icon }}
            </a>
          </div>

          <a
            href="#contact"
            class="group flex items-center gap-3 rounded-full bg-[#182864] px-8 py-3 text-[12px] font-black tracking-[0.16em] text-white shadow-[0_10px_22px_rgba(24,40,100,0.22)] transition hover:-translate-y-1 hover:bg-sky-500"
          >
            <span>Business Inquiries</span>
            <span class="transition group-hover:translate-x-1">→</span>
          </a>
        </div>

        <!-- 中间 LOGO -->
        <div class="flex justify-center">
          <NuxtLink to="/" class="group block text-center">
            <div class="footer-logo-text drop-shadow-[0_4px_4px_rgba(30,70,140,0.25)] transition group-hover:scale-105">
              ATRI
            </div>

            <div class="mt-3 text-[13px] font-black tracking-[0.35em] text-[#264d9d]">
              MY DEAR MOMENTS
            </div>
          </NuxtLink>
        </div>

        <!-- 右侧 SHARE -->
        <div class="flex flex-col items-center gap-10 md:items-end">
          <div class="flex items-center gap-6">
            <span class="text-[12px] font-black tracking-[0.18em]">
              SHARE
            </span>

            <a
              v-for="item in shareLinks"
              :key="item.name"
              :href="item.link"
              class="flex h-8 w-8 items-center justify-center rounded-full text-xl font-black transition hover:-translate-y-1 hover:bg-white/70 hover:text-sky-600"
            >
              {{ item.icon }}
            </a>
          </div>

          <p class="text-center text-[10px] font-black tracking-[0.15em] text-[#29445c] md:text-right">
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
.footer-logo-text {
  font-size: 64px;
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #264d9d;
}

@media (max-width: 768px) {
  .footer-logo-text {
    font-size: 48px;
  }
}
</style>