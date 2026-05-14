<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";
import { gsap } from "gsap";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const isDark = useState("admin-dark-mode", () => false);
const { data: dashboardData } = await useFetch("/api/admin/dashboard", {
  default: () => ({
    metrics: {
      revenue: 0,
      visits: 0,
      orders: 0,
      returns: 0,
    },
    popularProducts: [],
    salesProducts: [],
    slowProducts: [],
    categoryStats: [],
  }),
});

const numberFormatter = new Intl.NumberFormat("ja-JP");
const dashboardMetrics = computed(() => dashboardData.value?.metrics ?? {});
const dashboardMetricDisplay = computed(() => ({
  revenue: `¥${numberFormatter.format(Number(dashboardMetrics.value.revenue) || 0)}`,
  visits: numberFormatter.format(Number(dashboardMetrics.value.visits) || 0),
  orders: numberFormatter.format(Number(dashboardMetrics.value.orders) || 0),
  returns: numberFormatter.format(Number(dashboardMetrics.value.returns) || 0),
}));

const categoryColors = ["#ff8c00", "#0088fe", "#00c49f", "#ffbb28"];
const categoryDistribution = computed(() => {
  const categoryStats = dashboardData.value?.categoryStats ?? [];

  return categoryStats.slice(0, 4).map((item: any, index: number) => ({
    category: item.category,
    count: Number(item.count) || 0,
    percentage: Number(item.percentage) || 0,
    color: categoryColors[index] ?? "#5b4eff",
  }));
});
const categoryChartData = computed(() =>
  categoryDistribution.value.map((item) => ({
    value: item.percentage,
    name: item.category,
    itemStyle: { color: item.color },
  }))
);
const productSalesChartData = computed(() => {
  const salesProducts = dashboardData.value?.salesProducts ?? [];

  return salesProducts.map((product: any) => ({
    name: product.name,
    soldQuantity: Number(product.soldQuantity) || 0,
  }));
});

let barChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

function updateBarChartData() {
  barChart?.setOption({
    xAxis: {
      data: Array.from({ length: 12 }, (_, index) => String(index + 1)),
    },
    series: [
      {
        data: productSalesChartData.value
          .slice(0, 12)
          .map((item) => item.soldQuantity),
      },
    ],
  });
}

function updateChartsTheme(nextIsDark: boolean) {
  const labelColor = nextIsDark ? "#a7b0c2" : "#9ca3af";

  barChart?.setOption({
    xAxis: {
      axisLabel: { color: labelColor },
    },
    yAxis: {
      axisLabel: { color: labelColor },
    },
  });
}

function toggleTheme() {
  const nextIsDark = !isDark.value;
  isDark.value = nextIsDark;
  updateChartsTheme(nextIsDark);
}

const legacyInventoryData = [
  { name: "角色立牌", percent: 85, color: "bg-[#5b4eff]" },
  { name: "主题徽章", percent: 60, color: "bg-[#5b4eff]" },
  { name: "纪念挂件", percent: 20, color: "bg-[#5b4eff]" },
  { name: "设定画册", percent: 45, color: "bg-[#5b4eff]" },
];

const inventoryData = computed(() => {
  const popularProducts = dashboardData.value?.popularProducts ?? [];
  const maxStock = Math.max(
    ...popularProducts.map((product: any) => Number(product.stock) || 0),
    1
  );

  return popularProducts.map((product: any) => {
    const stock = Number(product.stock) || 0;

    return {
      name: product.name,
      stock,
      percent: Math.max(4, Math.round((stock / maxStock) * 100)),
      color: stock <= 10 ? "bg-[#ef4444]" : "bg-[#5b4eff]",
    };
  });
});

const legacyBestSelling = [
  { name: "ATRI 亚克力立牌", percent: 85 },
  { name: "蓝色记忆徽章组", percent: 60 },
  { name: "主题透明卡", percent: 20 },
];

const bestSelling = computed(() => {
  const popularProducts = dashboardData.value?.popularProducts ?? [];
  const topProducts = popularProducts.slice(0, 3);
  const maxSoldQuantity = Math.max(
    ...topProducts.map((product: any) => Number(product.soldQuantity) || 0),
    1
  );

  return topProducts.map((product: any) => {
    const soldQuantity = Number(product.soldQuantity) || 0;

    return {
      name: product.name,
      soldQuantity,
      percent: Math.max(4, Math.round((soldQuantity / maxSoldQuantity) * 100)),
    };
  });
});

const worstSelling = [
  { name: "限定钥匙扣", percent: 15 },
  { name: "场景明信片", percent: 10 },
  { name: "收藏贴纸包", percent: 5 },
];

const slowSelling = computed(() => {
  const slowProducts = dashboardData.value?.slowProducts ?? [];
  const maxSoldQuantity = Math.max(
    ...slowProducts.map((product: any) => Number(product.soldQuantity) || 0),
    1
  );

  return slowProducts.map((product: any) => {
    const soldQuantity = Number(product.soldQuantity) || 0;

    return {
      name: product.name,
      soldQuantity,
      percent: Math.max(4, Math.round((soldQuantity / maxSoldQuantity) * 100)),
    };
  });
});

