<template>
  <section class="relative min-h-screen overflow-hidden bg-white text-black">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(97,207,255,0.08),transparent_38%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"></div>

    <div class="relative z-10 mx-auto min-h-screen max-w-[1540px] px-8 py-14 lg:px-20">
      <header>
        <h1 class="font-mono text-5xl font-light tracking-[0.45em] text-slate-900 md:text-7xl">
          gallery
        </h1>
        <p class="mt-3 text-xl tracking-[0.35em] text-slate-500">GALLERY</p>
      </header>

      <section class="relative mt-8">
        <div class="absolute right-16 -top-14 hidden gap-4 md:flex">
          <button
            class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-3xl text-slate-400 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-500 hover:shadow-[0_10px_24px_rgba(97,207,255,0.18)]"
            @click="prevScene"
          >
            ‹
          </button>
          <button
            class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-3xl text-slate-400 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-500 hover:shadow-[0_10px_24px_rgba(97,207,255,0.18)]"
            @click="nextScene"
          >
            ›
          </button>
        </div>

        <div class="relative left-1/2 w-screen -translate-x-1/2">
          <div
            ref="thumbnailScroller"
            class="scene-carousel flex gap-9 overflow-x-auto pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            :class="{ 'is-dragging': isDragging }"
            @pointerdown="startThumbnailDrag"
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
              class="gallery-thumb group relative shrink-0 text-left"
              :class="{ 'is-active': activeIndex === scene.realIndex }"
              @click="handleSceneClick(scene.realIndex)"
            >
              <span class="corner corner-tl" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
              <span class="corner corner-tr" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
              <span class="corner corner-bl" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>
              <span class="corner corner-br" :class="activeIndex === scene.realIndex ? 'is-active' : ''"></span>

              <div class="gallery-thumb-image overflow-hidden rounded-[2px] bg-white">
                <img
                  :src="scene.image"
                  :alt="`Scene ${scene.id}`"
                  class="block h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.045]"
                  draggable="false"
                >
                <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,16,34,0.22),transparent_45%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_34%)]"></div>

                <span class="absolute bottom-3 right-4 text-[9px] tracking-[0.18em] text-white/70">
                  VISUAL ARTS/Key
                </span>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <div
                  class="mx-auto h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent transition-colors duration-300"
                  :class="activeIndex === scene.realIndex ? 'border-b-cyan-300' : 'border-b-slate-300'"
                ></div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <main class="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[62%_38%] lg:items-center">
        <section class="relative mx-auto w-full max-w-[840px]">
          <span class="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-slate-300"></span>
          <span class="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-slate-300"></span>
          <span class="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-slate-300"></span>
          <span class="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-slate-300"></span>

          <div class="relative aspect-[16/9] overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <img
              :key="activeScene.id"
              :src="activeScene.image"
              :alt="`Scene ${activeScene.id}`"
              class="scene-main-image block h-full w-full object-cover"
            >
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.02),rgba(255,255,255,.06)_58%,rgba(255,255,255,.16))]"></div>

            <div class="absolute bottom-4 right-5 text-[10px] tracking-[0.25em] text-cyan-500/80">
              © VISUAL ARTS / Key
            </div>
          </div>
        </section>

        <section class="relative px-2 lg:px-8">
          <div class="mb-6 h-px w-12 bg-slate-400"></div>
          <p class="mb-4 text-xs font-bold tracking-[0.25em] text-slate-500">FILE</p>

          <div class="relative inline-block">
            <span class="absolute -left-3 -top-2 h-3 w-3 border-l-2 border-t-2 border-cyan-300"></span>
            <span class="absolute -right-3 -top-2 h-3 w-3 border-r-2 border-t-2 border-cyan-300"></span>
            <span class="absolute -bottom-2 -left-3 h-3 w-3 border-b-2 border-l-2 border-cyan-300"></span>
            <span class="absolute -bottom-2 -right-3 h-3 w-3 border-b-2 border-r-2 border-cyan-300"></span>
            <h2 class="text-2xl tracking-[0.12em] text-slate-900">#{{ activeScene.id }}</h2>
          </div>

          <p class="mt-8 max-w-xl whitespace-pre-line text-lg leading-[2.2] tracking-[0.08em] text-slate-700">
            {{ activeScene.description }}
          </p>
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

const dragEase = 0.18
const inertiaFriction = 0.94
const minInertiaVelocity = 0.18
const minDragDistance = 10

