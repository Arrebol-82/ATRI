<script setup>
import { gsap } from 'gsap'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import CharactersSection from '~/components/site/CharactersSection.vue'
import HomeSidebar from '~/components/site/HomeSidebar.vue'
import { homeNavItems } from '~/constants/navigation'
import NewsSection from './news.vue'
import ScenesSection from './scenes.vue'
import StorySection from './story.vue'

const heroItems = [
  { image: '/images/sy1.jpg', thumb: '/images/tx1.jpg', showTitle: true },
  { image: '/images/sy2.jpg', thumb: '/images/tx2.jpg', showTitle: false },
  { image: '/images/sy3.jpg', thumb: '/images/tx3.jpg', showTitle: false },
  { image: '/images/sy4.jpg', thumb: '/images/tx4.jpg', showTitle: false },
  { image: '/images/sy5.jpg', thumb: '/images/tx5.jpg', showTitle: false }
]

const HOME_INTRO_PLAYED_KEY = 'atriHomeIntroPlayed'
const SKIP_HOME_INTRO_KEY = 'atriSkipHomeIntroOnce'

const introVisible = ref(false)
const showVideo = ref(false)
const introFinished = ref(false)
const introScreen = ref(null)
const introVideoLayer = ref(null)
const introCard = ref(null)
const introTitle = ref(null)
const introClickCursor = ref(null)
const openingVideo = ref(null)
const heroVisual = ref(null)
const heroTitleImage = ref(null)
const nextSlideImage = ref(null)
const thumbButtons = ref([])
const activeIndex = ref(0)
const currentImage = ref(heroItems[0].image)
const nextImage = ref('')
const isSwitching = ref(false)

let introTimeline
let videoCall
let playCall
let finishTween
let slideTween
let introPointer = { x: 0, y: 0 }

function getSessionItem(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function setSessionItem(key, value) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Storage can fail in private contexts. The page still works without it.
  }
}

function removeSessionItem(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Storage can fail in private contexts. The page still works without it.
  }
}

function getNavigationType() {
  const navigationEntry = performance.getEntriesByType('navigation')?.[0]
  return navigationEntry?.type || 'navigate'
}

function shouldPlayHomeIntro() {
  if (getNavigationType() === 'reload') {
    removeSessionItem(SKIP_HOME_INTRO_KEY)
    removeSessionItem('atriSkipIntro')
    return true
  }

  if (getSessionItem(SKIP_HOME_INTRO_KEY) === '1' || getSessionItem('atriSkipIntro') === '1') {
    removeSessionItem(SKIP_HOME_INTRO_KEY)
    removeSessionItem('atriSkipIntro')
    return false
  }

  return getSessionItem(HOME_INTRO_PLAYED_KEY) !== '1'
}

function setThumbButtonRef(element, index) {
  if (element) thumbButtons.value[index] = element
}

function animateThumb(index, isLifted = index === activeIndex.value) {
  const button = thumbButtons.value[index]
  if (!button) return

  gsap.to(button, {
    x: isLifted ? 8 : 0,
    boxShadow: isLifted
      ? index === activeIndex.value
        ? '0 10px 28px rgba(60,150,210,0.35)'
        : '0 10px 24px rgba(60,150,210,0.28)'
      : '0 0 0 rgba(60,150,210,0)',
    duration: 0.28,
    ease: 'power2.out',
    overwrite: true
  })
}

function syncThumbButtons() {
  thumbButtons.value.forEach((_, index) => {
    animateThumb(index, index === activeIndex.value)
  })
}

function enterHome() {
  if (introFinished.value) return

  setSessionItem(HOME_INTRO_PLAYED_KEY, '1')
  introFinished.value = true
  openingVideo.value?.pause()
  introTimeline?.kill()
  videoCall?.kill()
  playCall?.kill()

  finishTween = gsap.to(introScreen.value, {
    autoAlpha: 0,
    duration: 0.5,
    ease: 'power1.out',
    onComplete: () => {
      introVisible.value = false
    }
  })
}

function handleIntroClick() {
  if (showVideo.value) enterHome()
}

function handleIntroMousemove(event) {
  introPointer = { x: event.clientX, y: event.clientY }
  if (!showVideo.value || !introClickCursor.value) return

  gsap.to(introClickCursor.value, {
    x: introPointer.x,
    y: introPointer.y,
    duration: 0.16,
    ease: 'power2.out',
    overwrite: true
  })
}

