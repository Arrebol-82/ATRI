// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/supabase", "@vercel/analytics"],
  app: {
    head: {
      title: "ATRI",
    },
  },
  supabase: {
    redirect: false,
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
