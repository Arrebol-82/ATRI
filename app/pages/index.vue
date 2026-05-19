<script setup>
import { gsap } from 'gsap'
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import HomeSidebar from '~/components/site/HomeSidebar.vue'
import Footer from '~/components/Footer.vue'
import { homeNavItems } from '~/constants/navigation'

const CharactersSection = defineAsyncComponent(() => import('~/components/site/CharactersSection.vue'))
const MascotGirlEasterEgg = defineAsyncComponent(() => import('~/components/site/MascotGirlEasterEgg.vue'))
const ThanksWatchingSection = defineAsyncComponent(() => import('~/components/site/ThanksWatchingSection.vue'))
const NewsSection = defineAsyncComponent(() => import('./news.vue'))
const ScenesSection = defineAsyncComponent(() => import('./scenes.vue'))
const StorySection = defineAsyncComponent(() => import('./story.vue'))

const heroItems = [
  { image: '/images/sy1.jpg', thumb: '/images/tx1.jpg', showTitle: true },
  { image: '/images/sy2.jpg', thumb: '/images/tx2.jpg', showTitle: false },
  { image: '/images/sy3.jpg', thumb: '/images/tx3.jpg', showTitle: false },
  { image: '/images/sy4.jpg', thumb: '/images/tx4.jpg', showTitle: false },
  { image: '/images/sy5.jpg', thumb: '/images/tx5.jpg', showTitle: false }
]

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const languageOptions = [
  { code: 'zh', name: '中文', htmlLang: 'zh-CN' },
  { code: 'en', name: 'English', htmlLang: 'en' },
  { code: 'ja', name: '日本語', htmlLang: 'ja' }
]

const languageNameMap = languageOptions.reduce((map, option) => {
  map[option.code] = option.name
  return map
}, {})

const languageHtmlMap = languageOptions.reduce((map, option) => {
  map[option.code] = option.htmlLang
  return map
}, {})

const translations = {
  zh: {
    'site.tagline': 'Blue Memory Store',
    'site.project': 'Tech Festival Project',
    'intro.click': 'CLICK',
    'aria.openMenu': '打开菜单',
    'aria.closeMenu': '关闭菜单',
    'aria.closeLanguage': '关闭语言选择',
    'language.eyebrow': 'LANGUAGE',
    'language.title': '你选择的是？',
    'language.confirmTitle': '确定选择「{language}」吗？',
    'language.optionHint': '中文 / 英文 / 日文',
    'language.confirmHint': '点击确定后，整个网站语言会切换过去',
    'language.reselect': '重选',
    'language.confirm': '确定',
    'language.tooltip': '这里是语言切换功能',
    'language.imageAlt': '语言切换入口',
    'nav.home': '首页',
    'nav.products': '周边商品',
    'nav.story': '故事',
    'nav.characters': '角色',
    'nav.scenes': '场景',
    'nav.news': '新闻',
    'nav.mascot': '彩蛋',
    'nav.thanks': '结尾'
  },
  en: {
    'site.tagline': 'Blue Memory Store',
    'site.project': 'Tech Festival Project',
    'intro.click': 'CLICK',
    'aria.openMenu': 'Open menu',
    'aria.closeMenu': 'Close menu',
    'aria.closeLanguage': 'Close language selector',
    'language.eyebrow': 'LANGUAGE',
    'language.title': 'Choose a language',
    'language.confirmTitle': 'Switch to {language}?',
    'language.optionHint': 'Chinese / English / Japanese',
    'language.confirmHint': 'After confirming, the whole site language will change.',
    'language.reselect': 'Back',
    'language.confirm': 'Confirm',
    'language.tooltip': 'Switch language here',
    'language.imageAlt': 'Language switch entry',
    'nav.home': 'Home',
    'nav.products': 'Merchandise',
    'nav.story': 'Story',
    'nav.characters': 'Characters',
    'nav.scenes': 'Scenes',
    'nav.news': 'News',
    'nav.mascot': 'Easter Egg',
    'nav.thanks': 'Thanks'
  },
  ja: {
    'site.tagline': 'Blue Memory Store',
    'site.project': 'Tech Festival Project',
    'intro.click': 'CLICK',
    'aria.openMenu': 'メニューを開く',
    'aria.closeMenu': 'メニューを閉じる',
    'aria.closeLanguage': '言語選択を閉じる',
    'language.eyebrow': 'LANGUAGE',
    'language.title': '言語を選択してください',
    'language.confirmTitle': '「{language}」に切り替えますか？',
    'language.optionHint': '中国語 / 英語 / 日本語',
    'language.confirmHint': '確定すると、サイト全体の言語が切り替わります。',
    'language.reselect': '選び直す',
    'language.confirm': '確定',
    'language.tooltip': 'ここで言語を切り替えます',
    'language.imageAlt': '言語切り替え入口',
    'nav.home': 'ホーム',
    'nav.products': 'グッズ',
    'nav.story': 'ストーリー',
    'nav.characters': 'キャラクター',
    'nav.scenes': 'シーン',
    'nav.news': 'ニュース',
    'nav.mascot': 'イースターエッグ',
    'nav.thanks': 'エンディング'
  }
}

const HOME_INTRO_PLAYED_KEY = 'atriHomeIntroPlayed'
const SKIP_HOME_INTRO_KEY = 'atriSkipHomeIntroOnce'

const introVisible = ref(false)
const showVideo = ref(false)
const introFinished = ref(false)
const bootMaskVisible = ref(true)
const longPageReady = ref(false)

