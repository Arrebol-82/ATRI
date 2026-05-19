<template>
  <footer class="footer-root">
    <div class="footer-box">
      <div class="footer-inner">
        <!-- 顶部导航：已改成和首页导航栏一致 -->
        <nav class="footer-nav">
          <ul class="footer-nav-list">
            <li v-for="item in navList" :key="item.key">
              <NuxtLink
                :to="item.link"
                class="footer-nav-link"
              >
                <span v-if="item.key === 'home'" class="footer-heart">♥</span>
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="footer-divider"></div>

        <div class="footer-content">
          <div class="footer-column footer-column-left">
            <div class="footer-social">
              <span class="footer-label">{{ t('footer.official') }}</span>

              <a
                v-for="item in officialLinks"
                :key="item.name"
                :href="item.link"
                class="footer-icon"
                :aria-label="item.name"
              >
                {{ item.icon }}
              </a>
            </div>

            <a href="#contact" class="footer-button">
              <span>{{ t('footer.businessInquiries') }}</span>
              <span class="footer-button-arrow">→</span>
            </a>
          </div>

          <div class="footer-logo-area">
            <NuxtLink to="/" class="footer-logo-link">
              <div class="footer-logo-text">
                ATRI
              </div>

              <div class="footer-logo-subtitle">
                {{ t('footer.logoSubtitle') }}
              </div>
            </NuxtLink>
          </div>

          <div class="footer-column footer-column-right">
            <div class="footer-social">
              <span class="footer-label">{{ t('footer.share') }}</span>

              <a
                v-for="item in shareLinks"
                :key="item.name"
                :href="item.link"
                class="footer-icon"
                :aria-label="item.name"
              >
                {{ item.icon }}
              </a>
            </div>

            <p class="footer-copy">
              {{ t('footer.copy') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)

/**
 * 底部黑色导航文字
 * 已改成和首页导航栏一致：
 * 首页 / 周边商品 / 故事 / 角色 / 场景 / 新闻 / 彩蛋 / 结尾
 */
const navBaseList = [
  { key: 'home', link: '/' },
  { key: 'products', link: '/products' },
  { key: 'story', link: '#story' },
  { key: 'characters', link: '#characters' },
  { key: 'scenes', link: '#scenes' },
  { key: 'news', link: '#news' },
  { key: 'mascot', link: '#mascot-easteregg' },
  { key: 'thanks', link: '#thanks-watching' }
]

const footerTranslations = {
  zh: {
    'footer.nav.home': '首页',
    'footer.nav.products': '周边商品',
    'footer.nav.story': '故事',
    'footer.nav.characters': '角色',
    'footer.nav.scenes': '场景',
    'footer.nav.news': '新闻',
    'footer.nav.mascot': '彩蛋',
    'footer.nav.thanks': '结尾',

    'footer.official': '官方',
    'footer.share': '分享',
    'footer.businessInquiries': '商务咨询',
    'footer.logoSubtitle': 'MY DEAR MOMENTS',
    'footer.copy': '©ATRI PROJECT / SAMPLE WEBSITE'
  },

  en: {
    'footer.nav.home': 'Home',
    'footer.nav.products': 'Merchandise',
    'footer.nav.story': 'Story',
    'footer.nav.characters': 'Characters',
    'footer.nav.scenes': 'Scenes',
    'footer.nav.news': 'News',
    'footer.nav.mascot': 'Easter Egg',
    'footer.nav.thanks': 'Thanks',

    'footer.official': 'Official',
    'footer.share': 'Share',
    'footer.businessInquiries': 'Business Inquiries',
    'footer.logoSubtitle': 'MY DEAR MOMENTS',
    'footer.copy': '©ATRI PROJECT / SAMPLE WEBSITE'
  },

  ja: {
    'footer.nav.home': 'ホーム',
    'footer.nav.products': 'グッズ',
    'footer.nav.story': 'ストーリー',
    'footer.nav.characters': 'キャラクター',
    'footer.nav.scenes': 'シーン',
    'footer.nav.news': 'ニュース',
    'footer.nav.mascot': 'イースターエッグ',
    'footer.nav.thanks': 'エンディング',

    'footer.official': '公式',
    'footer.share': '共有',
    'footer.businessInquiries': 'お問い合わせ',
    'footer.logoSubtitle': 'MY DEAR MOMENTS',
    'footer.copy': '©ATRI PROJECT / SAMPLE WEBSITE'
  }
}

const officialLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'TikTok', icon: '♪', link: '#' }
]

const shareLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'LINE', icon: '●', link: '#' }
]

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value

  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

