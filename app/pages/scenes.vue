<template>
  <section class="relative min-h-screen overflow-hidden bg-white text-black">
    <div class="relative z-10 mx-auto min-h-screen max-w-[1540px] px-8 py-14 lg:px-20">
      <!-- 标题 -->
      <header>
        <h1 class="font-mono text-5xl font-light tracking-[0.45em] md:text-7xl">
          gallery
        </h1>
        <p class="mt-3 text-xl tracking-[0.35em]">GALLERY</p>
        <!--
        <p class="mt-3 text-xl tracking-[0.35em]">ギャラリー</p>
        -->
      </header>

      <!-- 顶部缩略图轮播 -->
      <section class="relative mt-8">
        <div class="absolute right-16 -top-14 hidden gap-4 md:flex">
          <button
            class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white/80 text-3xl text-gray-400 transition hover:border-cyan-300 hover:text-cyan-400"
            @click="prevScene"
          >
            ‹
          </button>
          <button
            class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white/80 text-3xl text-gray-400 transition hover:border-cyan-300 hover:text-cyan-400"
            @click="nextScene"
          >
            ›
          </button>
        </div>

        <div class="relative left-1/2 w-screen -translate-x-1/2">
          <div
            ref="thumbnailScroller"
            class="scene-carousel flex gap-9 overflow-x-auto pb-7 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            :class="{ 'is-dragging': isDragging }"
            @pointerdown="startThumbnailDrag"
            @pointerleave="stopThumbnailDrag"
            @pointermove="moveThumbnailDrag"
            @pointerup="stopThumbnailDrag"
            @pointercancel="stopThumbnailDrag"
            @scroll="handleCarouselScroll"
          >
            <button
              v-for="scene in loopedScenes"
              :key="scene.renderId"
              :data-real-index="scene.realIndex"
              :data-loop-index="scene.loopIndex"
              class="gallery-thumb group relative shrink-0"
              @click="handleSceneClick(scene.realIndex)"
            >
            <!-- 四角框线 -->
            <span class="corner corner-tl" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
            <span class="corner corner-tr" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
            <span class="corner corner-bl" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
            <span class="corner corner-br" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>

            <!-- 缩略图占位 -->
            <div class="gallery-thumb-image overflow-hidden bg-white">
              <img
                :src="scene.image"
                :alt="`Scene ${scene.id}`"
                class="block h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
              >
              <span class="absolute bottom-3 right-4 text-[9px] tracking-[0.18em] text-white/70">
                VISUAL ARTS/Key
              </span>
            </div>

            <div
              class="mx-auto mt-3 h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent"
              :class="activeIndex === scene.realIndex ? 'border-b-cyan-300' : 'border-b-gray-300'"
            ></div>
            </button>
          </div>
        </div>
      </section>

      <!-- 主体：左大图 + 右文字 -->
      <main class="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[62%_38%] lg:items-center">
        <!-- 大图区域 -->
        <section class="relative mx-auto w-full max-w-[820px]">
          <span class="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-gray-300"></span>
          <span class="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-gray-300"></span>
          <span class="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-gray-300"></span>
          <span class="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-gray-300"></span>

          <div class="relative aspect-[16/9] overflow-hidden border border-gray-200 bg-white shadow-sm">
            <img
              :key="activeScene.id"
              :src="activeScene.image"
              :alt="`Scene ${activeScene.id}`"
              class="scene-main-image block h-full w-full object-cover"
            >
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.02),rgba(255,255,255,.08)_62%,rgba(255,255,255,.18))]"></div>

            <div class="absolute bottom-4 right-5 text-[10px] tracking-[0.25em] text-cyan-500/80">
              © VISUAL ARTS / Key
            </div>
          </div>
        </section>

        <!-- 右侧说明 -->
        <section class="relative px-2 lg:px-8">
          <div class="mb-6 h-px w-12 bg-gray-400"></div>
          <p class="mb-4 text-xs font-bold tracking-[0.25em]">FILE</p>
          <div class="relative inline-block">
            <span class="absolute -left-3 -top-2 h-3 w-3 border-l-2 border-t-2 border-cyan-300"></span>
            <span class="absolute -right-3 -top-2 h-3 w-3 border-r-2 border-t-2 border-cyan-300"></span>
            <span class="absolute -bottom-2 -left-3 h-3 w-3 border-b-2 border-l-2 border-cyan-300"></span>
            <span class="absolute -bottom-2 -right-3 h-3 w-3 border-b-2 border-r-2 border-cyan-300"></span>
            <h2 class="text-2xl tracking-[0.12em]">#{{ activeScene.id }}</h2>
          </div>

          <p class="mt-8 max-w-xl whitespace-pre-line text-lg leading-[2.2] tracking-[0.08em]">
            {{ activeScene.description }}
          </p>

          <div class="mt-10 flex items-center gap-5">
            <button
              class="border border-cyan-300 px-5 py-2 text-sm tracking-[0.25em] text-cyan-500 transition hover:bg-cyan-400 hover:text-white"
              @click="prevScene"
            >
              PREV
            </button>
            <button
              class="border border-cyan-300 px-5 py-2 text-sm tracking-[0.25em] text-cyan-500 transition hover:bg-cyan-400 hover:text-white"
              @click="nextScene"
            >
              NEXT
            </button>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const activeIndex = ref(0)