function handleMousemove(event) {
  if (!heroVisual.value) return

  const rect = event.currentTarget.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  gsap.to(heroVisual.value, {
    '--move-x': `${((mouseX - centerX) / centerX) * 24}px`,
    '--move-y': `${((mouseY - centerY) / centerY) * 14}px`,
    duration: 0.18,
    ease: 'power2.out',
    overwrite: true
  })
}

function resetParallax() {
  if (!heroVisual.value) return

  gsap.to(heroVisual.value, {
    '--move-x': '0px',
    '--move-y': '0px',
    duration: 0.24,
    ease: 'power2.out',
    overwrite: true
  })
}

async function selectHero(index) {
  const item = heroItems[index]

  if (!item || isSwitching.value || item.image === currentImage.value) return

  isSwitching.value = true
  activeIndex.value = index
  syncThumbButtons()
  nextImage.value = item.image

  gsap.to(heroTitleImage.value, {
    autoAlpha: item.showTitle ? 1 : 0,
    duration: 0.35,
    ease: 'power1.out'
  })

  await nextTick()

  slideTween?.kill()
  gsap.set(nextSlideImage.value, {
    clipPath: 'inset(0 100% 0 0)',
    scale: 1.08,
    filter: 'brightness(1.08)'
  })

  slideTween = gsap.timeline({
    defaults: {
      ease: 'expo.out'
    },
    onComplete: () => {
      currentImage.value = item.image
      nextImage.value = ''
      isSwitching.value = false
    }
  })

  slideTween
    .to(nextSlideImage.value, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.05
    })
    .to(nextSlideImage.value, {
      scale: 1.04,
      filter: 'brightness(1)',
      duration: 1.2
    }, 0)
}

onMounted(async () => {
  introPointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }

  gsap.set(heroVisual.value, { '--move-x': '0px', '--move-y': '0px' })

  if (shouldPlayHomeIntro()) {
    setSessionItem(HOME_INTRO_PLAYED_KEY, '1')
    introVisible.value = true

    await nextTick()

    gsap.set(introClickCursor.value, introPointer)
    gsap.set(introVideoLayer.value, { opacity: 0 })
    gsap.set(introCard.value, { yPercent: 100 })
    gsap.set(introTitle.value, {
      xPercent: -50,
      yPercent: -45,
      opacity: 0,
      backgroundPosition: '100% 0'
    })

    introTimeline = gsap.timeline()

    introTimeline
      .to(introCard.value, {
        yPercent: 0,
        duration: 1.2,
        ease: 'power4.out'
      })
      .to(introTitle.value, {
        opacity: 1,
        yPercent: -50,
        duration: 0.7,
        ease: 'power1.out'
      }, 0.9)
      .to(introTitle.value, {
        backgroundPosition: '0% 0',
        duration: 1.1,
        ease: 'power1.inOut'
      }, 1.25)
      .to(introTitle.value, {
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out'
      }, 2.8)
      .to(introCard.value, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power2.inOut'
      }, 3)

    videoCall = gsap.delayedCall(3, () => {
      showVideo.value = true
      gsap.set(introClickCursor.value, introPointer)
      gsap.fromTo(introClickCursor.value, {
        autoAlpha: 0,
        scale: 0.8
      }, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.28,
        ease: 'power2.out'
      })
      gsap.to(introVideoLayer.value, {
        opacity: 1,
        duration: 0.2,
        ease: 'power1.out'
      })
    })

    playCall = gsap.delayedCall(3.9, () => {
      openingVideo.value?.play().catch(() => {})
    })
  }

  heroItems.forEach((item) => {
    const image = new Image()
    image.src = item.image
  })

  nextTick(syncThumbButtons)
})

onBeforeUnmount(() => {
  introTimeline?.kill()
  videoCall?.kill()
  playCall?.kill()
  finishTween?.kill()
  slideTween?.kill()
  gsap.killTweensOf(introClickCursor.value)
})
</script>

