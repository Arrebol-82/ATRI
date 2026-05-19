<template>
  <section
    ref="newsPageRoot"
    class="relative min-h-screen overflow-hidden text-[#24424b]"
    :class="showFullPage ? 'bg-gradient-to-b from-sky-50/50 to-white' : 'bg-white'"
  >
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[8%] top-20 h-[320px] w-[320px] rounded-full bg-sky-100/60 blur-3xl"></div>
      <div class="absolute right-[5%] top-[30%] h-[280px] w-[280px] rounded-full bg-sky-50/80 blur-3xl"></div>
      <div class="absolute left-[20%] bottom-20 h-[200px] w-[200px] rounded-full border border-sky-100/50"></div>
    </div>

    <!-- 新闻详情页 -->
    <div
      v-if="selectedNews"
      ref="detailOverlay"
      class="news-detail-page relative z-[60] bg-white"
      tabindex="-1"
    >
      <article class="news-detail relative min-h-screen w-full overflow-hidden p-6 text-[#263f48] md:p-10 lg:p-14">
        <div class="news-detail-bubbles" aria-hidden="true">
          <span v-for="i in 6" :key="i" />
        </div>

        <div class="relative z-[1] mx-auto max-w-[900px]">
          <div class="rounded-[28px] border-2 border-sky-200 bg-white/95 px-7 py-9 shadow-[0_18px_50px_rgba(56,189,248,0.12)] md:px-12 md:py-12">
            <div class="mb-6 flex items-center justify-end">
              <button
                class="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white/90 text-xl font-black leading-none text-sky-400 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                :aria-label="t('news.detail.close')"
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
                loading="eager"
                decoding="async"
                :style="{ objectPosition: selectedNews.imagePosition || 'center' }"
              >
            </div>

            <h2 class="mt-5 border-b-2 border-sky-100 pb-8 text-2xl font-black leading-[1.7] tracking-[0.06em] text-[#263f48] md:text-4xl">
              {{ selectedNews.title }}
            </h2>

            <div class="mt-10 space-y-8 text-[17px] font-medium leading-[2.1] tracking-[0.04em] text-[#263f48]">
              <p v-for="paragraph in selectedNews.body" :key="paragraph">
                {{ paragraph }}
              </p>

              <section class="rounded-2xl bg-sky-50/80 p-6">
                <h3 class="mb-4 text-xl font-black text-sky-500">
                  {{ t('news.detail.eventOverview') }}
                </h3>

                <dl class="space-y-3">
                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">
                      {{ t('news.detail.schedule') }}
                    </dt>
                    <dd>{{ selectedNews.event.date }}</dd>
                  </div>

                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">
                      {{ t('news.detail.venue') }}
                    </dt>
                    <dd>{{ selectedNews.event.place }}</dd>
                  </div>

                  <div class="grid gap-1 md:grid-cols-[120px_1fr]">
                    <dt class="font-bold text-sky-500">
                      {{ t('news.detail.content') }}
                    </dt>
                    <dd>{{ selectedNews.event.content }}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 class="mb-4 text-xl font-black text-sky-500">
                  {{ t('news.detail.notes') }}
                </h3>

                <ul class="list-disc space-y-2 pl-6">
                  <li v-for="note in selectedNews.notes" :key="note">
                    {{ note }}
                  </li>
                </ul>
              </section>
            </div>

            <div class="mt-12 border-t-2 border-sky-100 pt-8">
              <p class="mb-4 text-sm font-black tracking-[0.3em] text-sky-400">
                {{ t('news.detail.share') }}
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

    <!-- 新闻列表页 / 新闻模块首页内容 -->
    <div
      v-else
      class="relative z-10 mx-auto max-w-[1200px] px-6 py-20 md:px-10 lg:py-24"
    >
      <header class="mb-14">
        <div class="flex items-center justify-between">
          <div class="flex items-end gap-6">
            <h1 class="text-6xl font-black uppercase tracking-[0.04em] text-sky-400 md:text-8xl">
              {{ t('news.title') }}
            </h1>

            <p class="mb-5 text-sm font-bold tracking-[0.35em] text-sky-400 md:text-base">
              {{ t('news.subtitle') }}
            </p>
          </div>

          <button
            v-if="showFullPage"
            class="news-back-btn flex items-center gap-2 rounded-full border-2 border-sky-300 bg-white/80 px-4 py-2 text-sm font-bold tracking-[0.1em] text-sky-500 transition-[background-color,box-shadow] hover:bg-sky-50 hover:shadow-md disabled:cursor-wait disabled:opacity-80"
            :disabled="isRouteChanging"
            @click="goHomeNewsSection"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{{ t('news.back') }}</span>
          </button>
        </div>
      </header>

      <main>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in displayedNews"
            :key="item.id"
            class="news-card group cursor-pointer rounded-xl border-2 border-sky-300 bg-white p-4 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-lg"
            @click="openNewsDetail(item)"
          >
            <div class="relative aspect-[16/9] overflow-hidden rounded-lg">
              <img
                :src="item.image"
                :alt="item.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                decoding="async"
                :loading="item.id <= 3 ? 'eager' : 'lazy'"
                :fetchpriority="item.id <= 3 ? 'high' : 'low'"
                :style="{ objectPosition: item.imagePosition || 'center' }"
              >

              <div class="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold tracking-[0.15em] text-sky-500 shadow-sm">
                {{ t('news.cardLabel') }}
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

        <div v-if="!showFullPage" class="mt-14 flex justify-center">
          <button
            type="button"
            class="group flex h-14 w-[200px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-300 px-8 py-4 text-sm font-black tracking-[0.4em] text-white shadow-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-wait disabled:opacity-90"
            :disabled="isRouteChanging"
            @click="goNewsFullPage"
          >
            <span>{{ t('news.more') }}</span>

            <span class="transition-transform group-hover:translate-x-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, nextTick, onActivated, onBeforeUnmount, onMounted, ref } from 'vue'

