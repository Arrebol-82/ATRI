<script setup>
import { onMounted } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true
  }
})

const MERCHANDISE_PRODUCTS_STORAGE_KEY = 'atriMerchandiseProductsCache'
const MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY = 'atriMerchandiseProductsCacheTime'
const MERCHANDISE_PRODUCTS_CACHE_MAX_AGE = 1000 * 60 * 60 * 24

const merchandiseCache = useState('merchandise-products-cache', () => [])
const merchandisePreloaded = useState('merchandise-products-preloaded', () => false)
const merchandisePreloading = useState('merchandise-products-preloading', () => false)
const route = useRoute()

let merchandisePreloadPromise = null

function readMerchandiseProductsFromStorage() {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = localStorage.getItem(MERCHANDISE_PRODUCTS_STORAGE_KEY)
    const savedAt = Number(localStorage.getItem(MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY) || 0)

    if (!raw || !savedAt) {
      return []
    }

    const isExpired = Date.now() - savedAt > MERCHANDISE_PRODUCTS_CACHE_MAX_AGE

    if (isExpired) {
      return []
    }

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveMerchandiseProductsToStorage(productList) {
  if (!import.meta.client || !Array.isArray(productList)) {
    return
  }

  try {
    localStorage.setItem(MERCHANDISE_PRODUCTS_STORAGE_KEY, JSON.stringify(productList))
    localStorage.setItem(MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY, String(Date.now()))
  } catch {
    // localStorage 可能因为隐私模式或容量限制失败，失败时不影响页面正常使用。
  }
}

function restoreMerchandiseProductsFromStorage() {
  if (merchandiseCache.value.length) {
    merchandisePreloaded.value = true
    return
  }

  const cachedProducts = readMerchandiseProductsFromStorage()

  if (cachedProducts.length) {
    merchandiseCache.value = cachedProducts
    merchandisePreloaded.value = true
  }
}

async function preloadMerchandise() {
  if (!import.meta.client) {
    return
  }

  restoreMerchandiseProductsFromStorage()

  if (merchandisePreloaded.value || merchandiseCache.value.length) {
    return
  }

  if (merchandisePreloadPromise) {
    return merchandisePreloadPromise
  }

  merchandisePreloading.value = true

  merchandisePreloadPromise = $fetch('/api/merchandise')
    .then((data) => {
      const productList = Array.isArray(data) ? data : []

      merchandiseCache.value = productList
      merchandisePreloaded.value = true

      if (productList.length) {
        saveMerchandiseProductsToStorage(productList)
      }
    })
    .catch((error) => {
      merchandisePreloaded.value = false
      console.error('商品数据预加载失败：', error)
    })
    .finally(() => {
      merchandisePreloading.value = false
      merchandisePreloadPromise = null
    })

  return merchandisePreloadPromise
}

function isHomeNavItem(item) {
  const label = String(item?.label || '').trim().toUpperCase()
  const rawLabel = String(item?.label || '').trim()
  const text = String(item?.text || '').trim().toLowerCase()
  const rawText = String(item?.text || '').trim()
  const to = String(item?.to || '').trim().toLowerCase()

  return (
    label === 'HOME' ||
    rawLabel === '首页' ||
    rawLabel === '主页' ||
    rawLabel === 'ホーム' ||
    text === 'home' ||
    text === 'blue memories' ||
    rawText === '首页' ||
    rawText === '主页' ||
    rawText === 'ホーム' ||
    to === '/' ||
    to === '#home' ||
    to === '/#home' ||
    to === '/home'
  )
}

function resolveNavTo(item) {
  if (isHomeNavItem(item)) {
    return '/'
  }

  const to = String(item?.to || '').trim()

  if (!to) {
    return '/'
  }

  // 如果某些页面传进来的是 #story 这种相对锚点，
  // 从子页面点击会只在当前页找锚点，导致回不到首页。
  // 这里统一改成 /#story，保证从任何页面都先回首页再定位。
  if (to.startsWith('#')) {
    return `/${to}`
  }

  return to
}

function scrollHomeToTop() {
  if (!import.meta.client) {
    return
  }

  const lenis = window.__lenis

  if (typeof lenis?.scrollTo === 'function') {
    lenis.scrollTo(0, {
      immediate: true,
      force: true
    })
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  })

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    })
  })
}

function handleNavClick(item, event) {
  if (!isHomeNavItem(item)) {
    return
  }

  // 很多页面其实还是在首页长页面 / 里面，
  // 只是滚到了 characters / scenes / news 区块。
  // 这时候 NuxtLink 的 to='/' 和当前路由一样，不会触发跳转，
  // 所以 HOME 需要手动滚回顶部。
  if (route.path === '/') {
    event?.preventDefault()
    scrollHomeToTop()
  }
}

function handleNavPrepare(item) {
  if (resolveNavTo(item) === '/merchandise') {
    preloadMerchandise()
  }
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  restoreMerchandiseProductsFromStorage()

  const preload = () => {
    preloadMerchandise()
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, {
      timeout: 5200
    })
  } else {
    setTimeout(preload, 3600)
  }
})
</script>

<template>
  <nav class="flex flex-col gap-2">
    <NuxtLink
      v-for="(item, index) in items"
      :key="item.label"
      :to="resolveNavTo(item)"
      class="sidebar-link group relative flex items-center gap-3 rounded-[14px] px-2.5 py-[11px] text-[#102a3a] transition duration-300 hover:-translate-x-1.5 hover:bg-[#a5e1fa]/20"
      @click="handleNavClick(item, $event)"
      @mouseenter="handleNavPrepare(item)"
      @focus="handleNavPrepare(item)"
      @touchstart.passive="handleNavPrepare(item)"
      @pointerdown="handleNavPrepare(item)"
    >
      <span class="text-xs text-[#102a3a]/40">
        {{ String(index + 1).padStart(2, '0') }}
      </span>

      <span>
        <strong class="block text-sm font-bold tracking-[0.08em]">
          {{ item.label }}
        </strong>

        <small class="mt-0.5 block text-[11px] text-[#102a3a]/55">
          {{ item.text }}
        </small>
      </span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.sidebar-link::before {
  position: absolute;
  left: 0;
  top: 50%;
  height: 0;
  width: 3px;
  content: "";
  border-radius: 999px;
  background: #73c8ef;
  transform: translateY(-50%);
  transition: 0.28s ease;
}

.sidebar-link:hover::before {
  height: 60%;
}
</style>
