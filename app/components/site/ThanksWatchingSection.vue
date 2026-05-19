<template>
  <section
    ref="sectionRef"
    class="thanks-watching-section"
    :class="{
      'is-visible': isVisible,
      'is-echo': isEcho
    }"
  >
    <div class="ending-stars" aria-hidden="true">
      <span
        v-for="star in stars"
        :key="star.id"
        class="ending-star"
        :style="{
          '--x': `${star.x}%`,
          '--y': `${star.y}%`,
          '--size': `${star.size}px`,
          '--delay': `${star.delay}ms`,
          '--duration': `${star.duration}ms`
        }"
      ></span>
    </div>

    <div class="thanks-inner">
      <div class="ending-line ending-line-top">
        <span></span>
        <i></i>
        <span></span>
      </div>

      <p class="ending-kicker">
        You've reached the end
      </p>

      <svg
        class="ending-title-svg"
        viewBox="0 0 3200 900"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Thank you for watching"
      >
        <defs>
          <linearGradient
            :id="fadeGradientId"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stop-color="white" stop-opacity="1" />
            <stop offset="68%" stop-color="white" stop-opacity="0.88" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
          </linearGradient>

          <linearGradient
            :id="sweepGradientId"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stop-color="white" stop-opacity="0" />
            <stop offset="45%" stop-color="white" stop-opacity="0.72" />
            <stop offset="68%" stop-color="#8bcfff" stop-opacity="0.3" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
          </linearGradient>

          <mask
            :id="titleMaskId"
            maskUnits="userSpaceOnUse"
            x="-500"
            y="-300"
            width="4200"
            height="1500"
          >
            <rect
              x="-500"
              y="-300"
              width="4200"
              height="1500"
              fill="black"
            />

            <rect
              :x="MASK_START_X"
              y="-300"
              :width="solidMaskWidth"
              height="1500"
              fill="white"
            />

            <rect
              :x="fadeMaskX"
              y="-300"
              :width="fadeMaskWidth"
              height="1500"
              :fill="`url(#${fadeGradientId})`"
            />
          </mask>
        </defs>

        <g :mask="`url(#${titleMaskId})`">
          <g class="title-text-pull-group">
            <text
              class="ending-title-text title-echo title-echo-two"
              x="1600"
              y="430"
              text-anchor="middle"
              dominant-baseline="middle"
              textLength="2550"
              lengthAdjust="spacingAndGlyphs"
            >
              Thank you for watching
            </text>

            <text
              class="ending-title-text title-echo title-echo-one"
              x="1600"
              y="430"
              text-anchor="middle"
              dominant-baseline="middle"
              textLength="2550"
              lengthAdjust="spacingAndGlyphs"
            >
              Thank you for watching
            </text>

            <text
              class="ending-title-text title-main"
              x="1600"
              y="430"
              text-anchor="middle"
              dominant-baseline="middle"
              textLength="2550"
              lengthAdjust="spacingAndGlyphs"
            >
              Thank you for watching
            </text>
          </g>

          <rect
            class="title-sweep"
            :x="sweepX"
            y="120"
            width="280"
            height="620"
            rx="140"
            :fill="`url(#${sweepGradientId})`"
            :opacity="sweepOpacity"
          />
        </g>
      </svg>

      <p class="ending-subtitle">
        Thanks for scrolling all the way here.
      </p>

      <button
        class="ending-goodbye"
        type="button"
        @click="openCredits"
      >
        Roll credits
      </button>

      <div class="ending-line ending-line-bottom">
        <span></span>
        <i></i>
        <span></span>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="isCreditsOpen"
      class="credits-overlay"
      :class="{ 'is-leaving': isCreditsLeaving }"
      :style="creditsOverlayStyle"
      @mousemove="handleCreditsMouseMove"
      @mouseleave="resetCreditsParallax"
    >
      <div
        class="credits-parallax-bg"
        :style="creditsParallaxStyle"
        aria-hidden="true"
      ></div>
      <div class="credits-vignette" aria-hidden="true"></div>

      <button
        class="credits-close"
        type="button"
        aria-label="Close ending credits"
        @click="startCloseCredits"
      >
        ×
      </button>

      <div ref="creditsScreenRef" class="credits-screen">
        <div class="credits-fade credits-fade-top" aria-hidden="true"></div>
        <div class="credits-fade credits-fade-bottom" aria-hidden="true"></div>

        <div class="credits-roll">
          <p class="credits-label">小小故事的终点</p>
          <h2 class="credits-title">再会啦</h2>
          <p class="credits-subtitle">感谢你看到这里</p>

          <div class="credits-group">
            <span>企划</span>
            <strong>Anna</strong>
          </div>

          <div class="credits-group">
            <span>画面设计</span>
            <strong>温柔海边的片尾</strong>
          </div>

          <div class="credits-group">
            <span>前端制作</span>
            <strong>Vue 3 · CSS Motion · Parallax</strong>
          </div>

          <div class="credits-group">
            <span>演出</span>
            <strong>光 · 留白 · 安静流动</strong>
          </div>

          <div class="credits-group">
            <span>Special Thanks</span>
            <strong>献给一直看到最后的你</strong>
          </div>

          <div ref="creditsFinalRef" class="credits-final">
            <span>下次再见</span>
            <small>Thank you for watching</small>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const sectionRef = ref(null)
