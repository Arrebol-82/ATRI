<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

const route = useRoute();
const supabase = useSupabaseClient();
// 核心：使用 Nuxt 全局状态控制明暗模式
const isDark = useState("admin-dark-mode", () => false);
const isEasterEggActive = ref(false);

// 判断是否是登录页
const isLoginPage = computed(() => {
  return route.path === "/admin";
});

// --- 粒子与流星的类型定义 ---
interface Star {
  distance: number;
  angle: number;
  speed: number;
  size: number;
  phase: number;
  twinkleSpeed: number;
  baseAlpha: number;
  variance: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  life: number;
  maxLife: number;
}

// --- Konami Code 彩蛋逻辑 ---
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];
let keySequence: string[] = [];

const checkKonamiCode = (e: KeyboardEvent) => {
  // 登录页不触发彩蛋
  if (isLoginPage.value) {
    return;
  }

  // 彩蛋激活时，只有按 ESC 才取消
  if (isEasterEggActive.value) {
    if (e.code === "Escape") {
      isEasterEggActive.value = false;
      keySequence = [];
    }
    return;
  }

  keySequence.push(e.code);
  if (keySequence.length > konamiCode.length) keySequence.shift();
  if (JSON.stringify(keySequence) === JSON.stringify(konamiCode)) {
    isEasterEggActive.value = true;
  }
};

const handleEasterEggClose = () => {
  isEasterEggActive.value = false;
  keySequence = [];
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  await navigateTo("/admin");
};

// --- Canvas 星空引擎 ---
const starCanvas = ref<HTMLCanvasElement | null>(null);
let cleanupCanvas: (() => void) | null = null;

const initParticleSystem = (): (() => void) | null => {
  const canvas = starCanvas.value;
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  let particles: Star[] = [];
  let meteors: Meteor[] = [];
  let animationFrameId: number | null = null;
  let nextMeteorTime: number = Date.now() + Math.random() * 3000;

  const pivotX = () => width;
  const pivotY = () => height;

  const initStars = () => {
    particles = [];
    meteors = [];
    const maxDistance = Math.sqrt(width * width + height * height) * 1.1;
    const circleArea = Math.PI * maxDistance * maxDistance;
    const particleCount = Math.floor(circleArea / 22000);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        distance: Math.sqrt(Math.random()) * maxDistance,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0001 + 0.0001,
        size: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        baseAlpha: Math.random() * 0.4 + 0.5,
        variance: Math.random() * 0.2 + 0.2,
      });
    }
  };

  const spawnMeteor = () => {
    const baseSpeed = Math.random() * 3 + 4;
    meteors.push({
      x: Math.random() * width * 1.5,
      y: -50,
      vx: -baseSpeed * 1.0, // 锁定平行角度
      vy: baseSpeed * 1.5,
      length: Math.random() * 400 + 350,
      thickness: Math.random() * 1.2 + 1.2,
      life: 0,
      maxLife: 140 + Math.random() * 60,
    });
  };

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // 1. 绘制底层星空
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // 修复 TS 严苛检查：确保 p 存在
      if (!p) continue;

      p.phase += p.twinkleSpeed;
      p.angle += p.speed;
      const currentAlpha = Math.max(
        0.15,
        Math.min(1, p.baseAlpha + Math.sin(p.phase) * p.variance),
      );
      const x = pivotX() + Math.cos(p.angle) * p.distance;
      const y = pivotY() + Math.sin(p.angle) * p.distance;

      if (x > -10 && x < width + 10 && y > -10 && y < height + 10) {
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      }
    }

    // 2. 流星调度
    const now = Date.now();
    if (now > nextMeteorTime) {
      const count = Math.random() < 0.15 ? 2 : 1;
      for (let k = 0; k < count; k++) spawnMeteor();
      nextMeteorTime = now + (Math.random() * 5000 + 1000);
    }

    // 3. 绘制流星
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      // 修复 TS 严苛检查：确保 m 存在
      if (!m) continue;

      m.x += m.vx;
      m.y += m.vy;
      m.life++;

      const opacity = Math.max(0, 1 - m.life / m.maxLife);

      if (
        m.life >= m.maxLife ||
        opacity <= 0 ||
        m.x < -400 ||
        m.y > height + 400
      ) {
        meteors.splice(i, 1);
        continue;
      }

      const speedScale = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
      const tailX = m.x - (m.vx / speedScale) * m.length;
      const tailY = m.y - (m.vy / speedScale) * m.length;

      // 绘制锐利渐变尾巴
      const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.7})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = m.thickness;
      ctx.lineCap = "round";
      ctx.stroke();

      // 绘制发光头部
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.thickness * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }
    animationFrameId = requestAnimationFrame(draw);
  };

  initStars();
  draw();

  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
  };

  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
};

