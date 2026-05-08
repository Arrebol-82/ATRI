<template>
  <section class="relative min-h-screen overflow-hidden bg-white text-[#24424b]">
    <!-- 背景装饰 -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[10%] top-16 h-40 w-[520px] rounded-full bg-sky-100/70 blur-3xl"></div>
      <div class="absolute right-[-170px] top-[-120px] h-[420px] w-[420px] rounded-full border border-sky-100"></div>
      <div class="absolute right-[-80px] top-8 h-[280px] w-[280px] rounded-full border border-sky-50"></div>
      <div class="absolute left-0 bottom-12 h-px w-[520px] rotate-[-25deg] bg-gradient-to-r from-transparent via-sky-200 to-transparent"></div>
      <div class="absolute right-0 bottom-24 h-px w-[460px] rotate-[-18deg] bg-gradient-to-r from-transparent via-sky-200 to-transparent"></div>
    </div>

    <!-- 新闻详情弹窗 -->
    <div
      v-if="selectedNews"
      class="fixed inset-0 z-[60] overflow-y-auto bg-white"
    >
      <article
        class="news-detail relative min-h-screen w-full overflow-hidden p-6 text-[#263f48] md:p-10 lg:p-14"
      >


        <div class="news-detail-bubbles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div class="relative z-[1] mx-auto max-w-[900px]">
          <div class="rounded-[28px] border-2 border-sky-200 bg-white/95 px-7 py-9 shadow-[0_18px_50px_rgba(56,189,248,0.12)] md:px-12 md:py-12">
            <button
              class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white/90 text-xl font-black leading-none text-sky-400 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
              aria-label="Close news detail"
              @click="closeNewsDetail"
            >
              x
            </button>

            <time class="block text-xl font-bold tracking-[0.08em] text-sky-500">
              {{ selectedNews.date }}
            </time>

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
              <p class="mb-4 text-sm font-black tracking-[0.3em] text-sky-400">SHARE</p>
              <div class="flex gap-3">
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm text-white">X</button>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm text-white">Li</button>
              </div>
            </div>

          </div>


        </div>
      </article>
    </div>

    <div class="relative z-10 mx-auto max-w-[1200px] px-6 py-20 md:px-10 lg:py-24">
      <!-- 标题 -->
      <header class="mb-14">
        <div class="flex items-end gap-6">
          <h1 class="text-6xl font-black uppercase tracking-[0.04em] text-sky-400 md:text-8xl">
            NEWS
          </h1>
          <p class="mb-5 text-sm font-bold tracking-[0.35em] text-sky-400 md:text-base">
            ニュース
          </p>
        </div>
      </header>

      <!-- 新闻列表页 -->
      <main>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in newsList"
            :key="item.id"
            class="group cursor-pointer rounded-2xl border-2 border-sky-200 bg-white/90 p-5 shadow-[0_10px_30px_rgba(56,189,248,0.08)] transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_16px_40px_rgba(56,189,248,0.18)]"
            @click="openNewsDetail(item)"
          >
            <!-- 图片占位：以后有图片了，把这里换成 img -->
            <div class="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl" :class="item.bgClass">
              <div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.15),transparent_45%,rgba(255,255,255,.45))]"></div>
              <div class="absolute left-6 top-6 rounded-full bg-white/50 px-4 py-1 text-xs font-bold tracking-[0.18em] text-sky-500">
                NEWS
              </div>
              <div class="absolute bottom-5 left-6 h-8 w-36 rounded-full bg-white/30 blur-md"></div>
              <div class="absolute right-5 top-5 h-12 w-12 rounded-full border border-white/70"></div>
              <div class="absolute bottom-5 right-5 text-[10px] font-bold tracking-[0.25em] text-white/90">
                ATRI
              </div>
            </div>

            <time class="block text-xl font-bold tracking-[0.06em] text-sky-500">
              {{ item.date }}
            </time>

            <h2 class="mt-4 min-h-[72px] text-[17px] font-bold leading-8 tracking-[0.06em] text-[#263f48]">
              {{ item.title }}
            </h2>
          </article>
        </div>

        <!-- 分页装饰 -->
        <div class="mt-16 flex items-center justify-center gap-4 text-lg font-bold text-sky-400">
          <button class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-white">1</button>
          <button class="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300 hover:bg-sky-50">2</button>
          <span>...</span>
          <button class="flex h-10 w-10 items-center justify-center rounded-full border border-sky-300 hover:bg-sky-50">10</button>
          <button class="ml-2 rounded-full border border-sky-300 px-5 py-2 text-sm tracking-[0.2em] hover:bg-sky-50">NEXT</button>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const selectedNews = ref(null)

