// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase", "@vercel/analytics", "@vercel/speed-insights"],

  app: {
    head: {
      title: "ATRI",
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "shortcut icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/images/tb.png" },
      ],
    },
  },

  components: {
    dirs: [
      {
        path: "~/components",
        pathPrefix: false,
      },
    ],
  },

  typescript: {
    shim: false,
  },

  supabase: {
    redirect: false,
    types: false,
    redirectOptions: {
      login: "/admin",
      callback: "/confirm",
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        'lenis',
        'gsap',
        'gsap/ScrollTrigger',
      ],
    },
  },
})