const isVisible = ref(false)
const isEcho = ref(false)
const revealProgress = ref(0)

const isCreditsOpen = ref(false)
const isCreditsLeaving = ref(false)
const creditsScreenRef = ref(null)
const creditsFinalRef = ref(null)

const CREDITS_DURATION = 18000
const CREDITS_DELAY = 420
const CREDITS_EXIT_DURATION = 360

let observer = null
let animationFrame = null
let hasPlayed = false
let echoStarted = false
let previousBodyOverflow = ''
let creditsCloseTimer = null
let creditsExitTimer = null
let creditsWatchFrame = null

const parallaxX = ref(0)
const parallaxY = ref(0)

const uniqueId = Math.random().toString(36).slice(2)

const titleMaskId = `thanks-title-mask-${uniqueId}`
const fadeGradientId = `thanks-fade-gradient-${uniqueId}`
const sweepGradientId = `thanks-sweep-gradient-${uniqueId}`

const MASK_START_X = -420
const VIEWBOX_WIDTH = 3200
const SOFT_EDGE = 360
const REVEAL_DISTANCE = VIEWBOX_WIDTH + SOFT_EDGE + 840

const TEXT_RIGHT_X = 1600 + 2550 / 2

const ECHO_TRIGGER_VISUAL_PROGRESS =
  (TEXT_RIGHT_X + SOFT_EDGE - MASK_START_X) / REVEAL_DISTANCE

const stars = [
  { id: 1, x: 9, y: 72, size: 3, delay: 200, duration: 5400 },
  { id: 2, x: 18, y: 58, size: 4, delay: 800, duration: 6000 },
  { id: 3, x: 27, y: 80, size: 3, delay: 1300, duration: 6200 },
  { id: 4, x: 39, y: 64, size: 4, delay: 500, duration: 5600 },
  { id: 5, x: 51, y: 76, size: 3, delay: 1000, duration: 5900 },
  { id: 6, x: 64, y: 62, size: 4, delay: 1500, duration: 6400 },
  { id: 7, x: 76, y: 78, size: 3, delay: 700, duration: 5700 },
  { id: 8, x: 89, y: 68, size: 4, delay: 1200, duration: 6100 }
]

const revealPosition = computed(() => {
  return MASK_START_X + REVEAL_DISTANCE * revealProgress.value
})

const solidMaskWidth = computed(() => {
  return Math.max(0, revealPosition.value - MASK_START_X - SOFT_EDGE)
})

