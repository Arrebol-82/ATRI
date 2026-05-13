export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser(); // 获取当前用户

  // 受保护的后台页面列表
  const protectedPaths = [
    "/admin/dashboard",
    "/admin/orders",
    "/admin/products",
  ];

  // 1. 未登录拦截：尝试去后台但没账号，踢回登录页
  if (!user.value && protectedPaths.includes(to.path)) {
    return navigateTo("/admin");
  }

  // 2. 已登录拦截：已经登录了还想回登录页 (/admin)，理智地直接送去仪表盘
  if (user.value && to.path === "/admin") {
    return navigateTo("/admin/dashboard");
  }
});