// --- 生命周期管理 ---
let mediaQuery: MediaQueryList | null = null;
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  isDark.value = e.matches;
};

onMounted(() => {
  window.addEventListener("keydown", checkKonamiCode);

  if (window.matchMedia) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    // 仅在首次挂载且没有手动设置过时参考系统主题
    if (mediaQuery.matches) isDark.value = true;
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", checkKonamiCode);
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }
  if (cleanupCanvas) cleanupCanvas();
});

watch(
  isDark,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        cleanupCanvas = initParticleSystem();
      });
    } else {
      if (cleanupCanvas) {
        cleanupCanvas();
        cleanupCanvas = null;
      }
    }
  },
  { immediate: true },
);

const navItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6 M14 5l5-2m0 0l-2 5m2-5l-6 6" />`,
  },
  {
    name: "Store",
    path: "/admin/products",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H6.75A.75.75 0 006 15v3.75c0 .414.336.75.75.75z" />`,
  },
  {
    name: "Tasks",
    path: "/admin/orders",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />`,
  },
];
</script>

<template>
  <div
    class="relative flex h-screen w-full overflow-hidden transition-colors duration-500"
    :class="isDark ? 'bg-[#000000]' : 'bg-[#f8f9fa]'"
  >
    <!-- 背景层 -->
    <div
      v-if="isDark"
      class="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      <div class="absolute inset-0 bg-[#000000]"></div>
      <canvas ref="starCanvas" class="absolute inset-0 z-10"></canvas>
      <div
        class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"
      ></div>
    </div>

    <!-- 彩蛋提示层 -->
    <div
      v-if="isEasterEggActive"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
    >
      <div class="text-center">
        <h2 class="text-4xl font-black tracking-tighter text-white drop-shadow-lg animate-pulse">
          ✨
        </h2>
        <p
          class="mt-6 text-gray-300 text-lg cursor-pointer pointer-events-auto hover:text-white transition-colors"
          @click="handleEasterEggClose"
        >
          按 ESC 键或点击这里返回
        </p>
      </div>
    </div>

    <!-- 侧边栏 -->
    <aside
      v-if="!isLoginPage && !isEasterEggActive"
      class="z-10 flex h-screen w-[84px] shrink-0 flex-col items-center border-r py-10 transition-colors duration-500"
      :class="
        isDark
          ? 'border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md'
          : 'border-gray-100 bg-white'
      "
    >
      <nav class="mt-5 flex flex-col gap-6">
        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="group flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition-all duration-300 ease-out"
          :class="[
            route.path === item.path
              ? isDark
                ? 'bg-[#1f2230] text-[#dbeafe]'
                : 'bg-[#f3f0fd] text-[#5b4097]'
              : isDark
                ? 'text-gray-500 hover:bg-white/10'
                : 'text-gray-400 hover:bg-gray-50',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="h-6 w-6"
            v-html="item.icon"
          ></svg>
        </NuxtLink>
      </nav>
      <div class="mt-auto flex flex-col items-center pb-4">
        <button
          type="button"
          class="group flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition-all duration-300 ease-out"
          :class="
            isDark
              ? 'text-gray-500 hover:bg-red-500/15 hover:text-red-400'
              : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
          "
          aria-label="退出登录"
          @click="handleLogout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>
      </div>
    </aside>

    <main
      v-show="!isEasterEggActive"
      class="relative z-10 hide-scrollbar flex-1 overflow-y-auto"
    >
      <slot />
    </main>
  </div>
</template>

<style scoped>
a,
button {
  -webkit-tap-highlight-color: transparent;
}
.hide-scrollbar {
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
