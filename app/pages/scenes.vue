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

    <!-- 右上角菜单 -->
    <button class="absolute right-8 top-8 z-30 flex flex-col items-end gap-1">
      <span class="block h-[2px] w-9 bg-black"></span>
      <span class="block h-[2px] w-9 bg-black"></span>
      <span class="block h-[2px] w-9 bg-black"></span>
      <span class="mt-1 text-[10px] tracking-[0.35em]">MENU</span>
    </button>

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
        <p class="mt-3 text-xl tracking-[0.35em]">ギャラリー</p>
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

        <div
          ref="thumbnailScroller"
          class="scene-carousel flex gap-7 overflow-x-auto pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          :class="{ 'is-dragging': isDragging }"
          @pointerdown="startThumbnailDrag"
          @pointerleave="stopThumbnailDrag"
          @pointermove="moveThumbnailDrag"
          @pointerup="stopThumbnailDrag"
        >
          <button
            v-for="(scene, index) in scenes"
            :key="scene.id"
            class="group relative shrink-0"
            @click="handleSceneClick(index)"
          >
            <!-- 四角框线 -->
            <span class="absolute -left-3 -top-3 h-4 w-4 border-l-2 border-t-2" :class="activeIndex === index ? 'border-cyan-300' : 'border-gray-300'"></span>
            <span class="absolute -right-3 -top-3 h-4 w-4 border-r-2 border-t-2" :class="activeIndex === index ? 'border-cyan-300' : 'border-gray-300'"></span>
            <span class="absolute -bottom-3 -left-3 h-4 w-4 border-b-2 border-l-2" :class="activeIndex === index ? 'border-cyan-300' : 'border-gray-300'"></span>
            <span class="absolute -bottom-3 -right-3 h-4 w-4 border-b-2 border-r-2" :class="activeIndex === index ? 'border-cyan-300' : 'border-gray-300'"></span>

            <!-- 缩略图占位 -->
            <div class="h-[112px] w-[260px] overflow-hidden bg-white shadow-sm transition duration-300 group-hover:scale-[1.02]">
              <div class="relative h-full w-full" :class="scene.thumbClass">
                <div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.15),transparent_45%,rgba(255,255,255,.35))]"></div>
                <div class="absolute bottom-3 left-4 h-8 w-28 rounded-full bg-white/30 blur-md"></div>
                <div class="absolute right-4 top-4 text-[10px] tracking-[0.35em] text-white/80">FILE {{ scene.id }}</div>
              </div>
            </div>

            <div
              class="mx-auto mt-2 h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent"
              :class="activeIndex === index ? 'border-b-cyan-400' : 'border-b-gray-300'"
            ></div>
          </button>
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
import { computed, ref } from 'vue'

const activeIndex = ref(2)
const thumbnailScroller = ref(null)
const isDragging = ref(false)
const shouldSuppressClick = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let dragMoved = false

const scenes = [
  {
    id: '001',
    description:
      '白い霧を抜けて、登り切った先に「それ」はある。\nどこまでも続きそうな、一面の花畑。\n色とりどりの花々が鼻腔をくすぐる、とても綺麗な花畑。\n——そこにはいつも、君がいた。',
    thumbClass: 'bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-300',
    mainClass: 'bg-gradient-to-br from-cyan-50 via-white to-pink-100',
  },
  {
    id: '002',
    description:
      '懐かしい駅前通りに、夏の光が差し込んでいる。\n見慣れたはずの景色なのに、少しだけ違って見えた。\nその違和感が、物語の始まりだった。',
    thumbClass: 'bg-gradient-to-br from-sky-300 via-emerald-200 to-yellow-100',
    mainClass: 'bg-gradient-to-br from-sky-100 via-emerald-50 to-yellow-100',
  },
  {
    id: '003',
    description:
      '透明な街の中を、光の線が走っていく。\n現実と仮想が重なり合う場所で、失くした記憶の断片が静かに浮かび上がった。',
    thumbClass: 'bg-gradient-to-br from-cyan-200 via-white to-blue-500',
    mainClass: 'bg-gradient-to-br from-cyan-100 via-white to-blue-200',
  },
  {
    id: '004',
    description:
      '風に舞う花びらの中で、少女は空を見上げていた。\n柔らかな光に包まれたその表情は、どこか遠い約束を思い出しているようだった。',
    thumbClass: 'bg-gradient-to-br from-white via-pink-100 to-cyan-100',
    mainClass: 'bg-gradient-to-br from-white via-pink-50 to-cyan-100',
  },
  {
    id: '005',
    description:
      '移動する車窓の向こうで、街の輪郭がゆっくり流れていく。\n静かな会話と沈黙の間に、少しずつ距離が縮まっていった。',
    thumbClass: 'bg-gradient-to-br from-slate-300 via-blue-100 to-indigo-300',
    mainClass: 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100',
  },
  {
    id: '006',
    description:
      '夜の闇を切り裂くように、赤い光が走った。\nその一瞬だけ、誰も知らない真実が照らし出される。',
    thumbClass: 'bg-gradient-to-br from-slate-950 via-indigo-900 to-pink-500',
    mainClass: 'bg-gradient-to-br from-slate-900 via-indigo-800 to-pink-400',
  },
]

const activeScene = computed(() => scenes[activeIndex.value])

function selectScene(index) {
  activeIndex.value = index
}

function handleSceneClick(index) {
  if (shouldSuppressClick.value) return

  selectScene(index)
}

function startThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!scroller) return

  isDragging.value = true
  dragMoved = false
  shouldSuppressClick.value = false
  dragStartX = event.clientX
  dragStartScrollLeft = scroller.scrollLeft
  scroller.setPointerCapture?.(event.pointerId)
}

function moveThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!isDragging.value || !scroller) return

  const distance = event.clientX - dragStartX

  if (Math.abs(distance) > 6) {
    dragMoved = true
    shouldSuppressClick.value = true
  }

  scroller.scrollLeft = dragStartScrollLeft - distance
}

function stopThumbnailDrag(event) {
  const scroller = thumbnailScroller.value
  if (!isDragging.value) return

  isDragging.value = false
  scroller?.releasePointerCapture?.(event.pointerId)

  if (dragMoved) {
    window.setTimeout(() => {
      shouldSuppressClick.value = false
    }, 0)
  }
}

function prevScene() {
  selectScene((activeIndex.value - 1 + scenes.length) % scenes.length)
}

function nextScene() {
  selectScene((activeIndex.value + 1) % scenes.length)
}
</script>

<style scoped>
.scene-carousel {
  cursor: grab;
  user-select: none;
  mask-image: linear-gradient(90deg, transparent 0, #000 42px, #000 calc(100% - 42px), transparent 100%);
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}

.scene-carousel.is-dragging {
  cursor: grabbing;
}

.scene-carousel.is-dragging button {
  pointer-events: none;
}

section.relative.mt-8 > .absolute.right-16 {
  display: none;
}
</style>
