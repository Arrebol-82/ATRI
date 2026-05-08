<script setup>
import { computed, ref } from 'vue'

const activeIndex = ref(0)

const characters = [
  {
    name: '亚托莉',
    enName: 'ATRI',
    cv: '赤尾光',
    quote: '「我会成为夏生先生的腿！」',
    profile: '海底打捞出的高性能仿生人少女。\n感情丰富，行动力惊人，自称是“高性能”的伙伴。',
    image: '/images/characters/ph_atri.png',
    thumb: 'from-cyan-100 via-white to-sky-300',
    imageClass: 'atri'
  },
  {
    name: '凯瑟琳',
    enName: 'CATHERINE',
    cv: '日笠阳子',
    quote: '「别磨蹭了，想做就现在去做。」',
    profile: '在小镇上活动的可靠女性。\n爽快、强势，却也会在关键时刻照顾身边的人。',
    image: '/images/characters/ph_catherine.png',
    thumb: 'from-violet-100 via-white to-slate-400',
    imageClass: 'catherine'
  },
  {
    name: '神白水菜',
    enName: 'MINAMO KAMISHIRO',
    cv: '高桥未奈美',
    quote: '「没关系，我们再试一次吧。」',
    profile: '夏生的儿时玩伴。\n温柔认真，总能用自己的方式支撑周围的人。',
    image: '/images/characters/ph_minamo.png',
    thumb: 'from-rose-100 via-white to-teal-200',
    imageClass: 'minamo'
  },
  {
    name: '斑鸠夏生',
    enName: 'NATSUKI IKARUGA',
    cv: '小野贤章',
    quote: '「沉在海底的东西，也许还能被找回来。」',
    profile: '因事故失去一条腿的少年。\n回到被海水吞没的故乡后，与亚托莉相遇。',
    image: '/images/characters/ph_natsuki.png',
    thumb: 'from-slate-100 via-white to-sky-200',
    imageClass: 'natsuki'
  },
  {
    name: '名波凛凛花',
    enName: 'RIRIKA NANAMI',
    cv: '春野杏',
    quote: '「看我的，马上就能搞定！」',
    profile: '活泼开朗的小学生。\n精力充沛，常常把安静的海边小镇搅得热闹起来。',
    image: '/images/characters/ph_ririka.png',
    thumb: 'from-yellow-100 via-white to-sky-200',
    imageClass: 'ririka'
  },
  {
    name: '野岛龙司',
    enName: 'RYUJI NOJIMA',
    cv: '细谷佳正',
    quote: '「有困难就说，别一个人扛着。」',
    profile: '夏生的朋友。\n看起来粗枝大叶，其实相当可靠，是能托付事情的人。',
    image: '/images/characters/ph_ryuji.png',
    thumb: 'from-lime-100 via-white to-stone-300',
    imageClass: 'ryuji'
  }
]

const activeCharacter = computed(() => characters[activeIndex.value])

function selectCharacter(index) {
  activeIndex.value = index
}

function nextCharacter() {
  activeIndex.value = (activeIndex.value + 1) % characters.length
}
</script>

<template>
  <section class="character-lab relative min-h-screen overflow-hidden bg-white text-[#060b12]">
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-8 md:px-10 lg:px-16">
      <header class="grid gap-6 pt-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div class="flex items-center gap-5">
            <h2 class="font-mono text-[clamp(2.8rem,4.8vw,5rem)] font-black leading-none tracking-[0.44em] text-black">
              Character
            </h2>
            <span class="hidden h-px w-28 bg-[#69cdf7] lg:block" />
            <span class="hidden font-mono text-[9px] font-bold leading-4 text-[#5fcdf8] lg:block">
              Remaining<br>Days:XX10566 min.
            </span>
          </div>
          <p class="mt-4 font-sans text-xl font-bold tracking-[0.48em] md:text-2xl">人物鉴赏</p>
        </div>
      </header>

      <div class="relative z-20 mt-8 flex flex-wrap items-end gap-5 md:gap-7 lg:mt-10">
        <button
          v-for="(character, index) in characters"
          :key="character.enName"
          type="button"
          class="thumb-button group"
          :class="{ 'is-active': activeIndex === index }"
          :aria-label="`查看${character.name}`"
          @click="selectCharacter(index)"
        >
          <span class="thumb-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="thumb-corners" aria-hidden="true" />
          <span class="thumb-portrait bg-gradient-to-br" :class="character.thumb">
            <img :src="character.image" :alt="character.name">
          </span>
          <span class="thumb-pointer" aria-hidden="true" />
        </button>
      </div>

      <div class="relative grid flex-1 items-end gap-8 pb-12 pt-8 lg:grid-cols-[minmax(500px,1fr)_minmax(420px,620px)] lg:gap-14 lg:pb-16 lg:pt-0">
        <div class="relative min-h-[540px] lg:min-h-[690px]">
          <div class="vertical-copy left-copy">
            <span>Game Protocol</span>
            <span>https://key.visualarts.gr.jp</span>
          </div>

          <p class="quote-copy">
            {{ activeCharacter.quote }}
          </p>

          <div class="character-stand" aria-hidden="true">
            <img
              :key="activeCharacter.image"
              class="character-image"
              :class="activeCharacter.imageClass"
              :src="activeCharacter.image"
              :alt="activeCharacter.name"
            >
          </div>

        </div>

        <article class="profile-panel">
          <div class="change-image" aria-hidden="true">
            <span />
            <b>CHANGE<br>IMAGE</b>
          </div>

          <div class="profile-name">
            <p>Name</p>
            <h3 :key="activeCharacter.name">{{ activeCharacter.name }}</h3>
            <span>CV&nbsp;&nbsp;{{ activeCharacter.cv }}</span>
          </div>

          <div class="profile-frame">
            <div class="corner top-left" />
            <div class="corner top-right" />
            <div class="corner bottom-left" />
            <div class="corner bottom-right" />

            <p class="profile-label">Profile</p>
            <p class="profile-text">{{ activeCharacter.profile }}</p>
          </div>

          <p class="vertical-name">{{ activeCharacter.enName }}</p>
        </article>
      </div>

      <button type="button" class="next-button" @click="nextCharacter">
        <span>NEXT</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.character-lab {
  isolation: isolate;
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

.vertical-copy {
  position: absolute;
  left: -26px;
  bottom: 12%;
  display: flex;
  gap: 54px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  writing-mode: vertical-rl;
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

.profile-panel {
  position: relative;
  z-index: 3;
  min-height: 520px;
  padding: 7rem 2rem 2rem 3rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 20%, #fff 100%);
}

.change-image {
  position: absolute;
  left: -80px;
  top: 95px;
  display: grid;
  justify-items: center;
  gap: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.2;
}

.change-image span {
  width: 54px;
  height: 54px;
  border: 2px solid #111;
  border-radius: 999px;
}

.change-image span::before,
.change-image span::after {
  position: absolute;
  content: '';
  border: solid #111;
}

.change-image span::before {
  width: 7px;
  height: 7px;
  border-width: 0 2px 2px 0;
  transform: translate(8px, -14px) rotate(45deg);
}

.change-image span::after {
  width: 7px;
  height: 7px;
  border-width: 2px 0 0 2px;
  transform: translate(38px, 58px) rotate(45deg);
}

.profile-name p,
.profile-label {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.42em;
}

.profile-name h3 {
  margin-top: 22px;
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

  .change-image,
  .vertical-copy,
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
