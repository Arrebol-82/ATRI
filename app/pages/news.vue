<template>
  <section
    :id="!showFullPage ? 'news' : undefined"
    class="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50/50 to-white text-[#24424b]"
  >
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[8%] top-20 h-[320px] w-[320px] rounded-full bg-sky-100/60 blur-3xl"></div>
      <div class="absolute right-[5%] top-[30%] h-[280px] w-[280px] rounded-full bg-sky-50/80 blur-3xl"></div>
      <div class="absolute left-[20%] bottom-20 h-[200px] w-[200px] rounded-full border border-sky-100/50"></div>
    </div>

    <!-- 新闻详情页 -->
    <div v-if="selectedNews" class="fixed inset-0 z-[60] overflow-y-auto bg-white">
      <article class="news-detail relative min-h-screen w-full overflow-hidden p-6 text-[#263f48] md:p-10 lg:p-14">
        <div class="news-detail-bubbles" aria-hidden="true">
          <span v-for="i in 12" :key="i" />
        </div>

        <div class="relative z-[1] mx-auto max-w-[900px]">
          <div class="rounded-[28px] border-2 border-sky-200 bg-white/95 px-7 py-9 shadow-[0_18px_50px_rgba(56,189,248,0.12)] md:px-12 md:py-12">
            <!-- 详情页只保留关闭按钮：关闭后回到 12 个新闻展示框 -->
            <div class="mb-6 flex items-center justify-end">
              <button
                class="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white/90 text-xl font-black leading-none text-sky-400 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                aria-label="Close news detail"
                @click="closeDetailToNewsList"
              >
                ×
              </button>
            </div>

            <time class="block text-xl font-bold tracking-[0.08em] text-sky-500">
              {{ selectedNews.date }}
            </time>

            <div class="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl border-2 border-sky-200">
              <img
                :src="selectedNews.image"
                :alt="selectedNews.title"
                class="h-full w-full object-cover"
                :style="{ objectPosition: selectedNews.imagePosition || 'center' }"
              />
            </div>

            <h2 class="mt-5 border-b-2 border-sky-100 pb-8 text-2xl font-black leading-[1.7] tracking-[0.06em] text-[#263f48] md:text-4xl">
              {{ selectedNews.title }}
            </h2>

            <div class="mt-10 space-y-8 text-[17px] font-medium leading-[2.1] tracking-[0.04em] text-[#263f48]">
              <p v-for="paragraph in selectedNews.body" :key="paragraph">
                {{ paragraph }}
              </p>

              <section class="rounded-2xl bg-sky-50/80 p-6">
                <h3 class="mb-4 text-xl font-black text-sky-500">イベント概要</h3>

                <dl class="space-y-3">
                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">日程</dt>
                    <dd>{{ selectedNews.event.date }}</dd>
                  </div>

                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">会場</dt>
                    <dd>{{ selectedNews.event.place }}</dd>
                  </div>

                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">内容</dt>
                    <dd>{{ selectedNews.event.content }}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 class="mb-4 text-xl font-black text-sky-500">注意事項</h3>

                <ul class="list-disc space-y-2 pl-6">
                  <li v-for="note in selectedNews.notes" :key="note">
                    {{ note }}
                  </li>
                </ul>
              </section>
            </div>

            <div class="mt-12 border-t-2 border-sky-100 pt-8">
              <p class="mb-4 text-sm font-black tracking-[0.3em] text-sky-400">
                SHARE
              </p>

              <div class="flex gap-3">
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm text-white">
                  X
                </button>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                  Li
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 新闻列表页 -->
    <div class="relative z-10 mx-auto max-w-[1200px] px-6 py-20 md:px-10 lg:py-24">
      <header class="mb-14">
        <div class="flex items-center justify-between">
          <div class="flex items-end gap-6">
            <h1 class="text-6xl font-black uppercase tracking-[0.04em] text-sky-400 md:text-8xl">
              NEWS
            </h1>

            <p class="mb-5 text-sm font-bold tracking-[0.35em] text-sky-400 md:text-base">
              ニュース
            </p>
          </div>

          <!-- 这个 BACK 是新闻完整页返回首页新闻模块 -->
          <button
            v-if="showFullPage"
            class="news-back-btn flex items-center gap-2 rounded-full border-2 border-sky-300 bg-white/80 px-4 py-2 text-sm font-bold tracking-[0.1em] text-sky-500 transition-all hover:bg-sky-50 hover:shadow-md"
            @click="goHomeNewsSection"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>
        </div>
      </header>

      <main>
        <!-- 首页：3 个；新闻页：12 个 -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in displayedNews"
            :key="item.id"
            class="group cursor-pointer rounded-xl border-2 border-sky-300 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-lg"
            @click="openNewsDetail(item)"
          >
            <div class="relative aspect-[16/9] overflow-hidden rounded-lg">
              <img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                :style="{ objectPosition: item.imagePosition || 'center' }"
              />

              <div class="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold tracking-[0.15em] text-sky-500 shadow-sm">
                NEWS
              </div>
            </div>

            <time class="mt-4 block text-lg font-bold tracking-[0.08em] text-sky-500">
              {{ item.date }}
            </time>

            <h2 class="mt-3 line-clamp-2 text-sm font-bold leading-6 tracking-[0.04em] text-[#263f48]">
              {{ item.title }}
            </h2>
          </article>
        </div>

        <!-- MORE 按钮：只在首页模块显示 -->
        <div v-if="!showFullPage" class="mt-14 flex justify-center">
          <NuxtLink
            to="/news"
            class="group flex h-14 w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-8 py-4 text-sm font-black tracking-[0.4em] text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <span>MORE</span>

            <span class="transition-transform group-hover:translate-x-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const router = useRouter()