const router = useRouter()
const newsReturnMaskVisible = useState('news-return-mask-visible', () => false)

const props = defineProps({
  showFullPage: {
    type: Boolean,
    default: true
  }
})

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)

const selectedNewsId = ref(null)
const isRouteChanging = ref(false)
const newsPageRoot = ref(null)
const detailOverlay = ref(null)

let scrollFrame = null
let scrollTimer = null

const newsBaseList = [
  {
    id: 1,
    date: '2026.03.19',
    image: '/images/news1.jpg'
  },
  {
    id: 2,
    date: '2026.03.06',
    image: '/images/news2.jpg'
  },
  {
    id: 3,
    date: '2026.03.03',
    image: '/images/news3.jpg'
  },
  {
    id: 4,
    date: '2026.03.16',
    image: '/images/news4.jpg'
  },
  {
    id: 5,
    date: '2026.02.13',
    image: '/images/news5.jpg'
  },
  {
    id: 6,
    date: '2026.01.19',
    image: '/images/news6.jpg'
  },
  {
    id: 7,
    date: '2025.12.25',
    image: '/images/news7.jpg'
  },
  {
    id: 8,
    date: '2025.12.12',
    image: '/images/news8.jpg'
  },
  {
    id: 9,
    date: '2025.11.30',
    image: '/images/news9.jpg'
  },
  {
    id: 10,
    date: '2025.11.15',
    image: '/images/news10.png'
  },
  {
    id: 11,
    date: '2025.10.28',
    image: '/images/news11.jpg',
    imagePosition: 'center 30%'
  },
  {
    id: 12,
    date: '2025.10.10',
    image: '/images/news12.jpg',
    imagePosition: 'center 25%'
  }
]

