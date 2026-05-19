<script setup lang="ts">
import {
  ref,
  computed,
  onBeforeUnmount,
  onMounted,
  nextTick,
  watch,
} from "vue";
import gsap from "gsap";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const isDark = useState("admin-dark-mode", () => false);
const ordersPageRef = ref<HTMLElement | null>(null);

function toggleTheme() {
  isDark.value = !isDark.value;
}

interface Order {
  id: string;
  productName: string;
  type: string;
  quantity: number;
  status: "Shipped" | "Pending" | "Cancelled";
  orderTime: string;
  price: string;
}

type OrderRecord = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
};

const { data: orderRecords, refresh: refreshOrders } = await useFetch<OrderRecord[]>(
  "/api/orders/list",
  {
    default: () => [],
  },
);

const numberFormatter = new Intl.NumberFormat("ja-JP");
const totalOrderCount = computed(() => orderRecords.value.length);

function mapOrderStatus(status: string): Order["status"] {
  if (status === "已发货") {
    return "Shipped";
  }

  if (status === "已取消") {
    return "Cancelled";
  }

  return "Pending";
}

function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(/\//g, "-");
}

const orders = computed<Order[]>(() =>
  orderRecords.value.map((order) => ({
    id: order.id,
    productName: order.productName,
    type: order.category,
    quantity: order.quantity,
    status: mapOrderStatus(order.status),
    orderTime: formatOrderTime(order.createdAt),
    price: `JPY ${numberFormatter.format(Number(order.amount) || 0)}`,
  })),
);

const stats = computed(() => [
  {
    label: "总订单",
    value: totalOrderCount.value,
    trend: "↑ 8",
    trendType: "up",
    isPrimary: true,
  },
  {
    label: "已取消",
    value: 0,
    trend: "0",
    trendType: "down",
    isPrimary: false,
  },
  {
    label: "已完成订单",
    value: 0,
    trend: "0",
    trendType: "up",
    isPrimary: false,
  },
  {
    label: "每周退货率",
    value: "0%",
    trend: "0%",
    trendType: "down",
    isPrimary: false,
  },
]);

const searchQuery = ref("");
const selectedStatus = ref("订单状态");
const isStatusDropdownOpen = ref(false);
const selectedType = ref("全部类型");
const selectedTimeRange = ref("全部时间");
const selectedPriceRange = ref("全部价格");
const isFilterDropdownOpen = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const typeOptions = [
  "全部类型",
  "周边",
  "亚克力立牌",
  "海报",
  "挂件",
  "Merch",
  "Poster",
];

const timeRangeOptions = [
  { label: "全部时间", value: "all" },
  { label: "今天", value: "today" },
  { label: "近7天", value: "week" },
  { label: "近30天", value: "month" },
];

const priceRangeOptions = [
  { label: "全部价格", value: "all", min: 0, max: Infinity },
  { label: "¥0-¥1,000", value: "0-1000", min: 0, max: 1000 },
  { label: "¥1,000-¥3,000", value: "1000-3000", min: 1000, max: 3000 },
  { label: "¥3,000-¥5,000", value: "3000-5000", min: 3000, max: 5000 },
  { label: "¥5,000+", value: "5000+", min: 5000, max: Infinity },
];

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage);
});

const shouldShowPagination = computed(() => {
  return totalPages.value > 1;
});

const paginatedOrders = computed(() => {
  const filtered = filteredOrders.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
});

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchSearch = order.productName
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchStatus =
      selectedStatus.value === "订单状态" ||
      order.status === selectedStatus.value;
    const matchType =
      selectedType.value === "全部类型" || order.type === selectedType.value;
    const matchTime = checkTimeRange(order.orderTime);
    const matchPrice = checkPriceRange(order.price);
    return matchSearch && matchStatus && matchType && matchTime && matchPrice;
  });
});

function checkTimeRange(orderTime: string): boolean {
  if (selectedTimeRange.value === "全部时间") return true;

  const [datePart] = orderTime.split(" ");
  if (!datePart) return true;

  const parts = datePart.split("-");
  if (parts.length !== 3) return true;

  const yearStr = parts[0];
  const monthStr = parts[1];
  const dayStr = parts[2];
  if (!yearStr || !monthStr || !dayStr) return true;

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return true;

  const orderDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (selectedTimeRange.value) {
    case "今天": {
      return orderDate.getTime() === today.getTime();
    }
    case "近7天": {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    }
    case "近30天": {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return orderDate >= monthAgo;
    }
    default:
      return true;
  }
}

