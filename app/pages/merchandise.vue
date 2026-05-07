<script setup>
import { gsap } from 'gsap'
import { nextTick, onBeforeUnmount, ref } from 'vue'
import HomeSidebar from '~/components/HomeSidebar.vue'
import { homeNavItems } from '~/constants/navigation'

const sideCaptionText = 'ATRIMyDearMoments'
const navBackdrop = ref(null)
const navPanel = ref(null)
const navCloseButton = ref(null)
const isSidebarOpen = ref(false)
const router = useRouter()

let navTimeline

const { data: products, pending, error } = await useFetch('/api/merchandise')


function goBack() {
  if (import.meta.client) {
    sessionStorage.setItem('atriSkipIntro', '1')
  }

  if (import.meta.client && window.history.state?.back) {
    router.back()
    return
  }

  navigateTo('/')
}

async function openSidebar() {
  isSidebarOpen.value = true

  await nextTick()

  navTimeline?.kill()
  navTimeline = gsap.timeline()

  navTimeline
    .fromTo(navBackdrop.value, {
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      duration: 0.32,
      ease: 'power2.out'
    })
    .fromTo(navPanel.value, {
      xPercent: 100
    }, {
      xPercent: 0,
      duration: 0.58,
      ease: 'expo.out'
    }, 0)
    .fromTo(navCloseButton.value, {
      rotate: -90,
      autoAlpha: 0,
      scale: 0.78
    }, {
      rotate: 0,
      autoAlpha: 1,
      scale: 1,
      duration: 0.34,
      ease: 'back.out(1.8)'
    }, 0.22)
}

function closeSidebar() {
  navTimeline?.kill()

  navTimeline = gsap.timeline({
    onComplete: () => {
      isSidebarOpen.value = false
    }
  })

  navTimeline
    .to(navCloseButton.value, {
      rotate: 90,
      autoAlpha: 0,
      scale: 0.8,
      duration: 0.18,
      ease: 'power2.in'
    })
    .to(navPanel.value, {
      xPercent: 100,
      duration: 0.38,
      ease: 'power3.in'
    }, 0)
    .to(navBackdrop.value, {
      autoAlpha: 0,
      duration: 0.28,
      ease: 'power2.in'
    }, 0.1)
}

onBeforeUnmount(() => {
  navTimeline?.kill()
})
</script>