const introScreen = ref(null)
const introVideoLayer = ref(null)
const introCard = ref(null)
const introTitle = ref(null)
const introClickCursor = ref(null)
const openingVideo = ref(null)

const heroVisual = ref(null)
const heroTitleImage = ref(null)
const nextSlideImage = ref(null)
const heroProgressBar = ref(null)
const languageImage = ref(null)
const languageImageFailed = ref(false)
const languageSpinLocked = ref(false)
const thumbButtons = ref([])

const activeIndex = ref(0)
const currentImage = ref(heroItems[0].image)
const nextImage = ref('')
const isSwitching = ref(false)

const menuOpen = ref(false)
const isMenuIconVisible = ref(false)

const currentLanguage = ref(DEFAULT_LANGUAGE)

function normalizeLanguage(language) {
  return languageOptions.some((option) => option.code === language)
    ? language
    : DEFAULT_LANGUAGE
}

function formatMessage(message, params = {}) {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value)
  }, message)
}

function t(key, params = {}) {
  const language = normalizeLanguage(currentLanguage.value)
  const message = translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE]?.[key] ?? key

  return formatMessage(message, params)
}

function updateDocumentLanguage(language) {
  if (typeof document === 'undefined') return

  document.documentElement.lang = languageHtmlMap[language] || languageHtmlMap[DEFAULT_LANGUAGE]
}

function saveLanguage(language) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {}
}

function getSavedLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function setLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language)

  currentLanguage.value = normalizedLanguage
  updateDocumentLanguage(normalizedLanguage)
  saveLanguage(normalizedLanguage)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('atri-language-change', {
        detail: {
          language: normalizedLanguage,
          label: languageNameMap[normalizedLanguage]
        }
      })
    )
  }
}

function initLanguage() {
  const savedLanguage = getSavedLanguage()

  currentLanguage.value = savedLanguage
  updateDocumentLanguage(savedLanguage)
}

function getNavigationLabelKey(item) {
  const rawList = [
    item?.href,
    item?.to,
    item?.path,
    item?.id,
    item?.label,
    item?.title,
    item?.name,
    item?.text
  ]
    .filter(Boolean)
    .map((value) => String(value))

  const rawValues = rawList.join(' ').toLowerCase()
  const pathValues = rawList.map((value) => value.trim().toLowerCase())

  if (
    pathValues.includes('/') ||
    rawValues.includes('home') ||
    rawValues.includes('首页') ||
    rawValues.includes('ホーム')
  ) return 'nav.home'

  if (
    rawValues.includes('products') ||
    rawValues.includes('goods') ||
    rawValues.includes('merch') ||
    rawValues.includes('shop') ||
    rawValues.includes('周边') ||
    rawValues.includes('商品') ||
    rawValues.includes('グッズ')
  ) return 'nav.products'

  if (rawValues.includes('characters')) return 'nav.characters'
  if (rawValues.includes('scenes')) return 'nav.scenes'
  if (rawValues.includes('news')) return 'nav.news'
  if (rawValues.includes('mascot') || rawValues.includes('easter')) return 'nav.mascot'
  if (rawValues.includes('thanks')) return 'nav.thanks'
  if (rawValues.includes('story')) return 'nav.story'

  return ''
}

const translatedHomeNavItems = computed(() => {
  return homeNavItems.map((item) => {
    const labelKey = getNavigationLabelKey(item)

    if (!labelKey) return item

    const translatedLabel = t(labelKey)

    return {
      ...item,
      label: translatedLabel,
      title: translatedLabel,
      name: translatedLabel,
      text: translatedLabel
    }
  })
})

initLanguage()

provide('atriI18n', {
  currentLanguage,
  languageOptions,
  t,
  setLanguage
})

const route = useRoute()
const newsReturnMaskVisible = useState('news-return-mask-visible', () => false)

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)

let introTimeline
let videoCall
let playCall
let finishTween
let slideTween
let heroProgressTween
let introPointer = { x: 0, y: 0 }

const HERO_VISUAL_CHANGE_DURATION = 4.5

let menuIconRaf = 0
let returnMaskReleaseTimer = 0

let ScrollTriggerPlugin = null
let lenisScrollTriggerHandler = null
let longPageMotionItems = []
let previousScrollRestoration = null