const newsTranslations = {
  zh: {
    'news.title': 'NEWS',
    'news.subtitle': '新闻',
    'news.back': '返回',
    'news.more': '更多',
    'news.cardLabel': '新闻',
    'news.detail.close': '关闭新闻详情',
    'news.detail.eventOverview': '活动概要',
    'news.detail.schedule': '日程',
    'news.detail.venue': '会场',
    'news.detail.content': '内容',
    'news.detail.notes': '注意事项',
    'news.detail.share': '分享',

    'news.1.title': '特别活动详细情报公开！（含门票优先销售等）',
    'news.1.body': [
      'ATRI 纪念活动的详细情报已经公开。当天将准备能感受作品世界观的访谈、展示企划等特别内容。',
      '关于门票受付期间和参加方式，请确认下方概要。后续追加情报也会在本页面陆续公布。'
    ],
    'news.1.event.date': '2026年8月16日（周日）',
    'news.1.event.place': 'Aqua City Hall',
    'news.1.event.content': '声优访谈、展示、到场特典发放等',
    'news.1.notes': [
      '活动内容可能会在未提前通知的情况下变更。',
      '请勿直接向会场咨询相关事项。'
    ],

    'news.2.title': '特别活动确定举办！！',
    'news.2.body': [
      'ATRI 官方特别活动确定举办。',
      '举办日期、出演者、门票情报等详细内容将在日后公布。'
    ],
    'news.2.event.date': '日后公布',
    'news.2.event.place': '日后公布',
    'news.2.event.content': '特别访谈、最新情报发布等',
    'news.2.notes': ['详细内容将在日后公布。'],

    'news.3.title': '角色生日纪念♡亲笔签名色纸赠送活动',
    'news.3.body': [
      '为纪念角色生日，将举办抽选赠送活动。',
      '在活动期间内按指定方式参与的用户，将有机会获得亲笔签名色纸。'
    ],
    'news.3.event.date': '2026年3月3日（周二）〜3月10日（周二）',
    'news.3.event.place': '官方 SNS',
    'news.3.event.content': '关注＆转发活动',
    'news.3.notes': ['参与活动需要关注官方 SNS 账号。'],

    'news.4.title': '活动情报与追加活动公告已公开',
    'news.4.body': [
      '活动相关的追加情报已经公开。',
      '请查看各项目中的详细内容。'
    ],
    'news.4.event.date': '2026年3月16日（周一）',
    'news.4.event.place': '官方网站内',
    'news.4.event.content': '追加活动情报公开',
    'news.4.notes': ['活动内容可能会发生变更。'],

    'news.5.title': '【Gamers 限定】Blu-ray 全卷购买活动公告',
    'news.5.body': ['将举办面向 Blu-ray 全卷购买者的限定活动。'],
    'news.5.event.date': '2026年2月13日（周五）开始',
    'news.5.event.place': '指定店铺',
    'news.5.event.content': 'Blu-ray 购买者限定特典活动',
    'news.5.notes': ['特典数量有限，送完即止。'],

    'news.6.title': '工作人员＆声优特别访谈活动情报公开',
    'news.6.body': ['工作人员与声优共同参与的特别访谈活动情报已经公开。'],
    'news.6.event.date': '2026年1月19日（周一）',
    'news.6.event.place': '活动会场',
    'news.6.event.content': '工作人员＆声优访谈',
    'news.6.notes': ['登台人员可能会在未提前通知的情况下变更。'],

    'news.7.title': '官方网站已更新',
    'news.7.body': [
      '官方网站信息已经更新。',
      '今后也将陆续公开最新情报。'
    ],
    'news.7.event.date': '2025年12月25日（周四）',
    'news.7.event.place': '官方网站',
    'news.7.event.content': '网站更新情报',
    'news.7.notes': ['最新情报请以官方网站为准。'],

    'news.8.title': '追加角色情报已公开',
    'news.8.body': ['角色介绍页面已追加新的情报。'],
    'news.8.event.date': '2025年12月12日（周五）',
    'news.8.event.place': '角色页面',
    'news.8.event.content': '角色情报追加',
    'news.8.notes': ['刊登内容可能会发生变更。'],

    'news.9.title': '周边商品情报已公开',
    'news.9.body': ['相关周边商品的情报已经公开。'],
    'news.9.event.date': '2025年11月30日（周日）',
    'news.9.event.place': '商品页面',
    'news.9.event.content': '周边商品情报公开',
    'news.9.notes': ['商品图片仅供参考。'],

    'news.10.title': '故事页面已更新',
    'news.10.body': ['故事页面内容已经更新。'],
    'news.10.event.date': '2025年11月15日（周六）',
    'news.10.event.place': '故事页面',
    'news.10.event.content': '故事情报更新',
    'news.10.notes': ['部分内容可能包含剧透。'],

    'news.11.title': '新增场景截图',
    'news.11.body': ['画廊页面已追加新的场景截图。'],
    'news.11.event.date': '2025年10月28日（周二）',
    'news.11.event.place': '画廊页面',
    'news.11.event.content': '场景截图追加',
    'news.11.notes': ['图片可能包含开发中的画面。'],

    'news.12.title': '特别内容已公开',
    'news.12.body': ['特别页面已公开新的内容。'],
    'news.12.event.date': '2025年10月10日（周五）',
    'news.12.event.place': '特别页面',
    'news.12.event.content': '特别内容公开',
    'news.12.notes': ['公开期间可能会发生变更。']
  },

  en: {
    'news.title': 'NEWS',
    'news.subtitle': 'News',
    'news.back': 'BACK',
    'news.more': 'MORE',
    'news.cardLabel': 'NEWS',
    'news.detail.close': 'Close news detail',
    'news.detail.eventOverview': 'Event Overview',
    'news.detail.schedule': 'Schedule',
    'news.detail.venue': 'Venue',
    'news.detail.content': 'Content',
    'news.detail.notes': 'Notes',
    'news.detail.share': 'SHARE',

    'news.1.title': 'Special event details revealed! Including early ticket sales',
    'news.1.body': [
      'Details for the ATRI commemorative event have been released. A special day is planned with talks, exhibitions, and programs that let visitors enjoy the world of the series.',
      'Please check the overview below for ticket sales periods and participation details. Additional updates will be announced on this page.'
    ],
    'news.1.event.date': 'Sunday, August 16, 2026',
    'news.1.event.place': 'Aqua City Hall',
    'news.1.event.content': 'Cast talk, exhibition, visitor bonuses, and more',
    'news.1.notes': [
      'Event contents may change without prior notice.',
      'Please refrain from contacting the venue directly.'
    ],

    'news.2.title': 'Special event confirmed!',
    'news.2.body': [
      'An official ATRI special event has been confirmed.',
      'Details including date, guests, and ticket information will be announced later.'
    ],
    'news.2.event.date': 'To be announced',
    'news.2.event.place': 'To be announced',
    'news.2.event.content': 'Special talk, latest announcements, and more',
    'news.2.notes': ['More details will be announced later.'],

    'news.3.title': 'Birthday celebration campaign: signed illustration board giveaway',
    'news.3.body': [
      'A giveaway campaign will be held to celebrate the character’s birthday.',
      'Participants who apply during the campaign period through the specified method will have a chance to win a hand-signed illustration board.'
    ],
    'news.3.event.date': 'Tuesday, March 3 – Tuesday, March 10, 2026',
    'news.3.event.place': 'Official social media',
    'news.3.event.content': 'Follow and repost campaign',
    'news.3.notes': ['Following the official social media account is required to enter.'],

    'news.4.title': 'Event information and additional campaign notices released',
    'news.4.body': [
      'Additional information related to the event has been released.',
      'Please check each section for details.'
    ],
    'news.4.event.date': 'Monday, March 16, 2026',
    'news.4.event.place': 'Official website',
    'news.4.event.content': 'Additional campaign information released',
    'news.4.notes': ['Campaign contents may be subject to change.'],

    'news.5.title': '[Gamers Exclusive] Blu-ray complete purchase campaign notice',
    'news.5.body': ['A limited campaign will be held for customers who purchase the full Blu-ray set.'],
    'news.5.event.date': 'Starts Friday, February 13, 2026',
    'news.5.event.place': 'Participating stores',
    'news.5.event.content': 'Blu-ray purchaser exclusive bonus campaign',
    'news.5.notes': ['Bonuses are available while supplies last.'],

    'news.6.title': 'Staff and cast talk event information released',
    'news.6.body': ['Information about a special talk event featuring staff and cast members has been released.'],
    'news.6.event.date': 'Monday, January 19, 2026',
    'news.6.event.place': 'Event venue',
    'news.6.event.content': 'Staff and cast talk event',
    'news.6.notes': ['Guest appearances may change without prior notice.'],

    'news.7.title': 'Official website updated',
    'news.7.body': [
      'Information on the official website has been updated.',
      'More updates will continue to be released in the future.'
    ],
    'news.7.event.date': 'Thursday, December 25, 2025',
    'news.7.event.place': 'Official website',
    'news.7.event.content': 'Website update information',
    'news.7.notes': ['Please check the official website for the latest information.'],

    'news.8.title': 'Additional character information released',
    'news.8.body': ['New information has been added to the character introduction page.'],
    'news.8.event.date': 'Friday, December 12, 2025',
    'news.8.event.place': 'Character page',
    'news.8.event.content': 'Additional character information',
    'news.8.notes': ['Published contents may be subject to change.'],

    'news.9.title': 'Merchandise information released',
    'news.9.body': ['Information about related merchandise has been released.'],
    'news.9.event.date': 'Sunday, November 30, 2025',
    'news.9.event.place': 'Product page',
    'news.9.event.content': 'Merchandise information released',
    'news.9.notes': ['Product images are for reference only.'],

    'news.10.title': 'Story page updated',
    'news.10.body': ['The contents of the story page have been updated.'],
    'news.10.event.date': 'Saturday, November 15, 2025',
    'news.10.event.place': 'Story page',
    'news.10.event.content': 'Story information update',
    'news.10.notes': ['Some contents may include spoilers.'],

    'news.11.title': 'New scene cuts added',
    'news.11.body': ['New scene cuts have been added to the gallery page.'],
    'news.11.event.date': 'Tuesday, October 28, 2025',
    'news.11.event.place': 'Gallery page',
    'news.11.event.content': 'Scene cuts added',
    'news.11.notes': ['Images may include work-in-progress visuals.'],

    'news.12.title': 'Special content released',
    'news.12.body': ['New content has been released on the special page.'],
    'news.12.event.date': 'Friday, October 10, 2025',
    'news.12.event.place': 'Special page',
    'news.12.event.content': 'Special content released',
    'news.12.notes': ['The release period may be subject to change.']
  },

  ja: {
    'news.title': 'NEWS',
    'news.subtitle': 'ニュース',
    'news.back': 'BACK',
    'news.more': 'MORE',
    'news.cardLabel': 'NEWS',
    'news.detail.close': 'ニュース詳細を閉じる',
    'news.detail.eventOverview': 'イベント概要',
    'news.detail.schedule': '日程',
    'news.detail.venue': '会場',
    'news.detail.content': '内容',
    'news.detail.notes': '注意事項',
    'news.detail.share': 'SHARE',

    'news.1.title': 'スペシャルイベントの詳細情報を公開！（チケット先行優先販売受付ほか）',
    'news.1.body': [
      'ATRI記念イベントの詳細情報を公開しました。作品の世界観を楽しめるトークや展示企画など、特別な一日を予定しています。',
      'チケットの受付期間や参加方法につきましては、下記の概要をご確認ください。今後の追加情報も本ページにて順次お知らせいたします。'
    ],
    'news.1.event.date': '2026年8月16日（日）',
    'news.1.event.place': 'アクアシティホール',
    'news.1.event.content': 'キャストトーク、展示、来場者特典配布など',
    'news.1.notes': [
      '内容は予告なく変更となる場合があります。',
      '会場への直接のお問い合わせはご遠慮ください。'
    ],

    'news.2.title': 'スペシャルイベント開催決定！！',
    'news.2.body': [
      'ATRI公式スペシャルイベントの開催が決定しました。',
      '開催日時、出演者、チケット情報などの詳細は後日発表いたします。'
    ],
    'news.2.event.date': '後日公開予定',
    'news.2.event.place': '後日公開予定',
    'news.2.event.content': 'スペシャルトーク、最新情報発表など',
    'news.2.notes': ['詳細は後日発表いたします。'],

    'news.3.title': '甘慣れな子誕生日記念♡直筆サイン色紙をプレゼント',
    'news.3.body': [
      'キャラクターの誕生日を記念して、抽選プレゼントキャンペーンを実施します。',
      '対象期間中に指定の方法で応募された方の中から、直筆サイン色紙をプレゼントいたします。'
    ],
    'news.3.event.date': '2026年3月3日（火）〜3月10日（火）',
    'news.3.event.place': '公式SNS',
    'news.3.event.content': 'フォロー＆リポストキャンペーン',
    'news.3.notes': ['応募には公式SNSアカウントのフォローが必要です。'],

    'news.4.title': 'イベント情報と追加キャンペーンのお知らせを公開しました',
    'news.4.body': [
      'イベントに関する追加情報を公開しました。',
      '詳細は各項目をご確認ください。'
    ],
    'news.4.event.date': '2026年3月16日（月）',
    'news.4.event.place': '公式サイト内',
    'news.4.event.content': '追加キャンペーン情報公開',
    'news.4.notes': ['キャンペーン内容は変更となる可能性があります。'],

    'news.5.title': '【ゲーマーズ限定】Blu-ray全巻購入キャンペーンのお知らせ',
    'news.5.body': ['Blu-ray全巻購入者を対象とした限定キャンペーンを実施します。'],
    'news.5.event.date': '2026年2月13日（金）開始',
    'news.5.event.place': '対象店舗',
    'news.5.event.content': 'Blu-ray購入者限定特典キャンペーン',
    'news.5.notes': ['特典はなくなり次第終了となります。'],

    'news.6.title': 'スタッフ＆キャストによるトークイベント情報を公開しました',
    'news.6.body': ['スタッフ＆キャストによるスペシャルトークイベントの情報を公開しました。'],
    'news.6.event.date': '2026年1月19日（月）',
    'news.6.event.place': 'イベント会場',
    'news.6.event.content': 'スタッフ＆キャストトーク',
    'news.6.notes': ['登壇者は予告なく変更となる場合があります。'],

    'news.7.title': '公式サイトを更新しました',
    'news.7.body': [
      '公式サイトの情報を更新しました。',
      '今後も最新情報を順次公開予定です。'
    ],
    'news.7.event.date': '2025年12月25日（木）',
    'news.7.event.place': '公式サイト',
    'news.7.event.content': 'サイト更新情報',
    'news.7.notes': ['最新情報は公式サイトをご確認ください。'],

    'news.8.title': 'キャラクター情報を追加公開しました',
    'news.8.body': ['キャラクター紹介ページに新しい情報を追加しました。'],
    'news.8.event.date': '2025年12月12日（金）',
    'news.8.event.place': 'キャラクターページ',
    'news.8.event.content': 'キャラクター情報追加',
    'news.8.notes': ['掲載内容は変更となる場合があります。'],

    'news.9.title': 'グッズ情報を公開しました',
    'news.9.body': ['関連グッズの情報を公開しました。'],
    'news.9.event.date': '2025年11月30日（日）',
    'news.9.event.place': '商品ページ',
    'news.9.event.content': 'グッズ情報公開',
    'news.9.notes': ['商品画像はイメージです。'],

    'news.10.title': 'ストーリーページを更新しました',
    'news.10.body': ['ストーリーページの内容を更新しました。'],
    'news.10.event.date': '2025年11月15日（土）',
    'news.10.event.place': 'ストーリーページ',
    'news.10.event.content': 'ストーリー情報更新',
    'news.10.notes': ['一部内容にはネタバレを含む場合があります。'],

    'news.11.title': '場面カットを追加しました',
    'news.11.body': ['ギャラリーページに新しい場面カットを追加しました。'],
    'news.11.event.date': '2025年10月28日（火）',
    'news.11.event.place': 'ギャラリーページ',
    'news.11.event.content': '場面カット追加',
    'news.11.notes': ['画像は開発中のものを含む場合があります。'],

    'news.12.title': 'スペシャルコンテンツを公開しました',
    'news.12.body': ['スペシャルページに新しいコンテンツを公開しました。'],
    'news.12.event.date': '2025年10月10日（金）',
    'news.12.event.place': 'スペシャルページ',
    'news.12.event.content': 'スペシャルコンテンツ公開',
    'news.12.notes': ['公開期間は変更となる場合があります。']
  }
}

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value

  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