// 保留你喜欢的效果：默认让第 3 张图作为当前选中项。
const activeThumbnailSlot = 2

const wheelStrength = 0.9

const scenes = [
  {
    id: '001',
    description:
      '白い霧を抜けて、登り切った先に「それ」はある。\nどこまでも続きそうな、一面の花畑。\n色とりどりの花々が鼻腔をくすぐる、とても綺麗な花畑。\n——そこにはいつも、君がいた。',
    image: '/images/atri1.jpg',
  },
  {
    id: '002',
    description:
      '懐かしい駅前通りに、夏の光が差し込んでいる。\n見慣れたはずの景色なのに、少しだけ違って見えた。\nその違和感が、物語の始まりだった。',
    image: '/images/atri2.jpg',
  },
  {
    id: '003',
    description:
      '透明な街の中を、光の線が走っていく。\n現実と仮想が重なり合う場所で、失くした記憶の断片が静かに浮かび上がった。',
    image: '/images/atri3.jpg',
  },
  {
    id: '004',
    description:
      '風に舞う花びらの中で、少女は空を見上げていた。\n柔らかな光に包まれたその表情は、どこか遠い約束を思い出しているようだった。',
    image: '/images/atri4.jpg',
  },
  {
    id: '005',
    description:
      '移動する車窓の向こうで、街の輪郭がゆっくり流れていく。\n静かな会話と沈黙の間に、少しずつ距離が縮まっていった。',
    image: '/images/atri5.jpg',
  },
  {
    id: '006',
    description:
      '夕暮れの海岸辺で、波の音が静かに響いていた。\nオレンジ色の空に映る二人の影は、少しずつ近づいていった。',
    image: '/images/atri6.jpg',
  },
  {
    id: '007',
    description:
      '図書館の静けさの中で、ページをめくる音だけが聞こえる。\n君が真剣に本を読む横顔は、いつまでも見ていられる。',
    image: '/images/atri7.jpg',
  },
  {
    id: '008',
    description:
      '雨上がりの街路樹の下で、水たまりに映る空を見ていた。\n君が差し出した傘の中は、世界で一番暖かい場所だった。',
    image: '/images/atri8.jpg',
  },
  {
    id: '009',
    description:
      '冬の夜空に咲く花火は、一瞬の美しさだけれど、\n君と一緒に見た景色は、永遠に記憶に残る。',
    image: '/images/atri9.jpg',
  },
  {
    id: '010',
    description:
      '春の桜吹雪の中で、君の笑顔が一番輝いていた。\n舞い落ちる花びらが、二人の時間を優しく包み込んだ。',
    image: '/images/atri10.jpg',
  },
  {
    id: '011',
    description:
      '星空の下で、君の手を握りしめていた。\n無数の星が瞬く中で、二人の約束は永遠に輝く。',
    image: '/images/atri11.jpg',
  },
  {
    id: '012',
    description:
      '新しい朝が来て、君と共に歩き出す。\nこれからもずっと、二人で同じ道を歩いていこう。',
    image: '/images/atri12.jpg',
  },
]

const loopedScenes = computed(() =>
  [-2, -1, 0, 1, 2].flatMap((loopIndex) =>
    scenes.map((scene, realIndex) => ({
      ...scene,
      realIndex,
      loopIndex,
      renderId: `${loopIndex}-${scene.id}`,
    }))
  )
)

const activeScene = computed(() => scenes[activeIndex.value])

function getGap(scroller) {
  return parseFloat(getComputedStyle(scroller).columnGap) || 0
}

function getTargetSlotLeft(scroller, itemWidth) {
  const gap = getGap(scroller)
  return activeThumbnailSlot * (itemWidth + gap)
}

function getNearestThumbForActiveIndex() {
  const scroller = thumbnailScroller.value
  if (!scroller) return null

  const thumbs = Array.from(
    scroller.querySelectorAll(`.gallery-thumb[data-real-index="${activeIndex.value}"]`)
  )

  if (!thumbs.length) return null

  const targetSlotLeft = getTargetSlotLeft(scroller, thumbs[0].offsetWidth)

  let bestThumb = thumbs[0]
  let bestDistance = Infinity

  for (const thumb of thumbs) {
    const targetLeft = thumb.offsetLeft - targetSlotLeft
    const distance = Math.abs(targetLeft - scroller.scrollLeft)

    if (distance < bestDistance) {
      bestDistance = distance
      bestThumb = thumb
    }
  }

  return bestThumb
}

