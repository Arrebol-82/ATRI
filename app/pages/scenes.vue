<template>
  <section class="relative min-h-screen overflow-hidden bg-white text-black">
    <!-- 背景科技装饰，不用图片，纯 CSS 做效果 -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-24 top-4 h-40 w-[520px] rounded-full bg-cyan-200/20 blur-3xl"></div>
      <div class="absolute left-20 bottom-24 h-36 w-72 rounded-full bg-pink-200/30 blur-3xl"></div>
      <div class="absolute right-0 top-0 h-[560px] w-[560px] rounded-full border border-cyan-200/50"></div>
      <div class="absolute right-24 top-24 h-80 w-80 rounded-full border border-cyan-100"></div>
      <div class="absolute right-36 top-32 h-56 w-56 rotate-45 border border-cyan-100 bg-cyan-50/30"></div>

      <div class="absolute left-0 top-10 h-px w-[420px] rotate-12 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
      <div class="absolute left-0 bottom-24 h-px w-[520px] rotate-[-35deg] bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
      <div class="absolute right-32 bottom-24 h-px w-[460px] rotate-[-18deg] bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
      <div class="absolute left-[36%] top-16 h-24 w-24 rounded-full border border-yellow-200/70"></div>
      <div class="absolute left-[37%] top-20 h-14 w-14 rounded-full border border-cyan-200/70"></div>

      <div class="absolute left-8 top-1/2 text-[10px] tracking-[0.35em] text-black/60 [writing-mode:vertical-rl]">
        logical subscriber
      </div>
      <div class="absolute right-8 top-1/2 text-[10px] tracking-[0.35em] text-black/60 [writing-mode:vertical-rl]">
        Heaven is a fiction.
      </div>
      <div class="absolute left-10 bottom-8 border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-cyan-400">
        <p class="text-xs tracking-[0.45em]">OUTLINE</p>
        <p class="mt-1 max-w-xs text-[10px] leading-relaxed">
          Gallery module preview. Image area is currently made by CSS placeholders.
        </p>
      </div>
    </div>

    <!-- 右侧社交按钮装饰 -->
    <div class="absolute bottom-28 right-8 z-20 hidden flex-col gap-3 md:flex">
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white">Li</span>
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white">f</span>
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs text-white">X</span>
    </div>

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
            :class="{ 'is-dragging': isDragging, 'is-gliding': isGliding }"
            @pointerdown="startThumbnailDrag"
            @pointerleave="stopThumbnailDrag"
            @pointermove="moveThumbnailDrag"
            @pointercancel="stopThumbnailDrag"
            @pointerup="stopThumbnailDrag"
            @scroll.passive="syncThumbnailLoop"
          >
            <button
            v-for="scene in loopedScenes"
            :key="`${scene.loop}-${scene.id}`"
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
            <!-- 这里以后换成真实图片即可 -->
            <div class="absolute inset-0 transition duration-500" :class="activeScene.mainClass"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.05),rgba(255,255,255,.65)_65%,rgba(255,255,255,.85))]"></div>

            <!-- 模拟场景内容，不用真实图片 -->
            <div class="absolute left-[18%] top-[22%] h-40 w-40 rounded-full bg-white/35 blur-2xl"></div>
            <div class="absolute left-[22%] top-[32%] h-52 w-44 rounded-t-full border border-white/60 bg-white/25"></div>
            <div class="absolute left-[34%] top-[28%] h-44 w-72 rounded-full border-t-2 border-white/70"></div>
            <div class="absolute bottom-0 left-0 h-32 w-full bg-white/20 blur-xl"></div>

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

const activeIndex = ref(2)
const thumbnailScroller = ref(null)
const isDragging = ref(false)
const isGliding = ref(false)
const shouldSuppressClick = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let dragMoved = false
let dragPointerId = null
let dragAnimationId = 0
let inertiaAnimationId = 0
let scrollSyncAnimationId = 0
let lastPointerX = 0
let lastPointerTime = 0
let dragVelocity = 0
let targetScrollLeft = 0
let loopWidthCache = 0

const dragEase = 0.36
const inertiaFriction = 0.94
const minInertiaVelocity = 0.08
const loopCopyCount = 3
const loopMiddleCopy = 1