function getSessionItem(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function removeSessionItem(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {}
}

function setManualScrollRestoration() {
  if (typeof window === 'undefined') return

  if ('scrollRestoration' in window.history) {
    previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
  }
}

function restoreScrollRestoration() {
  if (typeof window === 'undefined') return

  if ('scrollRestoration' in window.history && previousScrollRestoration) {
    window.history.scrollRestoration = previousScrollRestoration
  }
}

function getNavigationType() {
  const navigationEntry = performance.getEntriesByType('navigation')?.[0]
  return navigationEntry?.type || 'navigate'
}

function shouldPlayHomeIntro() {
  if (typeof window === 'undefined') return false

  if (window.__ATRI_HOME_INTRO_PLAYED__) {
    return false
  }

  const shouldSkipFromNavigation =
    getNavigationType() === 'back_forward' ||
    getSessionItem(SKIP_HOME_INTRO_KEY) === '1' ||
    getSessionItem('atriSkipIntro') === '1' ||
    getSessionItem('introPlayed') === 'true'

  window.__ATRI_HOME_INTRO_PLAYED__ = true

  removeSessionItem(SKIP_HOME_INTRO_KEY)
  removeSessionItem('atriSkipIntro')
  removeSessionItem('introPlayed')
  removeSessionItem(HOME_INTRO_PLAYED_KEY)

  return !shouldSkipFromNavigation
}

function clearIntroSkipFlags() {
  removeSessionItem(SKIP_HOME_INTRO_KEY)
  removeSessionItem('atriSkipIntro')
  removeSessionItem('introPlayed')
  removeSessionItem(HOME_INTRO_PLAYED_KEY)
}

function updateMenuIconVisible() {
  if (typeof window === 'undefined') return

  const coverPage = document.querySelector('.home-cover-page')

  if (!coverPage) {
    isMenuIconVisible.value = false
    menuOpen.value = false
    return
  }

  const coverRect = coverPage.getBoundingClientRect()
  const shouldShow = coverRect.top <= 0

  isMenuIconVisible.value = shouldShow

  if (!shouldShow) {
    menuOpen.value = false
  }
}

function handleMenuIconScroll() {
  if (typeof window === 'undefined') return
  if (menuIconRaf) return

  menuIconRaf = window.requestAnimationFrame(() => {
    menuIconRaf = 0
    updateMenuIconVisible()
  })
}

function toggleMenu() {
  if (!isMenuIconVisible.value) return
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleLenisReady(event) {
  const lenis = event?.detail?.lenis || window.__lenis

  if (lenis?.on) {
    lenis.on('scroll', handleMenuIconScroll)
  }

  if (ScrollTriggerPlugin && !lenisScrollTriggerHandler && lenis?.on) {
    lenisScrollTriggerHandler = () => ScrollTriggerPlugin.update()
    lenis.on('scroll', lenisScrollTriggerHandler)
  }
}

function runWhenBrowserIsCalm(callback, timeout = 1400) {
  if (typeof window === 'undefined') return

  const schedule = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout })
    } else {
      window.setTimeout(callback, Math.min(timeout, 900))
    }
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(schedule)
  })
}

function ensureLongPageReady() {
  if (longPageReady.value) return
  longPageReady.value = true
}

function preloadHeroImages() {
  if (typeof window === 'undefined') return

  heroItems.slice(1).forEach((item) => {
    const image = new Image()
    image.decoding = 'async'
    image.src = item.image
  })
}

function handleMenuPanelNavigationClick(event) {
  if (typeof window === 'undefined') return

  const target = event.target
  const navLink = target?.closest?.('a')

  if (!navLink) return

  window.setTimeout(() => {
    closeMenu()
  }, 160)
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

function getNextHeroIndex() {
  return (activeIndex.value + 1) % heroItems.length
}

function stopHeroProgress() {
  heroProgressTween?.kill()
  heroProgressTween = null

  if (heroProgressBar.value) {
    gsap.set(heroProgressBar.value, {
      scaleX: 0,
      transformOrigin: 'left center'
    })
  }
}

function startHeroProgress() {
  if (typeof window === 'undefined') return
  if (!heroProgressBar.value || heroItems.length <= 1) return
  if (introVisible.value || bootMaskVisible.value || newsReturnMaskVisible.value) return

  heroProgressTween?.kill()

  gsap.set(heroProgressBar.value, {
    scaleX: 0,
    transformOrigin: 'left center'
  })

  heroProgressTween = gsap.to(heroProgressBar.value, {
    scaleX: 1,
    duration: HERO_VISUAL_CHANGE_DURATION,
    ease: 'none',
    onComplete: () => {
      heroProgressTween = null
      selectHero(getNextHeroIndex())
    }
  })
}

function restartHeroProgress() {
  stopHeroProgress()

  nextTick(() => {
    startHeroProgress()
  })
}

function handleLanguageImageError() {
  languageImageFailed.value = true
}

function cycleLanguage() {
  const currentIndex = languageOptions.findIndex((opt) => opt.code === currentLanguage.value)
  const nextIndex = (currentIndex + 1) % languageOptions.length

  setLanguage(languageOptions[nextIndex].code)
}

function switchToLanguage(language) {
  setLanguage(language)
}

function spinLanguageImage() {
  if (!languageImage.value || languageSpinLocked.value) return

  languageSpinLocked.value = true

  gsap.killTweensOf(languageImage.value)
  gsap.set(languageImage.value, {
    rotation: 0,
    transformOrigin: '50% 50%'
  })

  gsap.to(languageImage.value, {
    rotation: 360,
    duration: 0.9,
    ease: 'power2.inOut',
    overwrite: true,
    onComplete: () => {
      gsap.set(languageImage.value, { rotation: 0 })
      languageSpinLocked.value = false
      cycleLanguage()
    }
  })
}

function enterHome() {
  if (introFinished.value) return

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
      updateMenuIconVisible()

      nextTick(() => {
        startHeroProgress()
      })
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

  if (!item || isSwitching.value) return

  if (item.image === currentImage.value) {
    restartHeroProgress()
    return
  }

  stopHeroProgress()

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

      nextTick(() => {
        startHeroProgress()
      })
    }
  })

  slideTween
    .to(nextSlideImage.value, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.05
    })
    .to(
      nextSlideImage.value,
      {
        scale: 1.04,
        filter: 'brightness(1)',
        duration: 1.2
      },
      0
    )
}