const props = defineProps({
  showFullPage: {
    type: Boolean,
    default: true
  }
})

const selectedNews = ref(null)

const newsList = [
  {
    id: 1,
    date: '2026.03.19',
    title: 'スペシャルイベントの詳細情報を公開！（チケット先行優先販売受付ほか）',
    image: '/images/news1.jpg',
    body: [
      'ATRI記念イベントの詳細情報を公開しました。作品の世界観を楽しめるトークや展示企画など、特別な一日を予定しています。',
      'チケットの受付期間や参加方法につきましては、下記の概要をご確認ください。今後の追加情報も本ページにて順次お知らせいたします。'
    ],
    event: {
      date: '2026年8月16日（日）',
      place: 'アクアシティホール',
      content: 'キャストトーク、展示、来場者特典配布など'
    },
    notes: [
      '内容は予告なく変更となる場合があります。',
      '会場への直接のお問い合わせはご遠慮ください。'
    ]
  },
  {
    id: 2,
    date: '2026.03.06',
    title: 'スペシャルイベント開催決定！！',
    image: '/images/news2.jpg',
    body: [
      'ATRI公式スペシャルイベントの開催が決定しました。',
      '開催日時、出演者、チケット情報などの詳細は後日発表いたします。'
    ],
    event: {
      date: '後日公開予定',
      place: '後日公開予定',
      content: 'スペシャルトーク、最新情報発表など'
    },
    notes: [
      '詳細は後日発表いたします。'
    ]
  },
  {
    id: 3,
    date: '2026.03.03',
    title: '甘慣れな子誕生日記念♡直筆サイン色紙をプレゼント',
    image: '/images/news3.jpg',
    body: [
      'キャラクターの誕生日を記念して、抽選プレゼントキャンペーンを実施します。',
      '対象期間中に指定の方法で応募された方の中から、直筆サイン色紙をプレゼントいたします。'
    ],
    event: {
      date: '2026年3月3日（火）〜3月10日（火）',
      place: '公式SNS',
      content: 'フォロー＆リポストキャンペーン'
    },
    notes: [
      '応募には公式SNSアカウントのフォローが必要です。'
    ]
  },
  {
    id: 4,
    date: '2026.03.16',
    title: 'イベント情報と追加キャンペーンのお知らせを公開しました',
    image: '/images/news4.jpg',
    body: [
      'イベントに関する追加情報を公開しました。',
      '詳細は各項目をご確認ください。'
    ],
    event: {
      date: '2026年3月16日（月）',
      place: '公式サイト内',
      content: '追加キャンペーン情報公開'
    },
    notes: [
      'キャンペーン内容は変更となる可能性があります。'
    ]
  },
  {
    id: 5,
    date: '2026.02.13',
    title: '【ゲーマーズ限定】Blu-ray全巻購入キャンペーンのお知らせ',
    image: '/images/news5.jpg',
    body: [
      'Blu-ray全巻購入者を対象とした限定キャンペーンを実施します。'
    ],
    event: {
      date: '2026年2月13日（金）開始',
      place: '対象店舗',
      content: 'Blu-ray購入者限定特典キャンペーン'
    },
    notes: [
      '特典はなくなり次第終了となります。'
    ]
  },
  {
    id: 6,
    date: '2026.01.19',
    title: 'スタッフ＆キャストによるトークイベント情報を公開しました',
    image: '/images/news6.jpg',
    body: [
      'スタッフ＆キャストによるスペシャルトークイベントの情報を公開しました。'
    ],
    event: {
      date: '2026年1月19日（月）',
      place: 'イベント会場',
      content: 'スタッフ＆キャストトーク'
    },
    notes: [
      '登壇者は予告なく変更となる場合があります。'
    ]
  },
  {
    id: 7,
    date: '2025.12.25',
    title: '公式サイトを更新しました',
    image: '/images/news7.jpg',
    body: [
      '公式サイトの情報を更新しました。',
      '今後も最新情報を順次公開予定です。'
    ],
    event: {
      date: '2025年12月25日（木）',
      place: '公式サイト',
      content: 'サイト更新情報'
    },
    notes: [
      '最新情報は公式サイトをご確認ください。'
    ]
  },
  {
    id: 8,
    date: '2025.12.12',
    title: 'キャラクター情報を追加公開しました',
    image: '/images/news8.jpg',
    body: [
      'キャラクター紹介ページに新しい情報を追加しました。'
    ],
    event: {
      date: '2025年12月12日（金）',
      place: 'キャラクターページ',
      content: 'キャラクター情報追加'
    },
    notes: [
      '掲載内容は変更となる場合があります。'
    ]
  },
  {
    id: 9,
    date: '2025.11.30',
    title: 'グッズ情報を公開しました',
    image: '/images/news9.jpg',
    body: [
      '関連グッズの情報を公開しました。'
    ],
    event: {
      date: '2025年11月30日（日）',
      place: '商品ページ',
      content: 'グッズ情報公開'
    },
    notes: [
      '商品画像はイメージです。'
    ]
  },
  {
    id: 10,
    date: '2025.11.15',
    title: 'ストーリーページを更新しました',
    image: '/images/news10.png',
    body: [
      'ストーリーページの内容を更新しました。'
    ],
    event: {
      date: '2025年11月15日（土）',
      place: 'ストーリーページ',
      content: 'ストーリー情報更新'
    },
    notes: [
      '一部内容にはネタバレを含む場合があります。'
    ]
  },
  {
    id: 11,
    date: '2025.10.28',
    title: '場面カットを追加しました',
    image: '/images/news11.jpg',
    imagePosition: 'center 30%',
    body: [
      'ギャラリーページに新しい場面カットを追加しました。'
    ],
    event: {
      date: '2025年10月28日（火）',
      place: 'ギャラリーページ',
      content: '場面カット追加'
    },
    notes: [
      '画像は開発中のものを含む場合があります。'
    ]
  },
  {
    id: 12,
    date: '2025.10.10',
    title: 'スペシャルコンテンツを公開しました',
    image: '/images/news12.jpg',
    imagePosition: 'center 25%',
    body: [
      'スペシャルページに新しいコンテンツを公開しました。'
    ],
    event: {
      date: '2025年10月10日（金）',
      place: 'スペシャルページ',
      content: 'スペシャルコンテンツ公開'
    },
    notes: [
      '公開期間は変更となる場合があります。'
    ]
  }
]