const scenes = [
  {
    id: '001',
    description:
      '白い霧を抜けて、登り切った先に「それ」はある。\nどこまでも続きそうな、一面の花畑。\n色とりどりの花々が鼻腔をくすぐる、とても綺麗な花畑。\n——そこにはいつも、君がいた。',
    thumbClass: 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-300',
    mainClass: 'bg-gradient-to-br from-cyan-50 via-white to-pink-100',
    image: '/images/sy1.jpg',
  },
  {
    id: '002',
    description:
      '懐かしい駅前通りに、夏の光が差し込んでいる。\n見慣れたはずの景色なのに、少しだけ違って見えた。\nその違和感が、物語の始まりだった。',
    thumbClass: 'bg-gradient-to-br from-sky-300 via-emerald-200 to-yellow-100',
    mainClass: 'bg-gradient-to-br from-sky-100 via-emerald-50 to-yellow-100',
    image: '/images/sy2.jpg',
  },
  {
    id: '003',
    description:
      '透明な街の中を、光の線が走っていく。\n現実と仮想が重なり合う場所で、失くした記憶の断片が静かに浮かび上がった。',
    thumbClass: 'bg-gradient-to-br from-cyan-200 via-white to-blue-500',
    mainClass: 'bg-gradient-to-br from-cyan-100 via-white to-blue-200',
    image: '/images/sy3.jpg',
  },
  {
    id: '004',
    description:
      '風に舞う花びらの中で、少女は空を見上げていた。\n柔らかな光に包まれたその表情は、どこか遠い約束を思い出しているようだった。',
    thumbClass: 'bg-gradient-to-br from-white via-pink-100 to-cyan-100',
    mainClass: 'bg-gradient-to-br from-white via-pink-50 to-cyan-100',
    image: '/images/sy4.jpg',
  },
  {
    id: '005',
    description:
      '移動する車窓の向こうで、街の輪郭がゆっくり流れていく。\n静かな会話と沈黙の間に、少しずつ距離が縮まっていった。',
    thumbClass: 'bg-gradient-to-br from-slate-300 via-blue-100 to-indigo-300',
    mainClass: 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100',
    image: '/images/sy5.jpg',
  },
  {
    id: '006',
    description:
      '夜の闇を切り裂くように、赤い光が走った。\nその一瞬だけ、誰も知らない真実が照らし出される。',
    thumbClass: 'bg-gradient-to-br from-slate-950 via-indigo-900 to-pink-500',
    mainClass: 'bg-gradient-to-br from-slate-900 via-indigo-800 to-pink-400',
    image: '/images/story1.png',
  },
  {
    id: '007',
    description:
      'Light lingers over the frame like a preview cut waiting for the final gallery asset.\nThe long strip now has enough visual rhythm to judge spacing and flow.',
    thumbClass: 'bg-gradient-to-br from-cyan-100 via-white to-rose-100',
    mainClass: 'bg-gradient-to-br from-cyan-50 via-white to-rose-100',
    image: '/images/story2.png',
  },
  {
    id: '008',
    description:
      'A brighter placeholder for checking the full twelve-image preview row.\nIt keeps the gallery feeling alive while the final scene images are prepared.',
    thumbClass: 'bg-gradient-to-br from-blue-100 via-white to-yellow-100',
    mainClass: 'bg-gradient-to-br from-blue-50 via-white to-yellow-100',
    image: '/images/sy1(1).png',
  },
  {
    id: '009',
    description:
      'Preview frame for testing density in the horizontal gallery strip.\nThe selection indicator should stay easy to follow while users drag through the row.',
    thumbClass: 'bg-gradient-to-br from-sky-200 via-white to-cyan-300',
    mainClass: 'bg-gradient-to-br from-sky-100 via-white to-cyan-200',
    image: '/images/tx1.jpg',
  },
  {
    id: '010',
    description:
      'A soft contrast preview that keeps the drag motion from feeling visually flat.\nThe asset can be replaced later without changing the interaction model.',
    thumbClass: 'bg-gradient-to-br from-violet-200 via-white to-pink-200',
    mainClass: 'bg-gradient-to-br from-violet-100 via-white to-pink-100',
    image: '/images/tx2.jpg',
  },
  {
    id: '011',
    description:
      'This slot adds another color beat in the long row.\nIt helps validate the final gallery pacing before all production images are ready.',
    thumbClass: 'bg-gradient-to-br from-emerald-100 via-cyan-100 to-blue-300',
    mainClass: 'bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-200',
    image: '/images/tx3.jpg',
  },
  {
    id: '012',
    description:
      'The last temporary preview in the twelve-image set.\nThe release motion should coast gently instead of stopping in a stiff, mechanical way.',
    thumbClass: 'bg-gradient-to-br from-amber-100 via-white to-cyan-200',
    mainClass: 'bg-gradient-to-br from-amber-50 via-white to-cyan-100',
    image: '/images/tx4.jpg',
  },
]