function jumpToSectionImmediately(selector, stabilize = true) {
  if (typeof window === 'undefined') return false

  const targetSection =
    selector === '#news'
      ? document.getElementById('news')
      : document.querySelector(selector)

  if (!targetSection) return false

  const lenis = window.__lenis
  const html = document.documentElement
  const body = document.body
  const previousHtmlScrollBehavior = html.style.scrollBehavior
  const previousBodyScrollBehavior = body.style.scrollBehavior

  html.style.scrollBehavior = 'auto'
  body.style.scrollBehavior = 'auto'

  const stopLenis = () => {
    if (typeof lenis?.stop === 'function') {
      lenis.stop()
    }
  }

  const startLenis = () => {
    if (typeof lenis?.start === 'function') {
      lenis.start()
    }
  }

  const getTargetTop = () => {
    const rect = targetSection.getBoundingClientRect()
    return rect.top + window.pageYOffset
  }

  const jump = () => {
    stopLenis()

    const targetTop = getTargetTop()

    if (typeof lenis?.scrollTo === 'function') {
      lenis.scrollTo(targetTop, {
        immediate: true,
        force: true
      })
    }

    window.scrollTo({
      top: targetTop,
      left: 0,
      behavior: 'auto'
    })
  }

  const restore = () => {
    html.style.scrollBehavior = previousHtmlScrollBehavior
    body.style.scrollBehavior = previousBodyScrollBehavior
    startLenis()
    updateMenuIconVisible()
  }

  jump()
  requestAnimationFrame(jump)

  if (stabilize) {
    window.setTimeout(jump, 50)
    window.setTimeout(jump, 120)
    window.setTimeout(jump, 220)
    window.setTimeout(jump, 340)
    window.setTimeout(restore, 390)
  } else {
    requestAnimationFrame(restore)
  }

  return true
}

function jumpToTopImmediately() {
  if (typeof window === 'undefined') return

  const lenis = window.__lenis

  if (lenis?.scrollTo) {
    lenis.scrollTo(0, {
      immediate: true,
      force: true
    })

    return
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  })
}

function replaceUrlWithoutHashOrQuery() {
  if (typeof window === 'undefined') return

  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname
  )
}

function normalizeHistoryPath(value) {
  if (typeof window === 'undefined' || !value || typeof value !== 'string') {
    return ''
  }

  try {
    return new URL(value, window.location.origin).pathname
  } catch {
    return value.split('?')[0].split('#')[0]
  }
}

function isNewsRoutePath(value) {
  const path = normalizeHistoryPath(value)

  return path === '/news' || path === '/news/' || path.startsWith('/news/')
}

function isFromNewsPageRoute() {
  if (typeof window === 'undefined') return false

  if (getNavigationType() === 'reload') return false

  const historyState = window.history.state || {}

  const historyCandidates = [
    historyState.back,
    historyState.forward
  ]

  if (historyCandidates.some(isNewsRoutePath)) {
    return true
  }

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)

      if (referrerUrl.origin === window.location.origin && isNewsRoutePath(referrerUrl.pathname)) {
        return true
      }
    } catch {}
  }

  return false
}

function releaseBootMaskAfterNewsJump() {
  if (typeof window === 'undefined') return

  if (returnMaskReleaseTimer) {
    window.clearTimeout(returnMaskReleaseTimer)
    returnMaskReleaseTimer = 0
  }

  requestAnimationFrame(() => {
    updateMenuIconVisible()
    setupLongPageMotion()

    returnMaskReleaseTimer = window.setTimeout(() => {
      jumpToSectionImmediately('#news', false)

      bootMaskVisible.value = false
      newsReturnMaskVisible.value = false
      returnMaskReleaseTimer = 0
    }, 430)
  })
}

async function jumpToNewsAndReveal() {
  if (typeof window === 'undefined') return

  bootMaskVisible.value = true
  newsReturnMaskVisible.value = true
  clearIntroSkipFlags()

  await nextTick()

  requestAnimationFrame(() => {
    const didJump = jumpToSectionImmediately('#news')

    if (didJump) {
      replaceUrlWithoutHashOrQuery()
    }

    releaseBootMaskAfterNewsJump()
  })
}

function teardownLongPageMotion() {
  longPageMotionItems.forEach((item) => {
    item.animation?.kill()
    item.trigger?.kill()
  })

  longPageMotionItems = []

  if (lenisScrollTriggerHandler && window.__lenis?.off) {
    window.__lenis.off('scroll', lenisScrollTriggerHandler)
    lenisScrollTriggerHandler = null
  }

  ScrollTriggerPlugin?.refresh?.()
}

async function setupLongPageMotion() {
  if (typeof window === 'undefined') return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion) return

  const { ScrollTrigger } = await import('gsap/ScrollTrigger')

  gsap.registerPlugin(ScrollTrigger)
  ScrollTriggerPlugin = ScrollTrigger

  teardownLongPageMotion()

  if (window.__lenis?.on) {
    lenisScrollTriggerHandler = () => ScrollTrigger.update()
    window.__lenis.on('scroll', lenisScrollTriggerHandler)
  }

  const sections = gsap.utils.toArray('.motion-section')

  sections.forEach((section) => {
    const inner = section.querySelector('.motion-section-inner')

    gsap.set(section, {
      autoAlpha: 0,
      y: 36,
      transformOrigin: 'center top'
    })

    const revealAnimation = gsap.to(section, {
      autoAlpha: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      paused: true
    })

    const revealTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 82%',
      once: true,
      onEnter: () => revealAnimation.play(),
      onEnterBack: () => revealAnimation.play()
    })

    longPageMotionItems.push({
      animation: revealAnimation,
      trigger: revealTrigger
    })

    const shouldUseInnerParallax = !['characters', 'scenes'].includes(section.id)

    if (inner && shouldUseInnerParallax) {
      const parallaxAnimation = gsap.fromTo(
        inner,
        {
          y: -10
        },
        {
          y: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.75
          }
        }
      )

      longPageMotionItems.push({
        animation: parallaxAnimation,
        trigger: parallaxAnimation.scrollTrigger
      })
    }
  })

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}