function checkPriceRange(price: string): boolean {
  if (selectedPriceRange.value === "全部价格") return true;

  const match = price.match(/[\d,]+/);
  if (!match) return true;

  const priceValue = parseInt(match[0].replace(/,/g, ""), 10);

  switch (selectedPriceRange.value) {
    case "¥0-¥1,000":
      return priceValue >= 0 && priceValue <= 1000;
    case "¥1,000-¥3,000":
      return priceValue >= 1000 && priceValue <= 3000;
    case "¥3,000-¥5,000":
      return priceValue >= 3000 && priceValue <= 5000;
    case "¥5,000+":
      return priceValue >= 5000;
    default:
      return true;
  }
}

watch(
  [
    searchQuery,
    selectedStatus,
    selectedType,
    selectedTimeRange,
    selectedPriceRange,
  ],
  () => {
    currentPage.value = 1;
  },
);

function toggleStatusDropdown() {
  if (isStatusDropdownOpen.value) {
    isStatusDropdownOpen.value = false;
  } else {
    isStatusDropdownOpen.value = true;
    isFilterDropdownOpen.value = false;
  }
}

function selectStatus(status: string) {
  selectedStatus.value = status;
  isStatusDropdownOpen.value = false;
}

function getStatusDropdownItemClass(status: string, isDark: boolean) {
  const isSelected = selectedStatus.value === status;
  if (isSelected) {
    return "bg-[#5b4eff]/10 text-[#5b4eff] font-bold";
  }
  return isDark
    ? "text-gray-300 hover:bg-white/5 hover:text-white"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
}

function getStatusDropdownItemIconClass(status: string, isDark: boolean) {
  const isSelected = selectedStatus.value === status;
  if (isSelected) {
    return "bg-[#5b4eff]/15 text-[#5b4eff]";
  }
  switch (status) {
    case "Shipped":
      return isDark
        ? "bg-[#1aa467]/20 text-[#34d399]"
        : "bg-[#e2f8ee] text-[#1aa467]";
    case "Pending":
      return isDark
        ? "bg-[#f59e0b]/20 text-[#fbbf24]"
        : "bg-[#fff4e5] text-[#f59e0b]";
    case "Cancelled":
      return isDark
        ? "bg-[#ef4444]/20 text-[#f87171]"
        : "bg-[#fee2e2] text-[#ef4444]";
    default:
      return isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500";
  }
}

function getStatusDropdownIconClass(status: string) {
  switch (status) {
    case "Shipped":
      return "M5 13l4 4L19 7";
    case "Pending":
      return "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z";
    case "Cancelled":
      return "M6 18L18 6M6 6l12 12";
    default:
      return "";
  }
}

function getStatusDisplayText(status: string) {
  switch (status) {
    case "Shipped":
      return "已发货";
    case "Pending":
      return "待处理";
    case "Cancelled":
      return "已取消";
    default:
      return status;
  }
}

function toggleFilterDropdown() {
  if (isFilterDropdownOpen.value) {
    isFilterDropdownOpen.value = false;
  } else {
    isFilterDropdownOpen.value = true;
    isStatusDropdownOpen.value = false;
  }
}

function getFilterItemClass(isSelected: boolean, isDark: boolean) {
  if (isSelected) {
    return "bg-[#5b4eff]/10 text-[#5b4eff] font-bold border-transparent ring-1 ring-[#5b4eff]/30";
  }
  return isDark
    ? "bg-[#11131c] text-gray-300 border-white/5 hover:bg-white/5 hover:text-white"
    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900";
}

function getFilterButtonClass(isDark: boolean, hasActiveFilter: boolean) {
  if (hasActiveFilter) {
    return "bg-[#5b4eff]/10 text-[#5b4eff] ring-[#5b4eff]/30";
  }
  return isDark
    ? "bg-[#1a1d27] ring-white/10 text-gray-100 hover:bg-[#242837]"
    : "bg-white ring-gray-200/80 text-gray-900 hover:bg-gray-50";
}