function getThumbForActiveIndexInLoop(loopIndex = 0) {
  const scroller = thumbnailScroller.value
  if (!scroller) return null

  return scroller.querySelector(
    `.gallery-thumb[data-real-index="${activeIndex.value}"][data-loop-index="${loopIndex}"]`
  )
}

function alignThumbnail(targetThumb, useSmooth = false) {
  const scroller = thumbnailScroller.value
  if (!scroller || !targetThumb) return

  const targetSlotLeft = getTargetSlotLeft(scroller, targetThumb.offsetWidth)
  const nextLeft = targetThumb.offsetLeft - targetSlotLeft

  if (useSmooth) {
    scroller.scrollTo({
      left: nextLeft,
      behavior: 'smooth',
    })
  } else {
    scroller.scrollLeft = nextLeft
  }
}

function alignActiveThumbnailToNearest(useSmooth = false) {
  alignThumbnail(getNearestThumbForActiveIndex(), useSmooth)
}

function alignActiveThumbnailToCurrentLoop(useSmooth = false) {
  alignThumbnail(getThumbForActiveIndexInLoop(0), useSmooth)
}

function selectScene(index) {
  activeIndex.value = index
  nextTick(() => alignActiveThumbnailToNearest(false))
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
  if (loopWidth <= 0) return null

  const targetSlotLeft = getTargetSlotLeft(scroller, firstRealThumb.clientWidth)
  const firstRealTargetScroll = firstRealThumb.offsetLeft - targetSlotLeft

  return {
    loopWidth,
    lowerLimit: firstRealTargetScroll - loopWidth * 1.5,
    upperLimit: firstRealTargetScroll + loopWidth * 2.5,
  }
}

function normalizeCarouselLoop(syncTarget = false) {
  const scroller = thumbnailScroller.value
  const metrics = getLoopMetrics(scroller)

  if (!scroller || !metrics) return

  const previousScrollLeft = scroller.scrollLeft
  let nextScrollLeft = previousScrollLeft

  if (nextScrollLeft < metrics.lowerLimit) {
    nextScrollLeft += metrics.loopWidth
  } else if (nextScrollLeft > metrics.upperLimit) {
    nextScrollLeft -= metrics.loopWidth
  }

  if (nextScrollLeft === previousScrollLeft) return

  scroller.scrollLeft = nextScrollLeft

  if (syncTarget) {
    const offset = nextScrollLeft - previousScrollLeft
    targetScrollLeft += offset
    dragStartScrollLeft += offset
  }
}

function updateActiveSceneFromCarousel() {
  activationAnimationId = 0

  const scroller = thumbnailScroller.value
  if (!scroller) return

  const scrollerRect = scroller.getBoundingClientRect()
  const thumbs = Array.from(scroller.querySelectorAll('.gallery-thumb'))
    .map((thumb) => {
      const rect = thumb.getBoundingClientRect()
      const overlap = Math.min(rect.right, scrollerRect.right) - Math.max(rect.left, scrollerRect.left)

      return { thumb, rect, overlap }
    })
    .filter(({ rect, overlap }) => overlap >= rect.width * 0.42)
    .sort((a, b) => a.rect.left - b.rect.left)

  const activeThumb = thumbs[Math.min(activeThumbnailSlot, thumbs.length - 1)]
  const realIndex = Number(activeThumb?.thumb.dataset.realIndex)

  if (Number.isInteger(realIndex) && realIndex !== activeIndex.value) {
    activeIndex.value = realIndex
  }
}

function scheduleActiveSceneFromCarousel() {
  if (activationAnimationId) return
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

  const diff = targetScrollLeft - scroller.scrollLeft
  scroller.scrollLeft += diff * dragEase
  normalizeCarouselLoop(true)
  dragAnimationId = requestAnimationFrame(animateDragScroll)
}

