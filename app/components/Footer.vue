<template>
  <footer class="footer-root">
    <div class="footer-box">
      <div class="footer-inner">
        <!-- 顶部导航 -->
        <nav class="footer-nav">
          <ul class="footer-nav-list">
            <li v-for="item in navList" :key="item.name">
              <NuxtLink
                :to="item.link"
                class="footer-nav-link"
              >
                <span v-if="item.name === 'HOME'" class="footer-heart">♥</span>
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="footer-divider"></div>

        <div class="footer-content">
          <div class="footer-column footer-column-left">
            <div class="footer-social">
              <span class="footer-label">OFFICIAL</span>

              <a
                v-for="item in officialLinks"
                :key="item.name"
                :href="item.link"
                class="footer-icon"
              >
                {{ item.icon }}
              </a>
            </div>

            <a href="#contact" class="footer-button">
              <span>Business Inquiries</span>
              <span class="footer-button-arrow">→</span>
            </a>
          </div>

          <div class="footer-logo-area">
            <NuxtLink to="/" class="footer-logo-link">
              <div class="footer-logo-text">
                ATRI
              </div>

              <div class="footer-logo-subtitle">
                MY DEAR MOMENTS
              </div>
            </NuxtLink>
          </div>

          <div class="footer-column footer-column-right">
            <div class="footer-social">
              <span class="footer-label">SHARE</span>

              <a
                v-for="item in shareLinks"
                :key="item.name"
                :href="item.link"
                class="footer-icon"
              >
                {{ item.icon }}
              </a>
            </div>

            <p class="footer-copy">
              ©ATRI PROJECT / SAMPLE WEBSITE
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const navList = [
  { name: 'HOME', link: '/' },
  { name: 'MOVIE', link: '#movie' },
  { name: 'NEWS', link: '/news' },
  { name: 'STAFF&CAST', link: '#staff' },
  { name: 'INTRODUCTION', link: '#introduction' },
  { name: 'CHARACTER', link: '/characters' },
  { name: 'BOOKS', link: '#books' },
  { name: 'STORY', link: '/story' },
  { name: 'ON AIR', link: '#onair' },
  { name: 'MUSIC', link: '#music' },
  { name: 'PRODUCTS', link: '/merchandise' },
  { name: 'SPECIAL', link: '#special' },
]

const officialLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'TikTok', icon: '♪', link: '#' },
]

const shareLinks = [
  { name: 'X', icon: '𝕏', link: '#' },
  { name: 'LINE', icon: '●', link: '#' },
]
</script>

<style scoped>
.footer-root {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: 560px;
  overflow: hidden;
  color: #10213a;
  background: #ffffff;
}

.footer-box {
  position: relative;
  width: 100%;
  min-height: 360px;
  background:
    linear-gradient(180deg, #eef9ff 0%, #d7efff 48%, #acdfff 100%);
  border-top: 1px solid rgba(110, 175, 220, 0.32);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.footer-inner {
  width: min(1080px, calc(100% - 48px));
  margin: 0 auto;
  padding: 54px 0 58px;
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
  margin: 42px auto;
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
    margin-top: 420px;
  }

  .footer-inner {
    width: min(100% - 40px, 760px);
    padding: 50px 0 54px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 38px;
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
    margin-top: 320px;
  }

  .footer-box {
    min-height: 420px;
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
    margin-top: 240px;
  }

  .footer-inner {
    width: min(100% - 32px, 460px);
    padding: 44px 0 48px;
  }

  .footer-nav-list {
    gap: 16px 20px;
  }

  .footer-nav-link {
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .footer-divider {
    margin: 34px auto;
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