<template>
  <main class="min-h-screen overflow-x-hidden bg-white text-[#102a3a]">
    <div
      v-if="introVisible"
      ref="introScreen"
      class="intro-screen fixed inset-0 z-[9999] h-screen w-full overflow-hidden bg-[#f5efe3]"
      :class="{
        'show-video cursor-none': showVideo,
        'is-finished pointer-events-none invisible opacity-0': introFinished
      }"
      @click="handleIntroClick"
      @mousemove="handleIntroMousemove"
    >
      <div ref="introVideoLayer" class="absolute inset-0 z-0 h-full w-full bg-black opacity-0">
        <video
          ref="openingVideo"
          class="block h-full w-full object-cover"
          muted
          playsinline
          preload="auto"
          @ended="enterHome"
        >
          <source src="/videos/ATRI2.mp4" type="video/mp4">
        </video>
      </div>

      <div ref="introCard" class="intro-card absolute inset-0 z-[2] h-full w-full bg-[#c8ebff]" />

      <div
        ref="introTitle"
        class="intro-title pointer-events-none absolute left-1/2 top-1/2 z-[3] bg-[linear-gradient(90deg,#102a3a_0%,#102a3a_50%,#ffffff_50%,#ffffff_100%)] bg-[length:200%_100%] bg-[position:100%_0] bg-clip-text [font-family:'Cormorant_Garamond','Times_New_Roman',serif] text-[72px] font-[250] tracking-[0.16em] text-transparent opacity-0 [text-shadow:0_8px_24px_rgba(60,150,210,0.25)] md:text-[120px]"
      >
        ATRI
      </div>

      <div
        ref="introClickCursor"
        class="pointer-events-none fixed left-0 top-0 z-[4] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#102a3a]/70 bg-[#c8ebff]/90 text-[10px] font-bold tracking-[0.16em] text-[#102a3a] opacity-0 shadow-[0_12px_34px_rgba(16,42,58,0.35)] backdrop-blur-md"
      >
        CLICK
      </div>
    </div>

    <section
      class="relative grid h-screen w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-[1fr_240px]"
      @mousemove="handleMousemove"
      @mouseleave="resetParallax"
    >
      <div
        ref="heroVisual"
        class="relative h-screen w-full overflow-hidden"
      >
        <img
          :src="currentImage"
          alt=""
          class="absolute inset-0 block h-full w-full scale-[1.04] object-cover object-center transition-transform duration-200 ease-out will-change-transform hero-parallax"
        >

        <img
          ref="heroTitleImage"
          src="/images/sy1(1).png"
          alt=""
          class="pointer-events-none absolute left-[18%] top-[9%] z-[5] h-auto w-[min(380px,42vw)]"
        >

        <img
          v-if="nextImage"
          ref="nextSlideImage"
          :src="nextImage"
          alt=""
          class="hero-slide-next absolute inset-0 z-[2] block h-full w-full scale-[1.04] object-cover object-center will-change-[clip-path]"
        >

        <div class="absolute bottom-8 left-8 z-20 flex flex-col items-start gap-3">
          <button
            v-for="(item, index) in heroItems"
            :key="item.image"
            :ref="(element) => setThumbButtonRef(element, index)"
            type="button"
            class="h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-[14px] border-2 border-white/75 bg-white/45 p-1 opacity-100 backdrop-blur"
            :class="activeIndex === index ? 'border-white' : ''"
            @mouseenter="animateThumb(index, true)"
            @mouseleave="animateThumb(index, index === activeIndex)"
            @click="selectHero(index)"
          >
            <img :src="item.thumb" alt="" class="block h-full w-full rounded-[10px] object-cover">
          </button>
        </div>
      </div>

      <aside class="relative z-10 flex h-screen w-full flex-col border-l border-[rgba(120,180,210,0.28)] bg-white/95 px-6 pb-7 pt-[34px] shadow-[-18px_0_50px_rgba(80,130,160,0.08)] lg:w-[240px]">
        <div class="mb-[34px]">
          <h1 class="font-serif text-[42px] font-normal tracking-[0.14em] text-[#102a3a]">
            ATRI
          </h1>
          <p class="mt-1.5 text-xs tracking-[0.08em] text-[#102a3a]/60">
            Blue Memory Store
          </p>
        </div>

        <HomeSidebar :items="homeNavItems" />

        <div class="mt-auto border-t border-[rgba(120,180,210,0.26)] pt-[18px]">
          <p class="text-[11px] tracking-[0.08em] text-[#102a3a]/60">
            Tech Festival Project
          </p>
          <span class="mt-1.5 block font-serif text-xl text-[#102a3a]">2026</span>
        </div>
      </aside>
    </section>

    <section id="story">
      <StorySection />
    </section>

    <section id="characters">
      <CharactersSection />
    </section>

    <section id="scenes">
      <ScenesSection />
    </section>

    <section id="news">
      <NewsSection />
    </section>
  </main>
</template>

<style scoped>
.hero-parallax,
.hero-slide-next {
  transform: translate3d(var(--move-x, 0px), var(--move-y, 0px), 0) scale(1.04);
}

.hero-slide-next {
  clip-path: inset(0 100% 0 0);
  pointer-events: none;
}

.hero-slide-next.is-show {
  clip-path: inset(0 0 0 0);
}

</style>