const newsList = computed(() =>
  newsBaseList.map((item) => ({
    ...item,
    title: t(`news.${item.id}.title`),
    body: t(`news.${item.id}.body`),
    event: {
      date: t(`news.${item.id}.event.date`),
      place: t(`news.${item.id}.event.place`),
      content: t(`news.${item.id}.event.content`)
    },
    notes: t(`news.${item.id}.notes`)
  }))
)

const selectedNews = computed(() => {
  if (!selectedNewsId.value) return null

  return newsList.value.find((item) => item.id === selectedNewsId.value) || null
})

const displayedNews = computed(() => {
  if (props.showFullPage) {
    return newsList.value
  }

  return newsList.value.slice(0, 3)
})

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function formatMessage(message, params = {}) {
  if (Array.isArray(message)) return message
  if (typeof message !== 'string') return message

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value)
  }, message)
}

function t(key, params = {}) {
  const language = currentLanguage.value
  const message =
    newsTranslations[language]?.[key] ||
    newsTranslations[DEFAULT_LANGUAGE]?.[key] ||
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

function nextFrame() {
  if (typeof window === 'undefined') return Promise.resolve()

  return new Promise((resolve) => {
    window.requestAnimationFrame(resolve)
  })
}

function setWindowTop() {
  if (typeof window === 'undefined') return

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  })

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  if (newsPageRoot.value) {
    newsPageRoot.value.scrollTop = 0
  }
}