watch(
  () => [route.query.section, route.hash],
  ([section, hash]) => {
    if (section !== 'news' && hash !== '#news') return

    jumpToNewsAndReveal()
  },
  { flush: 'post' }
)

onMounted(async () => {
  setManualScrollRestoration()

  introPointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }

  gsap.set(heroVisual.value, {
    '--move-x': '0px',
    '--move-y': '0px'
  })

  isMenuIconVisible.value = false
  menuOpen.value = false

  window.addEventListener('scroll', handleMenuIconScroll, { passive: true })
  window.addEventListener('resize', handleMenuIconScroll)
  window.addEventListener('atri-lenis-ready', handleLenisReady)

  if (window.__lenis?.on) {
    window.__lenis.on('scroll', handleMenuIconScroll)
  }

  const hasHash = typeof window !== 'undefined' ? window.location.hash : ''
  const validSections = ['#story', '#characters', '#scenes', '#news', '#mascot-easteregg', '#thanks-watching']

  const scrollToNews =
    newsReturnMaskVisible.value ||
    getSessionItem('scrollToNews') === '1' ||
    route.query.section === 'news' ||
    hasHash === '#news' ||
    isFromNewsPageRoute()

  const shouldPrepareLongPageImmediately = Boolean(
    scrollToNews ||
    route.query.section ||
    (hasHash && validSections.includes(hasHash))
  )

  if (shouldPrepareLongPageImmediately) {
    ensureLongPageReady()
  }

  if (scrollToNews) {
    bootMaskVisible.value = true
    newsReturnMaskVisible.value = true
  }

  await nextTick()

  const isBackForwardNavigation = getNavigationType() === 'back_forward'

  const shouldScrollToHash = Boolean(
    !scrollToNews &&
    !isBackForwardNavigation &&
    hasHash &&
    validSections.includes(hasHash)
  )

  const shouldJumpImmediately = scrollToNews || shouldScrollToHash
  const immediateTarget = scrollToNews ? '#news' : hasHash

  if (scrollToNews) {
    removeSessionItem('scrollToNews')
  }

  if (shouldJumpImmediately) {
    clearIntroSkipFlags()

    requestAnimationFrame(() => {
      const didJump = jumpToSectionImmediately(immediateTarget)

      if (didJump && typeof window !== 'undefined') {
        replaceUrlWithoutHashOrQuery()
      }

      if (scrollToNews) {
        releaseBootMaskAfterNewsJump()
      } else {
        bootMaskVisible.value = false

        requestAnimationFrame(() => {
          updateMenuIconVisible()
          setupLongPageMotion()
          newsReturnMaskVisible.value = false
        })
      }
    })
  } else {
    jumpToTopImmediately()

    requestAnimationFrame(() => {
      updateMenuIconVisible()
    })

    if (shouldPlayHomeIntro()) {
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

      bootMaskVisible.value = false

      await nextTick()

      introTimeline = gsap.timeline()

      introTimeline
        .to(introCard.value, {
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.out'
        })
        .to(
          introTitle.value,
          {
            opacity: 1,
            yPercent: -50,
            duration: 0.7,
            ease: 'power1.out'
          },
          0.9
        )
        .to(
          introTitle.value,
          {
            backgroundPosition: '0% 0',
            duration: 1.1,
            ease: 'power1.inOut'
          },
          1.25
        )
        .to(
          introTitle.value,
          {
            opacity: 0,
            duration: 0.4,
            ease: 'power1.out'
          },
          2.8
        )
        .to(
          introCard.value,
          {
            yPercent: -100,
            duration: 0.9,
            ease: 'power2.inOut'
          },
          3
        )

      videoCall = gsap.delayedCall(3, () => {
        showVideo.value = true

        gsap.set(introClickCursor.value, introPointer)

        gsap.fromTo(
          introClickCursor.value,
          {
            autoAlpha: 0,
            scale: 0.8
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.28,
            ease: 'power2.out'
          }
        )

        gsap.to(introVideoLayer.value, {
          opacity: 1,
          duration: 0.2,
          ease: 'power1.out'
        })
      })

      playCall = gsap.delayedCall(3.9, () => {
        openingVideo.value?.play().catch(() => {})
      })

      finishTween = gsap.delayedCall(4.2, () => {
        ensureLongPageReady()

        nextTick(() => {
          setupLongPageMotion()
        })
      })
    } else {
      bootMaskVisible.value = false

      requestAnimationFrame(() => {
        runWhenBrowserIsCalm(async () => {
          ensureLongPageReady()
          await nextTick()
          setupLongPageMotion()
        })
      })
    }
  }

  runWhenBrowserIsCalm(preloadHeroImages, 2200)

  nextTick(() => {
    syncThumbButtons()
    startHeroProgress()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleMenuIconScroll)
  window.removeEventListener('resize', handleMenuIconScroll)
  window.removeEventListener('atri-lenis-ready', handleLenisReady)

  if (window.__lenis?.off) {
    window.__lenis.off('scroll', handleMenuIconScroll)
  }

  teardownLongPageMotion()
  restoreScrollRestoration()

  if (returnMaskReleaseTimer) {
    window.clearTimeout(returnMaskReleaseTimer)
    returnMaskReleaseTimer = 0
  }

  if (menuIconRaf) {
    window.cancelAnimationFrame(menuIconRaf)
    menuIconRaf = 0
  }

  introTimeline?.kill()
  videoCall?.kill()
  playCall?.kill()
  finishTween?.kill()
  slideTween?.kill()
  heroProgressTween?.kill()
  gsap.killTweensOf(introClickCursor.value)
  gsap.killTweensOf(languageImage.value)
})
</script>