<template>
  <main class="relative min-h-screen overflow-x-hidden bg-white px-6 py-8 text-[#102a3a] md:px-12 lg:px-[7.2vw]">
    <div class="side-caption side-caption-left" aria-hidden="true">
      <div class="side-caption-track side-caption-track-up">
        <span v-for="index in 12" :key="`left-${index}`">{{ sideCaptionText }}</span>
      </div>
    </div>

    <div class="side-caption side-caption-right" aria-hidden="true">
      <div class="side-caption-track side-caption-track-down">
        <span v-for="index in 12" :key="`right-${index}`">{{ sideCaptionText }}</span>
      </div>
    </div>

    <button
      type="button"
      class="back-button fixed left-4 top-8 z-40 md:left-6 lg:left-8 xl:left-10"
      aria-label="Go back"
      @click="goBack"
    >
      <span class="back-button-icon" aria-hidden="true" />
      <span class="back-button-copy">
        <span class="back-button-text">BACK</span>
        <span class="back-button-sub">PREV PAGE</span>
      </span>
    </button>

    <div class="fixed right-8 top-8 z-40 flex h-[50px] items-center">
      <button
        v-if="!isSidebarOpen"
        type="button"
        class="group flex h-[50px] w-[50px] cursor-pointer flex-col items-center justify-center space-y-[8px]"
        aria-expanded="false"
        aria-label="Open navigation"
        @click="openSidebar"
      >
        <span class="h-[1px] w-8 bg-[#102a3a] transition-colors group-hover:bg-[#4fb0cf]" />
        <span class="h-[1px] w-8 bg-[#102a3a] transition-colors group-hover:bg-[#4fb0cf]" />
        <span class="h-[1px] w-8 bg-[#102a3a] transition-colors group-hover:bg-[#4fb0cf]" />
      </button>
    </div>

    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-50 grid grid-cols-[1fr_320px]"
    >
      <button
        ref="navBackdrop"
        type="button"
        class="h-full w-full cursor-pointer bg-white/72 backdrop-blur-[3px]"
        aria-label="Close navigation"
        @click="closeSidebar"
      />

      <div
        ref="navPanel"
        class="relative z-10 h-screen w-full border-l border-[rgba(120,180,210,0.28)] bg-white/95 px-6 pt-[72px] shadow-[-18px_0_50px_rgba(80,130,160,0.08)]"
      >
        <button
          ref="navCloseButton"
          type="button"
          class="group absolute right-6 top-7 flex h-10 w-10 cursor-pointer items-center justify-center"
          aria-label="Close navigation"
          aria-expanded="true"
          @click="closeSidebar"
        >
          <span class="absolute h-[1px] w-8 rotate-45 bg-[#102a3a] transition-colors group-hover:bg-[#4fb0cf]" />
          <span class="absolute h-[1px] w-8 -rotate-45 bg-[#102a3a] transition-colors group-hover:bg-[#4fb0cf]" />
        </button>

        <HomeSidebar :items="homeNavItems" />
      </div>
    </div>

    <header class="relative z-10 mx-auto max-w-[1120px] pt-16 md:pt-14 lg:pt-12">
      <div class="flex items-end gap-4">
        <h1 class="text-[clamp(56px,8vw,104px)] font-black leading-none tracking-[0.02em] text-[#5fb8d7]">
          PRODUCTS
        </h1>
        <span class="mb-3 text-sm font-bold tracking-[0.12em] text-[#4fb0cf]">
          GOODS INFO
        </span>
      </div>
    </header>

    <section class="relative z-10 mx-auto mt-12 max-w-[1120px]">
      <div class="catalog-accent" aria-hidden="true">
        <span class="catalog-accent-line" />
        <span class="catalog-accent-mark">12 ITEMS</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">OFFICIAL GOODS</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">ATRI STORE</span>
        <span class="catalog-accent-line" />
      </div>

      <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-if="pending" class="col-span-full py-20 text-center font-bold text-[#4fb0cf]">
          正在连接数据库...
        </div>

        <div v-else-if="error" class="col-span-full py-20 text-center font-bold text-[#d45b6a]">
          商品数据加载失败
        </div>

        <article
          v-else
          v-for="product in products"
          :key="product.id"
          class="product-card flex min-h-[430px] flex-col rounded-[14px] border-2 border-b-[6px] border-l-[6px] border-[#d3eef4] bg-white p-6 shadow-[0_4px_14px_rgba(91,174,201,0.08)]"
        >
          <div class="flex aspect-square items-center justify-center overflow-hidden rounded-[9px] border-2 border-[#dff2f6] bg-[#f7fcfe] p-3">
            <img
              :src="product.imageUrl"
              :alt="product.name"
              class="h-full w-full object-contain"
              loading="lazy"
            >
          </div>

          <div class="mt-4 flex flex-1 flex-col px-3 py-4">
            <div class="flex items-center gap-2 text-sm font-black tracking-[0.04em] text-[#48adcd]">
              <span class="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#2f9ecd]" />
              <span>{{ product.category }}</span>
            </div>

            <h2 class="mt-3 min-h-[88px] text-[17px] font-black leading-[1.65] text-[#102a3a]">
              {{ product.name }}
            </h2>

            <p class="mt-auto pt-5 text-sm font-bold tracking-[0.02em] text-[#102a3a]">
              {{ product.priceDisplay }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.side-caption {
  display: none;
  pointer-events: none;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 0;
  width: clamp(96px, 9vw, 148px);
  overflow: hidden;
}

.side-caption-left {
  left: 0;
}

.side-caption-right {
  right: 0;
}

.side-caption-track {
  position: absolute;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 42px;
  color: rgba(95, 184, 215, 0.13);
  font-size: clamp(72px, 8vw, 118px);
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  transform: translateX(-50%);
  white-space: nowrap;
  will-change: transform;
}

.side-caption-track span {
  display: block;
  writing-mode: vertical-rl;
  text-orientation: sideways;
  white-space: nowrap;
}

.side-caption-left .side-caption-track {
  color: rgba(95, 184, 215, 0.12);
}

.side-caption-right .side-caption-track {
  color: rgba(79, 176, 207, 0.14);
}

.side-caption-track-up {
  animation: side-caption-up 92s linear infinite;
}

.side-caption-track-down {
  animation: side-caption-down 100s linear infinite;
}

@keyframes side-caption-up {
  from {
    transform: translate(-50%, 0);
  }

  to {
    transform: translate(-50%, -50%);
  }
}

@keyframes side-caption-down {
  from {
    transform: translate(-50%, -50%);
  }

  to {
    transform: translate(-50%, 0);
  }
}

.catalog-accent {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 2vw, 22px);
  overflow: hidden;
  border-block: 1px solid rgba(121, 203, 226, 0.28);
  padding: 18px 0;
}