function resetNewsPageTop() {
  if (typeof window === 'undefined') return

  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame)
  }

  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
  }

  scrollFrame = window.requestAnimationFrame(() => {
    setWindowTop()

    scrollTimer = window.setTimeout(() => {
      setWindowTop()
    }, 120)
  })
}

function resetDetailTop() {
  if (typeof window === 'undefined') return

  window.requestAnimationFrame(() => {
    if (props.showFullPage) {
      setWindowTop()
    } else if (detailOverlay.value) {
      detailOverlay.value.scrollIntoView({
        block: 'start',
        behavior: 'auto'
      })
    }

    if (detailOverlay.value) {
      detailOverlay.value.focus({
        preventScroll: true
      })
    }
  })
}

async function openNewsDetail(news) {
  if (isRouteChanging.value) return

  selectedNewsId.value = news.id

  await nextTick()
  resetDetailTop()
}

function markSkipIntro() {
  try {
    sessionStorage.setItem('atriSkipHomeIntroOnce', '1')
    sessionStorage.setItem('atriSkipIntro', '1')
    sessionStorage.setItem('introPlayed', 'true')
  } catch {}
}

async function goNewsFullPage() {
  if (isRouteChanging.value) return

  isRouteChanging.value = true
  newsReturnMaskVisible.value = true
  markSkipIntro()

  try {
    await nextTick()
    await nextFrame()
    await navigateTo('/news')
  } catch (error) {
    isRouteChanging.value = false
    newsReturnMaskVisible.value = false
    throw error
  }
}

