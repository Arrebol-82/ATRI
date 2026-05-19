export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  const isAdminSubPage = to.path.startsWith("/admin/");

  // 1. 未登录拦截：所有 /admin/* 子页面都需要登录
  if (!user.value && isAdminSubPage) {
    return navigateTo("/admin");
  }

  // 2. 已登录拦截：已登录访问登录页，直接送去仪表盘
  if (user.value && to.path === "/admin") {
    return navigateTo("/admin/dashboard");
  }
});