const displayedNews = computed(() => {
  if (props.showFullPage) {
    return newsList
  }

  return newsList.slice(0, 3)
})

function openNewsDetail(news) {
  selectedNews.value = news

  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    })
  }
}

function markSkipIntro() {
  try {
    sessionStorage.setItem('atriSkipHomeIntroOnce', '1')
    sessionStorage.setItem('atriSkipIntro', '1')
    sessionStorage.setItem('introPlayed', 'true')
  } catch {}
}

/**
 * 新闻完整页右上角 BACK：
 * 回到首页新闻模块，也就是 3 个新闻卡片 + MORE 的区域。
 */
async function goHomeNewsSection() {
  selectedNews.value = null
  markSkipIntro()

  await router.push({
    path: '/',
    hash: '#news'
  })

  await nextTick()

  requestAnimationFrame(() => {
    const newsSection = document.getElementById('news')

    if (newsSection) {
      const oldHtmlBehavior = document.documentElement.style.scrollBehavior
      const oldBodyBehavior = document.body.style.scrollBehavior

      document.documentElement.style.scrollBehavior = 'auto'
      document.body.style.scrollBehavior = 'auto'

      const targetTop = newsSection.getBoundingClientRect().top + window.scrollY

      window.scrollTo({
        top: targetTop,
        left: 0,
        behavior: 'auto'
      })

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = oldHtmlBehavior
        document.body.style.scrollBehavior = oldBodyBehavior
      })
    }
  })
}

/**
 * 详情页右上角 ×：
 * 只关闭详情，回到当前 /news 的 12 个新闻展示框。
 */
async function closeDetailToNewsList() {
  selectedNews.value = null
  markSkipIntro()

  await nextTick()

  if (!props.showFullPage) {
    await router.push('/news')
    return
  }

  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    })
  }
}
</script>

<style scoped>
.news-detail {
  background-color: #ffffff;
  background-image:
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.98) 0 170px, transparent 172px),
    radial-gradient(circle at 92% 12%, rgba(232, 249, 255, 0.92) 0 130px, transparent 132px),
    linear-gradient(180deg, #ffffff 0%, #f7fcfe 42%, #e8f9ff 100%);
}

