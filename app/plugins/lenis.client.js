import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    autoRaf: true,

    // 接近动画官网那种：柔，但不拖
    lerp: 0.105,

    // 不再压得太慢，让滚动更自然
    wheelMultiplier: 1,

    // 触控板 / 触摸设备保持自然
    touchMultiplier: 1.1,

    smoothWheel: true,

    // 不在 Lenis 里接管锚点跳转。
    // 返回首页 NEWS 模块时需要瞬间定位，避免中途闪到 STORY 区域。

    prevent: (node) => node?.closest?.('[data-lenis-prevent]')
  })

  window.__lenis = lenis

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      lenis.destroy()

      if (window.__lenis === lenis) {
        delete window.__lenis
      }
    })
  }

  return {
    provide: {
      lenis
    }
  }
})