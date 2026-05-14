<script setup>
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'

const eggImage = '/images/egg.png'

const lines = [
  '你发现我啦喵~',
  '欢迎来到隐藏区域。',
  '这里是新闻之后的小彩蛋。',
  '别急，慢慢往下看。',
  '今天也要继续前进。',
  '页面还没结束哦。',
  '要不要再往下看看？',
  '这个网站正在变得更有趣。',
  '蓝色的回忆正在闪闪发光。',
  '你能看到这些随机出现的文字吗？',
  '这里可以放你想写的角色台词。',
  '后面可以换成更有角色感的文案。',
  '这是一段属于看板娘的小空间。',
  '如果你看到这里，说明你真的认真逛了网站。',
  '隐藏彩蛋启动中……',
  '请保持好奇心。',
  '今天的风也很温柔。',
  '慢慢看，不用着急。',
  '我会一直在这里等你。',
  '欢迎回来。',
  '这里藏着一点点蓝色的小惊喜。',
  '如果觉得页面太安静，就让我来说几句话吧。',
  '继续探索吧，后面也许还有东西。',
  '这不是普通模块，是隐藏彩蛋喵。',
  '你已经解锁了看板娘区域。'
]

const activeTexts = ref([])

let showTimer = null
let nextTimer = null
let textId = 0
let isLoopRunning = false

const BATCH_COUNT = 5
const SHOW_TIME = 7000
const NEXT_GAP = 800

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function getBatchLines(count = BATCH_COUNT) {
  return shuffleArray(lines).slice(0, count)
}

function getRandomPosition(index) {
  const areas = [
    {
      left: [10, 30],
      top: [8, 24],
      rotate: [-7, 2]
    },
    {
      left: [34, 62],
      top: [4, 18],
      rotate: [-4, 4]
    },
    {
      left: [66, 90],
      top: [8, 26],
      rotate: [-2, 7]
    },
    {
      left: [6, 24],
      top: [34, 58],
      rotate: [-6, 3]
    },
    {
      left: [76, 96],
      top: [34, 62],
      rotate: [-3, 6]
    },
    {
      left: [14, 34],
      top: [68, 88],
      rotate: [-5, 5]
    },
    {
      left: [64, 88],
      top: [70, 90],
      rotate: [-5, 5]
    }
  ]

  const area = areas[index % areas.length]

  return {
    left: `${randomNumber(area.left[0], area.left[1])}%`,
    top: `${randomNumber(area.top[0], area.top[1])}%`,
    transform: `translate(-50%, -50%) rotate(${randomNumber(area.rotate[0], area.rotate[1])}deg)`,
    '--float-x': `${randomNumber(-12, 12)}px`,
    '--float-y': `${randomNumber(-28, -12)}px`,
    '--delay': `${index * 0.12}s`
  }
}

function clearTimers() {
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }

  if (nextTimer) {
    window.clearTimeout(nextTimer)
    nextTimer = null
  }
}

function clearTexts() {
  activeTexts.value = []
}

function createTextBatch() {
  if (!isLoopRunning) return

  clearTimers()

  // 每次生成新文字前，先清空旧文字，防止堆积和重叠
  clearTexts()

  const batchLines = getBatchLines()

  activeTexts.value = batchLines.map((text, index) => {
    textId += 1

    return {
      id: textId,
      text,
      style: getRandomPosition(index)
    }
  })

  showTimer = window.setTimeout(() => {
    // 当前这一批到时间后立刻消失
    clearTexts()

    if (!isLoopRunning) return

    // 停顿一下再出下一批
    nextTimer = window.setTimeout(() => {
      createTextBatch()
    }, NEXT_GAP)
  }, SHOW_TIME)
}

function startLoop() {
  if (isLoopRunning) return

  isLoopRunning = true
  clearTimers()
  clearTexts()

  nextTimer = window.setTimeout(() => {
    createTextBatch()
  }, 300)
}

function stopLoop() {
  isLoopRunning = false
  clearTimers()
  clearTexts()
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopLoop()
  } else {
    startLoop()
  }
}