const fadeMaskX = computed(() => {
  return MASK_START_X + solidMaskWidth.value
})

const fadeMaskWidth = computed(() => {
  return Math.max(0, Math.min(SOFT_EDGE, revealPosition.value - MASK_START_X))
})

const sweepX = computed(() => {
  return revealPosition.value - SOFT_EDGE * 0.65
})

const sweepOpacity = computed(() => {
  const progress = revealProgress.value

  if (progress <= 0.02 || progress >= 0.98) {
    return 0
  }

  if (progress < 0.18) {
    return progress / 0.18
  }

  if (progress > 0.82) {
    return (1 - progress) / 0.18
  }

  return 0.7
})

const creditsParallaxStyle = computed(() => {
  return {
    transform: `translate3d(${parallaxX.value}px, ${parallaxY.value}px, 0) scale(1.08)`
  }
})

const creditsOverlayStyle = computed(() => {
  return {
    '--credits-duration': `${CREDITS_DURATION}ms`,
    '--credits-delay': `${CREDITS_DELAY}ms`
  }
})

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function startEchoImmediately() {
  if (echoStarted) return

  echoStarted = true
  revealProgress.value = 1
  isEcho.value = true
}

function clearCreditsTimers() {
  if (creditsCloseTimer) {
    clearTimeout(creditsCloseTimer)
    creditsCloseTimer = null
  }

  if (creditsExitTimer) {
    clearTimeout(creditsExitTimer)
    creditsExitTimer = null
  }

  if (creditsWatchFrame) {
    cancelAnimationFrame(creditsWatchFrame)
    creditsWatchFrame = null
  }
}

function handleCreditsMouseMove(event) {
  const width = window.innerWidth || 1
  const height = window.innerHeight || 1

  const x = event.clientX / width - 0.5
  const y = event.clientY / height - 0.5

  parallaxX.value = -x * 26
  parallaxY.value = -y * 26
}

function resetCreditsParallax() {
  parallaxX.value = 0
  parallaxY.value = 0
}

function watchCreditsFinish() {
  if (!isCreditsOpen.value || isCreditsLeaving.value) return

  const screenEl = creditsScreenRef.value
  const finalEl = creditsFinalRef.value

  if (screenEl && finalEl) {
    const screenRect = screenEl.getBoundingClientRect()
    const finalRect = finalEl.getBoundingClientRect()

    if (finalRect.bottom <= screenRect.top + 24) {
      startCloseCredits()
      return
    }
  }

  creditsWatchFrame = requestAnimationFrame(watchCreditsFinish)
}

async function openCredits() {
  clearCreditsTimers()
  resetCreditsParallax()

  if (!isCreditsOpen.value) {
    previousBodyOverflow = document.body.style.overflow
  }

  isCreditsLeaving.value = false
  isCreditsOpen.value = true
  document.body.style.overflow = 'hidden'

  await nextTick()

  creditsWatchFrame = requestAnimationFrame(watchCreditsFinish)

  creditsCloseTimer = window.setTimeout(() => {
    startCloseCredits()
  }, CREDITS_DURATION + CREDITS_DELAY + 1000)
}

function startCloseCredits() {
  if (!isCreditsOpen.value || isCreditsLeaving.value) return

  clearCreditsTimers()
  isCreditsLeaving.value = true

  creditsExitTimer = window.setTimeout(() => {
    closeCredits()
  }, CREDITS_EXIT_DURATION)
}

function closeCredits() {
  clearCreditsTimers()
  resetCreditsParallax()
  isCreditsOpen.value = false
  isCreditsLeaving.value = false
  document.body.style.overflow = previousBodyOverflow
}

function handleCreditsKeydown(event) {
  if (event.key === 'Escape' && isCreditsOpen.value) {
    startCloseCredits()
  }
}