async function goHomeNewsSection() {
  if (isRouteChanging.value) return

  isRouteChanging.value = true
  selectedNewsId.value = null
  newsReturnMaskVisible.value = true
  markSkipIntro()

  try {
    sessionStorage.setItem('scrollToNews', '1')
    sessionStorage.setItem('atriSkipHomeIntroOnce', '1')
    sessionStorage.setItem('atriSkipIntro', '1')
    sessionStorage.setItem('introPlayed', 'true')
  } catch {}

  try {
    await nextTick()
    await nextFrame()

    await navigateTo('/?section=news', {
      replace: true
    })
  } catch (error) {
    isRouteChanging.value = false
    newsReturnMaskVisible.value = false
    throw error
  }
}

async function closeDetailToNewsList() {
  if (isRouteChanging.value) return

  markSkipIntro()

  if (!props.showFullPage) {
    isRouteChanging.value = true
    newsReturnMaskVisible.value = true

    try {
      await nextTick()
      await nextFrame()
      await router.replace('/news')
    } catch (error) {
      isRouteChanging.value = false
      newsReturnMaskVisible.value = false
      throw error
    }

    return
  }

  selectedNewsId.value = null

  await nextTick()
  resetNewsPageTop()
}

async function setupFullNewsPage() {
  if (!props.showFullPage) return

  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  await nextTick()
  resetNewsPageTop()

  window.setTimeout(() => {
    newsReturnMaskVisible.value = false
    isRouteChanging.value = false
  }, 120)
}

