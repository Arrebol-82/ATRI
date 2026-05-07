export default defineNuxtPlugin(() => {
  const skipHomeIntroKey = 'atriSkipHomeIntroOnce'
  const merchandiseReturnTargetKey = 'atriMerchandiseReturnTarget'

  function markHomeIntroSkip() {
    try {
      sessionStorage.setItem(skipHomeIntroKey, '1')
    } catch {
      // Ignore storage failures and let the home page fall back to default behavior.
    }
  }

  function getVisibleHomeSectionTarget() {
    if (window.location.pathname !== '/') {
      return `${window.location.pathname}${window.location.hash || ''}`
    }

    if (window.location.hash) {
      return `/${window.location.hash}`
    }

    const storySection = document.querySelector('#story')
    if (!storySection) {
      return '/'
    }

    const rect = storySection.getBoundingClientRect()
    const viewportFocusLine = window.innerHeight * 0.45
    if (rect.top <= viewportFocusLine && rect.bottom >= viewportFocusLine) {
      return '/#story'
    }

    return '/'
  }

  function rememberMerchandiseReturnTarget() {
    try {
      sessionStorage.setItem(merchandiseReturnTargetKey, getVisibleHomeSectionTarget())
    } catch {
      // The merchandise page can still fall back to browser history.
    }
  }

  document.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]')
    if (!link) return

    const url = new URL(link.href, window.location.href)
    if (url.origin === window.location.origin && url.pathname === '/merchandise') {
      rememberMerchandiseReturnTarget()
    }

    if (url.origin === window.location.origin && url.pathname === '/' && window.location.pathname !== '/') {
      markHomeIntroSkip()
    }
  }, true)

  const router = useRouter()
  router.beforeEach((to, from) => {
    if (to.path === '/' && from.path !== '/') {
      markHomeIntroSkip()
    }
  })
})
