import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin(() => {
  let lenis = null

  const createLenis = () => {
    if (lenis) return lenis

    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.105,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
      smoothWheel: true,
      prevent: (node) => node?.closest?.('[data-lenis-prevent]')
    })

    window.__lenis = lenis
    window.dispatchEvent(new CustomEvent('atri-lenis-ready', { detail: { lenis } }))

    return lenis
  }

  const scheduleLenis = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(createLenis, { timeout: 1600 })
    } else {
      window.setTimeout(createLenis, 900)
    }
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scheduleLenis)
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      lenis?.destroy()

      if (window.__lenis === lenis) {
        delete window.__lenis
      }
    })
  }

  return {
    provide: {
      lenis: {
        get instance() {
          return lenis
        }
      }
    }
  }
})