onMounted(() => {
  startLoop()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onActivated(() => {
  startLoop()
})

onDeactivated(() => {
  stopLoop()
})

onBeforeUnmount(() => {
  stopLoop()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section class="mascot-easteregg-module">
    <div class="mascot-stage">
      <p
        v-for="item in activeTexts"
        :key="item.id"
        class="mascot-random-text"
        :style="item.style"
      >
        {{ item.text }}
      </p>

      <img
        :src="eggImage"
        alt="Mascot easter egg"
        class="mascot-image"
      >

      <div class="thanks-message">
        Thank you for watching
      </div>
    </div>
  </section>
</template>

<style scoped>
.mascot-easteregg-module {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 130vh;
  overflow: hidden;
  background: #fff;
}

.mascot-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(1400px, 100%);
  min-height: 1200px;
  overflow: visible;
}

.mascot-image {
  position: relative;
  z-index: 2;
  display: block;
  width: min(1200px, 96vw);
  max-height: none;
  object-fit: contain;
  user-select: none;
  filter: drop-shadow(0 38px 46px rgba(40, 105, 150, 0.24));
  animation: mascot-idle 5.2s ease-in-out infinite;
}

.thanks-message {
  position: absolute;
  left: 50%;
  bottom: -40px;
  z-index: 3;
  transform: translateX(-50%);

  color: rgba(76, 166, 225, 0.52);
  font-family: "Cormorant Garamond", "Times New Roman", serif;
  font-size: clamp(44px, 7vw, 118px);
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.12em;
  white-space: nowrap;

  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.95),
    0 0 22px rgba(118, 204, 255, 0.62),
    0 0 42px rgba(72, 174, 255, 0.38),
    0 10px 28px rgba(80, 150, 200, 0.22);

  opacity: 1;
  pointer-events: none;
  user-select: none;
}

.mascot-random-text {
  position: absolute;
  z-index: 4;
  max-width: 420px;
  margin: 0;
  padding: 0;

  color: #ffffff;
  font-size: clamp(22px, 2.4vw, 36px);
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: 0.06em;
  white-space: nowrap;

  -webkit-text-stroke: 1.2px rgba(38, 148, 220, 0.95);

  text-shadow:
    0 0 4px rgba(255, 255, 255, 1),
    0 0 10px rgba(108, 205, 255, 0.95),
    0 0 22px rgba(72, 174, 255, 0.82),
    0 0 38px rgba(72, 174, 255, 0.48),
    0 5px 12px rgba(20, 58, 86, 0.32);

  scale: 1;
  opacity: 1;
  filter: blur(0);

  animation:
    mascot-text-pop 1.05s cubic-bezier(0.16, 1, 0.3, 1) both,
    mascot-text-float 3.2s ease-in-out infinite,
    mascot-text-glow 2.6s ease-in-out infinite;

  animation-delay:
    var(--delay),
    var(--delay),
    var(--delay);

  pointer-events: none;
}

@keyframes mascot-text-pop {
  0% {
    opacity: 0;
    filter: blur(12px);
    scale: 0.72;
  }

  100% {
    opacity: 1;
    filter: blur(0);
    scale: 1;
  }
}

@keyframes mascot-idle {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes mascot-text-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: var(--float-x) var(--float-y);
  }
}

@keyframes mascot-text-glow {
  0%,
  100% {
    opacity: 0.92;
  }

  50% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .mascot-easteregg-module {
    min-height: 100vh;
  }

  .mascot-stage {
    min-height: 720px;
  }

  .mascot-image {
    width: min(620px, 98vw);
  }

  .thanks-message {
    bottom: -20px;
    font-size: clamp(32px, 10vw, 72px);
    letter-spacing: 0.08em;
  }

  .mascot-random-text {
    max-width: 260px;
    font-size: 18px;
    white-space: normal;
  }
}

@media (max-width: 520px) {
  .mascot-stage {
    min-height: 600px;
  }

  .mascot-image {
    width: min(460px, 100vw);
  }

  .thanks-message {
    bottom: -12px;
    font-size: clamp(28px, 11vw, 56px);
    letter-spacing: 0.06em;
  }

  .mascot-random-text {
    max-width: 210px;
    font-size: 16px;
  }
}
</style>