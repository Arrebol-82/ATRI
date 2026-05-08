<template>
  <main class="news-detail relative min-h-screen overflow-hidden bg-[#fffdfd] text-[#765a78]">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="news-dot-pattern absolute inset-0"></div>
      <div class="absolute -left-8 top-20 hidden select-none text-[clamp(96px,12vw,210px)] font-black leading-none text-pink-100/65 [writing-mode:vertical-rl] md:block">
        NEWS
      </div>
      <div class="absolute -right-10 top-28 hidden select-none text-[clamp(96px,12vw,210px)] font-black leading-none text-cyan-100/80 [writing-mode:vertical-rl] md:block">
        ATRI
      </div>
      <div class="absolute right-[10%] top-[18%] h-0 w-0 rotate-[-13deg] border-y-[32px] border-l-[144px] border-y-transparent border-l-emerald-200/65"></div>
      <div class="absolute left-[8%] top-[56%] h-0 w-0 rotate-[13deg] border-y-[22px] border-l-[124px] border-y-transparent border-l-sky-200/65"></div>
      <div class="absolute left-[21%] top-[16%] h-8 w-8 rotate-45 rounded-[5px] bg-cyan-400/80"></div>
      <div class="absolute left-[18%] top-[20%] h-5 w-5 rotate-45 rounded-[4px] bg-amber-300/80"></div>
      <div class="absolute right-[16%] top-[34%] h-4 w-24 rotate-[-8deg] rounded-full bg-yellow-300/80"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-[1240px] px-5 py-20 md:px-10 lg:py-28">
      <header class="mb-14 md:ml-[7%]">
        <div class="flex items-end gap-5">
          <h1 class="text-[clamp(58px,9vw,116px)] font-black leading-none tracking-[0.02em] text-pink-400">
            NEWS
          </h1>
          <p class="mb-3 text-sm font-black tracking-[0.28em] text-[#765a78] md:mb-5">
            ニュース
          </p>
        </div>
      </header>

      <article
        v-if="newsItem"
        class="relative mx-auto max-w-[1000px] rounded-[28px] border border-pink-100 bg-white/95 px-7 py-12 shadow-[0_24px_72px_rgba(236,72,153,0.10)] md:px-16 lg:px-24 lg:py-20"
      >
        <div class="absolute inset-x-4 -bottom-4 h-8 rounded-b-[28px] bg-gradient-to-r from-pink-100 via-yellow-100 to-cyan-100"></div>

        <div class="relative">
          <time class="block text-2xl font-black tracking-[0.08em] text-pink-400">
            {{ newsItem.date }}
          </time>

          <h2 class="mt-6 text-[clamp(24px,3vw,34px)] font-black leading-relaxed tracking-[0.06em] text-[#765a78]">
            {{ newsItem.title }}
          </h2>

          <div class="mt-8 border-t-2 border-dotted border-[#d8c2da]"></div>

          <div class="mt-14 space-y-6 text-[16px] font-bold leading-[2.15] tracking-[0.04em] md:text-[17px]">
            <p>{{ newsItem.lead }}</p>
            <p v-for="paragraph in newsItem.paragraphs" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>

          <figure class="mx-auto mt-12 max-w-[760px] overflow-hidden rounded-[10px] border border-pink-100 bg-pink-50">
            <img
              :src="newsItem.image"
              :alt="newsItem.title"
              class="block w-full object-cover"
            >
          </figure>

          <section
            v-for="section in newsItem.sections"
            :key="section.heading"
            class="mt-12"
          >
            <h3 class="flex items-center gap-3 text-xl font-black leading-relaxed tracking-[0.06em] text-[#765a78]">
              <span class="h-5 w-5 rotate-45 rounded-[4px] bg-pink-400"></span>
              {{ section.heading }}
            </h3>

            <div class="mt-6 space-y-3 text-[16px] font-bold leading-[2.05] tracking-[0.04em]">
              <p v-for="line in section.lines" :key="line">
                {{ line }}
              </p>
            </div>
          </section>

          <div class="mt-12 h-px bg-gradient-to-r from-cyan-300 via-pink-100 to-transparent"></div>

          <p class="mt-12 text-[16px] font-bold leading-[2.05] tracking-[0.04em]">
            Follow-up information will be posted on this news page as soon as it is ready.
          </p>

          <div class="mt-16 flex items-center justify-end gap-5 text-sm font-black tracking-[0.18em] text-[#765a78]">
            <span>SHARE</span>
            <button class="text-2xl leading-none transition hover:text-pink-400" type="button" aria-label="Share on X">
              X
            </button>
            <button class="rounded-full bg-[#765a78] px-3 py-1 text-xs text-white transition hover:bg-pink-400" type="button" aria-label="Share on Line">
              LINE
            </button>
          </div>
        </div>
      </article>

      <section
        v-else
        class="mx-auto max-w-[760px] rounded-[28px] border border-pink-100 bg-white/95 px-8 py-16 text-center shadow-[0_24px_72px_rgba(236,72,153,0.10)]"
      >
        <p class="text-2xl font-black text-pink-400">NEWS NOT FOUND</p>
      </section>

      <nav class="mx-auto mt-12 flex max-w-[1000px] items-center justify-between gap-4 text-sm font-black tracking-[0.12em] text-[#765a78]" aria-label="News article navigation">
        <NuxtLink
          to="/news"
          class="inline-flex items-center rounded-full border border-pink-100 bg-white/90 px-6 py-3 shadow-[0_12px_30px_rgba(236,72,153,0.08)] transition hover:-translate-x-1 hover:text-pink-400"
        >
          VIEW ALL
        </NuxtLink>

        <NuxtLink
          v-if="nextItem"
          :to="`/news/${nextItem.id}`"
          class="inline-flex items-center gap-3 rounded-full border border-pink-100 bg-white/90 px-6 py-3 text-pink-400 shadow-[0_12px_30px_rgba(236,72,153,0.08)] transition hover:translate-x-1"
        >
          NEXT
          <span class="h-2 w-2 rotate-45 border-r-2 border-t-2 border-pink-400"></span>
        </NuxtLink>
      </nav>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { newsList } from '~/constants/news'

const route = useRoute()

const currentIndex = computed(() => {
  const id = Number(route.params.id)

  return newsList.findIndex((item) => item.id === id)
})

const newsItem = computed(() => newsList[currentIndex.value])

const nextItem = computed(() => {
  if (currentIndex.value < 0) return null

  return newsList[(currentIndex.value + 1) % newsList.length]
})
</script>

<style scoped>
.news-dot-pattern {
  background-image:
    radial-gradient(circle at center, rgba(236, 72, 153, 0.12) 0 2px, transparent 2.6px),
    radial-gradient(circle at center, rgba(45, 212, 191, 0.10) 0 1.5px, transparent 2.4px),
    linear-gradient(90deg, rgba(236, 72, 153, 0.025), rgba(34, 211, 238, 0.035));
  background-position: 0 0, 23px 23px, 0 0;
  background-size: 46px 46px, 46px 46px, 100% 100%;
}
</style>