<template>
  <main
    class="home-page-root min-h-screen overflow-x-hidden bg-white text-[#102a3a]"
    :data-language="currentLanguage"
  >
    <div
      v-if="bootMaskVisible || newsReturnMaskVisible"
      class="boot-mask fixed inset-0 z-[10000] h-screen w-full bg-white"
      aria-hidden="true"
    />

    <div
      v-if="introVisible"
      ref="introScreen"
      class="intro-screen fixed inset-0 z-[9999] h-screen w-full overflow-hidden bg-white"
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
          preload="metadata"
          @ended="enterHome"
        >
          <source src="/videos/ATRI2.mp4" type="video/mp4">
        </video>
      </div>

      <div
        ref="introCard"
        class="intro-card absolute inset-0 z-[2] h-full w-full bg-[#c8ebff]"
      />

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
        {{ t('intro.click') }}
      </div>
    </div>

    <Transition name="menu-fade">
      <button
        v-if="isMenuIconVisible"
        type="button"
        class="menu-toggle fixed right-8 top-8 z-[10001]"
        :class="{ 'is-open': menuOpen }"
        :aria-label="menuOpen ? t('aria.closeMenu') : t('aria.openMenu')"
        :aria-expanded="menuOpen"
        @click="toggleMenu"
      >
        <span class="menu-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </Transition>

    <Transition name="menu-layer">
      <div
        v-if="menuOpen"
        class="menu-layer fixed inset-0 z-[10000]"
      >
        <button
          type="button"
          class="menu-scrim absolute inset-0 h-full w-full bg-white/70 backdrop-blur-[2px]"
          :aria-label="t('aria.closeMenu')"
          @click="closeMenu"
        />

        <aside
          class="menu-panel absolute right-0 top-0 flex h-screen w-[280px] max-w-[88vw] flex-col border-l border-[rgba(120,180,210,0.22)] bg-white/95 px-7 pb-7 pt-[34px] shadow-[-14px_0_34px_rgba(80,130,160,0.1)]"
          data-lenis-prevent
        >
          <div class="menu-panel-head mb-[34px] pr-12">
            <h2 class="font-serif text-[42px] font-normal tracking-[0.14em] text-[#102a3a]">
              ATRI
            </h2>

            <p class="mt-1.5 text-xs tracking-[0.08em] text-[#102a3a]/60">
              {{ t('site.tagline') }}
            </p>
          </div>

          <div class="menu-panel-body" @click="handleMenuPanelNavigationClick">
            <HomeSidebar :items="translatedHomeNavItems" />
          </div>

          <div class="menu-panel-foot mt-auto border-t border-[rgba(120,180,210,0.26)] pt-[18px]">
            <p class="text-[11px] tracking-[0.08em] text-[#102a3a]/60">
              {{ t('site.project') }}
            </p>

            <span class="mt-1.5 block font-serif text-xl text-[#102a3a]">
              2026
            </span>
          </div>
        </aside>
      </div>
    </Transition>

    <section
      class="home-fixed-hero grid h-screen w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-[1fr_240px]"
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
          class="hero-parallax absolute inset-0 block h-full w-full scale-[1.04] object-cover object-center transition-transform duration-200 ease-out will-change-transform"
          decoding="async"
          fetchpriority="high"
          loading="eager"
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
            <img
              :src="item.thumb"
              alt=""
              class="block h-full w-full rounded-[10px] object-cover"
              decoding="async"
              loading="lazy"
            >
          </button>
        </div>
      </div>

      <aside class="relative z-10 flex h-screen w-full flex-col border-l border-[rgba(120,180,210,0.28)] bg-white/95 px-6 pb-7 pt-[34px] shadow-[-18px_0_50px_rgba(80,130,160,0.08)] lg:w-[240px]">
        <div class="mb-[34px]">
          <h1 class="font-serif text-[42px] font-normal tracking-[0.14em] text-[#102a3a]">
            ATRI
          </h1>

          <p class="mt-1.5 text-xs tracking-[0.08em] text-[#102a3a]/60">
            {{ t('site.tagline') }}
          </p>
        </div>

        <div class="language-bar shrink-0 mb-5 pb-4 border-b border-[rgba(120,180,210,0.22)]">
          <div class="language-bar-inner flex items-center justify-center text-sm font-bold tracking-[0.06em] text-[#102a3a]">
            <template v-for="(option, i) in languageOptions" :key="option.code">
              <button
                type="button"
                class="language-option px-1 py-0.5 transition-colors hover:text-[#67a9ca]"
                :class="currentLanguage === option.code ? 'text-[#3c96d2] underline decoration-[#67c7f7] decoration-2 underline-offset-[5px]' : 'text-[#102a3a]/70'"
                @click="switchToLanguage(option.code)"
              >
                {{ option.name }}
              </button>
              <span
                v-if="i < languageOptions.length - 1"
                class="mx-0.5 text-[#102a3a]/35 select-none"
                aria-hidden="true"
              >/</span>
            </template>
          </div>
        </div>

        <div class="shrink-0">
          <HomeSidebar :items="translatedHomeNavItems" />
        </div>

        <div class="hero-visual-change-nav">
          <div class="hero-visual-change-title">
            VISUAL CHANGE
          </div>

          <div class="hero-visual-progress-line">
            <span class="hero-visual-progress-dot" />

            <span class="hero-visual-progress-track">
              <span
                ref="heroProgressBar"
                class="hero-visual-progress-bar"
              />
            </span>
          </div>
        </div>

        <div class="language-picker relative z-10 mt-auto flex shrink-0 flex-col items-center justify-center pt-4">
          <img
            v-if="!languageImageFailed"
            ref="languageImage"
            src="/images/lage.jpg"
            :alt="t('language.imageAlt')"
            class="block h-[110px] w-[124px] cursor-pointer select-none object-contain will-change-transform"
            decoding="async"
            loading="lazy"
            @click="spinLanguageImage"
            @error="handleLanguageImageError"
          >

          <button
            v-else
            ref="languageImage"
            type="button"
            class="flex h-[110px] w-[124px] cursor-pointer select-none flex-col items-center justify-center rounded-[24px] border-2 border-[#102a3a] bg-[#f5fbff] text-center shadow-[6px_6px_0_rgba(16,42,58,0.14)] transition will-change-transform hover:-translate-y-0.5 hover:bg-[#c8ebff]"
            :aria-label="t('language.imageAlt')"
            @click="spinLanguageImage"
          >
            <span class="text-[11px] font-black tracking-[0.22em] text-[#67a9ca]">LANGUAGE</span>
            <span class="mt-2 text-[18px] font-bold tracking-[0.06em] text-[#102a3a]">语言切换</span>
            <span class="mt-1 text-[11px] font-bold tracking-[0.12em] text-[#102a3a]/55">中文 / EN / 日</span>
          </button>
        </div>

        <div class="mt-4 shrink-0 border-t border-[rgba(120,180,210,0.26)] pt-[18px]">
          <p class="text-[11px] tracking-[0.08em] text-[#102a3a]/60">
            {{ t('site.project') }}
          </p>

          <span class="mt-1.5 block font-serif text-xl text-[#102a3a]">
            2026
          </span>
        </div>
      </aside>
    </section>

    <div v-if="longPageReady" class="home-cover-page">
      <section id="story" class="motion-section cover-panel">
        <div class="motion-section-inner">
          <StorySection />
        </div>
      </section>

      <section id="characters" class="motion-section cover-panel">
        <div class="motion-section-inner">
          <CharactersSection />
        </div>
      </section>

      <section id="scenes" class="motion-section cover-panel">
        <div class="motion-section-inner">
          <ScenesSection />
        </div>
      </section>

      <section id="news" class="cover-panel">
        <NewsSection :showFullPage="false" />
      </section>

      <section id="mascot-easteregg" class="motion-section cover-panel">
        <div class="motion-section-inner">
          <MascotGirlEasterEgg />
        </div>
      </section>

      <section id="thanks-watching" class="motion-section cover-panel">
        <div class="motion-section-inner">
          <ThanksWatchingSection />
        </div>
      </section>

      <Footer />
    </div>
  </main>
