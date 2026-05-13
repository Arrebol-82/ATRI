<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { gsap } from "gsap";

type MerchandiseProduct = {
  id: string;
  name: string;
  category: string;
  priceDisplay: string;
  imageDescription?: string | null;
  imageUrl: string;
  createdAt?: string | Date;
};

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

// 绝对控制明暗模式
const isDark = useState("admin-dark-mode", () => false);
const searchQuery = ref("");

function toggleTheme() {
  isDark.value = !isDark.value;
}

const isFilterOpen = ref(false);
const selectedCategory = ref("");

function resetSearch() {
  searchQuery.value = "";
  selectedCategory.value = "";
  isFilterOpen.value = false;
}

function toggleFilter() {
  isFilterOpen.value = !isFilterOpen.value;
}

function selectCategory(category: string) {
  selectedCategory.value = category;
  isFilterOpen.value = false;
}

const {
  data: products,
  pending,
  error,
} = await useFetch<MerchandiseProduct[]>("/api/merchandise", {
  default: () => [],
});

const totalProducts = computed(() => products.value.length);

const totalCategories = computed(() => {
  const categories = new Set(products.value.map((p) => p.category));
  return categories.size;
});

const categoryList = computed(() => {
  const categories = new Set(products.value.map((p) => p.category));
  return Array.from(categories);
});

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  products.value.forEach((product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
  });
  return counts;
});

const categoryTrends = computed(() => {
  const trends: Record<string, { count: number; type: "up" | "down" }> = {};
  trends["周边"] = { count: 2, type: "up" };
  trends["海报"] = { count: 1, type: "down" };
  trends["亚克力立牌"] = { count: 2, type: "down" };
  trends["挂件"] = { count: 2, type: "down" };
  return trends;
});

const selectedCategoryCount = computed(() => {
  if (!selectedCategory.value) {
    return null;
  }
  return products.value.filter((p) => p.category === selectedCategory.value)
    .length;
});

const filteredProducts = computed(() => {
  let result = products.value;

  if (selectedCategory.value) {
    result = result.filter(
      (product) => product.category === selectedCategory.value,
    );
  }

  const keyword = searchQuery.value.trim().toLowerCase();
  if (keyword) {
    result = result.filter((product) => {
      return [
        product.name,
        formatCreatedAt(product.createdAt),
        product.priceDisplay,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword),
      );
    });
  }

  return result;
});

function formatCreatedAt(value?: string | Date) {
  if (!value) {
    return "未记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function handleStatusChange(
  product: MerchandiseProduct,
  action: "list" | "unlist",
) {
  console.log(`Action: ${action} for product ID: ${product.id}`);
}

function animateProducts() {
  nextTick(() => {
    gsap.fromTo(
      ".stagger-product",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        overwrite: true,
      },
    );
  });
}

onMounted(() => {
  gsap.from(".stagger-card", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: "power3.out",
  });
  animateProducts();

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".filter-dropdown")) {
      isFilterOpen.value = false;
    }
  });
});

watch(filteredProducts, () => {
  animateProducts();
});
</script>