onMounted(() => {
  localLanguage.value = getSavedLanguage()

  if (typeof window !== 'undefined') {
    window.addEventListener('atri-language-change', handleLanguageChange)
  }

  setupFullNewsPage()
})

onActivated(setupFullNewsPage)

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return

  window.removeEventListener('atri-language-change', handleLanguageChange)

  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame)
  }

  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
  }
})
</script>

<style scoped>
.news-card {
  backface-visibility: hidden;
  transform: translateZ(0);
  content-visibility: auto;
  contain-intrinsic-size: 320px;
}

.news-detail-page {
  min-height: 100vh;
  outline: none;
}

.news-detail {
  contain: paint;
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
  transform: translateZ(0);
}

.news-detail-bubbles span {
  position: absolute;
  bottom: -160px;
  display: block;
  width: var(--bubble-size);
  height: var(--bubble-size);
  border: 2px solid rgba(95, 184, 215, 0.42);
  border-radius: 999px;
  background:
    radial-gradient(circle at 28% 26%, rgba(255, 255, 255, 0.9) 0 14%, transparent 16%),
    rgba(232, 249, 255, 0.42);
  box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.72);
  animation: news-bubble-float var(--bubble-duration) linear infinite;
  animation-delay: var(--bubble-delay);
  left: var(--bubble-left);
  opacity: var(--bubble-opacity);
  will-change: transform;
}