function hasActiveFilters(): boolean {
  return (
    selectedType.value !== "全部类型" ||
    selectedTimeRange.value !== "全部时间" ||
    selectedPriceRange.value !== "全部价格"
  );
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// --- 查看详情 ---
const viewingOrder = ref<Order | null>(null);
const isUpdatingStatus = ref(false);

function openOrderDetail(order: Order) {
  viewingOrder.value = order;
}

function closeOrderDetail() {
  viewingOrder.value = null;
}

async function updateStatus(newStatus: Order["status"]) {
  if (!viewingOrder.value || isUpdatingStatus.value) return;
  isUpdatingStatus.value = true;
  const orderId = viewingOrder.value.id;
  const dbStatus = newStatus === "Shipped" ? "已发货" : "已取消";
  try {
    await $fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: { status: dbStatus },
    });
    await refreshOrders();
    const fresh = orders.value.find((o) => o.id === orderId);
    if (fresh) viewingOrder.value = fresh;
  } finally {
    isUpdatingStatus.value = false;
  }
}

// --- 删除确认 ---
const deletingOrderId = ref<string | null>(null);
const isDeleting = ref(false);

function openDeleteConfirm(orderId: string) {
  deletingOrderId.value = orderId;
}

function closeDeleteConfirm() {
  if (!isDeleting.value) {
    deletingOrderId.value = null;
  }
}

async function confirmDelete() {
  if (!deletingOrderId.value) return;
  isDeleting.value = true;
  const idToDelete = deletingOrderId.value;
  try {
    await $fetch(`/api/orders/${idToDelete}`, { method: "DELETE" });
    await refreshOrders();
    deletingOrderId.value = null;
    if (viewingOrder.value?.id === idToDelete) viewingOrder.value = null;
  } finally {
    isDeleting.value = false;
  }
}

const getStatusStyles = (status: Order["status"], dark: boolean) => {
  switch (status) {
    case "Shipped":
      return dark
        ? "bg-[#1aa467]/15 text-[#34d399]"
        : "bg-[#e2f8ee] text-[#1aa467]";
    case "Pending":
      return dark
        ? "bg-[#f59e0b]/15 text-[#fbbf24]"
        : "bg-[#fff4e5] text-[#f59e0b]";
    case "Cancelled":
      return dark
        ? "bg-[#ef4444]/15 text-[#f87171]"
        : "bg-[#fee2e2] text-[#ef4444]";
  }
};

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "Shipped":
      return "已发货";
    case "Pending":
      return "待处理";
    case "Cancelled":
      return "已取消";
  }
};

// --- GSAP 动画 ---
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (
    !target.closest(".status-dropdown") &&
    !target.closest(".filter-dropdown")
  ) {
    isStatusDropdownOpen.value = false;
    isFilterDropdownOpen.value = false;
  }
}

onMounted(() => {
  nextTick(() => {
    const cards = ordersPageRef.value?.querySelectorAll(".stagger-card");
    if (cards?.length) {
      gsap.killTweensOf(cards);
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }

    const rows = ordersPageRef.value?.querySelectorAll(".table-row");
    if (rows?.length) {
      gsap.killTweensOf(rows);
      gsap.from(rows, {
        x: -15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.3,
        ease: "power2.out",
      });
    }
  });

  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  viewingOrder.value = null;
  deletingOrderId.value = null;
  isStatusDropdownOpen.value = false;
  isFilterDropdownOpen.value = false;

  const animatedEls = ordersPageRef.value?.querySelectorAll(
    ".stagger-card, .table-row",
  );
  if (animatedEls?.length) {
    gsap.killTweensOf(animatedEls);
    gsap.set(animatedEls, { clearProps: "opacity,transform" });
  }
});
</script>