const thumbnailScroller = ref(null)
const isDragging = ref(false)
const shouldSuppressClick = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let dragMoved = false
let dragPointerId = null
let dragAnimationId = 0
let inertiaAnimationId = 0
let activationAnimationId = 0
let lastPointerX = 0
let lastPointerTime = 0
let dragVelocity = 0
let targetScrollLeft = 0

const dragEase = 0.36
const inertiaFriction = 0.94
const minInertiaVelocity = 0.08
const activeThumbnailSlot = 2

const scenes = [
  {
    id: '001',
    description:
      '白い霧を抜けて、登り切った先に「それ」はある。\nどこまでも続きそうな、一面の花畑。\n色とりどりの花々が鼻腔をくすぐる、とても綺麗な花畑。\n——そこにはいつも、君がいた。',
    thumbClass: 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-300',
    mainClass: 'bg-gradient-to-br from-cyan-50 via-white to-pink-100',
    image: '/images/atri1.jpg',
  },
  {
    id: '002',
    description:
      '懐かしい駅前通りに、夏の光が差し込んでいる。\n見慣れたはずの景色なのに、少しだけ違って見えた。\nその違和感が、物語の始まりだった。',
    thumbClass: 'bg-gradient-to-br from-sky-300 via-emerald-200 to-yellow-100',
    mainClass: 'bg-gradient-to-br from-sky-100 via-emerald-50 to-yellow-100',
    image: '/images/atri2.jpg',
  },
  {
    id: '003',
    description:
      '透明な街の中を、光の線が走っていく。\n現実と仮想が重なり合う場所で、失くした記憶の断片が静かに浮かび上がった。',
    thumbClass: 'bg-gradient-to-br from-cyan-200 via-white to-blue-500',
    mainClass: 'bg-gradient-to-br from-cyan-100 via-white to-blue-200',
    image: '/images/atri3.jpg',
  },
  {
    id: '004',
    description:
      '風に舞う花びらの中で、少女は空を見上げていた。\n柔らかな光に包まれたその表情は、どこか遠い約束を思い出しているようだった。',
    thumbClass: 'bg-gradient-to-br from-white via-pink-100 to-cyan-100',
    mainClass: 'bg-gradient-to-br from-white via-pink-50 to-cyan-100',
    image: '/images/atri4.jpg',
  },
  {
    id: '005',
    description:
      '移動する車窓の向こうで、街の輪郭がゆっくり流れていく。\n静かな会話と沈黙の間に、少しずつ距離が縮まっていった。',
    thumbClass: 'bg-gradient-to-br from-slate-300 via-blue-100 to-indigo-300',
    mainClass: 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100',
    image: '/images/atri5.jpg',
  },
  {
    id: '006',
    description:
      '夕暮れの海岸辺で、波の音が静かに響いていた。\nオレンジ色の空に映る二人の影は、少しずつ近づいていった。',
    thumbClass: 'bg-gradient-to-br from-orange-300 via-pink-200 to-purple-300',
    mainClass: 'bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100',
    image: '/images/atri6.jpg',
  },
  {
    id: '007',
    description:
      '図書館の静けさの中で、ページをめくる音だけが聞こえる。\n君が真剣に本を読む横顔は、いつまでも見ていられる。',
    thumbClass: 'bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200',
    mainClass: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100',
    image: '/images/atri7.jpg',
  },
  {
    id: '008',
    description:
      '雨上がりの街路樹の下で、水たまりに映る空を見ていた。\n君が差し出した傘の中は、世界で一番暖かい場所だった。',
    thumbClass: 'bg-gradient-to-br from-blue-300 via-cyan-200 to-teal-300',
    mainClass: 'bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100',
    image: '/images/atri8.jpg',
  },
  {
    id: '009',
    description:
      '冬の夜空に咲く花火は、一瞬の美しさだけれど、\n君と一緒に見た景色は、永遠に記憶に残る。',
    thumbClass: 'bg-gradient-to-br from-red-400 via-orange-300 to-yellow-300',
    mainClass: 'bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100',
    image: '/images/atri9.jpg',
  },
  {
    id: '010',
    description:
      '春の桜吹雪の中で、君の笑顔が一番輝いていた。\n舞い落ちる花びらが、二人の時間を優しく包み込んだ。',
    thumbClass: 'bg-gradient-to-br from-pink-300 via-rose-200 to-red-200',
    mainClass: 'bg-gradient-to-br from-pink-100 via-rose-50 to-red-100',
    image: '/images/atri10.jpg',
  },
  {
    id: '011',
    description:
      '星空の下で、君の手を握りしめていた。\n無数の星が瞬く中で、二人の約束は永遠に輝く。',
    thumbClass: 'bg-gradient-to-br from-indigo-400 via-purple-300 to-violet-300',
    mainClass: 'bg-gradient-to-br from-indigo-100 via-purple-50 to-violet-100',
    image: '/images/atri11.jpg',
  },
  {
    id: '012',
    description:
      '新しい朝が来て、君と共に歩き出す。\nこれからもずっと、二人で同じ道を歩いていこう。',
    thumbClass: 'bg-gradient-to-br from-green-300 via-emerald-200 to-teal-200',
    mainClass: 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100',
    image: '/images/atri12.jpg',
  },
]