.catalog-accent::before,
.catalog-accent::after {
  position: absolute;
  top: 50%;
  width: 58px;
  height: 58px;
  border: 12px solid rgba(95, 184, 215, 0.08);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

.catalog-accent::before {
  left: 6%;
}

.catalog-accent::after {
  right: 6%;
}

.catalog-accent-line {
  height: 1px;
  flex: 1 1 96px;
  max-width: 180px;
  background: linear-gradient(90deg, transparent, rgba(79, 176, 207, 0.52), transparent);
}

.catalog-accent-mark {
  position: relative;
  z-index: 1;
  color: #48adcd;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  white-space: nowrap;
}

.catalog-accent-diamond {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 2px;
  background: #9be0ef;
  transform: rotate(45deg);
}

.back-button {
  position: relative;
  display: inline-flex;
  min-width: 132px;
  height: 50px;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
  border: 1px solid rgba(121, 215, 240, 0.52);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(232, 249, 255, 0.74)),
    rgba(255, 255, 255, 0.78);
  color: #102a3a;
  cursor: pointer;
  padding: 0 18px 0 15px;
  box-shadow: 0 14px 34px rgba(79, 176, 207, 0.14);
  backdrop-filter: blur(10px);
  transition:
    background-color 0.32s ease,
    border-color 0.32s ease,
    box-shadow 0.32s ease,
    color 0.28s ease,
    transform 0.28s ease;
}

.back-button::before {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: inherit;
  content: "";
}

.back-button::after {
  position: absolute;
  right: -18px;
  bottom: -22px;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(121, 215, 240, 0.28);
  content: "";
  transition: transform 0.32s ease;
}

.back-button-icon {
  position: relative;
  z-index: 1;
  display: block;
  width: 36px;
  height: 20px;
  color: #2f9ecd;
  transition: transform 0.32s ease;
}

.back-button-icon::before,
.back-button-icon::after {
  position: absolute;
  content: "";
}

.back-button-icon::before {
  left: 1px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.back-button-icon::after {
  left: 3px;
  top: 9px;
  width: 33px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.back-button-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
}

.back-button-text {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.back-button-sub {
  color: rgba(16, 42, 58, 0.42);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  transition: color 0.28s ease;
}

.back-button:hover {
  border-color: #79d7f0;
  box-shadow: 0 16px 36px rgba(79, 176, 207, 0.22);
  transform: translateX(-3px);
}

.back-button:hover::after {
  transform: scale(1.18);
}

.back-button:hover .back-button-icon {
  transform: translateX(-4px);
}

.product-card {
  transform-origin: center;
  transition:
    background-color 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card:hover {
  border-color: #79d7f0;
  background-color: #e8f9ff;
  box-shadow: 0 16px 34px rgba(79, 176, 207, 0.2);
  transform: scale(1.025);
  transition-duration: 0.26s;
}

@media (max-width: 640px) {
  .catalog-accent {
    gap: 12px;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 14px 2px;
  }

  .catalog-accent::before,
  .catalog-accent::after,
  .catalog-accent-line {
    display: none;
  }
}

@media (min-width: 1024px) {
  .side-caption {
    display: block;
  }
}
</style>