.news-detail-bubbles {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.news-detail-bubbles span {
  position: absolute;
  bottom: -160px;
  display: block;
  width: var(--bubble-size);
  height: var(--bubble-size);
  border: 3px solid rgba(95, 184, 215, 0.58);
  border-radius: 999px;
  background:
    radial-gradient(circle at 28% 26%, rgba(255, 255, 255, 0.98) 0 15%, transparent 16%),
    radial-gradient(circle at 68% 72%, rgba(121, 215, 240, 0.32) 0 22%, transparent 24%),
    rgba(232, 249, 255, 0.5);
  box-shadow:
    inset 0 0 34px rgba(255, 255, 255, 0.92),
    0 18px 42px rgba(79, 176, 207, 0.2);
  animation:
    news-bubble-float var(--bubble-duration) linear infinite,
    news-bubble-pulse 4.8s ease-in-out infinite;
  animation-delay: var(--bubble-delay);
  left: var(--bubble-left);
  opacity: var(--bubble-opacity);
}

.news-detail-bubbles span:nth-child(1) {
  --bubble-size: 92px;
  --bubble-left: 6%;
  --bubble-duration: 16s;
  --bubble-delay: -4s;
  --bubble-opacity: 0.72;
}

.news-detail-bubbles span:nth-child(2) {
  --bubble-size: 152px;
  --bubble-left: 15%;
  --bubble-duration: 21s;
  --bubble-delay: -17s;
  --bubble-opacity: 0.54;
}

.news-detail-bubbles span:nth-child(3) {
  --bubble-size: 62px;
  --bubble-left: 24%;
  --bubble-duration: 14s;
  --bubble-delay: -9s;
  --bubble-opacity: 0.68;
}

.news-detail-bubbles span:nth-child(4) {
  --bubble-size: 118px;
  --bubble-left: 34%;
  --bubble-duration: 19s;
  --bubble-delay: -2s;
  --bubble-opacity: 0.64;
}

.news-detail-bubbles span:nth-child(5) {
  --bubble-size: 176px;
  --bubble-left: 47%;
  --bubble-duration: 24s;
  --bubble-delay: -21s;
  --bubble-opacity: 0.48;
}

.news-detail-bubbles span:nth-child(6) {
  --bubble-size: 78px;
  --bubble-left: 57%;
  --bubble-duration: 15s;
  --bubble-delay: -12s;
  --bubble-opacity: 0.7;
}

.news-detail-bubbles span:nth-child(7) {
  --bubble-size: 136px;
  --bubble-left: 66%;
  --bubble-duration: 20s;
  --bubble-delay: -7s;
  --bubble-opacity: 0.58;
}

.news-detail-bubbles span:nth-child(8) {
  --bubble-size: 88px;
  --bubble-left: 76%;
  --bubble-duration: 17s;
  --bubble-delay: -15s;
  --bubble-opacity: 0.7;
}

.news-detail-bubbles span:nth-child(9) {
  --bubble-size: 190px;
  --bubble-left: 84%;
  --bubble-duration: 26s;
  --bubble-delay: -25s;
  --bubble-opacity: 0.46;
}

.news-detail-bubbles span:nth-child(10) {
  --bubble-size: 58px;
  --bubble-left: 91%;
  --bubble-duration: 13s;
  --bubble-delay: -5s;
  --bubble-opacity: 0.76;
}

.news-detail-bubbles span:nth-child(11) {
  --bubble-size: 110px;
  --bubble-left: 3%;
  --bubble-duration: 18s;
  --bubble-delay: -23s;
  --bubble-opacity: 0.58;
}

.news-detail-bubbles span:nth-child(12) {
  --bubble-size: 72px;
  --bubble-left: 72%;
  --bubble-duration: 14s;
  --bubble-delay: -1s;
  --bubble-opacity: 0.72;
}

@keyframes news-bubble-float {
  0% {
    transform: translate3d(0, 0, 0) scale(0.92);
  }

  25% {
    transform: translate3d(44px, -30vh, 0) scale(1.04);
  }

  55% {
    transform: translate3d(-38px, -62vh, 0) scale(1.1);
  }

  78% {
    transform: translate3d(30px, -88vh, 0) scale(1);
  }

  100% {
    transform: translate3d(-18px, calc(-100vh - 260px), 0) scale(0.94);
  }
}

@keyframes news-bubble-pulse {
  0%,
  100% {
    filter: saturate(1) brightness(1);
  }

  50% {
    filter: saturate(1.25) brightness(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-detail-bubbles span {
    animation: none;
    transform: translateY(-22vh);
  }
}
</style>