const loopedScenes = computed(() =>
  [-1, 0, 1].flatMap((loopIndex) =>
    scenes.map((scene, realIndex) => ({
      ...scene,
      realIndex,
      loopIndex,
      renderId: `${loopIndex}-${scene.id}`,
    }))
  )
)

const activeScene = computed(() => scenes[activeIndex.value])

function selectScene(index) {
  activeIndex.value = index
  nextTick(alignActiveThumbnailToSlot)
}

function alignActiveThumbnailToSlot(behavior = isDragging.value ? 'auto' : 'smooth') {
  const scroller = thumbnailScroller.value
  const activeThumb = scroller?.querySelector(
    `.gallery-thumb[data-real-index="${activeIndex.value}"][data-loop-index="0"]`
  )

  if (!scroller || !activeThumb) {
    return
  }

  const gap = parseFloat(getComputedStyle(scroller).columnGap) || 0
  const scrollerRect = scroller.getBoundingClientRect()
  const activeThumbRect = activeThumb.getBoundingClientRect()
  const slotLeft = scrollerRect.left + activeThumbnailSlot * (activeThumb.offsetWidth + gap)

  scroller.scrollTo({
    left: scroller.scrollLeft + activeThumbRect.left - slotLeft,
    behavior,
  })
}

function handleSceneClick(index) {
  if (shouldSuppressClick.value) return

  selectScene(index)
}

