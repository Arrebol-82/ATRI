export default defineNuxtPlugin(() => {
  const skipHomeIntroKey = 'atriSkipHomeIntroOnce'

  function markHomeIntroSkip() {
    try {
      sessionStorage.setItem(skipHomeIntroKey, '1')
    } catch {
      // Ignore storage failures and let the home page fall back to default behavior.
    }
  }

  document.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]')
    if (!link) return

    const url = new URL(link.href, window.location.href)
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
