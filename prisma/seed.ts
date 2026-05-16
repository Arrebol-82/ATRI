import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = connectionString.startsWith("prisma+postgres://")
  ? new PrismaClient({ accelerateUrl: connectionString })
  : new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const BASE_URL =
  "https://irkydgphndgopzicgqou.supabase.co/storage/v1/object/public/atri/";

// ─── Merchandise ────────────────────────────────────────────────────────────

const merchandiseData = [
  {
    id: "fallback-ph-amiami",
    name: "3尺寸画布",
    category: "周边",
    priceDisplay: "JPY 14,000",
    imageDescription: "Canvas goods product image",
    imageUrl: `${BASE_URL}commodity/ph_amiami.webp`,
    sortOrder: 1,
  },
  {
    id: "fallback-ph-animate-1",
    name: "动画原创亚克力立牌",
    category: "亚克力立牌",
    priceDisplay: "JPY 3,300 (含税)",
    imageDescription: "Acrylic goods product image",
    imageUrl: `${BASE_URL}commodity/ph_animate_1.webp`,
    sortOrder: 2,
  },
  {
    id: "fallback-ph-animega-2",
    name: "动画原创插画 B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 500 (含税)",
    imageDescription: "Poster goods product image",
    imageUrl: `${BASE_URL}commodity/ph_animega_2.webp`,
    sortOrder: 3,
  },
  {
    id: "fallback-ph-aniplex-2",
    name: "ATRI 亚克力商品",
    category: "亚克力立牌",
    priceDisplay: "JPY 28,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}commodity/ph_aniplex_2.webp`,
    sortOrder: 4,
  },
  {
    id: "fallback-ph-gamers-2",
    name: "动画原创插画 B2 挂毯 Atori",
    category: "海报",
    priceDisplay: "JPY 3,900",
    imageDescription: "Tapestry goods product image",
    imageUrl: `${BASE_URL}commodity/ph_gamers_2.webp`,
    sortOrder: 5,
  },
  {
    id: "fallback-ph-joshin",
    name: "ATRI 钥匙扣",
    category: "挂件",
    priceDisplay: "JPY 300",
    imageDescription: "Keychain goods product image",
    imageUrl: `${BASE_URL}commodity/ph_joshin.webp`,
    sortOrder: 6,
  },
  {
    id: "fallback-ph-melonbooks",
    name: "B2 挂毯",
    category: "海报",
    priceDisplay: "JPY 18,000",
    imageDescription: "B2 tapestry goods product image",
    imageUrl: `${BASE_URL}commodity/ph_melonbooks.webp`,
    sortOrder: 7,
  },
  {
    id: "fallback-ph-rakuten-1",
    name: "原创插画 2L 角色精美画",
    category: "海报",
    priceDisplay: "JPY 2,500",
    imageDescription: "Character illustration goods product image",
    imageUrl: `${BASE_URL}commodity/ph_rakuten_1.webp`,
    sortOrder: 8,
  },
  {
    id: "fallback-ph-seven",
    name: "制图精细商品",
    category: "周边",
    priceDisplay: "JPY 1,000",
    imageDescription: "Official goods product image",
    imageUrl: `${BASE_URL}commodity/ph_seven.webp`,
    sortOrder: 9,
  },
  {
    id: "fallback-ph-toranoana",
    name: "明信片大小亚克力支架",
    category: "亚克力立牌",
    priceDisplay: "JPY 153,000",
    imageDescription: "Acrylic stand goods product image",
    imageUrl: `${BASE_URL}commodity/ph_toranoana.webp`,
    sortOrder: 10,
  },
  {
    id: "fallback-ph-tsutaya-1",
    name: "两张 L 尺寸银盐照片",
    category: "海报",
    priceDisplay: "JPY 5,500",
    imageDescription: "Photo goods product image",
    imageUrl: `${BASE_URL}commodity/ph_tsutaya_1.webp`,
    sortOrder: 11,
  },
  {
    id: "fallback-w",
    name: "动画原创 P3 角色美术画板",
    category: "海报",
    priceDisplay: "JPY 3,000",
    imageDescription: "Art board goods product image",
    imageUrl: `${BASE_URL}commodity/w.webp`,
    sortOrder: 12,
  },
];

// ─── News ────────────────────────────────────────────────────────────────────

