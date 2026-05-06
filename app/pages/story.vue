<script setup>
import { gsap } from 'gsap'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSidebar from '~/components/HomeSidebar.vue'
import { homeNavItems } from '~/constants/navigation'
const videoSrc = '/videos/story.mp4'
const charImageStory1 = '/images/story2.png'
const charImageStory2 = '/images/story1.png'

const storySection = ref(null)
const storyVideo = ref(null)
const navBackdrop = ref(null)
const navPanel = ref(null)
const navCloseButton = ref(null)
const isSidebarOpen = ref(false)

let videoObserver
let navTimeline

function playStoryVideo() {
  const video = storyVideo.value
  if (!video) return

  video.muted = true
  video.load()
  video.play().catch(() => {})
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

onMounted(() => {
  if (!storySection.value || !storyVideo.value) return

  videoObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        playStoryVideo()
      } else {
        storyVideo.value?.pause()
      }
    },
    {
      threshold: 0.35
    }
  )

  videoObserver.observe(storySection.value)
})

onBeforeUnmount(() => {
  videoObserver?.disconnect()
  navTimeline?.kill()
})
</script>

<template>
  <main ref="storySection" class="story-container relative h-screen w-full overflow-hidden antialiased">
    
    <video
      ref="storyVideo"
      loop
      muted
      playsinline
      preload="metadata"
      class="absolute inset-0 z-0 h-full w-full object-cover"
    >
      <source :src="videoSrc" type="video/mp4">
      您的浏览器不支持 HTML5 视频。
    </video>
    
    <div class="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px]"></div>

    <div class="absolute right-8 top-8 z-30 flex flex-col items-center">
      <button
        v-if="!isSidebarOpen"
        type="button"
        class="group flex cursor-pointer flex-col space-y-[8px] p-2"
        aria-expanded="false"
        aria-label="Open navigation"
        @click="openSidebar"
      >
        <span class="h-[1px] w-8 bg-gray-800 transition-colors group-hover:bg-black"></span>
        <span class="h-[1px] w-8 bg-gray-800 transition-colors group-hover:bg-black"></span>
        <span class="h-[1px] w-8 bg-gray-800 transition-colors group-hover:bg-black"></span>
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
      ></button>

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
          <span class="absolute h-[1px] w-8 rotate-45 bg-gray-800 transition-colors group-hover:bg-black"></span>
          <span class="absolute h-[1px] w-8 -rotate-45 bg-gray-800 transition-colors group-hover:bg-black"></span>
        </button>

        <HomeSidebar :items="homeNavItems" />
      </div>
    </div>

    <div class="vertical-text-left absolute left-6 top-1/2 z-20 -translate-y-1/2 font-sans text-[10px] uppercase tracking-widest text-gray-500">
      Welcome to SHIPPO CAFE
    </div>
    <div class="vertical-text-right absolute right-6 top-1/2 z-20 -translate-y-1/2 font-sans text-[10px] uppercase tracking-widest text-gray-500">
      My Favorite KEMOMIMI ADV.
    </div>

    <div class="pointer-events-none absolute right-[15%] top-[8%] z-20 lg:right-[25%]">
      <div class="relative">
        <img
          :src="charImageStory1"
          alt="Character Top Right"
          class="h-40 w-40 object-contain md:h-52 md:w-52"
        >
      </div>
    </div>

    <div class="pointer-events-none absolute bottom-0 left-[5%] z-20 lg:left-[10%]">
      <img
        :src="charImageStory2"
        alt="Character Bottom Left"
        class="w-[295px] object-contain"
      >
    </div>

    <section class="relative z-20 flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4">
      <h1 class="title-spacing mb-12 text-3xl text-[#3b3432] md:text-[2.5rem]">
        STORY
      </h1>

      <!-- 正文段落区域 -->
      <div class="max-w-2xl space-y-8 text-center text-[13px] font-[300] leading-[2.2] text-[#000] md:text-[15px]">
        <p>
          季节为秋。<br>
          在那树叶开始发黄的时节，少年来到了夕渚镇。
        </p>

        <p>
          少年最初遇到的，是一位独自发传单的可爱猫耳女仆。
        </p>

        <!-- 带有边角框的引用文本 -->
        <div class="corner-quote">
          “Setaria”咖、咖啡馆。请多指教
        </div>

        <p>
          走进女仆带我走进的咖啡馆后，那里有着同样带着兽耳的女孩<br>
          面对一脸不解的少年，女孩们疑惑地向他如此问道。
        </p>

        <div class="corner-quote">
          莫非，您看得见我们的<span class="mx-[2px] font-medium text-[#f190a1]">耳朵</span>吗……？
        </div>

        <p>
          她们说明到她们其实属于名为兽人的种族，耳朵和尾巴一般的人类是无法看到的。<br>
          然后得知了秘密的少年，与同伴们开始在咖啡店一起打工了。
        </p>

        <p>
          少年在对人类与兽人的区别感到吃惊的同时，今天也要和兽耳娘们一同努力工作。
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap');

.story-container {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  color: #5c5553;
  background-color: #fcfbfb;
}

.title-spacing {
  letter-spacing: 0.5em;
  text-indent: 0.5em;
}

.corner-quote {
  position: relative;
  display: inline-block;
  padding: 1.5rem 3.5rem;
  margin: 0.5rem 0;
}

.corner-quote::before,
.corner-quote::after {
  position: absolute;
  width: 20px;
  height: 20px;
  content: '';
  border-color: black;
  border-style: solid;
  opacity: 0.8;
}

.corner-quote::before {
  top: 0;
  left: 0;
  border-width: 1px 0 0 1px;
}

.corner-quote::after {
  right: 0;
  bottom: 0;
  border-width: 0 1px 1px 0;
}

.vertical-text-left {
  writing-mode: vertical-rl;
  letter-spacing: 0.3em;
  transform: rotate(180deg);
}

.vertical-text-right {
  writing-mode: vertical-rl;
  letter-spacing: 0.3em;
}
</style>
