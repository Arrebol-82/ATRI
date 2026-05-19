<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

const videoSrc = '/videos/story.mp4'
const charImageStory1 = '/images/story2.png'
const charImageStory2 = '/images/story1.png'

const storySection = ref(null)
const storyVideo = ref(null)

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)

const storyTranslations = {
  zh: {
    'story.video.unsupported': '您的浏览器不支持 HTML5 视频。',
    'story.vertical.left': '欢迎来到 SHIPPO CAFE',
    'story.vertical.right': '我最喜欢的兽耳 ADV.',
    'story.image.topAlt': '右上角角色',
    'story.image.bottomAlt': '左下角角色',
    'story.title': '故事',
    'story.paragraph.1.line1': '季节为秋。',
    'story.paragraph.1.line2': '在那树叶开始发黄的时节，少年来到了夕渚镇。',
    'story.paragraph.2': '少年最初遇到的，是一位独自发传单的可爱猫耳女仆。',
    'story.quote.1': '"Setaria"咖、咖啡馆。请多指教',
    'story.paragraph.3.line1': '走进女仆带我走进的咖啡馆后，那里有着同样带着兽耳的女孩',
    'story.paragraph.3.line2': '面对一脸不解的少年，女孩们疑惑地向他如此问道。',
    'story.quote.2.before': '莫非，您看得见我们的',
    'story.quote.2.highlight': '耳朵',
    'story.quote.2.after': '吗……？',
    'story.paragraph.4.line1': '她们说明到她们其实属于名为兽人的种族，耳朵和尾巴一般的人类是无法看到的。',
    'story.paragraph.4.line2': '然后得知了秘密的少年，与同伴们开始在咖啡店一起打工了。',
    'story.paragraph.5': '少年在对人类与兽人的区别感到吃惊的同时，今天也要和兽耳娘们一同努力工作。'
  },

  en: {
    'story.video.unsupported': 'Your browser does not support HTML5 video.',
    'story.vertical.left': 'Welcome to SHIPPO CAFE',
    'story.vertical.right': 'My Favorite KEMOMIMI ADV.',
    'story.image.topAlt': 'Character on the upper right',
    'story.image.bottomAlt': 'Character on the lower left',
    'story.title': 'STORY',
    'story.paragraph.1.line1': 'The season is autumn.',
    'story.paragraph.1.line2': 'As the leaves began to turn yellow, a boy arrived in Yunagisa Town.',
    'story.paragraph.2': 'The first person he met was a cute cat-eared maid handing out flyers alone.',
    'story.quote.1': '"Setaria" Ca-Cafe. Nice to meet you.',
    'story.paragraph.3.line1': 'After following the maid into the cafe, he found girls there with animal ears just like hers.',
    'story.paragraph.3.line2': 'Seeing the confused look on his face, the girls asked him in surprise.',
    'story.quote.2.before': 'Could it be that you can see our',
    'story.quote.2.highlight': 'ears',
    'story.quote.2.after': '...?',
    'story.paragraph.4.line1': 'They explained that they were actually a race known as beastfolk, and that ordinary humans could not see their ears or tails.',
    'story.paragraph.4.line2': 'After learning their secret, the boy began working together with them at the cafe.',
    'story.paragraph.5': 'While still surprised by the differences between humans and beastfolk, the boy works hard again today with the animal-eared girls.'
  },

  ja: {
    'story.video.unsupported': 'お使いのブラウザは HTML5 動画に対応していません。',
    'story.vertical.left': 'SHIPPO CAFEへようこそ',
    'story.vertical.right': 'お気に入りのケモミミADV.',
    'story.image.topAlt': '右上のキャラクター',
    'story.image.bottomAlt': '左下のキャラクター',
    'story.title': 'ストーリー',
    'story.paragraph.1.line1': '季節は秋。',
    'story.paragraph.1.line2': '木々の葉が色づき始めるころ、少年は夕渚町へやって来た。',
    'story.paragraph.2': '少年が最初に出会ったのは、ひとりでチラシを配っていた可愛い猫耳のメイドだった。',
    'story.quote.1': '「Setaria」カ、カフェです。よろしくお願いします',
    'story.paragraph.3.line1': 'メイドに案内されてカフェへ入ると、そこには同じように獣耳を持つ少女たちがいた。',
    'story.paragraph.3.line2': '戸惑う少年の顔を見て、少女たちは不思議そうにこう尋ねた。',
    'story.quote.2.before': 'もしかして、私たちの',
    'story.quote.2.highlight': '耳',
    'story.quote.2.after': 'が見えているのですか……？',
    'story.paragraph.4.line1': '彼女たちは、自分たちが獣人と呼ばれる種族であり、普通の人間には耳や尻尾が見えないのだと説明した。',
    'story.paragraph.4.line2': '秘密を知った少年は、仲間たちと一緒にカフェで働き始めることになる。',
    'story.paragraph.5': '人間と獣人の違いに驚きながらも、少年は今日も獣耳の少女たちと一緒に頑張って働いていく。'
  }
}

