<script setup lang="ts">
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

definePageMeta({
  layout: "admin",
  middleware: "auth", // 让登录页也去运行 auth.ts 里的逻辑
});

// 1. 获取 Supabase 客户端
const supabase = useSupabaseClient();
const isDark = useState("admin-dark-mode", () => false);

// 2. 将 username 改为 email，因为 Supabase 认证默认使用邮箱
const email = ref("");
const password = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    // 3. 调用真实的 Supabase 认证接口
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      // 如果报错（比如密码错了），理智地反馈给用户
      alert("安全验证未通过: " + error.message);
    } else {
      // 登录成功，跳转至仪表盘
      navigateTo("/admin/dashboard");
    }
  } catch (err) {
    console.error("系统错误:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  gsap.from(".login-card", {
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
  });
});
</script>

<template>
  <div
    class="login-page flex min-h-full items-center justify-center p-6 sm:p-12"
  >
    <!-- 登录卡片：去除了 backdrop-blur 模糊效果，实现了极致纯净的透明质感 -->
    <div
      class="login-card w-full max-w-[440px] rounded-[32px] p-10 transition-all duration-700"
      :class="[
        isDark
          ? 'bg-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/20'
          : 'bg-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] ring-1 ring-black/5',
      ]"
    >
      <!-- 品牌标识/图标区 -->
      <div class="mb-10 text-center">
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5b4eff] shadow-lg shadow-[#5b4eff]/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="white"
            class="h-8 w-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h1
          class="text-3xl font-black tracking-tight transition-colors duration-300"
          :class="isDark ? 'text-white' : 'text-gray-900'"
        >
          ATRI Admin
        </h1>
        <p
          class="mt-2 text-sm font-medium transition-colors duration-300"
          :class="isDark ? 'text-gray-400' : 'text-gray-500'"
        >
          安全访问授权 • 系统就绪
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 账号输入 -->
        <div class="space-y-2">
          <label
            class="ml-1 block text-[13px] font-bold tracking-wide"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            管理员账号
          </label>
          <div class="relative group">
            <input
              v-model="email"
              type="text"
              class="w-full rounded-2xl border-0 py-4 pl-5 pr-4 text-sm font-bold shadow-sm outline-none ring-1 transition-all focus:ring-2 focus:ring-[#5b4eff]"
              :class="[
                isDark
                  ? 'bg-white/5 ring-white/10 text-white placeholder:text-gray-600 focus:bg-white/10'
                  : 'bg-black/5 ring-black/5 text-gray-900 placeholder:text-gray-400 focus:bg-white',
              ]"
              placeholder="Username"
              required
            />
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="space-y-2">
          <label
            class="ml-1 block text-[13px] font-bold tracking-wide"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >
            访问令牌 / 密码
          </label>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-2xl border-0 py-4 pl-5 pr-4 text-sm font-bold shadow-sm outline-none ring-1 transition-all focus:ring-2 focus:ring-[#5b4eff]"
            :class="[
              isDark
                ? 'bg-white/5 ring-white/10 text-white placeholder:text-gray-600 focus:bg-white/10'
                : 'bg-black/5 ring-black/5 text-gray-900 placeholder:text-gray-400 focus:bg-white',
            ]"
            placeholder="Password"
            required
          />
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="isLoading"
          class="relative w-full overflow-hidden rounded-2xl bg-[#5b4eff] py-4 text-sm font-black text-white shadow-xl shadow-[#5b4eff]/20 transition-all hover:scale-[1.01] hover:bg-[#4d42db] active:scale-[0.99] disabled:opacity-50"
        >
          <span
            v-if="!isLoading"
            class="flex items-center justify-center gap-2"
          >
            确认登录
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            正在建立安全连接...
          </span>
        </button>
      </form>

      <!-- 底部版权/备案信息，采用低调样式 -->
      <div class="mt-12 text-center">
        <p
          class="text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300"
          :class="isDark ? 'text-white/20' : 'text-black/20'"
        >
          &copy; 2026 ATRI SYSTEM • SECURE ACCESS
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  /* 确保垂直居中，不被顶部 Header 挤压感干扰 */
  min-height: calc(100vh - 40px);
}

/* 保持平滑的过渡效果 */
.login-card {
  will-change: transform, opacity, background-color;
}
</style>
