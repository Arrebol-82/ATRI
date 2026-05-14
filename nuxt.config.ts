// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/supabase", "@vercel/analytics", "@vercel/speed-insights"],
  app: {
    head: {
      title: "ATRI",
    },
    pageTransition: {
      name: "page-fade",
      mode: "out-in",
    },
  },
  supabase: {
    redirect: false,
    types: false,
    redirectOptions: {
      login: "/admin",
      callback: "/confirm",
    },
  },
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ]
  },
  typescript: {
    shim: false
  }
})