</template>

<style scoped>
.home-page-root {
  position: relative;
  isolation: isolate;
}

.home-fixed-hero {
  position: fixed;
  inset: 0;
  z-index: 0;
  min-height: 100vh;
  transform: translateZ(0);
  will-change: transform;
}

.home-cover-page {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  margin-top: 100vh;
  background: #fff;
  isolation: isolate;
}

.cover-panel {
  position: relative;
  z-index: 1;
  margin: 0;
  border: 0;
  background: #fff;
  box-shadow: none;
  outline: 0;
}

#news,
#mascot-easteregg,
#thanks-watching {
  margin-top: -1px;
}

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

.hero-visual-change-nav {
  width: 100%;
  margin-top: 28px;
  padding-left: 2px;
  color: #7b5b82;
}

.hero-visual-change-title {
  margin-bottom: 14px;
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.03em;
  color: #7b5b82;
}

.hero-visual-progress-line {
  display: flex;
  align-items: center;
  width: 100%;
}

.hero-visual-progress-dot {
  position: relative;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  border: 2px solid #67c7f7;
  border-radius: 999px;
  background: #ffffff;
}

.hero-visual-progress-dot::after {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #67c7f7;
  content: "";
  transform: translate(-50%, -50%);
}

.hero-visual-progress-track {
  position: relative;
  display: block;
  width: 100%;
  height: 2px;
  margin-left: -1px;
  overflow: hidden;
  background: rgba(103, 199, 247, 0.38);
}

.hero-visual-progress-bar {
  display: block;
  width: 100%;
  height: 100%;
  background: #67c7f7;
  transform: scaleX(0);
  transform-origin: left center;
}

.boot-mask {
  pointer-events: auto;
}

.motion-section {
  position: relative;
  transform-origin: center top;
  will-change: transform, opacity;
}

.motion-section-inner {
  position: relative;
  will-change: transform;
}

#characters,
#scenes {
  background: transparent;
}

#news {
  background: #fff;
}

#characters .motion-section-inner,
#scenes .motion-section-inner {
  transform: none !important;
}

