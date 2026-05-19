<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

const activeIndex = ref(0)
const atriAltImageVisible = ref(false)
const atriButtonSpinning = ref(false)

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)

const characterBaseList = [
  {
    id: 'atri',
    enName: 'ATRI',
    image: '/images/characters/ph_atri.png',
    altImage: '/images/characters/ph_atri_2.png',
    buttonImage: '/images/characters/annu.svg',
    thumb: 'from-cyan-100 via-white to-sky-300',
    imageClass: 'atri'
  },
  {
    id: 'catherine',
    enName: 'CATHERINE',
    image: '/images/characters/ph_catherine.png',
    thumb: 'from-violet-100 via-white to-slate-400',
    imageClass: 'catherine'
  },
  {
    id: 'minamo',
    enName: 'MINAMO KAMISHIRO',
    image: '/images/characters/ph_minamo.png',
    thumb: 'from-rose-100 via-white to-teal-200',
    imageClass: 'minamo'
  },
  {
    id: 'natsuki',
    enName: 'NATSUKI IKARUGA',
    image: '/images/characters/ph_natsuki.png',
    thumb: 'from-slate-100 via-white to-sky-200',
    imageClass: 'natsuki'
  },
  {
    id: 'ririka',
    enName: 'RIRIKA NANAMI',
    image: '/images/characters/ph_ririka.png',
    thumb: 'from-yellow-100 via-white to-sky-200',
    imageClass: 'ririka'
  },
  {
    id: 'ryuji',
    enName: 'RYUJI NOJIMA',
    image: '/images/characters/ph_ryuji.png',
    thumb: 'from-lime-100 via-white to-stone-300',
    imageClass: 'ryuji'
  }
]

