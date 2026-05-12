// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/supabase"],
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
});