const navList = computed(() =>
  navBaseList.map((item) => ({
    ...item,
    name: t(`footer.nav.${item.key}`)
  }))
)

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function t(key) {
  const language = currentLanguage.value

  return (
    footerTranslations[language]?.[key] ||
    footerTranslations[DEFAULT_LANGUAGE]?.[key] ||
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

<style scoped>
.footer-root {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: 160px;
  overflow: hidden;
  color: #10213a;
  background: #ffffff;
}

.footer-box {
  position: relative;
  width: 100%;
  min-height: 560px;
  overflow: hidden;
  background:
    linear-gradient(180deg, #eef9ff 0%, #d7efff 48%, #acdfff 100%);
}

/* 顶部白色弧形切口：只保留形状，不加细线 */
.footer-box::before {
  position: absolute;
  left: 50%;
  top: -178px;
  z-index: 0;
  width: 150%;
  height: 260px;
  border-radius: 0 0 50% 50%;
  background: #ffffff;
  transform: translateX(-50%);
  content: "";
  pointer-events: none;
}

.footer-inner {
  position: relative;
  z-index: 1;
  width: min(1080px, calc(100% - 48px));
  margin: 0 auto;
  padding: 126px 0 100px;
}

.footer-nav {
  width: 100%;
}

.footer-nav-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 22px 42px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-nav-link {
  display: inline-flex;
  align-items: center;
  color: #10213a;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.14em;
  text-decoration: none;
  transition:
    color 0.22s ease,
    transform 0.22s ease,
    opacity 0.22s ease;
}

.footer-nav-link:hover {
  color: #2f93d2;
  transform: translateY(-2px);
}

.footer-heart {
  margin-right: 6px;
  font-size: 11px;
}

.footer-divider {
  width: min(820px, 100%);
  height: 1px;
  margin: 52px auto;
  border-top: 1px dotted rgba(91, 139, 170, 0.56);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  align-items: center;
  gap: 42px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.footer-column-left {
  align-items: flex-start;
}

.footer-column-right {
  align-items: flex-end;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 18px;
}

.footer-label {
  color: #10213a;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.18em;
}

.footer-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  color: #10213a;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  text-decoration: none;
  transition:
    color 0.22s ease,
    transform 0.22s ease;
}

.footer-icon:hover {
  color: #2f93d2;
  transform: translateY(-2px) scale(1.08);
}

.footer-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border-radius: 999px;
  background: #182864;
  padding: 13px 30px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.16em;
  text-decoration: none;
  box-shadow: 0 10px 22px rgba(24, 40, 100, 0.22);
  transition:
    background 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.footer-button:hover {
  background: #2f93d2;
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(47, 147, 210, 0.26);
}

.footer-button-arrow {
  transition: transform 0.22s ease;
}

.footer-button:hover .footer-button-arrow {
  transform: translateX(4px);
}

.footer-logo-area {
  display: flex;
  justify-content: center;
}

.footer-logo-link {
  display: block;
  text-align: center;
  text-decoration: none;
}

.footer-logo-text {
  color: #264d9d;
  font-size: 64px;
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-shadow: 0 4px 4px rgba(30, 70, 140, 0.25);
  transition: transform 0.22s ease;
}

.footer-logo-link:hover .footer-logo-text {
  transform: scale(1.05);
}

.footer-logo-subtitle {
  margin-top: 12px;
  color: #264d9d;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.35em;
}

.footer-copy {
  margin: 0;
  color: #29445c;
  font-size: 10px;
  font-weight: 900;
  line-height: 1.7;
  letter-spacing: 0.15em;
  text-align: right;
}

@media (max-width: 900px) {
  .footer-root {
    margin-top: 120px;
  }

  .footer-box::before {
    top: -150px;
    width: 170%;
    height: 230px;
  }

  .footer-inner {
    width: min(100% - 40px, 760px);
    padding: 118px 0 90px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .footer-column-left,
  .footer-column-right {
    align-items: center;
  }

  .footer-copy {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .footer-root {
    margin-top: 90px;
  }

  .footer-box {
    min-height: 560px;
  }

  .footer-box::before {
    top: -132px;
    width: 190%;
    height: 210px;
  }

  .footer-nav-list {
    gap: 18px 26px;
  }

  .footer-nav-link {
    font-size: 13px;
  }

  .footer-logo-text {
    font-size: 48px;
  }

  .footer-logo-subtitle {
    font-size: 11px;
    letter-spacing: 0.28em;
  }
}

@media (max-width: 520px) {
  .footer-root {
    margin-top: 60px;
  }

  .footer-box::before {
    top: -112px;
    width: 230%;
    height: 188px;
  }

  .footer-inner {
    width: min(100% - 32px, 460px);
    padding: 106px 0 78px;
  }

  .footer-nav-list {
    gap: 16px 20px;
  }

  .footer-nav-link {
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .footer-divider {
    margin: 40px auto;
  }

  .footer-button {
    padding: 12px 24px;
    font-size: 11px;
  }

  .footer-logo-text {
    font-size: 42px;
  }
}
</style>