const characterTranslations = {
  zh: {
    'characters.title': 'Character',
    'characters.subtitle': '人物鉴赏',
    'characters.nameLabel': 'Name',
    'characters.profileLabel': 'Profile',
    'characters.changeImage': 'CHANGE',
    'characters.next': 'NEXT',
    'characters.aria.view': '查看{character}',
    'characters.aria.changeAtriImage': '切换亚托利图片',

    'characters.atri.name': '亚托利',
    'characters.atri.cv': '赤尾光',
    'characters.atri.quote': '「我会成为夏生先生的腿！」',
    'characters.atri.profile': '海底打捞出的高性能仿生人少女。\n感情丰富，行动力惊人，自称是“高性能”的伙伴。',

    'characters.catherine.name': '凯瑟琳',
    'characters.catherine.cv': '日笠阳子',
    'characters.catherine.quote': '「别磨蹭了，想做就现在去做。」',
    'characters.catherine.profile': '在小镇上活动的可靠女性。\n爽快、强势，却也会在关键时刻照顾身边的人。',

    'characters.minamo.name': '神白水菜',
    'characters.minamo.cv': '高桥未奈美',
    'characters.minamo.quote': '「没关系，我们再试一次吧。」',
    'characters.minamo.profile': '夏生的儿时玩伴。\n温柔认真，总能用自己的方式支撑周围的人。',

    'characters.natsuki.name': '斑鸠夏生',
    'characters.natsuki.cv': '小野贤章',
    'characters.natsuki.quote': '「沉在海底的东西，也许还能被找回来。」',
    'characters.natsuki.profile': '因事故失去一条腿的少年。\n回到被海水吞没的故乡后，与亚托利相遇。',

    'characters.ririka.name': '名波凛凛花',
    'characters.ririka.cv': '春野杏',
    'characters.ririka.quote': '「看我的，马上就能搞定！」',
    'characters.ririka.profile': '活泼开朗的小学生。\n精力充沛，常常把安静的海边小镇搅得热闹起来。',

    'characters.ryuji.name': '野岛龙司',
    'characters.ryuji.cv': '细谷佳正',
    'characters.ryuji.quote': '「有困难就说，别一个人扛着。」',
    'characters.ryuji.profile': '夏生的朋友。\n看起来粗枝大叶，其实相当可靠，是能托付事情的人。'
  },

  en: {
    'characters.title': 'Character',
    'characters.subtitle': 'Character Gallery',
    'characters.nameLabel': 'Name',
    'characters.profileLabel': 'Profile',
    'characters.changeImage': 'CHANGE',
    'characters.next': 'NEXT',
    'characters.aria.view': 'View {character}',
    'characters.aria.changeAtriImage': 'Change Atri image',

    'characters.atri.name': 'Atri',
    'characters.atri.cv': 'Hikari Akao',
    'characters.atri.quote': '“I will become Natsuki-san’s legs!”',
    'characters.atri.profile': 'A high-performance humanoid girl salvaged from the bottom of the sea.\nShe is expressive, energetic, and proudly calls herself “high-performance.”',

    'characters.catherine.name': 'Catherine',
    'characters.catherine.cv': 'Yoko Hikasa',
    'characters.catherine.quote': '“Stop hesitating. If you want to do it, do it now.”',
    'characters.catherine.profile': 'A dependable woman active around the town.\nStraightforward and strong-willed, yet caring when it truly matters.',

    'characters.minamo.name': 'Minamo Kamishiro',
    'characters.minamo.cv': 'Minami Takahashi',
    'characters.minamo.quote': '“It’s okay. Let’s try again.”',
    'characters.minamo.profile': 'Natsuki’s childhood friend.\nGentle and sincere, she supports the people around her in her own quiet way.',

    'characters.natsuki.name': 'Natsuki Ikaruga',
    'characters.natsuki.cv': 'Kensho Ono',
    'characters.natsuki.quote': '“Things sunk beneath the sea might still be found again.”',
    'characters.natsuki.profile': 'A boy who lost one of his legs in an accident.\nAfter returning to his hometown swallowed by the sea, he meets Atri.',

    'characters.ririka.name': 'Ririka Nanami',
    'characters.ririka.cv': 'Anzu Haruno',
    'characters.ririka.quote': '“Watch me. I’ll get it done right away!”',
    'characters.ririka.profile': 'A cheerful and lively elementary school girl.\nFull of energy, she often brings excitement to the quiet seaside town.',

    'characters.ryuji.name': 'Ryuji Nojima',
    'characters.ryuji.cv': 'Yoshimasa Hosoya',
    'characters.ryuji.quote': '“If you’re in trouble, say so. Don’t carry it alone.”',
    'characters.ryuji.profile': 'Natsuki’s friend.\nHe may seem rough around the edges, but he is truly dependable and trustworthy.'
  },

  ja: {
    'characters.title': 'Character',
    'characters.subtitle': 'キャラクター鑑賞',
    'characters.nameLabel': 'Name',
    'characters.profileLabel': 'Profile',
    'characters.changeImage': 'CHANGE',
    'characters.next': 'NEXT',
    'characters.aria.view': '{character}を見る',
    'characters.aria.changeAtriImage': 'アトリの画像を切り替える',

    'characters.atri.name': 'アトリ',
    'characters.atri.cv': '赤尾ひかる',
    'characters.atri.quote': '「夏生さんの足になります！」',
    'characters.atri.profile': '海底から引き揚げられた高性能なヒューマノイドの少女。\n感情豊かで行動力があり、自らを「高性能」だと名乗る。',

    'characters.catherine.name': 'キャサリン',
    'characters.catherine.cv': '日笠陽子',
    'characters.catherine.quote': '「ぐずぐずしない。やりたいなら今すぐやりなさい。」',
    'characters.catherine.profile': '町で活動する頼れる女性。\nさっぱりとしていて強気だが、大事な場面では周囲を気にかける。',

    'characters.minamo.name': '神白水菜',
    'characters.minamo.cv': '髙橋ミナミ',
    'characters.minamo.quote': '「大丈夫、もう一度やってみよう。」',
    'characters.minamo.profile': '夏生の幼なじみ。\n優しく真面目で、自分なりの方法で周囲を支える存在。',

    'characters.natsuki.name': '斑鳩夏生',
    'characters.natsuki.cv': '小野賢章',
    'characters.natsuki.quote': '「海底に沈んだものだって、まだ取り戻せるかもしれない。」',
    'characters.natsuki.profile': '事故で片脚を失った少年。\n海に沈んだ故郷へ戻ったあと、アトリと出会う。',

    'characters.ririka.name': '名波凜々花',
    'characters.ririka.cv': '春野杏',
    'characters.ririka.quote': '「見てて、すぐにやっちゃうから！」',
    'characters.ririka.profile': '明るく元気な小学生。\nエネルギッシュで、静かな海辺の町をにぎやかにすることが多い。',

    'characters.ryuji.name': '野島竜司',
    'characters.ryuji.cv': '細谷佳正',
    'characters.ryuji.quote': '「困ったら言え。一人で抱え込むな。」',
    'characters.ryuji.profile': '夏生の友人。\n大ざっぱに見えるが実はかなり頼もしく、物事を任せられる人物。'
  }
}

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value
  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