<template>
  <div
    class="products-page min-h-full p-8 transition-colors duration-500"
    :class="
      isDark
        ? 'products-dark bg-transparent text-gray-100'
        : 'bg-[#f2f4f8] text-gray-900'
    "
  >
    <AdminHeader
      title="商品管理"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <!-- 第一模块：顶部数据卡片 -->
    <div class="grid grid-cols-1 gap-5 mb-10 sm:grid-cols-2 lg:grid-cols-3">
      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] transition-all duration-300 hover:-translate-y-1"
        :class="
          isDark
            ? 'bg-[#11131c] text-gray-100 ring-1 ring-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
            : 'bg-white text-gray-900 ring-1 ring-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
        "
      >
        <div class="flex items-start justify-between">
          <div
            class="text-[15px] font-bold transition-colors duration-300"
            :class="
              isDark
                ? 'text-gray-400 group-hover:text-white/90'
                : 'text-gray-500 group-hover:text-white/90'
            "
          >
            商品总量
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                : 'bg-[#e2f8ee] text-[#1aa467] group-hover:bg-green-400/20 group-hover:text-green-300'
            "
          >
            ↑ {{ totalProducts }}件
          </span>
        </div>
        <div class="mt-4 text-[34px] font-black tracking-tight">
          {{ totalProducts }}
        </div>
      </div>

      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] transition-all duration-300 hover:-translate-y-1"
        :class="
          isDark
            ? 'bg-[#11131c] text-gray-100 ring-1 ring-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
            : 'bg-white text-gray-900 ring-1 ring-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
        "
      >
        <div class="flex items-start justify-between">
          <div
            class="text-[15px] font-bold transition-colors duration-300"
            :class="
              isDark
                ? 'text-gray-400 group-hover:text-white/90'
                : 'text-gray-500 group-hover:text-white/90'
            "
          >
            类型总数
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                : 'bg-[#e2f8ee] text-[#1aa467] group-hover:bg-green-400/20 group-hover:text-green-300'
            "
          >
            ↑ {{ totalCategories }}类
          </span>
        </div>
        <div class="mt-4 text-[34px] font-black tracking-tight">
          {{ totalCategories }}
        </div>
      </div>

      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] transition-all duration-300"
        :class="
          isDark
            ? 'bg-[#11131c] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
            : 'bg-white shadow-sm hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30'
        "
      >
        <div
          class="text-[15px] font-bold transition-colors duration-300"
          :class="
            isDark
              ? 'text-gray-400 group-hover:text-white/90'
              : 'text-gray-500 group-hover:text-white/90'
          "
        >
          商品类型分布
        </div>
        <div class="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
          <div
            v-for="category in categoryList"
            :key="category"
            class="flex items-center justify-between text-left"
          >
            <span
              class="text-[15px] font-bold transition-colors duration-300"
              :class="
                isDark
                  ? 'text-gray-100 group-hover:text-white'
                  : 'text-gray-800 group-hover:text-white'
              "
            >
              {{ category }}
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
              :class="
                categoryTrends[category]?.type === 'up'
                  ? isDark
                    ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                    : 'bg-green-100 text-green-600 group-hover:bg-green-400/20 group-hover:text-green-300'
                  : isDark
                    ? 'bg-[#ef4444]/15 text-[#f87171] group-hover:bg-red-400/20 group-hover:text-red-300'
                    : 'bg-red-100 text-red-500 group-hover:bg-red-400/20 group-hover:text-red-200'
              "
            >
              {{ categoryTrends[category]?.type === "up" ? "↑" : "↓" }}
              {{ categoryTrends[category]?.count }}件
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二模块：整合了搜索和列表的文件夹容器 -->
    <div class="stagger-card tab-container relative">
      <!-- 文件夹大容器 (Body) -->
      <div
        class="relative z-0 bg-[var(--bg-color)] rounded-[24px] p-6 transition-colors duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      >
        <!-- 操作栏 (搜索 & 筛选) -->
        <div class="flex flex-wrap items-center gap-4 mb-8">
          <!-- 搜索框 -->
          <div class="relative flex-1 max-w-[420px] group-search">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="h-4 w-4 transition-colors group-search-focus-within:text-[#5b4eff]"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full rounded-full border-0 py-3.5 pl-11 pr-4 text-[13px] font-bold shadow-sm outline-none ring-1 transition-all placeholder:font-medium focus:ring-2 focus:ring-[#5b4eff]"
              :class="
                isDark
                  ? 'bg-[#1a1d27] ring-white/10 text-gray-100 placeholder:text-gray-500 focus:bg-[#11131c]'
                  : 'bg-gray-50 ring-gray-200/80 text-gray-900 placeholder:text-gray-400 focus:bg-white'
              "
              placeholder="搜索商品名称、上架时间或价格..."
            />
          </div>

          <!-- 筛选按钮 -->
          <div class="relative z-20 filter-dropdown">
            <button
              class="flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-bold shadow-sm transition-all ring-1"
              :class="
                isFilterOpen
                  ? 'bg-[#5b4eff] text-white ring-[#5b4eff] shadow-md shadow-[#5b4eff]/30'
                  : isDark
                    ? 'bg-[#1a1d27] ring-white/10 text-gray-100 hover:bg-[#242837]'
                    : 'bg-white ring-gray-200/80 text-gray-900 hover:bg-gray-50'
              "
              @click="toggleFilter"
            >
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
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
              筛选分类
            </button>

            <!-- 下拉筛选面板 -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-2 opacity-0"
            >
              <div
                v-if="isFilterOpen"
                class="absolute left-0 top-full z-30 mt-3 w-48 overflow-hidden rounded-2xl shadow-xl ring-1"
                :class="
                  isDark
                    ? 'bg-[#1a1d27] ring-white/10'
                    : 'bg-white ring-gray-100'
                "
              >
                <button
                  v-for="category in categoryList"
                  :key="category"
                  class="flex w-full items-center px-5 py-3 text-left text-[13px] font-bold transition-colors"
                  :class="[
                    selectedCategory === category
                      ? 'bg-[#5b4eff]/10 text-[#5b4eff]'
                      : isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-gray-50',
                  ]"
                  @click="selectCategory(category)"
                >
                  <span v-if="selectedCategory === category" class="mr-2"
                    >✓</span
                  >
                  <span :class="{ 'ml-5': selectedCategory !== category }">{{
                    category
                  }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- 重置按钮 -->
          <button
            class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5b4eff] text-[#5b4eff] transition-all hover:bg-[#5b4eff]/10"
            @click="resetSearch"
            title="重置检索"
          >
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
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>

          <!-- 统计计数 -->
          <p
            class="ml-auto text-[13px] font-bold"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            <span v-if="selectedCategoryCount !== null">
              <span :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{
                selectedCategory
              }}</span>
              分类下共
              <span class="text-[#5b4eff] font-black">{{
                selectedCategoryCount
              }}</span>
              件商品
            </span>
            <span v-else>
              共检索到
              <span class="text-[#5b4eff] font-black">{{
                filteredProducts.length
              }}</span>
              件商品
            </span>
          </p>
        </div>

        <!-- 状态展示 -->
        <div
          v-if="pending"
          class="py-20 text-center text-sm font-bold text-[#5b4eff]"
        >
          <svg
            class="h-8 w-8 animate-spin mx-auto mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          正在连接数据库...
        </div>

        <div
          v-else-if="error"
          class="py-20 text-center text-sm font-bold text-red-500"
        >
          商品数据加载失败
        </div>

        <div
          v-else-if="!filteredProducts.length"
          class="py-20 text-center text-sm font-bold"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          <span class="text-4xl block mb-2 opacity-50">📭</span>
          没有找到匹配的商品
        </div>

        <!-- 商品网格 -->
        <div
          v-else
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="stagger-product flex flex-col overflow-hidden rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(91,78,255,0.08)]"
            :class="
              isDark
                ? 'bg-[#1a1d27] ring-white/5 hover:ring-[#5b4eff]/50'
                : 'bg-white ring-gray-100 hover:ring-[#5b4eff]/30'
            "
          >
            <!-- 图片区域 -->
            <div
              v-if="!product.name.includes('Acrylic Panel')"
              class="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[14px] p-3 transition-colors"
              :class="isDark ? 'bg-[#11131c]' : 'bg-[#f8f9fa]'"
            >
              <img
                :src="product.imageUrl"
                :alt="product.name"
                class="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                loading="lazy"
              />
            </div>

            <!-- 分类标签 -->
            <div
              class="flex items-center gap-2 text-[11px] font-black tracking-[0.06em] text-[#5b4eff]"
            >
              <span class="h-2 w-2 rotate-45 rounded-[2px] bg-[#5b4eff]" />
              <span>{{ product.category }}</span>
            </div>

            <!-- 商品标题 -->
            <h3
              class="mt-3 line-clamp-2 min-h-[44px] text-[15px] font-black leading-snug"
              :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              :title="product.name"
            >
              {{ product.name }}
            </h3>

            <!-- 价格及时间信息 -->
            <div
              class="mt-3 flex flex-col gap-1.5 text-[12px] font-bold"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              <div class="flex justify-between">
                <span>价格</span>
                <span class="text-[#5b4eff] font-black">{{
                  product.priceDisplay
                }}</span>
              </div>
              <div class="flex justify-between">
                <span>上架时间</span>
                <span>{{ formatCreatedAt(product.createdAt) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="mt-auto pt-6">
              <div class="flex items-center gap-2">
                <button
                  class="flex-1 rounded-xl bg-[#5b4eff] py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_14px_rgba(91,78,255,0.25)] transition-all hover:bg-[#4d42db] active:scale-95"
                  @click="handleStatusChange(product, 'list')"
                >
                  下架
                </button>
                <button
                  class="flex-1 rounded-xl border border-[#5b4eff] py-2.5 text-[13px] font-extrabold text-[#5b4eff] transition-all hover:bg-[#5b4eff]/10 active:scale-95"
                  @click="handleStatusChange(product, 'unlist')"
                >
                  修改
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局平滑过渡 */
.products-page * {
  transition-property: background-color, border-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* 搜索框图标 focus 联动 */
.group-search-focus-within\:text-\[\#5b4eff\]:focus-within {
  color: #5b4eff;
}

/* =====================================================
核心科技：异形 Tab 的平滑倒角 (Inverted Corner)
通过 CSS 变量自动适配亮色与暗色模式
=====================================================
*/
.tab-container {
  --bg-color: #ffffff;
}
.products-dark .tab-container {
  --bg-color: #11131c;
}

.inverted-corner {
  position: absolute;
  right: -20px;
  bottom: 0;
  width: 20px;
  height: 20px;
  overflow: hidden;
  pointer-events: none;
}

.inverted-corner::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-bottom-left-radius: 20px;
  box-shadow: -10px 10px 0 0 var(--bg-color);
  background: transparent;
  transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