const activeScene = computed(() => scenes[activeIndex.value])
const loopedScenes = computed(() =>
  Array.from({ length: loopCopyCount }, (_, loop) =>
    scenes.map((scene, realIndex) => ({
      ...scene,
      loop,
      realIndex
    }))
  ).flat()
)

function selectScene(index) {
  activeIndex.value = index
  nextTick(centerActiveThumbnail)
}

function centerActiveThumbnail(behavior = 'smooth') {
  const scroller = thumbnailScroller.value
  const activeThumb = scroller?.querySelectorAll('.gallery-thumb')?.[
    scenes.length * loopMiddleCopy + activeIndex.value
  ]

  activeThumb?.scrollIntoView({
    behavior: isDragging.value || isGliding.value ? 'auto' : behavior,
    block: 'nearest',
    inline: 'center'
  })
}

function handleSceneClick(index) {
  if (shouldSuppressClick.value) return

  selectScene(index)
}

function getLoopWidth(scroller) {
  if (loopWidthCache) return loopWidthCache

  const thumbs = scroller?.querySelectorAll('.gallery-thumb')

  if (!thumbs || thumbs.length <= scenes.length) return 0

  loopWidthCache = thumbs[scenes.length].offsetLeft - thumbs[0].offsetLeft

  return loopWidthCache
}

function syncLoopScroll(scroller) {
  const loopWidth = getLoopWidth(scroller)
  if (!loopWidth) return

  const minScrollLeft = loopWidth * 0.5
  const maxScrollLeft = loopWidth * 1.5
  let offset = 0

  while (scroller.scrollLeft < minScrollLeft) {
    offset += loopWidth
    scroller.scrollLeft += loopWidth
  }

  while (scroller.scrollLeft > maxScrollLeft) {
    offset -= loopWidth
    scroller.scrollLeft -= loopWidth
  }

  if (!offset) return

  targetScrollLeft += offset
  dragStartScrollLeft += offset
}

function syncThumbnailLoop() {
  if (isDragging.value || isGliding.value || scrollSyncAnimationId) return

  scrollSyncAnimationId = requestAnimationFrame(() => {
    scrollSyncAnimationId = 0

    const scroller = thumbnailScroller.value
    if (!scroller) return

    syncLoopScroll(scroller)
  })
}

function stopScrollSync() {
  if (!scrollSyncAnimationId) return

  cancelAnimationFrame(scrollSyncAnimationId)
  scrollSyncAnimationId = 0
}

function stopDragAnimation() {
  if (!dragAnimationId) return

  cancelAnimationFrame(dragAnimationId)
  dragAnimationId = 0
}

function stopInertia() {
  if (!inertiaAnimationId) {
    isGliding.value = false
    return
  }

  cancelAnimationFrame(inertiaAnimationId)
  inertiaAnimationId = 0
  isGliding.value = false
}

function animateDragScroll() {
  const scroller = thumbnailScroller.value

  if (!isDragging.value || !scroller) {
    dragAnimationId = 0
    return
  }

  scroller.scrollLeft += (targetScrollLeft - scroller.scrollLeft) * dragEase
  syncLoopScroll(scroller)
  dragAnimationId = requestAnimationFrame(animateDragScroll)
}

function startInertia() {
  const scroller = thumbnailScroller.value
  if (!scroller || Math.abs(dragVelocity) < minInertiaVelocity) {
    isGliding.value = false
    return
  }

  isGliding.value = true

  const step = () => {
    scroller.scrollLeft += dragVelocity * 16
    syncLoopScroll(scroller)
    dragVelocity *= inertiaFriction

    if (Math.abs(dragVelocity) < minInertiaVelocity) {
      inertiaAnimationId = 0
      isGliding.value = false
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
  stopScrollSync()
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
  syncLoopScroll(scroller)

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
  nextTick(() => centerActiveThumbnail('auto'))
})

onUnmounted(() => {
  stopDragAnimation()
  stopInertia()
  stopScrollSync()
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

.scene-carousel.is-dragging,
.scene-carousel.is-gliding {
  cursor: grabbing;
  scroll-behavior: auto;
  scroll-snap-type: none;
}

.scene-carousel.is-dragging button,
.scene-carousel.is-gliding button {
  pointer-events: none;
}

section.relative.mt-8 > .absolute.right-16 {
  display: none;
}
</style>