.news-detail-bubbles span:nth-child(1) {
  --bubble-size: 88px;
  --bubble-left: 6%;
  --bubble-duration: 18s;
  --bubble-delay: -4s;
  --bubble-opacity: 0.6;
}

.news-detail-bubbles span:nth-child(2) {
  --bubble-size: 132px;
  --bubble-left: 18%;
  --bubble-duration: 23s;
  --bubble-delay: -17s;
  --bubble-opacity: 0.42;
}

.news-detail-bubbles span:nth-child(3) {
  --bubble-size: 60px;
  --bubble-left: 34%;
  --bubble-duration: 16s;
  --bubble-delay: -9s;
  --bubble-opacity: 0.56;
}

.news-detail-bubbles span:nth-child(4) {
  --bubble-size: 112px;
  --bubble-left: 57%;
  --bubble-duration: 21s;
  --bubble-delay: -2s;
  --bubble-opacity: 0.48;
}

.news-detail-bubbles span:nth-child(5) {
  --bubble-size: 150px;
  --bubble-left: 76%;
  --bubble-duration: 26s;
  --bubble-delay: -21s;
  --bubble-opacity: 0.36;
}

.news-detail-bubbles span:nth-child(6) {
  --bubble-size: 72px;
  --bubble-left: 91%;
  --bubble-duration: 17s;
  --bubble-delay: -12s;
  --bubble-opacity: 0.58;
}

@keyframes news-bubble-float {
  0% {
    transform: translate3d(0, 0, 0) scale(0.92);
  }

  35% {
    transform: translate3d(26px, -38vh, 0) scale(1.02);
  }

  70% {
    transform: translate3d(-22px, -74vh, 0) scale(1.06);
  }

  100% {
    transform: translate3d(12px, calc(-100vh - 220px), 0) scale(0.96);
  }
}

@media (max-width: 768px) {
  .news-card {
    content-visibility: visible;
  }

  .news-detail-bubbles span:nth-child(n + 5) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-detail-bubbles span {
    animation: none;
    transform: translateY(-22vh);
  }
}
</style>