const newsList = [
  {
    id: 1,
    date: '2026.03.19',
    title: 'スペシャルイベントの詳細情報を公開！（チケット先行優先販売受付ほか）',
    bgClass: 'bg-gradient-to-br from-pink-100 via-yellow-50 to-emerald-100',
    body: [
      'ATRI記念イベントの詳細情報を公開しました。作品の世界観を楽しめるトークや展示企画など、特別な一日を予定しています。',
      'チケットの受付期間や参加方法につきましては、下記の概要をご確認ください。今後の追加情報も本ページにて順次お知らせいたします。',
    ],
    event: {
      date: '2026年8月16日（日）',
      place: 'アクアシティホール',
      content: 'キャストトーク、展示、来場者特典配布など',
    },
    notes: [
      '内容は予告なく変更となる場合があります。',
      '会場への直接のお問い合わせはご遠慮ください。',
      '最新情報は公式サイトにてご確認ください。',
    ],
  },
  {
    id: 2,
    date: '2026.03.06',
    title: 'スペシャルイベント開催決定！！',
    bgClass: 'bg-gradient-to-br from-slate-200 via-white to-sky-300',
    body: [
      'ATRI公式スペシャルイベントの開催が決定しました。作品を応援してくださる皆さまに向けて、特別な企画を準備中です。',
      '開催日時、出演者、チケット情報などの詳細は後日発表いたします。',
    ],
    event: {
      date: '後日公開予定',
      place: '後日公開予定',
      content: 'スペシャルトーク、最新情報発表など',
    },
    notes: [
      '詳細は後日発表いたします。',
      '本イベントの内容は変更となる場合があります。',
    ],
  },
  {
    id: 3,
    date: '2026.03.03',
    title: '甘慣れな子誕生日記念♡直筆サイン色紙をプレゼント',
    bgClass: 'bg-gradient-to-br from-pink-100 via-white to-cyan-100',
    body: [
      'キャラクターの誕生日を記念して、抽選プレゼントキャンペーンを実施します。',
      '対象期間中に指定の方法で応募された方の中から、直筆サイン色紙をプレゼントいたします。',
    ],
    event: {
      date: '2026年3月3日（火）〜3月10日（火）',
      place: '公式SNS',
      content: 'フォロー＆リポストキャンペーン',
    },
    notes: [
      '応募には公式SNSアカウントのフォローが必要です。',
      '当選者には後日DMにてご連絡します。',
    ],
  },
  {
    id: 4,
    date: '2026.03.16',
    title: 'イベント情報と追加キャンペーンのお知らせを公開しました',
    bgClass: 'bg-gradient-to-br from-yellow-50 via-pink-100 to-lime-100',
    body: [
      'イベントに関する追加情報を公開しました。あわせて、来場者向けのキャンペーンも実施予定です。',
      '詳細は各項目をご確認ください。',
    ],
    event: {
      date: '2026年3月16日（月）',
      place: '公式サイト内',
      content: '追加キャンペーン情報公開',
    },
    notes: [
      'キャンペーン内容は変更となる可能性があります。',
      '応募条件をよくご確認ください。',
    ],
  },
  {
    id: 5,
    date: '2026.02.13',
    title: '【ゲーマーズ限定】Blu-ray全巻購入キャンペーンのお知らせ',
    bgClass: 'bg-gradient-to-br from-orange-100 via-cyan-50 to-rose-100',
    body: [
      'Blu-ray全巻購入者を対象とした限定キャンペーンを実施します。',
      '対象店舗、応募方法、特典内容については下記をご確認ください。',
    ],
    event: {
      date: '2026年2月13日（金）開始',
      place: '対象店舗',
      content: 'Blu-ray購入者限定特典キャンペーン',
    },
    notes: [
      '特典はなくなり次第終了となります。',
      '詳しくは対象店舗の案内をご確認ください。',
    ],
  },
  {
    id: 6,
    date: '2026.01.19',
    title: 'スタッフ＆キャストによるトークイベント情報を公開しました',
    bgClass: 'bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100',
    body: [
      'スタッフ＆キャストによるスペシャルトークイベントの情報を公開しました。',
      '制作の裏側やキャラクターについて語る、ファン必見の内容です。',
    ],
    event: {
      date: '2026年1月19日（月）',
      place: 'イベント会場',
      content: 'スタッフ＆キャストトーク',
    },
    notes: [
      '登壇者は予告なく変更となる場合があります。',
      '会場内での撮影・録音は禁止です。',
    ],
  },
]

function openNewsDetail(news) {
  selectedNews.value = news
}

function closeNewsDetail() {
  selectedNews.value = null
}

</script>

<style scoped>
.news-detail {
  background-color: #ffffff;
  background-image:
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.98) 0 170px, transparent 172px),
    radial-gradient(circle at 92% 12%, rgba(232, 249, 255, 0.92) 0 130px, transparent 132px),
    linear-gradient(180deg, #ffffff 0%, #f7fcfe 42%, #e8f9ff 100%);
  background-position:
    0 0,
    0 0,
    0 0;
  background-size:
    100% 100%,
    100% 100%,
    100% 100%;
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