function startInertia() {
  const scroller = thumbnailScroller.value
  if (!scroller || Math.abs(dragVelocity) < minInertiaVelocity) {
    nextTick(() => alignActiveThumbnailToNearest(true))
    return
  }

  const step = () => {
    scroller.scrollLeft += dragVelocity * 18
    normalizeCarouselLoop()
    dragVelocity *= inertiaFriction

    if (Math.abs(dragVelocity) < minInertiaVelocity) {
      inertiaAnimationId = 0
      nextTick(() => alignActiveThumbnailToNearest(true))
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
  const elapsed = Math.max(8, now - lastPointerTime)

  if (Math.abs(distance) > minDragDistance) {
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
  if (!isDragging.value || !scroller) return

  if (event && dragPointerId !== null && event.pointerId !== dragPointerId) return

  isDragging.value = false
  stopDragAnimation()
  scroller.scrollLeft = targetScrollLeft
  normalizeCarouselLoop()

  if (dragPointerId !== null) {
    scroller.releasePointerCapture?.(dragPointerId)
  }

  dragPointerId = null

  if (dragMoved) {
    startInertia()
    window.setTimeout(() => {
      shouldSuppressClick.value = false
    }, 90)
  } else {
    nextTick(() => alignActiveThumbnailToNearest(true))
  }
}

function prevScene() {
  selectScene((activeIndex.value - 1 + scenes.length) % scenes.length)
}

function nextScene() {
  selectScene((activeIndex.value + 1) % scenes.length)
}

function handleWheel(event) {
  const scroller = thumbnailScroller.value
  if (!scroller) return

  const isHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.2
  if (!isHorizontalIntent || Math.abs(event.deltaX) < 1) return

  event.preventDefault()
  stopInertia()
  stopDragAnimation()

  scroller.scrollLeft += event.deltaX * wheelStrength
  normalizeCarouselLoop()
  scheduleActiveSceneFromCarousel()
}

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      activeIndex.value = 0
      // 直接对齐到 loopIndex=0 的 #001，由于有5套数据，左侧自然会露出 #012(-1)、#011(-1)
      alignActiveThumbnailToCurrentLoop(false)

      const scroller = thumbnailScroller.value
      if (scroller) {
        scroller.addEventListener('wheel', handleWheel, { passive: false })
      }
    })
  })

  window.addEventListener('resize', scheduleActiveSceneFromCarousel)
})

onUnmounted(() => {
  stopDragAnimation()
  stopInertia()
  window.removeEventListener('resize', scheduleActiveSceneFromCarousel)

  const scroller = thumbnailScroller.value
  if (scroller) {
    scroller.removeEventListener('wheel', handleWheel)
  }

  if (activationAnimationId) {
    cancelAnimationFrame(activationAnimationId)
  }
})
</script>

<style scoped>
.scene-carousel {
  --thumb-width: clamp(260px, 17.5vw, 360px);
  --carousel-side-space: clamp(24px, 6vw, 96px);

  cursor: grab;

  /* 修复点：
     不再用半屏 padding，所以不会出现第一张前面空一大截；
     但 JS 初始化仍然会对齐到真实循环组的 #003，
     因此 #001 前面继续往左拖可以接上 #012。 */
  padding-left: var(--carousel-side-space);
  padding-right: var(--carousel-side-space);
  scroll-padding-inline: var(--carousel-side-space);

  scroll-snap-type: x proximity;
  scroll-behavior: auto;
  user-select: none;
  overscroll-behavior-x: contain;
  touch-action: pan-y;
  will-change: scroll-position;
}

.gallery-thumb {
  width: var(--thumb-width);
  scroll-snap-align: start;
  transition:
    transform 0.42s ease,
    opacity 0.32s ease,
    filter 0.32s ease;
}

.gallery-thumb.is-active {
  transform: translateY(-8px);
}

.gallery-thumb:not(.is-active) {
  opacity: 0.9;
}

.gallery-thumb-image {
  position: relative;
  aspect-ratio: 16 / 9;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.06),
    0 14px 34px rgba(15, 23, 42, 0.06);
  transition:
    box-shadow 0.35s ease,
    transform 0.35s ease,
    filter 0.35s ease;
}

.gallery-thumb.is-active .gallery-thumb-image {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 20px 44px rgba(97, 207, 255, 0.18);
  filter: saturate(1.05);
}

.gallery-thumb:hover .gallery-thumb-image {
  transform: translateY(-2px);
}

.scene-main-image {
  animation: scene-main-fade 0.42s ease both;
}

@keyframes scene-main-fade {
  from {
    opacity: 0.72;
    transform: scale(1.018);
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
  border-color: #cbd5e1;
  transition:
    border-color 0.24s ease,
    transform 0.24s ease;
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
  scroll-snap-type: none;
}

.scene-carousel.is-dragging .gallery-thumb {
  transition: none;
}

.scene-carousel.is-dragging button {
  pointer-events: none;
}

section.relative.mt-8 > .absolute.right-16 {
  display: none;
}

@media (max-width: 768px) {
  .scene-carousel {
    --thumb-width: min(72vw, 310px);
    --carousel-side-space: clamp(18px, 5vw, 36px);
  }
}
</style>