const characters = computed(() => {
  return characterBaseList.map((character) => ({
    ...character,
    name: t(`characters.${character.id}.name`),
    cv: t(`characters.${character.id}.cv`),
    quote: t(`characters.${character.id}.quote`),
    profile: t(`characters.${character.id}.profile`)
  }))
})

const activeCharacter = computed(() => characters.value[activeIndex.value])

const activeCharacterImage = computed(() => {
  if (activeCharacter.value?.id === 'atri' && atriAltImageVisible.value) {
    return activeCharacter.value.altImage
  }

  return activeCharacter.value.image
})

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function formatMessage(message, params = {}) {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value)
  }, message)
}

function t(key, params = {}) {
  const language = currentLanguage.value
  const message =
    characterTranslations[language]?.[key] ||
    characterTranslations[DEFAULT_LANGUAGE]?.[key] ||
    key

  return formatMessage(message, params)
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

function selectCharacter(index) {
  activeIndex.value = index

  if (characters.value[index]?.id !== 'atri') {
    atriAltImageVisible.value = false
    atriButtonSpinning.value = false
  }
}

function nextCharacter() {
  const nextIndex = (activeIndex.value + 1) % characters.value.length
  activeIndex.value = nextIndex

  if (characters.value[nextIndex]?.id !== 'atri') {
    atriAltImageVisible.value = false
    atriButtonSpinning.value = false
  }
}

function toggleAtriImage() {
  if (activeCharacter.value?.id !== 'atri') return

  atriAltImageVisible.value = !atriAltImageVisible.value
  atriButtonSpinning.value = false

  requestAnimationFrame(() => {
    atriButtonSpinning.value = true
  })
}

function handleAtriButtonSpinEnd() {
  atriButtonSpinning.value = false
}

onMounted(() => {
  localLanguage.value = getSavedLanguage()

  if (typeof window !== 'undefined') {
    window.addEventListener('atri-language-change', handleLanguageChange)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('atri-language-change', handleLanguageChange)
  }
})
</script>

<template>
  <section class="character-lab relative min-h-screen overflow-hidden bg-transparent text-[#060b12]">
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-8 md:px-10 lg:px-16">
      <header class="grid gap-6 pt-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div class="flex items-center gap-5">
            <h2 class="font-mono text-[clamp(2.8rem,4.8vw,5rem)] font-black leading-none tracking-[0.44em] text-black">
              {{ t('characters.title') }}
            </h2>
            <span class="hidden h-px w-28 bg-[#69cdf7] lg:block" />
          </div>
          <p class="mt-4 font-sans text-xl font-bold tracking-[0.48em] md:text-2xl">
            {{ t('characters.subtitle') }}
          </p>
        </div>
      </header>

      <div class="relative z-20 mt-8 flex flex-wrap items-end gap-5 md:gap-7 lg:mt-10">
        <button
          v-for="(character, index) in characters"
          :key="character.enName"
          type="button"
          class="thumb-button group"
          :class="{ 'is-active': activeIndex === index }"
          :aria-label="t('characters.aria.view', { character: character.name })"
          @click="selectCharacter(index)"
        >
          <span class="thumb-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="thumb-corners" aria-hidden="true" />
          <span class="thumb-portrait bg-gradient-to-br" :class="character.thumb">
            <img
              :src="character.image"
              :alt="character.name"
              decoding="async"
              loading="lazy"
            >
          </span>
          <span class="thumb-pointer" aria-hidden="true" />
        </button>
      </div>

      <div class="relative grid flex-1 items-end gap-8 pb-12 pt-8 lg:grid-cols-[minmax(500px,1fr)_minmax(420px,620px)] lg:gap-14 lg:pb-16 lg:pt-0">
        <div class="relative min-h-[540px] lg:min-h-[690px]">
          <p class="quote-copy">
            {{ activeCharacter.quote }}
          </p>

          <div class="character-stand" aria-hidden="true">
            <Transition name="character-switch" mode="out-in">
              <img
                :key="`${activeCharacter.id}-${activeCharacterImage}`"
                class="character-image"
                :class="activeCharacter.imageClass"
                :src="activeCharacterImage"
                :alt="activeCharacter.name"
                decoding="async"
                loading="lazy"
              >
            </Transition>
          </div>
        </div>

        <article class="profile-panel">
          <div class="profile-name">
            <p>{{ t('characters.nameLabel') }}</p>

            <div class="profile-name-row">
              <h3 :key="activeCharacter.name">{{ activeCharacter.name }}</h3>

              <button
                v-if="activeCharacter.id === 'atri'"
                type="button"
                class="change-image change-image-inline"
                :aria-label="t('characters.aria.changeAtriImage')"
                @click="toggleAtriImage"
              >
                <span class="change-image-text">
                  {{ t('characters.changeImage') }}
                </span>

                <span class="change-image-button-body">
                  <img
                    class="change-image-graphic"
                    :class="{ 'is-spinning': atriButtonSpinning }"
                    :src="activeCharacter.buttonImage"
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    loading="lazy"
                    @animationend="handleAtriButtonSpinEnd"
                  >
                </span>
              </button>
            </div>

            <span>CV&nbsp;&nbsp;{{ activeCharacter.cv }}</span>
          </div>

          <div class="profile-frame">
            <div class="corner top-left" />
            <div class="corner top-right" />
            <div class="corner bottom-left" />
            <div class="corner bottom-right" />

            <p class="profile-label">{{ t('characters.profileLabel') }}</p>
            <p class="profile-text">{{ activeCharacter.profile }}</p>
          </div>

          <p class="vertical-name">{{ activeCharacter.enName }}</p>
        </article>
      </div>

      <button type="button" class="next-button" @click="nextCharacter">
        <span>{{ t('characters.next') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.character-lab {
  isolation: isolate;
  background: transparent;
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
}

.thumb-button {
  position: relative;
  width: 78px;
  height: 104px;
  padding: 16px 0 10px;
  color: #6dd5ff;
  transition: transform 0.25s ease, color 0.25s ease;
}

.thumb-button:hover,
.thumb-button.is-active {
  transform: translateY(-7px);
  color: #4fc9ff;
}

.thumb-number {
  position: absolute;
  left: 50%;
  top: -2px;
  transform: translateX(-50%);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.thumb-number::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -8px;
  width: 14px;
  height: 2px;
  transform: translateX(-50%);
  background: currentColor;
}

.thumb-portrait {
  position: relative;
  display: block;
  width: 78px;
  height: 78px;
  overflow: hidden;
  border: 1px solid rgba(4, 23, 37, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
}

.thumb-portrait img {
  width: 100%;
  height: 120%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 8px 10px rgba(16, 80, 120, 0.18));
}

.thumb-corners::before,
.thumb-corners::after,
.thumb-pointer {
  position: absolute;
  left: 50%;
  content: '';
  transform: translateX(-50%);
}

.thumb-corners::before {
  top: 12px;
  width: 92px;
  height: 88px;
  border: 3px solid currentColor;
  opacity: 0;
  clip-path: polygon(0 0, 22px 0, 22px 3px, 3px 3px, 3px 22px, 0 22px, 0 0, 100% 0, 100% 22px, calc(100% - 3px) 22px, calc(100% - 3px) 3px, calc(100% - 22px) 3px, calc(100% - 22px) 0, 100% 0, 100% 100%, calc(100% - 22px) 100%, calc(100% - 22px) calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) calc(100% - 22px), 100% calc(100% - 22px), 100% 100%, 0 100%, 0 calc(100% - 22px), 3px calc(100% - 22px), 3px calc(100% - 3px), 22px calc(100% - 3px), 22px 100%, 0 100%);
  transition: opacity 0.25s ease;
}

.thumb-button.is-active .thumb-corners::before {
  opacity: 1;
}

.thumb-pointer {
  bottom: -4px;
  width: 0;
  height: 0;
  border-right: 6px solid transparent;
  border-bottom: 0;
  border-left: 6px solid transparent;
  border-top: 10px solid currentColor;
  opacity: 0.45;
}

.thumb-button.is-active .thumb-pointer {
  opacity: 1;
}

.quote-copy {
  position: absolute;
  left: clamp(20px, 14vw, 330px);
  top: 10%;
  z-index: 5;
  max-height: 450px;
  font-size: clamp(1.25rem, 2vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  line-height: 2.15;
  writing-mode: vertical-rl;
}

.character-stand {
  position: absolute;
  left: 68%;
  bottom: -34px;
  width: min(58vw, 780px);
  min-width: 430px;
  height: min(70vh, 780px);
  transform: translateX(-50%);
}

.character-image {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  max-width: 92%;
  max-height: 100%;
  transform: translateX(-50%);
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 26px 28px rgba(55, 86, 120, 0.18));
  animation: image-in 0.35s ease;
}

.character-image.atri {
  max-height: 106%;
}

.character-image.catherine,
.character-image.natsuki,
.character-image.ryuji {
  max-height: 99%;
}

.character-image.minamo,
.character-image.ririka {
  max-height: 101%;
}

.character-switch-enter-active,
.character-switch-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    filter 0.28s ease;
}

.character-switch-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.96);
  filter: blur(4px) drop-shadow(0 26px 28px rgba(55, 86, 120, 0.18));
}