onMounted(() => {
  gsap.from(".stagger-card", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  });

  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value);
    barChart.setOption({
      grid: { left: "10%", right: "0%", bottom: "10%", top: "10%" },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter(params: any) {
          const current = Array.isArray(params) ? params[0] : params;
          const product = productSalesChartData.value[current?.dataIndex ?? 0];
          const name = product?.name ?? current?.axisValue ?? "";
          const value = product?.soldQuantity ?? current?.value ?? 0;

          return `${name}<br/>销量：${value}`;
        },
      },
      xAxis: {
        type: "category",
        data: Array.from({ length: 12 }, (_, index) => String(index + 1)),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#9ca3af", margin: 16 },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        splitLine: { show: false },
        axisLabel: { color: "#9ca3af" },
      },
      series: [
        {
          data: productSalesChartData.value
            .slice(0, 12)
            .map((item) => item.soldQuantity),
          type: "bar",
          barWidth: "55%",
          itemStyle: {
            color: "#5b4eff",
            borderRadius: [20, 20, 20, 20],
          },
        },
      ],
    });
  }

  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      series: [
        {
          type: "pie",
          radius: ["65%", "95%"],
          center: ["50%", "80%"],
          startAngle: 180,
          endAngle: 0,
          label: { show: false },
          data: [
            { value: 30, name: "周边", itemStyle: { color: "#ff8c00" } },
            { value: 20, name: "服饰", itemStyle: { color: "#0088fe" } },
            { value: 18, name: "收藏", itemStyle: { color: "#00c49f" } },
            { value: 20, name: "画册", itemStyle: { color: "#ffbb28" } },
            { value: 12, name: "其他", itemStyle: { color: "#ff8042" } },
          ],
        },
      ],
    });
    pieChart.setOption({
      series: [
        {
          data: categoryChartData.value,
        },
      ],
    });
  }

  window.addEventListener("resize", handleResize);
});

const handleResize = () => {
  barChart?.resize();
  pieChart?.resize();
};

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  barChart?.dispose();
  pieChart?.dispose();
});

watch(productSalesChartData, updateBarChartData);
</script>