<template>
  <div class="contents">
  <div
    ref="ordersPageRef"
    class="orders-page min-h-full px-8 py-8 pb-0 flex flex-col transition-colors duration-500"
    :class="
      isDark
        ? 'orders-dark bg-transparent text-gray-100'
        : 'bg-[#f2f4f8] text-gray-900'
    "
  >
    <AdminHeader
      title="订单管理"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <div class="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:bg-[#5b4eff] hover:shadow-lg hover:shadow-[#5b4eff]/30"
        :class="
          isDark
            ? 'bg-[#11131c] ring-1 ring-white/5 hover:text-white'
            : 'bg-white ring-1 ring-gray-100 hover:text-white'
        "
      >
        <div class="flex items-start justify-between">
          <span
            class="text-[15px] font-bold transition-colors duration-300 group-hover:text-white/90"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ stat.label }}
          </span>
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="[
              stat.trendType === 'up'
                ? isDark
                  ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                  : 'bg-green-100 text-green-600 group-hover:bg-green-400/20 group-hover:text-green-300'
                : '',
              stat.trendType === 'down'
                ? isDark
                  ? 'bg-[#ef4444]/15 text-[#f87171] group-hover:bg-red-400/20 group-hover:text-red-200'
                  : 'bg-red-100 text-red-500 group-hover:bg-red-400/20 group-hover:text-red-200'
                : '',
            ]"
          >
            {{ stat.trend }}
          </span>
        </div>
        <div
          class="mt-4 text-[34px] font-black tracking-tight"
          :class="
            isDark
              ? 'text-gray-100 group-hover:text-white'
              : 'text-gray-900 group-hover:text-white'
          "
        >
          {{ stat.value }}
        </div>
      </div>
    </div>

    <div class="relative mt-2.5">
      <svg
        class="absolute inset-0"
        style="clip-path: inset(0 round 48px 48px 0 0); height: 286px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          :fill="isDark ? '#11131c' : '#ffffff'"
          class="transition-colors duration-500"
          d="M 0 220 L 0 32 C 0 14, 14 0, 34 0 L 900 0 C 918 0, 930 7, 936 23 C 946 51, 965 64, 994 64 L 1164 64 C 1186 64, 1200 80, 1200 104 L 1200 220 Z"
        />
      </svg>

      <div class="relative z-10 p-6">
        <div class="flex flex-wrap items-center gap-4 mb-[44px]">
          <div class="relative flex-1 min-w-[280px] max-w-[420px] group-search">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-search-focus-within:text-[#5b4eff]"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索商品名称"
              class="w-full border-0 ring-1 shadow-sm rounded-full py-[17px] pl-11 pr-4 text-[13px] font-bold placeholder:font-medium focus:ring-2 focus:ring-[#5b4eff] outline-none transition-all"
              :class="
                isDark
                  ? 'bg-[#1a1d27] ring-white/10 text-gray-100 placeholder:text-gray-500 focus:bg-[#11131c]'
                  : 'bg-white ring-gray-200/80 text-gray-900 placeholder:text-gray-400 focus:bg-white'
              "
            />
          </div>

          <div class="relative status-dropdown">
            <button
              type="button"
              @click="toggleStatusDropdown"
              class="flex items-center gap-3 border-0 ring-1 shadow-sm rounded-full py-[17px] pl-5 pr-5 text-[13px] font-bold focus:ring-2 focus:ring-[#5b4eff] outline-none transition-all"
              :class="
                isDark
                  ? 'bg-[#1a1d27] ring-white/10 text-gray-100 hover:bg-[#242837]'
                  : 'bg-white ring-gray-200/80 text-gray-900 hover:bg-gray-50'
              "
            >
              <span>{{ getStatusDisplayText(selectedStatus) }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="isStatusDropdownOpen ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-if="isStatusDropdownOpen"
                class="absolute z-50 mt-3 w-48 overflow-hidden rounded-2xl shadow-xl"
                :class="
                  isDark
                    ? 'bg-[#1a1d27] ring-1 ring-white/10'
                    : 'bg-white ring-1 ring-gray-200/80'
                "
              >
                <div class="py-2">
                  <button
                    v-for="status in [
                      '订单状态',
                      'Shipped',
                      'Pending',
                      'Cancelled',
                    ]"
                    :key="status"
                    @click="selectStatus(status)"
                    class="w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors"
                    :class="getStatusDropdownItemClass(status, isDark)"
                  >
                    <span
                      v-if="status !== '订单状态'"
                      class="flex items-center justify-center w-6 h-6 rounded-full"
                      :class="getStatusDropdownItemIconClass(status, isDark)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          :d="getStatusDropdownIconClass(status)"
                        />
                      </svg>
                    </span>
                    <span
                      v-else
                      class="flex items-center justify-center w-6 h-6 rounded-full"
                      :class="
                        selectedStatus === status
                          ? 'bg-[#5b4eff]/15 text-[#5b4eff]'
                          : isDark
                            ? 'bg-white/10 text-gray-400'
                            : 'bg-gray-100 text-gray-500'
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a2.25 2.25 0 00-.659 1.591V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                    </span>
                    <span>{{ getStatusDisplayText(status) }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <div class="relative filter-dropdown">
            <button
              type="button"
              @click="toggleFilterDropdown"
              class="flex items-center gap-3 border-0 ring-1 shadow-sm rounded-full py-[17px] pl-5 pr-5 text-[13px] font-bold transition-all"
              :class="getFilterButtonClass(isDark, hasActiveFilters())"
            >
              <span>筛选</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="isFilterDropdownOpen ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-if="isFilterDropdownOpen"
                class="absolute z-50 mt-3 w-80 overflow-hidden rounded-2xl shadow-xl p-4 space-y-4"
                :class="
                  isDark
                    ? 'bg-[#1a1d27] ring-1 ring-white/10'
                    : 'bg-white ring-1 ring-gray-200/80'
                "
              >
                <div>
                  <p
                    class="text-xs font-bold mb-2"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    类型
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="type in typeOptions"
                      :key="type"
                      @click="
                        selectedType = type;
                        isFilterDropdownOpen = false;
                      "
                      class="px-3 py-2 text-[12px] font-bold rounded-full transition-all border"
                      :class="getFilterItemClass(selectedType === type, isDark)"
                    >
                      {{ type }}
                    </button>
                  </div>
                </div>

                <div>
                  <p
                    class="text-xs font-bold mb-2"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    下单时间
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="time in timeRangeOptions"
                      :key="time.value"
                      @click="
                        selectedTimeRange = time.label;
                        isFilterDropdownOpen = false;
                      "
                      class="px-3 py-2 text-[12px] font-bold rounded-full transition-all border"
                      :class="
                        getFilterItemClass(
                          selectedTimeRange === time.label,
                          isDark,
                        )
                      "
                    >
                      {{ time.label }}
                    </button>
                  </div>
                </div>

                <div>
                  <p
                    class="text-xs font-bold mb-2"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    价格
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="price in priceRangeOptions"
                      :key="price.value"
                      @click="
                        selectedPriceRange = price.label;
                        isFilterDropdownOpen = false;
                      "
                      class="px-3 py-2 text-[12px] font-bold rounded-full transition-all border"
                      :class="
                        getFilterItemClass(
                          selectedPriceRange === price.label,
                          isDark,
                        )
                      "
                    >
                      {{ price.label }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <div class="ml-auto -mt-[40px]">
            <div
              class="inline-flex items-center gap-2 px-5 py-[12px] rounded-full shadow-sm transition-colors duration-500"
              :class="
                isDark
                  ? 'bg-[#11131c] ring-1 ring-white/10'
                  : 'bg-white ring-1 ring-gray-100'
              "
            >
              <p
                class="text-[13px] font-bold"
                :class="isDark ? 'text-gray-300' : 'text-gray-800'"
              >
                订单总量:
                <span class="font-black text-[#5b4eff]">{{
                  filteredOrders.length
                }}</span>
                笔订单
              </p>
            </div>
          </div>
        </div>

        <div
          class="overflow-hidden -mx-6 px-6 pt-6 transition-colors duration-500"
          :style="{
            clipPath: 'inset(0 0 0 0 round 48px 12px 12px 48px)',
            backgroundColor: isDark ? '#1a1d27' : '#f8f8f8',
          }"
        >
          <div class="overflow-x-auto pb-4">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr
                  class="text-[13px] font-extrabold border-b-[1.5px]"
                  :class="
                    isDark
                      ? 'text-gray-200 border-white/5'
                      : 'text-gray-900 border-gray-100'
                  "
                >
                  <th class="pb-4 pl-2 text-center font-black w-[18%]">
                    商品名称
                  </th>
                  <th class="pb-4 text-center font-black w-[10%]">类型</th>
                  <th class="pb-4 text-center font-black w-[10%]">订单数量</th>
                  <th class="pb-4 text-center font-black w-[10%]">状态</th>
                  <th class="pb-4 text-center font-black w-[15%]">下单时间</th>
                  <th class="pb-4 text-center font-black w-[12%]">价格</th>
                  <th class="pb-4 text-center font-black w-[25%]">操作</th>
                </tr>
              </thead>
              <tbody class="text-[13px] font-bold">
                <tr
                  v-for="order in paginatedOrders"
                  :key="order.id"
                  class="table-row border-b last:border-none transition-colors"
                  :class="
                    isDark
                      ? 'border-white/5 hover:bg-[#242837]'
                      : 'border-gray-200/50 hover:bg-white'
                  "
                >
                  <td
                    class="py-5 text-center w-[18%]"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                  >
                    <span class="truncate block">{{ order.productName }}</span>
                  </td>
                  <td
                    class="py-5 text-center w-[10%]"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    {{ order.type }}
                  </td>
                  <td
                    class="py-5 text-center w-[10%]"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                  >
                    {{ order.quantity }}
                  </td>
                  <td class="py-5 text-center w-[10%]">
                    <div
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider"
                      :class="getStatusStyles(order.status, isDark)"
                    >
                      {{ getStatusLabel(order.status) }}
                    </div>
                  </td>
                  <td
                    class="py-5 text-center w-[15%]"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    {{ order.orderTime }}
                  </td>
                  <td
                    class="py-5 text-center w-[12%] font-extrabold"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                  >
                    {{ order.price }}
                  </td>
                  <td class="py-5 text-center w-[25%]">
                    <div class="flex items-center justify-center gap-5">
                      <button
                        class="flex items-center gap-1.5 transition-colors"
                        :class="
                          isDark
                            ? 'text-gray-400 hover:text-[#715df2]'
                            : 'text-gray-500 hover:text-[#5b4eff]'
                        "
                        @click="openOrderDetail(order)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        查看
                      </button>
                      <button
                        class="flex items-center gap-1.5 transition-colors hover:text-red-500"
                        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                        @click="openDeleteConfirm(order.id)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="shouldShowPagination"
            class="mt-8 mb-4 flex items-center justify-center gap-2"
          >
            <button
              class="flex h-10 w-10 items-center justify-center rounded-full transition-all"
              :class="
                isDark
                  ? 'bg-[#11131c] text-gray-400 hover:bg-[#5b4eff] hover:text-white ring-1 ring-white/5'
                  : 'bg-white text-gray-600 hover:bg-[#5b4eff] hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
              "
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <template v-for="page in totalPages" :key="page">
              <button
                v-if="
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                "
                class="flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-sm font-bold transition-all"
                :class="
                  currentPage === page
                    ? 'bg-[#5b4eff] text-white shadow-md shadow-[#5b4eff]/30'
                    : isDark
                      ? 'bg-[#11131c] text-gray-400 hover:bg-[#5b4eff] hover:text-white ring-1 ring-white/5'
                      : 'bg-white text-gray-600 hover:bg-[#5b4eff] hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                "
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <span
                v-else-if="page === currentPage - 2 || page === currentPage + 2"
                class="px-2 text-gray-400"
              >
                ...
              </span>
            </template>

            <button
              class="flex h-10 w-10 items-center justify-center rounded-full transition-all"
              :class="
                isDark
                  ? 'bg-[#11131c] text-gray-400 hover:bg-[#5b4eff] hover:text-white ring-1 ring-white/5'
                  : 'bg-white text-gray-600 hover:bg-[#5b4eff] hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
              "
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 查看详情面板 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="viewingOrder"
        class="fixed inset-0 z-50 flex"
        @click.self="closeOrderDetail"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeOrderDetail" />

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="viewingOrder"
            class="relative ml-auto h-full w-1/2 min-w-[480px] flex flex-col shadow-2xl"
            :class="isDark ? 'bg-[#11131c]' : 'bg-white'"
          >
            <!-- 头部 -->
            <div
              class="flex items-center justify-between px-8 py-6 border-b"
              :class="isDark ? 'border-white/5' : 'border-gray-100'"
            >
              <div>
                <p class="text-xs font-bold mb-1" :class="isDark ? 'text-gray-500' : 'text-gray-400'">订单编号</p>
                <p class="text-[13px] font-black font-mono" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  {{ viewingOrder.id }}
                </p>
              </div>
              <button
                @click="closeOrderDetail"
                class="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                :class="isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 状态标签 + 变更按钮 -->
            <div class="px-8 pt-8 pb-4 flex items-center gap-4">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-black tracking-wider"
                :class="getStatusStyles(viewingOrder.status, isDark)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current" />
                {{ getStatusLabel(viewingOrder.status) }}
              </div>

              <button
                v-if="viewingOrder.status !== 'Shipped'"
                @click="updateStatus('Shipped')"
                :disabled="isUpdatingStatus"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-black tracking-wider transition-all disabled:opacity-60"
                :class="isDark ? 'bg-[#1aa467]/15 text-[#34d399] hover:bg-[#1aa467]/25' : 'bg-[#e2f8ee] text-[#1aa467] hover:bg-[#c5f0dc]'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                标记为已发货
              </button>

              <button
                v-if="viewingOrder.status !== 'Cancelled'"
                @click="updateStatus('Cancelled')"
                :disabled="isUpdatingStatus"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-black tracking-wider transition-all disabled:opacity-60"
                :class="isDark ? 'bg-[#ef4444]/15 text-[#f87171] hover:bg-[#ef4444]/25' : 'bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca]'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                标记为已取消
              </button>

              <svg v-if="isUpdatingStatus" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin shrink-0" :class="isDark ? 'text-gray-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>

            <!-- 详情列表 -->
            <div class="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
              <div
                v-for="item in [
                  { label: '商品名称', value: viewingOrder.productName },
                  { label: '商品类型', value: viewingOrder.type },
                  { label: '订单数量', value: String(viewingOrder.quantity) + ' 件' },
                  { label: '下单时间', value: viewingOrder.orderTime },
                  { label: '订单金额', value: viewingOrder.price },
                ]"
                :key="item.label"
                class="flex flex-col gap-1.5 rounded-2xl p-5"
                :class="isDark ? 'bg-[#1a1d27]' : 'bg-gray-50'"
              >
                <p class="text-xs font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ item.label }}</p>
                <p class="text-[15px] font-black" :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ item.value }}</p>
              </div>
            </div>

            <!-- 底部操作 -->
            <div
              class="px-8 py-6 border-t"
              :class="isDark ? 'border-white/5' : 'border-gray-100'"
            >
              <button
                @click="openDeleteConfirm(viewingOrder.id); closeOrderDetail()"
                class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-colors text-red-500 hover:text-red-600"
                :class="isDark ? 'bg-red-500/10 hover:bg-red-500/15' : 'bg-red-50 hover:bg-red-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                删除此订单
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- 删除确认弹窗 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="deletingOrderId"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="closeDeleteConfirm"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDeleteConfirm" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="deletingOrderId"
            class="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            :class="isDark ? 'bg-[#1a1d27] ring-1 ring-white/10' : 'bg-white'"
          >
            <div
              class="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5"
              :class="isDark ? 'bg-red-500/10' : 'bg-red-50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 class="text-[17px] font-black text-center mb-2" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
              确认删除订单？
            </h3>
            <p class="text-[13px] text-center mb-8" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              此操作不可撤销，订单数据将被永久删除。
            </p>

            <div class="flex gap-3">
              <button
                @click="closeDeleteConfirm"
                :disabled="isDeleting"
                class="flex-1 py-3 rounded-2xl text-[13px] font-bold transition-colors"
                :class="isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                :disabled="isDeleting"
                class="flex-1 py-3 rounded-2xl text-[13px] font-bold text-white transition-colors bg-red-500 hover:bg-red-600 disabled:opacity-60"
              >
                {{ isDeleting ? '删除中…' : '确认删除' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>

<style scoped>
.orders-page * {
  transition-property: background-color, border-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.group-search-focus-within\:text-\[\#5b4eff\]:focus-within {
  color: #5b4eff;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.orders-dark .overflow-x-auto::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