const newsData = [
  {
    sortOrder: 1,
    date: "2026.03.19",
    title: "スペシャルイベントの詳細情報を公開！（チケット先行優先販売受付ほか）",
    imageUrl: `${BASE_URL}news1.webp`,
    body: [
      "ATRI記念イベントの詳細情報を公開しました。作品の世界観を楽しめるトークや展示企画など、特別な一日を予定しています。",
      "チケットの受付期間や参加方法につきましては、下記の概要をご確認ください。今後の追加情報も本ページにて順次お知らせいたします。",
    ],
    eventDate: "2026年8月16日（日）",
    eventPlace: "アクアシティホール",
    eventContent: "キャストトーク、展示、来場者特典配布など",
    notes: [
      "内容は予告なく変更となる場合があります。",
      "会場への直接のお問い合わせはご遠慮ください。",
    ],
  },
  {
    sortOrder: 2,
    date: "2026.03.06",
    title: "スペシャルイベント開催決定！！",
    imageUrl: `${BASE_URL}news2.webp`,
    body: [
      "ATRI公式スペシャルイベントの開催が決定しました。",
      "開催日時、出演者、チケット情報などの詳細は後日発表いたします。",
    ],
    eventDate: "後日公開予定",
    eventPlace: "後日公開予定",
    eventContent: "スペシャルトーク、最新情報発表など",
    notes: ["詳細は後日発表いたします。"],
  },
  {
    sortOrder: 3,
    date: "2026.03.03",
    title: "甘慣れな子誕生日記念♡直筆サイン色紙をプレゼント",
    imageUrl: `${BASE_URL}news3.webp`,
    body: [
      "キャラクターの誕生日を記念して、抽選プレゼントキャンペーンを実施します。",
      "対象期間中に指定の方法で応募された方の中から、直筆サイン色紙をプレゼントいたします。",
    ],
    eventDate: "2026年3月3日（火）〜3月10日（火）",
    eventPlace: "公式SNS",
    eventContent: "フォロー＆リポストキャンペーン",
    notes: ["応募には公式SNSアカウントのフォローが必要です。"],
  },
  {
    sortOrder: 4,
    date: "2026.03.16",
    title: "イベント情報と追加キャンペーンのお知らせを公開しました",
    imageUrl: `${BASE_URL}news4.webp`,
    body: [
      "イベントに関する追加情報を公開しました。",
      "詳細は各項目をご確認ください。",
    ],
    eventDate: "2026年3月16日（月）",
    eventPlace: "公式サイト内",
    eventContent: "追加キャンペーン情報公開",
    notes: ["キャンペーン内容は変更となる可能性があります。"],
  },
  {
    sortOrder: 5,
    date: "2026.02.13",
    title: "【ゲーマーズ限定】Blu-ray全巻購入キャンペーンのお知らせ",
    imageUrl: `${BASE_URL}news5.webp`,
    body: ["Blu-ray全巻購入者を対象とした限定キャンペーンを実施します。"],
    eventDate: "2026年2月13日（金）開始",
    eventPlace: "対象店舗",
    eventContent: "Blu-ray購入者限定特典キャンペーン",
    notes: ["特典はなくなり次第終了となります。"],
  },
  {
    sortOrder: 6,
    date: "2026.01.19",
    title: "スタッフ＆キャストによるトークイベント情報を公開しました",
    imageUrl: `${BASE_URL}news6.webp`,
    body: ["スタッフ＆キャストによるスペシャルトークイベントの情報を公開しました。"],
    eventDate: "2026年1月19日（月）",
    eventPlace: "イベント会場",
    eventContent: "スタッフ＆キャストトーク",
    notes: ["登壇者は予告なく変更となる場合があります。"],
  },
  {
    sortOrder: 7,
    date: "2025.12.25",
    title: "公式サイトを更新しました",
    imageUrl: `${BASE_URL}news7.webp`,
    body: [
      "公式サイトの情報を更新しました。",
      "今後も最新情報を順次公開予定です。",
    ],
    eventDate: "2025年12月25日（木）",
    eventPlace: "公式サイト",
    eventContent: "サイト更新情報",
    notes: ["最新情報は公式サイトをご確認ください。"],
  },
  {
    sortOrder: 8,
    date: "2025.12.12",
    title: "キャラクター情報を追加公開しました",
    imageUrl: `${BASE_URL}news8.webp`,
    body: ["キャラクター紹介ページに新しい情報を追加しました。"],
    eventDate: "2025年12月12日（金）",
    eventPlace: "キャラクターページ",
    eventContent: "キャラクター情報追加",
    notes: ["掲載内容は変更となる場合があります。"],
  },
  {
    sortOrder: 9,
    date: "2025.11.30",
    title: "グッズ情報を公開しました",
    imageUrl: `${BASE_URL}news9.webp`,
    body: ["関連グッズの情報を公開しました。"],
    eventDate: "2025年11月30日（日）",
    eventPlace: "商品ページ",
    eventContent: "グッズ情報公開",
    notes: ["商品画像はイメージです。"],
  },
  {
    sortOrder: 10,
    date: "2025.11.15",
    title: "ストーリーページを更新しました",
    imageUrl: `${BASE_URL}news10.webp`,
    body: ["ストーリーページの内容を更新しました。"],
    eventDate: "2025年11月15日（土）",
    eventPlace: "ストーリーページ",
    eventContent: "ストーリー情報更新",
    notes: ["一部内容にはネタバレを含む場合があります。"],
  },
  {
    sortOrder: 11,
    date: "2025.10.28",
    title: "場面カットを追加しました",
    imageUrl: `${BASE_URL}news11.webp`,
    body: ["ギャラリーページに新しい場面カットを追加しました。"],
    eventDate: "2025年10月28日（火）",
    eventPlace: "ギャラリーページ",
    eventContent: "場面カット追加",
    notes: ["画像は開発中のものを含む場合があります。"],
  },
  {
    sortOrder: 12,
    date: "2025.10.10",
    title: "スペシャルコンテンツを公開しました",
    imageUrl: `${BASE_URL}news12.webp`,
    body: ["スペシャルページに新しいコンテンツを公開しました。"],
    eventDate: "2025年10月10日（金）",
    eventPlace: "スペシャルページ",
    eventContent: "スペシャルコンテンツ公開",
    notes: ["公開期間は変更となる場合があります。"],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Seed 开始...\n");

  // Merchandise
  await prisma.merchandise.deleteMany();
  await prisma.merchandise.createMany({ data: merchandiseData });
  console.log(`✅ Merchandise：写入 ${merchandiseData.length} 条`);

  // News
  await prisma.news.deleteMany();
  for (const item of newsData) {
    await prisma.news.create({ data: item });
  }
  console.log(`✅ News：写入 ${newsData.length} 条`);

  console.log("\n🎉 全部完成！");
}

main()
  .catch((err) => {
    console.error("❌ Seed 失败：", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