<template>
  <div
    class="dashboard-page min-h-full p-8 text-gray-800 transition-colors duration-500"
    :class="
      isDark ? 'dashboard-dark bg-transparent text-gray-100' : 'bg-transparent'
    "
  >
    <AdminHeader
      title="Hello, Alpenglow! 👋"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="flex flex-col gap-6 lg:col-span-5">
        <div class="grid grid-cols-2 gap-4">
          <div
            class="stagger-card group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white p-6 text-gray-800 shadow-sm transition-all duration-300 hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30"
          >
            <div class="flex items-center justify-between">
              <span
                class="metric-title text-sm font-bold text-gray-500 transition-colors duration-300 group-hover:text-white/90"
                >销售额</span
              >
            </div>
            <div class="mt-4 text-[32px] font-bold">
              {{ dashboardMetricDisplay.revenue }}
            </div>
            <div class="mt-4">
              <span
                class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600 transition-colors duration-300 group-hover:bg-green-400/20 group-hover:text-green-300 group-hover:backdrop-blur-sm"
                >↑ 2.67%</span
              >
            </div>
          </div>

          <div
            class="stagger-card group flex flex-col justify-between rounded-[24px] bg-white p-6 text-gray-800 shadow-sm transition-all duration-300 hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30"
          >
            <div
              class="metric-title text-sm font-bold text-gray-500 transition-colors duration-300 group-hover:text-white/90"
            >
              访问量
            </div>
            <div class="mt-4 text-[32px] font-bold">
              {{ dashboardMetricDisplay.visits }}
            </div>
            <div class="mt-4">
              <span
                class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600 transition-colors duration-300 group-hover:bg-green-400/20 group-hover:text-green-300 group-hover:backdrop-blur-sm"
                >↑ 2.67%</span
              >
            </div>
          </div>

          <div
            class="stagger-card group flex flex-col justify-between rounded-[24px] bg-white p-6 text-gray-800 shadow-sm transition-all duration-300 hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30"
          >
            <div
              class="metric-title text-sm font-bold text-gray-500 transition-colors duration-300 group-hover:text-white/90"
            >
              订单数
            </div>
            <div class="mt-4 text-[32px] font-bold">
              {{ dashboardMetricDisplay.orders }}
            </div>
            <div class="mt-4">
              <span
                class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600 transition-colors duration-300 group-hover:bg-green-400/20 group-hover:text-green-300 group-hover:backdrop-blur-sm"
                >↑ 1.67%</span
              >
            </div>
          </div>

          <div
            class="stagger-card group flex flex-col justify-between rounded-[24px] bg-white p-6 text-gray-800 shadow-sm transition-all duration-300 hover:bg-[#5b4eff] hover:text-white hover:shadow-lg hover:shadow-[#5b4eff]/30"
          >
            <div
              class="metric-title text-sm font-bold text-gray-500 transition-colors duration-300 group-hover:text-white/90"
            >
              退货数
            </div>
            <div class="mt-4 text-[32px] font-bold">
              {{ dashboardMetricDisplay.returns }}
            </div>
            <div class="mt-4">
              <span
                class="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-500 transition-colors duration-300 group-hover:bg-red-400/20 group-hover:text-red-200 group-hover:backdrop-blur-sm"
                >↓ 2.67%</span
              >
            </div>
          </div>
        </div>

        <div class="stagger-card rounded-[24px] bg-white p-6 shadow-sm">
          <h2 class="mb-5 text-lg font-bold">库存概览</h2>
          <div class="grid grid-cols-2 gap-x-8 gap-y-5">
            <div
              v-for="item in inventoryData"
              :key="item.name"
              class="flex flex-col gap-2"
            >
              <div
                class="flex justify-between text-sm font-medium text-gray-600"
              >
                <span class="min-w-0 truncate">{{ item.name }}</span>
                <span class="font-bold text-gray-800">{{ item.stock }} 件</span>
              </div>
              <div
                class="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="item.color"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="stagger-card rounded-[24px] bg-white p-6 shadow-sm">
          <h2 class="mb-2 text-lg font-bold">品类分布</h2>
          <div class="flex items-center h-32">
            <div ref="pieChartRef" class="h-full w-1/2"></div>
            <div
              class="grid w-1/2 grid-cols-2 gap-y-3 text-xs font-medium text-gray-600 [&>div:nth-of-type(n+9)]:hidden"
            >
              <template
                v-for="item in categoryDistribution"
                :key="item.category"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div
                    class="h-2 w-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: item.color }"
                  ></div>
                  <span class="min-w-0 truncate">{{ item.category }}</span>
                </div>
                <div class="font-bold text-gray-800">
                  {{ item.percentage }}%
                </div>
              </template>
              <div class="hidden items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-[#ff8c00]"></div>
                周边
              </div>
              <div class="hidden font-bold text-gray-800">20%</div>
              <div class="hidden items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-[#0088fe]"></div>
                服饰
              </div>
              <div class="hidden font-bold text-gray-800">20%</div>
              <div class="hidden items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-[#00c49f]"></div>
                收藏
              </div>
              <div class="hidden font-bold text-gray-800">18%</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 lg:col-span-7">
        <div class="stagger-card flex-1 rounded-[24px] bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-bold">月度销售趋势</h2>
          <div ref="barChartRef" class="h-[340px] w-full"></div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="stagger-card rounded-[24px] bg-white p-6 shadow-sm">
            <h2 class="mb-6 text-lg font-bold">热销商品</h2>
            <div class="flex flex-col gap-5">
              <div
                v-for="item in bestSelling"
                :key="item.name"
                class="flex flex-col gap-2"
              >
                <div
                  class="flex justify-between text-sm font-medium text-gray-600"
                >
                  <span class="min-w-0 truncate">{{ item.name }}</span>
                  <span class="font-bold text-gray-800"
                    >{{ item.soldQuantity }} 件</span
                  >
                </div>
                <div
                  class="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
                >
                  <div
                    class="h-full rounded-full bg-[#5b4eff] transition-all duration-1000 ease-out"
                    :style="{ width: `${item.percent}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="stagger-card rounded-[24px] bg-white p-6 shadow-sm">
            <h2 class="mb-6 text-lg font-bold">滞销商品</h2>
            <div class="flex flex-col gap-5">
              <div
                v-for="item in slowSelling"
                :key="item.name"
                class="flex flex-col gap-2"
              >
                <div
                  class="flex justify-between text-sm font-medium text-gray-600"
                >
                  <span class="min-w-0 truncate">{{ item.name }}</span>
                  <span class="font-bold text-gray-800"
                    >{{ item.soldQuantity }} 件</span
                  >
                </div>
                <div
                  class="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
                >
                  <div
                    class="h-full rounded-full bg-[#ef4444] opacity-70 transition-all duration-1000 ease-out"
                    :style="{ width: `${item.percent}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page :deep(.bg-white),
.dashboard-page :deep(.bg-gray-100),
.dashboard-page :deep(.text-gray-500),
.dashboard-page :deep(.text-gray-600),
.dashboard-page :deep(.text-gray-800) {
  transition:
    background-color 0.5s ease,
    color 0.5s ease,
    box-shadow 0.5s ease;
}

.dashboard-dark :deep(.bg-white) {
  background-color: #11131c !important;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.34) !important;
}

.dashboard-dark :deep(.bg-gray-100) {
  background-color: #242837 !important;
}

.dashboard-dark :deep(.text-gray-500),
.dashboard-dark :deep(.text-gray-600) {
  color: #a7b0c2 !important;
}

.dashboard-dark :deep(.text-gray-800) {
  color: #f3f6fb !important;
}

.dashboard-dark :deep(h2) {
  color: #f8fafc;
}

.dashboard-dark :deep(.metric-title) {
  color: #f8fafc !important;
}
</style>
