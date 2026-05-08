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
});

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
        product.id,
        product.name,
        product.category,
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
    gsap.from(".stagger-product", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power3.out",
    });
  });
}

onMounted(() => {
  animateProducts();
});

watch(filteredProducts, () => {
  animateProducts();
});
</script>

<template>
  <div
    class="products-page min-h-full p-8 text-gray-800 transition-colors duration-500"
    :class="
      isDark ? 'products-dark bg-[#07080d] text-gray-100' : 'bg-transparent'
    "
  >
    <AdminHeader
      title="商品管理"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <div class="mb-8 mt-6 flex flex-wrap items-center gap-4">
      <div class="relative w-full max-w-md">
        <div
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-5 w-5 text-gray-400"
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
          class="block w-full rounded-full border-none bg-white py-3 pl-11 pr-4 text-sm font-medium text-gray-800 shadow-sm outline-none ring-1 ring-gray-100 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#5b4eff]"
          placeholder="搜索名称或分类"
        />
      </div>

      <div class="relative z-10">
        <button
          class="flex items-center gap-2 rounded-full bg-[#5b4eff] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#5b4eff]/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5b4eff]/40"
          :class="{ 'ring-2 ring-[#5b4eff] ring-offset-2': isFilterOpen }"
          @click="toggleFilter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-4 w-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          筛选
        </button>

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
            class="absolute left-0 top-full z-20 mt-3 w-48 overflow-hidden rounded-2xl bg-white py-3 shadow-xl ring-1 ring-gray-100"
          >
            <button
              v-for="category in ['周边', '亚克力立牌', '挂件', '海报']"
              :key="category"
              class="flex w-full items-center px-5 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#5b4eff]/5"
              :class="{
                'bg-[#5b4eff]/10 text-[#5b4eff]': selectedCategory === category,
              }"
              @click="selectCategory(category)"
            >
              <span v-if="selectedCategory === category" class="mr-2">✓</span>
              <span :class="{ 'ml-5': selectedCategory !== category }">{{
                category
              }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <button
        class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5b4eff] text-[#5b4eff] transition-all hover:bg-[#5b4eff]/10"
        @click="resetSearch"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="h-5 w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="pending"
      class="rounded-[24px] bg-white py-20 text-center text-sm font-bold text-[#5b4eff] shadow-sm ring-1 ring-gray-100"
    >
      正在连接数据库...
    </div>

    <div
      v-else-if="error"
      class="rounded-[24px] bg-white py-20 text-center text-sm font-bold text-red-500 shadow-sm ring-1 ring-gray-100"
    >
      商品数据加载失败
    </div>

    <div
      v-else-if="!filteredProducts.length"
      class="rounded-[24px] bg-white py-20 text-center text-sm font-bold text-gray-500 shadow-sm ring-1 ring-gray-100"
    >
      没有找到匹配的商品
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="product in filteredProducts"
        :key="product.id"
        class="stagger-product flex flex-col overflow-hidden rounded-[24px] bg-white p-4 text-gray-800 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg"
      >
        <div
          v-if="!product.name.includes('Acrylic Panel')"
          class="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#f4f5f7] p-3"
        >
          <img
            :src="product.imageUrl"
            :alt="product.name"
            class="h-full w-full object-contain"
            loading="lazy"
          />
        </div>

        <div
          class="flex items-center gap-2 text-xs font-black tracking-[0.06em] text-[#5b4eff]"
        >
          <span class="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#5b4eff]" />
          <span>{{ product.category }}</span>
        </div>

        <h3
          class="mt-3 line-clamp-2 min-h-[48px] text-base font-black leading-6 text-gray-800"
          :title="product.name"
        >
          {{ product.name }}
        </h3>

        <div class="mt-3 flex flex-col gap-1 text-xs font-medium text-gray-500">
          <span>价格: {{ product.priceDisplay }}</span>
          <span>上架时间: {{ formatCreatedAt(product.createdAt) }}</span>
        </div>

        <div class="mt-auto pt-5">
          <div class="flex items-center gap-3">
            <button
              class="flex-1 rounded-full bg-[#5b4eff] py-2.5 text-sm font-bold text-white transition-all hover:bg-[#4d42db] active:scale-95"
              @click="handleStatusChange(product, 'list')"
            >
              下架
            </button>
            <button
              class="flex-1 rounded-full border-2 border-[#5b4eff] py-2 text-sm font-bold text-[#5b4eff] transition-all hover:bg-[#5b4eff]/10 active:scale-95"
              @click="handleStatusChange(product, 'unlist')"
            >
              修改
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.products-page :deep(.bg-white),
.products-page :deep(.ring-1) {
  transition:
    background-color 0.5s ease,
    box-shadow 0.5s ease,
    border-color 0.5s ease,
    color 0.5s ease;
}
</style>