function getLoopMetrics(scroller) {
  const firstCloneThumb = scroller?.querySelector('.gallery-thumb[data-loop-index="-1"][data-real-index="0"]')
  const firstRealThumb = scroller?.querySelector('.gallery-thumb[data-loop-index="0"][data-real-index="0"]')

  if (!firstCloneThumb || !firstRealThumb) {
    return null
  }

  const loopWidth = firstRealThumb.offsetLeft - firstCloneThumb.offsetLeft

  if (loopWidth <= 0) {
    return null
  }

  const centerOffset = (scroller.clientWidth - firstRealThumb.clientWidth) / 2
  const firstRealCenterScroll = firstRealThumb.offsetLeft - centerOffset

  return {
    loopWidth,
    lowerLimit: firstRealCenterScroll - loopWidth / 2,
    upperLimit: firstRealCenterScroll + loopWidth * 1.5,
  }
}

function normalizeCarouselLoop(syncTarget = false) {
  const scroller = thumbnailScroller.value
  const metrics = getLoopMetrics(scroller)

  if (!scroller || !metrics) {
    return
  }

  const previousScrollLeft = scroller.scrollLeft
  let nextScrollLeft = previousScrollLeft

  if (nextScrollLeft < metrics.lowerLimit) {
    nextScrollLeft += metrics.loopWidth
  } else if (nextScrollLeft > metrics.upperLimit) {
    nextScrollLeft -= metrics.loopWidth
  }

  if (nextScrollLeft === previousScrollLeft) {
    return
  }

  scroller.scrollLeft = nextScrollLeft

  if (syncTarget) {
    targetScrollLeft += nextScrollLeft - previousScrollLeft
    dragStartScrollLeft += nextScrollLeft - previousScrollLeft
  }
}

function updateActiveSceneFromCarousel() {
  activationAnimationId = 0

  const scroller = thumbnailScroller.value

  if (!scroller) {
    return
  }

  const scrollerRect = scroller.getBoundingClientRect()
  const thumbs = Array.from(scroller.querySelectorAll('.gallery-thumb'))
    .map((thumb) => {
      const rect = thumb.getBoundingClientRect()
      const overlap = Math.min(rect.right, scrollerRect.right) - Math.max(rect.left, scrollerRect.left)

      return {
        thumb,
        rect,
        overlap,
      }
    })
    .filter(({ rect, overlap }) => overlap >= rect.width * 0.45)
    .sort((a, b) => a.rect.left - b.rect.left)

  const activeThumb = thumbs[Math.min(activeThumbnailSlot, thumbs.length - 1)]
  const realIndex = Number(activeThumb?.thumb.dataset.realIndex)

  if (Number.isInteger(realIndex) && realIndex !== activeIndex.value) {
    activeIndex.value = realIndex
  }
}

function scheduleActiveSceneFromCarousel() {
  if (activationAnimationId) {
    return
  }

  activationAnimationId = requestAnimationFrame(updateActiveSceneFromCarousel)
}

function handleCarouselScroll() {
  normalizeCarouselLoop()
  scheduleActiveSceneFromCarousel()
}

function stopDragAnimation() {
  if (!dragAnimationId) return

  cancelAnimationFrame(dragAnimationId)
  dragAnimationId = 0
}

function stopInertia() {
  if (!inertiaAnimationId) return

  cancelAnimationFrame(inertiaAnimationId)
  inertiaAnimationId = 0
}

function animateDragScroll() {
  const scroller = thumbnailScroller.value

  if (!isDragging.value || !scroller) {
    dragAnimationId = 0
    return
  }

  scroller.scrollLeft += (targetScrollLeft - scroller.scrollLeft) * dragEase
  normalizeCarouselLoop(true)
  dragAnimationId = requestAnimationFrame(animateDragScroll)
}

function startInertia() {
  const scroller = thumbnailScroller.value
  if (!scroller || Math.abs(dragVelocity) < minInertiaVelocity) return

  const step = () => {
    const nextScrollLeft = scroller.scrollLeft + dragVelocity * 16

    scroller.scrollLeft = nextScrollLeft
    normalizeCarouselLoop()
    dragVelocity *= inertiaFriction

    if (Math.abs(dragVelocity) < minInertiaVelocity) {
      inertiaAnimationId = 0
      return
    }

    inertiaAnimationId = requestAnimationFrame(step)
  }

  inertiaAnimationId = requestAnimationFrame(step)
}

function startThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!scroller) return

  stopInertia()
  stopDragAnimation()
  isDragging.value = true
  dragMoved = false
  shouldSuppressClick.value = false
  dragPointerId = event.pointerId
  dragStartX = event.clientX
  dragStartScrollLeft = scroller.scrollLeft
  lastPointerX = event.clientX
  lastPointerTime = performance.now()
  dragVelocity = 0
  targetScrollLeft = scroller.scrollLeft
  scroller.setPointerCapture?.(event.pointerId)
  dragAnimationId = requestAnimationFrame(animateDragScroll)
}

function moveThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!isDragging.value || !scroller) return

  event.preventDefault()

  const distance = event.clientX - dragStartX
  const now = performance.now()
  const elapsed = Math.max(16, now - lastPointerTime)

  if (Math.abs(distance) > 6) {
    dragMoved = true
    shouldSuppressClick.value = true
  }

  targetScrollLeft = dragStartScrollLeft - distance
  dragVelocity = (lastPointerX - event.clientX) / elapsed
  lastPointerX = event.clientX
  lastPointerTime = now
}

function stopThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!isDragging.value) return

  isDragging.value = false
  stopDragAnimation()
  scroller.scrollLeft = targetScrollLeft
  normalizeCarouselLoop()

  if (dragPointerId !== null) {
    scroller?.releasePointerCapture?.(dragPointerId)
  }

  dragPointerId = null

  if (dragMoved) {
    startInertia()
    window.setTimeout(() => {
      shouldSuppressClick.value = false
    }, 80)
  }
}

function prevScene() {
  selectScene((activeIndex.value - 1 + scenes.length) % scenes.length)
}

function nextScene() {
  selectScene((activeIndex.value + 1) % scenes.length)
}

onMounted(() => {
  nextTick(() => {
    alignActiveThumbnailToSlot('auto')
    scheduleActiveSceneFromCarousel()
  })
  window.addEventListener('resize', scheduleActiveSceneFromCarousel)
})

onUnmounted(() => {
  stopDragAnimation()
  stopInertia()
  window.removeEventListener('resize', scheduleActiveSceneFromCarousel)

  if (activationAnimationId) {
    cancelAnimationFrame(activationAnimationId)
  }
})
</script>

<style scoped>
.scene-carousel {
  --thumb-width: clamp(250px, 16.2vw, 340px);
  cursor: grab;
  padding-left: calc((100vw - var(--thumb-width)) / 2);
  padding-right: calc((100vw - var(--thumb-width)) / 2);
  scroll-padding-inline: calc((100vw - var(--thumb-width)) / 2);
  scroll-snap-type: x proximity;
  scroll-behavior: smooth;
  user-select: none;
  overscroll-behavior-x: contain;
  touch-action: pan-y;
  will-change: scroll-position;
}

.gallery-thumb {
  width: var(--thumb-width);
  scroll-snap-align: center;
}

.gallery-thumb-image {
  position: relative;
  aspect-ratio: 16 / 9;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}

.scene-main-image {
  animation: scene-main-fade 0.34s ease both;
}

@keyframes scene-main-fade {
  from {
    opacity: 0.72;
    transform: scale(1.012);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.corner {
  position: absolute;
  z-index: 2;
  height: 14px;
  width: 14px;
  border-color: #c6c8cf;
  transition: border-color 0.2s ease;
}

.corner.is-active {
  border-color: #61cfff;
}

.corner-tl {
  left: -12px;
  top: -12px;
  border-left-width: 2px;
  border-top-width: 2px;
}

.corner-tr {
  right: -12px;
  top: -12px;
  border-right-width: 2px;
  border-top-width: 2px;
}

.corner-bl {
  bottom: 25px;
  left: -12px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}

.corner-br {
  bottom: 25px;
  right: -12px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}

.scene-carousel.is-dragging {
  cursor: grabbing;
  scroll-behavior: auto;
  scroll-snap-type: none;
}

.scene-carousel.is-dragging button {
  pointer-events: none;
}

section.relative.mt-8 > .absolute.right-16 {
  display: none;
}
</style>