.character-switch-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0) drop-shadow(0 26px 28px rgba(55, 86, 120, 0.18));
}

.character-switch-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0) drop-shadow(0 26px 28px rgba(55, 86, 120, 0.18));
}

.character-switch-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-14px) scale(1.03);
  filter: blur(4px) drop-shadow(0 26px 28px rgba(55, 86, 120, 0.18));
}

.profile-panel {
  position: relative;
  z-index: 3;
  min-height: 520px;
  padding: 7rem 2rem 2rem 3rem;
  background: transparent;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 22px;
}

.profile-name-row h3 {
  margin-top: 0;
  flex: 0 1 auto;
}

.change-image {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.change-image-inline {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 96px;
  height: 118px;
  flex: 0 0 auto;
  transform: translateY(-8px);
}

.change-image-text {
  position: relative;
  z-index: 5;
  margin-bottom: 2px;
  color: #12324c;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 17px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.02em;
}

.change-image-button-body {
  --change-image-size: 88px;

  position: relative;
  display: block;
  width: var(--change-image-size);
  height: var(--change-image-size);
}

.change-image-graphic {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  display: block;
  width: var(--change-image-size);
  height: var(--change-image-size);
  object-fit: contain;
  transform: translate(-50%, -50%);
  transform-origin: 50% 50%;
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.32s ease,
    opacity 0.32s ease;
}

.change-image-inline:hover .change-image-graphic {
  transform: translate(-50%, -50%) rotate(12deg) scale(1.04);
  filter: drop-shadow(0 8px 14px rgba(18, 50, 76, 0.14));
}

.change-image-inline:active .change-image-graphic {
  transform: translate(-50%, -50%) rotate(12deg) scale(0.96);
}

.change-image-graphic.is-spinning {
  animation: change-image-spin 1.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.profile-name p,
.profile-label {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.42em;
}

.profile-name h3 {
  font-size: clamp(2.75rem, 4.2vw, 5rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.18em;
  animation: name-pop 0.35s ease;
}

.profile-name span {
  display: block;
  margin-top: 26px;
  font-size: clamp(1.2rem, 1.5vw, 1.7rem);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.profile-frame {
  position: relative;
  margin-top: 56px;
  padding: 42px 44px;
}

.corner {
  position: absolute;
  width: 34px;
  height: 34px;
  border-color: #62d1ff;
  border-style: solid;
}

.top-left {
  left: 0;
  top: 0;
  border-width: 3px 0 0 3px;
}

.top-right {
  right: 0;
  top: 0;
  border-width: 3px 3px 0 0;
}

.bottom-left {
  left: 0;
  bottom: 0;
  border-width: 0 0 3px 3px;
}

.bottom-right {
  right: 0;
  bottom: 0;
  border-width: 0 3px 3px 0;
}

.profile-text {
  margin-top: 22px;
  white-space: pre-line;
  font-size: clamp(1rem, 1.4vw, 1.35rem);
  line-height: 2.25;
  letter-spacing: 0.08em;
}

.vertical-name {
  position: absolute;
  left: -8px;
  bottom: 65px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.38em;
  writing-mode: vertical-rl;
}

.next-button {
  position: absolute;
  right: 28px;
  bottom: 28px;
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  border: 2px solid rgba(98, 209, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: #41bff4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.22em;
  box-shadow: 0 14px 34px rgba(63, 185, 235, 0.18);
  transition: transform 0.25s ease, background 0.25s ease;
}

.next-button:hover {
  transform: translateY(-4px) rotate(8deg);
  background: white;
}

@keyframes change-image-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
  }
}

@keyframes name-pop {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes image-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 1023px) {
  .character-stand {
    left: 68%;
    width: min(84vw, 660px);
    height: min(64vh, 680px);
  }

  .profile-panel {
    min-height: auto;
    padding: 2rem 0 5rem;
  }

  .vertical-name {
    display: none;
  }

  .profile-frame {
    padding: 32px 24px;
  }
}

@media (max-width: 767px) {
  .character-lab {
    min-height: 100svh;
  }

  .thumb-button {
    width: 60px;
    height: 86px;
  }

  .thumb-portrait {
    width: 60px;
    height: 60px;
  }

  .thumb-corners::before {
    width: 72px;
    height: 70px;
  }

  .quote-copy {
    left: 4px;
    top: 9%;
    font-size: 1rem;
  }

  .character-stand {
    left: 73%;
    bottom: 0;
    width: min(100vw, 510px);
    min-width: 350px;
    height: min(58vh, 540px);
  }

  .profile-name-row {
    gap: 10px;
    align-items: flex-start;
  }

  .change-image-inline {
    width: 76px;
    height: 96px;
    transform: translateY(-4px);
  }

  .change-image-text {
    font-size: 13px;
    margin-bottom: 1px;
  }

  .change-image-button-body {
    --change-image-size: 68px;
  }

  .profile-name h3 {
    letter-spacing: 0.08em;
  }

  .next-button {
    right: 18px;
    bottom: 18px;
    width: 66px;
    height: 66px;
  }
}
</style>