.menu-toggle {
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  transform: rotate(0deg);
  transition:
    opacity 0.25s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-toggle:hover {
  transform: translateY(-2px);
}

.menu-toggle.is-open {
  transform: rotate(180deg);
}

.menu-lines {
  position: relative;
  display: block;
  width: 34px;
  height: 26px;
}

.menu-lines span {
  position: absolute;
  left: 0;
  display: block;
  width: 34px;
  height: 2px;
  border-radius: 999px;
  background: rgba(16, 42, 58, 0.86);
  transform-origin: center;
  transition:
    top 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.menu-lines span:nth-child(1) {
  top: 5px;
}

.menu-lines span:nth-child(2) {
  top: 12px;
}

.menu-lines span:nth-child(3) {
  top: 19px;
}

.menu-toggle.is-open .menu-lines span:nth-child(1) {
  top: 12px;
  transform: rotate(45deg);
}

.menu-toggle.is-open .menu-lines span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.menu-toggle.is-open .menu-lines span:nth-child(3) {
  top: 12px;
  transform: rotate(-45deg);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.menu-fade-enter-to,
.menu-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.menu-layer-enter-active,
.menu-layer-leave-active {
  transition: opacity 0.32s ease;
}

.menu-layer-enter-active .menu-scrim,
.menu-layer-leave-active .menu-scrim {
  transition:
    opacity 0.32s ease,
    backdrop-filter 0.32s ease;
}

.menu-panel {
  z-index: 1;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 251, 255, 0.96)),
    rgba(255, 255, 255, 0.96);
}

.menu-panel::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(164, 220, 239, 0.12), rgba(87, 178, 214, 0.55), rgba(164, 220, 239, 0.12));
  content: "";
}

.menu-panel::after {
  position: absolute;
  right: -80px;
  bottom: -90px;
  width: 210px;
  height: 210px;
  border-radius: 999px;
  background: rgba(200, 235, 255, 0.5);
  content: "";
  pointer-events: none;
}

.menu-layer-enter-active .menu-panel,
.menu-layer-leave-active .menu-panel {
  transition:
    opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.38s ease;
}

.menu-layer-enter-active .menu-panel-head,
.menu-layer-enter-active .menu-panel-body,
.menu-layer-enter-active .menu-panel-foot,
.menu-layer-leave-active .menu-panel-head,
.menu-layer-leave-active .menu-panel-body,
.menu-layer-leave-active .menu-panel-foot {
  transition:
    opacity 0.34s ease,
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-layer-enter-from,
.menu-layer-leave-to {
  opacity: 0;
}

.menu-layer-enter-from .menu-scrim,
.menu-layer-leave-to .menu-scrim {
  opacity: 0;
  backdrop-filter: blur(0);
}

.menu-layer-enter-from .menu-panel,
.menu-layer-leave-to .menu-panel {
  opacity: 0;
  box-shadow: -8px 0 24px rgba(80, 130, 160, 0);
  transform: translate3d(34px, 0, 0);
}

.menu-layer-enter-from .menu-panel-head,
.menu-layer-enter-from .menu-panel-body,
.menu-layer-enter-from .menu-panel-foot,
.menu-layer-leave-to .menu-panel-head,
.menu-layer-leave-to .menu-panel-body,
.menu-layer-leave-to .menu-panel-foot {
  opacity: 0;
  transform: translate3d(12px, 0, 0);
}

.menu-layer-enter-to,
.menu-layer-leave-from {
  opacity: 1;
}

.menu-layer-enter-to .menu-scrim,
.menu-layer-leave-from .menu-scrim {
  opacity: 1;
  backdrop-filter: blur(2px);
}

.menu-layer-enter-to .menu-panel,
.menu-layer-leave-from .menu-panel {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.menu-layer-enter-to .menu-panel-head,
.menu-layer-enter-to .menu-panel-body,
.menu-layer-enter-to .menu-panel-foot,
.menu-layer-leave-from .menu-panel-head,
.menu-layer-leave-from .menu-panel-body,
.menu-layer-leave-from .menu-panel-foot {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.menu-layer-enter-active .menu-panel-head {
  transition-delay: 0.06s;
}

.menu-layer-enter-active .menu-panel-body {
  transition-delay: 0.1s;
}

.menu-layer-enter-active .menu-panel-foot {
  transition-delay: 0.14s;
}

.menu-panel-body :deep(a) {
  transition:
    color 0.22s ease,
    opacity 0.22s ease,
    transform 0.22s ease;
}

.menu-panel-body :deep(a:hover) {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .motion-section,
  .motion-section-inner,
  .menu-toggle,
  .menu-lines span,
  .menu-fade-enter-active,
  .menu-fade-leave-active,
  .menu-layer-enter-active,
  .menu-layer-leave-active,
  .menu-layer-enter-active .menu-scrim,
  .menu-layer-leave-active .menu-scrim,
  .menu-layer-enter-active .menu-panel,
  .menu-layer-leave-active .menu-panel,
  .menu-layer-enter-active .menu-panel-head,
  .menu-layer-enter-active .menu-panel-body,
  .menu-layer-enter-active .menu-panel-foot,
  .menu-layer-leave-active .menu-panel-head,
  .menu-layer-leave-active .menu-panel-body,
  .menu-layer-leave-active .menu-panel-foot {
    transition-duration: 0.01ms;
    transition-delay: 0s;
    transform: none;
    filter: none;
  }
}
</style>