function playReveal() {
  if (hasPlayed) return

  hasPlayed = true
  isVisible.value = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealProgress.value = 1
    isEcho.value = true
    return
  }

  const delay = 420
  const duration = 2800
  const startTime = performance.now() + delay

  function animate(now) {
    const rawProgress = Math.min(Math.max((now - startTime) / duration, 0), 1)
    const visualProgress = easeInOutCubic(rawProgress)

    if (visualProgress >= ECHO_TRIGGER_VISUAL_PROGRESS) {
      startEchoImmediately()
      return
    }

    revealProgress.value = visualProgress
    animationFrame = requestAnimationFrame(animate)
  }

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  window.addEventListener('keydown', handleCreditsKeydown)

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playReveal()

          if (observer && sectionRef.value) {
            observer.unobserve(sectionRef.value)
          }
        }
      })
    },
    {
      threshold: 0.48,
      rootMargin: '0px 0px -18% 0px'
    }
  )

  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

onBeforeUnmount(() => {
  clearCreditsTimers()
  window.removeEventListener('keydown', handleCreditsKeydown)
  document.body.style.overflow = previousBodyOverflow

  if (observer) {
    observer.disconnect()
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@400;500;600;700&family=Zen+Old+Mincho:wght@400;500;600;700&display=swap');

.thanks-watching-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 760px;
  padding: 80px 24px;
  overflow: visible;
  box-sizing: border-box;
  isolation: isolate;
  background: transparent;
}

.ending-stars {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ending-star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  background: rgba(82, 160, 220, 0.2);
  opacity: 0;
  transform: translate3d(0, 18px, 0) scale(0.72);
  box-shadow: none;
}

.thanks-watching-section.is-visible .ending-star {
  animation: starFloat var(--duration) ease-in-out var(--delay) infinite;
}

.thanks-inner {
  position: relative;
  z-index: 2;
  width: min(100%, 1800px);
  margin: 0 auto;
  text-align: center;
  overflow: visible;
}

.ending-kicker {
  margin: 0 0 6px;
  font-family: "Inter", sans-serif;
  font-size: clamp(12px, 1.35vw, 16px);
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(42, 126, 185, 0.68);
  opacity: 0;
  transform: translateY(16px);
}

.ending-title-svg {
  display: block;
  width: min(100vw, 1800px);
  height: auto;
  margin: -20px auto 0;
  overflow: visible;
  opacity: 0;
  transform: translateY(24px);
}

.ending-title-text {
  font-family: "Great Vibes", cursive;
  font-size: 310px;
  font-weight: 400;
  letter-spacing: 0.01em;
  paint-order: stroke fill;
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: center center;
}

.title-text-pull-group {
  transform-box: view-box;
  transform-origin: center center;
}

.title-main {
  fill: rgba(48, 145, 215, 0.95);
  stroke: rgba(255, 255, 255, 0.3);
}

.title-echo {
  opacity: 0;
  pointer-events: none;
}

.title-echo-one {
  fill: rgba(48, 145, 215, 0.38);
  stroke: rgba(255, 255, 255, 0.18);
}

.title-echo-two {
  fill: rgba(48, 145, 215, 0.24);
  stroke: rgba(255, 255, 255, 0.12);
}

.title-sweep {
  pointer-events: none;
  mix-blend-mode: screen;
}

.thanks-watching-section.is-echo .title-text-pull-group {
  animation: wholeTitleElasticPull 1380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.thanks-watching-section.is-echo .title-echo-one {
  animation: echoOneElasticStay 1380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.thanks-watching-section.is-echo .title-echo-two {
  animation: echoTwoElasticStay 1460ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.ending-subtitle {
  margin: 8px 0 0;
  font-family: "Inter", sans-serif;
  font-size: clamp(15px, 1.55vw, 21px);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(49, 112, 160, 0.66);
  opacity: 0;
  transform: translateY(18px);
}

.ending-goodbye {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 26px;
  padding: 12px 22px;
  border: 1px solid rgba(89, 166, 221, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.38);
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: clamp(13px, 1.3vw, 16px);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(44, 127, 184, 0.72);
  box-shadow: 0 14px 32px rgba(76, 154, 210, 0.08);
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  transition:
    border-color 260ms ease,
    background 260ms ease,
    box-shadow 260ms ease,
    color 260ms ease,
    transform 260ms ease;
}

.ending-goodbye:hover {
  border-color: rgba(89, 166, 221, 0.46);
  background: rgba(255, 255, 255, 0.62);
  color: rgba(34, 118, 180, 0.9);
  box-shadow:
    0 18px 40px rgba(76, 154, 210, 0.13),
    0 0 28px rgba(126, 203, 255, 0.22);
}

.ending-goodbye:focus-visible {
  outline: 3px solid rgba(89, 166, 221, 0.34);
  outline-offset: 4px;
}

.goodbye-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(92, 181, 239, 0.72);
}

.ending-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: min(72%, 760px);
  margin-left: auto;
  margin-right: auto;
  opacity: 0;
}

.ending-line span {
  display: block;
  height: 1px;
  flex: 1;
  background: linear-gradient(
    90deg,
    rgba(75, 166, 226, 0),
    rgba(75, 166, 226, 0.44),
    rgba(75, 166, 226, 0)
  );
  transform: scaleX(0);
}

.ending-line i {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(75, 166, 226, 0.6);
  box-shadow: 0 0 14px rgba(75, 166, 226, 0.3);
  transform: scale(0);
}

.ending-line-top {
  margin-bottom: 10px;
}

.ending-line-bottom {
  margin-top: 38px;
}

.thanks-watching-section.is-visible .ending-kicker {
  animation: textRise 760ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both;
}

.thanks-watching-section.is-visible .ending-title-svg {
  animation: titleEnter 800ms cubic-bezier(0.16, 1, 0.3, 1) 360ms both;
}

.thanks-watching-section.is-visible .ending-line {
  animation: lineFade 860ms ease 260ms both;
}

.thanks-watching-section.is-visible .ending-line span {
  animation: lineGrow 1200ms cubic-bezier(0.16, 1, 0.3, 1) 360ms both;
}

.thanks-watching-section.is-visible .ending-line i {
  animation: dotAppear 700ms cubic-bezier(0.16, 1, 0.3, 1) 820ms both;
}

.thanks-watching-section.is-echo .ending-subtitle {
  animation: textRise 720ms cubic-bezier(0.16, 1, 0.3, 1) 320ms both;
}

.thanks-watching-section.is-echo .ending-goodbye {
  animation: goodbyeIn 820ms cubic-bezier(0.16, 1, 0.3, 1) 640ms both;
}

@keyframes titleEnter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wholeTitleElasticPull {
  0% {
    transform: translateX(0) scaleX(1) scaleY(1);
  }

  8% {
    transform: translateX(34px) scaleX(1.018) scaleY(0.996);
  }

  22% {
    transform: translateX(84px) scaleX(1.045) scaleY(0.988);
  }

  36% {
    transform: translateX(88px) scaleX(1.05) scaleY(0.986);
  }

  54% {
    transform: translateX(-20px) scaleX(0.984) scaleY(1.014);
  }

  70% {
    transform: translateX(12px) scaleX(1.01) scaleY(0.997);
  }

  84% {
    transform: translateX(-5px) scaleX(0.998) scaleY(1.003);
  }

  100% {
    transform: translateX(0) scaleX(1) scaleY(1);
  }
}

@keyframes echoOneElasticStay {
  0% {
    opacity: 0;
    transform: translateX(0) scaleX(1) scaleY(1);
  }

  8% {
    opacity: 0.32;
    transform: translateX(46px) scaleX(1.02) scaleY(0.996);
  }

  24% {
    opacity: 0.62;
    transform: translateX(108px) scaleX(1.05) scaleY(0.988);
  }

  38% {
    opacity: 0.64;
    transform: translateX(112px) scaleX(1.055) scaleY(0.986);
  }

  56% {
    opacity: 0.36;
    transform: translateX(24px) scaleX(0.99) scaleY(1.01);
  }

  72% {
    opacity: 0.5;
    transform: translateX(66px) scaleX(1.018) scaleY(0.997);
  }

  86% {
    opacity: 0.42;
    transform: translateX(42px) scaleX(1.006) scaleY(1.002);
  }

  100% {
    opacity: 0.38;
    transform: translateX(48px) scaleX(1.01) scaleY(1);
  }
}

@keyframes echoTwoElasticStay {
  0% {
    opacity: 0;
    transform: translateX(0) scaleX(1) scaleY(1);
  }

  10% {
    opacity: 0.24;
    transform: translateX(78px) scaleX(1.026) scaleY(0.994);
  }

  26% {
    opacity: 0.44;
    transform: translateX(166px) scaleX(1.065) scaleY(0.984);
  }

  40% {
    opacity: 0.46;
    transform: translateX(174px) scaleX(1.07) scaleY(0.982);
  }

  58% {
    opacity: 0.24;
    transform: translateX(56px) scaleX(0.995) scaleY(1.01);
  }

  74% {
    opacity: 0.34;
    transform: translateX(110px) scaleX(1.02) scaleY(0.997);
  }

  88% {
    opacity: 0.28;
    transform: translateX(80px) scaleX(1.008) scaleY(1.002);
  }

  100% {
    opacity: 0.24;
    transform: translateX(88px) scaleX(1.012) scaleY(1);
  }
}

@keyframes textRise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes goodbyeIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes lineFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes lineGrow {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes dotAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes starFloat {
  0% {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.72);
  }

  18% {
    opacity: 0.38;
  }

  52% {
    opacity: 0.24;
    transform: translate3d(8px, -34px, 0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate3d(-8px, -92px, 0) scale(0.82);
  }
}

.credits-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 18px;
  overflow: hidden;
  background: transparent;
  backdrop-filter: none;
  animation: creditsOverlayIn 520ms ease both;
}

.credits-overlay.is-leaving {
  pointer-events: none;
  animation: creditsOverlayOut 360ms ease both;
}

.credits-overlay.is-leaving .credits-screen {
  animation: creditsScreenOut 360ms ease both;
}

.credits-parallax-bg {
  position: absolute;
  inset: -4%;
  z-index: 0;
  background: url('/images/aaa.jpg') center / cover no-repeat;
  transform: translate3d(0, 0, 0) scale(1.08);
  transform-origin: center center;
  will-change: transform;
  transition: transform 220ms ease-out;
  pointer-events: none;
}

.credits-vignette {
  display: none;
}

.credits-close {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 4;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition:
    background 220ms ease,
    transform 220ms ease,
    border-color 220ms ease;
}

.credits-close:hover {
  border-color: rgba(255, 255, 255, 0.46);
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(8deg) scale(1.04);
}

.credits-screen {
  position: fixed;
  inset: 0;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  pointer-events: none;
}

.credits-fade {
  display: none;
}

.credits-fade-top,
.credits-fade-bottom {
  display: none;
}

.credits-roll {
  position: absolute;
  left: 50%;
  top: 100vh;
  bottom: auto;
  z-index: 3;
  width: min(660px, 86vw);
  text-align: center;
  color: rgba(255, 253, 248, 0.94);
  transform: translate3d(-50%, 0, 0);
  animation: creditsRoll var(--credits-duration, 18000ms) linear var(--credits-delay, 420ms) forwards;
  will-change: transform;
}

.credits-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 30px;
  padding: 8px 18px;
  border: 1px solid rgba(151, 221, 255, 0.46);
  border-radius: 999px;
  background: rgba(32, 88, 124, 0.24);
  backdrop-filter: blur(6px);
  font-family: "Noto Serif JP", serif;
  font-size: clamp(14px, 2vw, 20px);
  font-weight: 600;
  letter-spacing: 0.28em;
  color: rgba(173, 230, 255, 0.96);
  text-shadow:
    0 2px 5px rgba(14, 36, 54, 0.95),
    0 0 16px rgba(128, 214, 255, 0.46),
    0 0 28px rgba(87, 190, 255, 0.22);
}

.credits-title {
  margin: 0;
  font-family: "Zen Old Mincho", "Noto Serif JP", serif;
  font-size: clamp(68px, 10vw, 132px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: 0.12em;
  color: rgba(255, 250, 244, 0.98);
  text-shadow:
    0 3px 10px rgba(47, 37, 45, 0.62),
    0 12px 36px rgba(67, 45, 55, 0.42),
    0 0 28px rgba(255, 218, 226, 0.22);
}

.credits-subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0 130px;
  padding: 7px 16px;
  border: 1px solid rgba(151, 221, 255, 0.34);
  border-radius: 999px;
  background: rgba(32, 88, 124, 0.2);
  backdrop-filter: blur(5px);
  font-family: "Noto Serif JP", serif;
  font-size: clamp(14px, 2vw, 19px);
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgba(184, 234, 255, 0.94);
  text-shadow:
    0 2px 6px rgba(14, 36, 54, 0.9),
    0 0 16px rgba(128, 214, 255, 0.4),
    0 0 26px rgba(87, 190, 255, 0.18);
}

.credits-group {
  display: grid;
  gap: 16px;
  margin: 0 auto 96px;
}

.credits-group span {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 0 auto;
  padding: 6px 16px;
  border: 1px solid rgba(151, 221, 255, 0.36);
  border-radius: 999px;
  background: rgba(32, 88, 124, 0.22);
  backdrop-filter: blur(5px);
  font-family: "Noto Serif JP", serif;
  font-size: clamp(13px, 1.75vw, 17px);
  font-weight: 600;
  letter-spacing: 0.24em;
  color: rgba(174, 229, 255, 0.94);
  text-shadow:
    0 2px 6px rgba(14, 36, 54, 0.92),
    0 0 15px rgba(128, 214, 255, 0.42),
    0 0 24px rgba(87, 190, 255, 0.2);
}

.credits-group span::before,
.credits-group span::after {
  content: "";
  display: block;
  width: 42px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(152, 220, 255, 0),
    rgba(152, 220, 255, 0.78)
  );
}

.credits-group span::after {
  background: linear-gradient(
    90deg,
    rgba(152, 220, 255, 0.78),
    rgba(152, 220, 255, 0)
  );
}

.credits-group strong {
  font-family: "Zen Old Mincho", "Noto Serif JP", serif;
  font-size: clamp(23px, 4.2vw, 42px);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.08em;
  color: rgba(255, 253, 248, 0.94);
  text-shadow:
    0 3px 10px rgba(42, 34, 42, 0.68),
    0 10px 30px rgba(58, 42, 52, 0.42),
    0 0 22px rgba(255, 235, 232, 0.18);
}

.credits-final {
  display: grid;
  gap: 24px;
  margin: 138px 0 30vh;
}

.credits-final span {
  font-family: "Zen Old Mincho", "Noto Serif JP", serif;
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 500;
  line-height: 1.18;
  letter-spacing: 0.14em;
  color: rgba(255, 250, 244, 0.98);
  text-shadow:
    0 4px 12px rgba(42, 34, 42, 0.7),
    0 14px 38px rgba(58, 42, 52, 0.48),
    0 0 28px rgba(255, 222, 228, 0.22);
}

.credits-final small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 7px 18px;
  border: 1px solid rgba(151, 221, 255, 0.36);
  border-radius: 999px;
  background: rgba(32, 88, 124, 0.22);
  backdrop-filter: blur(5px);
  font-family: "Inter", sans-serif;
  font-size: clamp(12px, 1.6vw, 15px);
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(184, 234, 255, 0.92);
  text-shadow:
    0 2px 6px rgba(14, 36, 54, 0.92),
    0 0 15px rgba(128, 214, 255, 0.38),
    0 0 24px rgba(87, 190, 255, 0.16);
}