let videoObserver

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value

  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function t(key) {
  const language = currentLanguage.value

  return (
    storyTranslations[language]?.[key] ||
    storyTranslations[DEFAULT_LANGUAGE]?.[key] ||
    key
  )
}

function getSavedLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function handleLanguageChange(event) {
  localLanguage.value = normalizeLanguage(event.detail?.language)
}

function playStoryVideo() {
  const video = storyVideo.value
  if (!video) return

  video.muted = true
  video.load()
  video.play().catch(() => {})
}

onMounted(() => {
  localLanguage.value = getSavedLanguage()

  if (typeof window !== 'undefined') {
    window.addEventListener('atri-language-change', handleLanguageChange)
  }

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

  if (typeof window !== 'undefined') {
    window.removeEventListener('atri-language-change', handleLanguageChange)
  }
})
</script>

<template>
  <section ref="storySection" class="story-container relative h-screen w-full overflow-hidden antialiased">
    <video
      ref="storyVideo"
      loop
      muted
      playsinline
      preload="metadata"
      class="absolute inset-0 z-0 h-full w-full object-cover"
    >
      <source :src="videoSrc" type="video/mp4">
      {{ t('story.video.unsupported') }}
    </video>

    <div class="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px]"></div>

    <div class="vertical-text-left absolute left-6 top-1/2 z-20 -translate-y-1/2 font-sans text-[10px] uppercase tracking-widest text-gray-500">
      {{ t('story.vertical.left') }}
    </div>

    <div class="vertical-text-right absolute right-6 top-1/2 z-20 -translate-y-1/2 font-sans text-[10px] uppercase tracking-widest text-gray-500">
      {{ t('story.vertical.right') }}
    </div>

    <div class="pointer-events-none absolute right-[15%] top-[8%] z-20 lg:right-[25%]">
      <div class="relative">
        <img
          :src="charImageStory1"
          :alt="t('story.image.topAlt')"
          class="h-40 w-40 object-contain md:h-52 md:w-52"
          decoding="async"
          loading="lazy"
        >
      </div>
    </div>

    <div class="pointer-events-none absolute bottom-0 left-[5%] z-20 lg:left-[10%]">
      <img
        :src="charImageStory2"
        :alt="t('story.image.bottomAlt')"
        class="w-[295px] object-contain"
        decoding="async"
        loading="lazy"
      >
    </div>

    <section class="relative z-20 flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4">
      <h1 class="title-spacing mb-12 text-3xl text-[#3b3432] md:text-[2.5rem]">
        {{ t('story.title') }}
      </h1>

      <div class="max-w-2xl space-y-8 text-center text-[13px] font-[300] leading-[2.2] text-[#000] md:text-[15px]">
        <p>
          {{ t('story.paragraph.1.line1') }}<br>
          {{ t('story.paragraph.1.line2') }}
        </p>

        <p>
          {{ t('story.paragraph.2') }}
        </p>

        <div class="corner-quote">
          {{ t('story.quote.1') }}
        </div>

        <p>
          {{ t('story.paragraph.3.line1') }}<br>
          {{ t('story.paragraph.3.line2') }}
        </p>

        <div class="corner-quote">
          {{ t('story.quote.2.before') }}<span class="mx-[2px] font-medium text-[#f190a1]">{{ t('story.quote.2.highlight') }}</span>{{ t('story.quote.2.after') }}
        </div>

        <p>
          {{ t('story.paragraph.4.line1') }}<br>
          {{ t('story.paragraph.4.line2') }}
        </p>

        <p>
          {{ t('story.paragraph.5') }}
        </p>
      </div>
    </section>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap');

.story-container {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  color: #5c5553;
  background-color: #fcfbfb;
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
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