@keyframes creditsOverlayIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes creditsOverlayOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes creditsScreenOut {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

@keyframes creditsRoll {
  from {
    transform: translate3d(-50%, 0, 0);
  }

  to {
    transform: translate3d(-50%, calc(-100% - 100vh), 0);
  }
}

@media (max-width: 900px) {
  .ending-title-svg {
    width: 110vw;
  }

  .ending-line {
    width: min(86%, 760px);
  }
}

@media (max-width: 640px) {
  .thanks-watching-section {
    min-height: 620px;
    padding: 64px 18px;
  }

  .ending-title-svg {
    width: 120vw;
  }

  .ending-kicker {
    letter-spacing: 0.22em;
  }

  .credits-overlay {
    padding: 18px 12px;
  }

  .credits-close {
    top: 14px;
    right: 14px;
    width: 40px;
    height: 40px;
  }

  .credits-screen {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .credits-roll {
    width: min(560px, 88vw);
  }

  .credits-label {
    font-size: clamp(13px, 3.4vw, 16px);
    letter-spacing: 0.18em;
    padding: 7px 14px;
  }

  .credits-title {
    font-size: clamp(56px, 15vw, 88px);
    letter-spacing: 0.08em;
  }

  .credits-subtitle {
    margin-bottom: 96px;
    font-size: clamp(13px, 3.4vw, 16px);
    letter-spacing: 0.12em;
    padding: 7px 13px;
  }

  .credits-group {
    margin-bottom: 72px;
  }

  .credits-group span {
    font-size: clamp(12px, 3.2vw, 15px);
    letter-spacing: 0.16em;
    padding: 6px 13px;
  }

  .credits-group span::before,
  .credits-group span::after {
    width: 24px;
  }

  .credits-group strong {
    letter-spacing: 0.05em;
  }

  .credits-final small {
    font-size: 11px;
    letter-spacing: 0.18em;
  }
}

@media (max-width: 420px) {
  .thanks-watching-section {
    min-height: 540px;
    padding: 56px 14px;
  }

  .ending-title-svg {
    width: 128vw;
  }

  .ending-goodbye {
    padding: 10px 18px;
  }

  .credits-roll {
    width: min(500px, 90vw);
  }

  .credits-title {
    font-size: clamp(48px, 16vw, 72px);
    letter-spacing: 0.06em;
  }

  .credits-final span {
    font-size: clamp(38px, 12vw, 64px);
    letter-spacing: 0.08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ending-kicker,
  .ending-title-svg,
  .ending-title-text,
  .title-text-pull-group,
  .ending-subtitle,
  .ending-goodbye,
  .ending-line,
  .ending-line span,
  .ending-line i,
  .ending-star {
    animation: none !important;
    transition: none !important;
  }

  .thanks-watching-section .ending-kicker,
  .thanks-watching-section .ending-title-svg,
  .thanks-watching-section .ending-subtitle,
  .thanks-watching-section .ending-goodbye,
  .thanks-watching-section .ending-line {
    opacity: 1;
    transform: none;
  }

  .thanks-watching-section.is-echo .title-echo-one {
    opacity: 0.38;
    transform: translateX(48px) scaleX(1.01);
  }

  .thanks-watching-section.is-echo .title-echo-two {
    opacity: 0.24;
    transform: translateX(88px) scaleX(1.012);
  }

  .thanks-watching-section .ending-line span {
    transform: scaleX(1);
  }

  .thanks-watching-section .ending-line i {
    transform: scale(1);
  }

  .ending-star {
    display: none;
  }

  .credits-parallax-bg {
    transition: none !important;
    transform: translate3d(0, 0, 0) scale(1.04) !important;
  }
}
</style>
