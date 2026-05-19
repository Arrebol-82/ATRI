<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import gsap from "gsap";

type MerchandiseProduct = {
  id: string;
  name: string;
  category: string;
  priceDisplay: string;
  imageDescription?: string | null;
  imageUrl: string;
  createdAt?: string | Date;
  stock?: number | null;
  sortOrder?: number | null;
};

type EditProductForm = {
  id: string;
  name: string;
  category: string;
  priceDisplay: string;
  imageDescription: string;
  imageUrl: string;
  stock: number;
  sortOrder: number;
};

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const isDark = useState("admin-dark-mode", () => false);
const searchQuery = ref("");
const productsPageRef = ref<HTMLElement | null>(null);
const isConfirmDialogOpen = ref(false);
const confirmTarget = ref<MerchandiseProduct | null>(null);
const isDeletingProduct = ref(false);
const deleteError = ref("");

const isEditModalOpen = ref(false);
const isSavingProduct = ref(false);
const editError = ref("");

const editFileInputRef = ref<HTMLInputElement | null>(null);
const editPreviewImgRef = ref<HTMLElement | null>(null);
const editProgressBarRef = ref<HTMLElement | null>(null);
const editProgressWrapRef = ref<HTMLElement | null>(null);
const editPreviewUrl = ref("");
const editUploadState = ref<"idle" | "uploading" | "done" | "error">("idle");
const editUploadErrorMsg = ref("");
const editShowManualUrl = ref(false);
const editIsDraggingOver = ref(false);

const isCreateModalOpen = ref(false);
const isCreatingProduct = ref(false);
const createError = ref("");
const isCategoryDropdownOpen = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null);
const previewImgRef = ref<HTMLElement | null>(null);
const progressBarRef = ref<HTMLElement | null>(null);
const progressWrapRef = ref<HTMLElement | null>(null);
const previewUrl = ref("");
const uploadState = ref<"idle" | "uploading" | "done" | "error">("idle");
const uploadErrorMsg = ref("");
const showManualUrl = ref(false);
const isDraggingOver = ref(false);
const createForm = ref({
  id: "",
  name: "",
  selectedCategory: "",
  isNewCategory: false,
  newCategoryName: "",
  priceDisplay: "",
  imageDescription: "",
  imageUrl: "",
  stock: 100,
  sortOrder: 0,
});

const {
  data: dbCategories,
  refresh: refreshCategories,
} = await useFetch<{ id: string; name: string; order: number }[]>(
  "/api/admin/categories",
  { default: () => [] },
);

function onCategorySelect(value: string) {
  if (value === "__new__") {
    createForm.value.isNewCategory = true;
    createForm.value.selectedCategory = "__new__";
    createForm.value.newCategoryName = "";
  } else {
    createForm.value.isNewCategory = false;
    createForm.value.selectedCategory = value;
  }
}

function triggerFileInput() {
  if (uploadState.value === "uploading") return;
  fileInputRef.value?.click();
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadFile(file);
  (e.target as HTMLInputElement).value = "";
}

function handleDrop(e: DragEvent) {
  isDraggingOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) uploadFile(file);
}

async function uploadFile(file: File) {
  uploadState.value = "uploading";
  uploadErrorMsg.value = "";

  if (previewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);

  await nextTick();

  if (previewImgRef.value) {
    gsap.fromTo(
      previewImgRef.value,
      { scale: 0.88, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
    );
  }

  if (progressWrapRef.value) {
    gsap.to(progressWrapRef.value, { opacity: 1, duration: 0.2 });
  }
  if (progressBarRef.value) {
    gsap.fromTo(
      progressBarRef.value,
      { width: "0%" },
      { width: "82%", duration: 2.4, ease: "power2.out" },
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await $fetch<{ url: string }>("/api/admin/upload/image", {
      method: "POST",
      body: formData,
    });

    createForm.value.imageUrl = result.url;

    if (progressBarRef.value) {
      gsap.killTweensOf(progressBarRef.value);
      gsap.to(progressBarRef.value, {
        width: "100%",
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          if (progressWrapRef.value) {
            gsap.to(progressWrapRef.value, { opacity: 0, delay: 0.55, duration: 0.35 });
          }
        },
      });
    }

    uploadState.value = "done";
  } catch (err: any) {
    uploadState.value = "error";
    uploadErrorMsg.value = err?.statusMessage || err?.data?.statusMessage || "上传失败，请重试";
    if (progressWrapRef.value) {
      gsap.killTweensOf(progressWrapRef.value);
      gsap.to(progressWrapRef.value, { opacity: 0, duration: 0.25 });
    }
  }
}

const editForm = ref<EditProductForm>({
  id: "",
  name: "",
  category: "",
  priceDisplay: "",
  imageDescription: "",
  imageUrl: "",
  stock: 0,
  sortOrder: 0,
});

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
  refresh: refreshProducts,
} = await useFetch<MerchandiseProduct[]>("/api/merchandise", {
  default: () => [],
});

const totalProducts = computed(() => products.value.length);

const totalStock = computed(() =>
  products.value.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0,
  ),
);

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

  Object.entries(categoryCounts.value).forEach(([category, count]) => {
    trends[category] = { count, type: "up" };
  });

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
  const selectedProduct = products.value.find((item) => item.id === product.id);
  if (!selectedProduct) {
    return;
  }

  if (action === "unlist") {
    openEditModal(selectedProduct);
    return;
  }

  deleteProduct(selectedProduct);
}

function openCreateModal() {
  createError.value = "";
  if (previewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  uploadState.value = "idle";
  uploadErrorMsg.value = "";
  showManualUrl.value = false;
  isDraggingOver.value = false;
  createForm.value = {
    id: "",
    name: "",
    selectedCategory: dbCategories.value[0]?.name ?? "",
    isNewCategory: false,
    newCategoryName: "",
    priceDisplay: "",
    imageDescription: "",
    imageUrl: "",
    stock: 100,
    sortOrder: 0,
  };
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
  createError.value = "";
  if (previewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  uploadState.value = "idle";
  uploadErrorMsg.value = "";
  showManualUrl.value = false;
}

async function saveNewProduct() {
  if (isCreatingProduct.value) return;
  createError.value = "";

  if (!createForm.value.imageUrl) {
    createError.value = "请上传商品图片或手动输入图片地址";
    return;
  }

  isCreatingProduct.value = true;

  try {
    let category = createForm.value.selectedCategory;

    if (createForm.value.isNewCategory) {
      const newName = createForm.value.newCategoryName.trim();
      if (!newName) {
        createError.value = "请输入新分类的名称";
        return;
      }
      const created = await $fetch<{ id: string; name: string }>("/api/admin/categories", {
        method: "POST",
        body: { name: newName },
      });
      await refreshCategories();
      category = created.name;
    }

    const productId = createForm.value.id.trim() || crypto.randomUUID();

    await $fetch("/api/admin/products", {
      method: "POST",
      body: {
        id: productId,
        name: createForm.value.name,
        category,
        priceDisplay: createForm.value.priceDisplay,
        imageDescription: createForm.value.imageDescription,
        imageUrl: createForm.value.imageUrl,
        stock: createForm.value.stock,
        sortOrder: createForm.value.sortOrder,
      },
    });

    await refreshProducts();
    closeCreateModal();
    animateProducts();
  } catch (error: any) {
    createError.value =
      error?.statusMessage || error?.data?.statusMessage || "商品创建失败";
  } finally {
    isCreatingProduct.value = false;
  }
}

function triggerEditFileInput() {
  if (editUploadState.value === "uploading") return;
  editFileInputRef.value?.click();
}

function handleEditFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadEditFile(file);
  (e.target as HTMLInputElement).value = "";
}

function handleEditDrop(e: DragEvent) {
  editIsDraggingOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) uploadEditFile(file);
}

async function uploadEditFile(file: File) {
  editUploadState.value = "uploading";
  editUploadErrorMsg.value = "";

  if (editPreviewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(editPreviewUrl.value);
  editPreviewUrl.value = URL.createObjectURL(file);

  await nextTick();

  if (editPreviewImgRef.value) {
    gsap.fromTo(
      editPreviewImgRef.value,
      { scale: 0.88, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
    );
  }

  if (editProgressWrapRef.value) {
    gsap.to(editProgressWrapRef.value, { opacity: 1, duration: 0.2 });
  }
  if (editProgressBarRef.value) {
    gsap.fromTo(
      editProgressBarRef.value,
      { width: "0%" },
      { width: "82%", duration: 2.4, ease: "power2.out" },
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await $fetch<{ url: string }>("/api/admin/upload/image", {
      method: "POST",
      body: formData,
    });

    editForm.value.imageUrl = result.url;

    if (editProgressBarRef.value) {
      gsap.killTweensOf(editProgressBarRef.value);
      gsap.to(editProgressBarRef.value, {
        width: "100%",
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          if (editProgressWrapRef.value) {
            gsap.to(editProgressWrapRef.value, { opacity: 0, delay: 0.55, duration: 0.35 });
          }
        },
      });
    }

    editUploadState.value = "done";
  } catch (err: any) {
    editUploadState.value = "error";
    editUploadErrorMsg.value = err?.statusMessage || err?.data?.statusMessage || "上传失败，请重试";
    if (editProgressWrapRef.value) {
      gsap.killTweensOf(editProgressWrapRef.value);
      gsap.to(editProgressWrapRef.value, { opacity: 0, duration: 0.25 });
    }
  }
}

function openEditModal(product: MerchandiseProduct) {
  editError.value = "";
  if (editPreviewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(editPreviewUrl.value);
  editPreviewUrl.value = product.imageUrl;
  editUploadState.value = "idle";
  editUploadErrorMsg.value = "";
  editShowManualUrl.value = false;
  editIsDraggingOver.value = false;
  editForm.value = {
    id: product.id,
    name: product.name,
    category: product.category,
    priceDisplay: product.priceDisplay,
    imageDescription: product.imageDescription ?? "",
    imageUrl: product.imageUrl,
    stock: Number(product.stock) || 0,
    sortOrder: Number(product.sortOrder) || 0,
  };
  isEditModalOpen.value = true;
}

function deleteProduct(product: MerchandiseProduct) {
  deleteError.value = "";
  confirmTarget.value = product;
  isConfirmDialogOpen.value = true;
}

function closeDeleteConfirm() {
  isConfirmDialogOpen.value = false;
  confirmTarget.value = null;
  deleteError.value = "";
}

async function confirmDeleteProduct() {
  if (!confirmTarget.value || isDeletingProduct.value) return;
  isDeletingProduct.value = true;
  deleteError.value = "";

  try {
    await $fetch(`/api/admin/products/${encodeURIComponent(confirmTarget.value.id)}`, {
      method: "DELETE",
    });
    closeDeleteConfirm();
    await refreshProducts();
    animateProducts();
  } catch (error: any) {
    deleteError.value = error?.statusMessage || error?.data?.statusMessage || "商品删除失败";
  } finally {
    isDeletingProduct.value = false;
  }
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editError.value = "";
  if (editPreviewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(editPreviewUrl.value);
  editPreviewUrl.value = "";
  editUploadState.value = "idle";
  editUploadErrorMsg.value = "";
  editShowManualUrl.value = false;
}

async function saveProductEdit() {
  if (isSavingProduct.value) {
    return;
  }

  editError.value = "";
  isSavingProduct.value = true;

  try {
    await $fetch<MerchandiseProduct>(
      `/api/admin/products/${encodeURIComponent(editForm.value.id)}`,
      {
        method: "PATCH",
        body: {
          name: editForm.value.name,
          category: editForm.value.category,
          priceDisplay: editForm.value.priceDisplay,
          imageDescription: editForm.value.imageDescription,
          imageUrl: editForm.value.imageUrl,
          stock: editForm.value.stock,
          sortOrder: editForm.value.sortOrder,
        },
      },
    );

    await refreshProducts();
    closeEditModal();
    animateProducts();
  } catch (error: any) {
    editError.value =
      error?.statusMessage || error?.data?.statusMessage || "商品更新失败";
  } finally {
    isSavingProduct.value = false;
  }
}

function animateProducts() {
  nextTick(() => {
    const els = productsPageRef.value?.querySelectorAll(".stagger-product");
    if (!els.length) return;

    gsap.killTweensOf(els);
    gsap.fromTo(
      els,
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

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".filter-dropdown")) {
    isFilterOpen.value = false;
  }
  if (!target.closest(".create-category-dropdown")) {
    isCategoryDropdownOpen.value = false;
  }
}

onMounted(() => {
  nextTick(() => {
    const cards = productsPageRef.value?.querySelectorAll(".stagger-card");
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
  });
  animateProducts();

  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  const animatedEls = productsPageRef.value?.querySelectorAll(
    ".stagger-product, .stagger-card",
  );
  if (animatedEls?.length) {
    gsap.killTweensOf(animatedEls);
    gsap.set(animatedEls, { clearProps: "opacity,transform" });
  }
});

watch(filteredProducts, () => {
  animateProducts();
});
</script>

<template>
  <div
    ref="productsPageRef"
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
            总库存
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                : 'bg-[#e2f8ee] text-[#1aa467] group-hover:bg-green-400/20 group-hover:text-green-300'
            "
          >
            ↑ {{ totalStock }}件
          </span>
        </div>
        <div class="mt-4 text-[34px] font-black tracking-tight">
          {{ totalStock }}
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
              {{ categoryTrends[category]?.count ?? 0 }}件
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="stagger-card tab-container relative">
      <div
        class="relative z-0 bg-[var(--bg-color)] rounded-[24px] p-6 transition-colors duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      >
        <div class="flex flex-wrap items-center gap-4 mb-8">
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

          <button
            class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5b4eff] text-[#5b4eff] transition-all hover:bg-[#5b4eff]/10"
            @click="resetSearch"
            title="重置搜索"
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

          <button
            class="flex items-center gap-2 rounded-full bg-[#5b4eff] px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(91,78,255,0.25)] transition-all hover:bg-[#4d42db] active:scale-95"
            @click="openCreateModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增商品
          </button>

          <p
            class="ml-auto text-[13px] font-bold"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            <span v-if="selectedCategoryCount !== null">
              <span :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{
                selectedCategory
              }}</span>
              分类下共有
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
          <span class="text-4xl block mb-2 opacity-50">📥</span>
          没有找到匹配的商品
        </div>

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

            <div
              class="flex items-center gap-2 text-[11px] font-black tracking-[0.06em] text-[#5b4eff]"
            >
              <span class="h-2 w-2 rotate-45 rounded-[2px] bg-[#5b4eff]" />
              <span>{{ product.category }}</span>
            </div>

            <h3
              class="mt-3 line-clamp-2 min-h-[44px] text-[15px] font-black leading-snug"
              :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              :title="product.name"
            >
              {{ product.name }}
            </h3>

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

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5 py-8 backdrop-blur-sm"
        @click.self="closeEditModal"
      >
        <form
          class="w-full max-w-[760px] overflow-hidden rounded-[28px] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1"
          :class="
            isDark
              ? 'bg-[#11131c] text-gray-100 ring-white/10'
              : 'bg-white text-gray-900 ring-gray-100'
          "
          @submit.prevent="saveProductEdit"
        >
          <div class="flex items-start justify-between gap-5">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-[#5b4eff]">
                Edit Product
              </p>
              <h2 class="mt-2 text-2xl font-black">修改商品</h2>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              :class="
                isDark
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              "
              @click="closeEditModal"
            >
              ×
            </button>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2 text-sm font-black">
              商品名称
              <input
                v-model="editForm.name"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                required
              >
            </label>

            <label class="flex flex-col gap-2 text-sm font-black">
              商品类型
              <input
                v-model="editForm.category"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                required
              >
            </label>

            <label class="flex flex-col gap-2 text-sm font-black">
              价格
              <input
                v-model="editForm.priceDisplay"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                required
              >
            </label>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex flex-col gap-2 text-sm font-black">
                库存
                <input
                  v-model.number="editForm.stock"
                  min="0"
                  type="number"
                  class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                  :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                >
              </label>

              <label class="flex flex-col gap-2 text-sm font-black">
                排序
                <input
                  v-model.number="editForm.sortOrder"
                  min="0"
                  type="number"
                  class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                  :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                >
              </label>
            </div>

            <div class="md:col-span-2 flex flex-col gap-3 text-sm font-black">
              图片

              <!-- 上传区域 -->
              <div
                class="relative overflow-hidden rounded-2xl ring-1 transition-all duration-200 min-h-[160px] flex items-center justify-center"
                :class="[
                  editUploadState === 'uploading' ? 'cursor-wait' : 'cursor-pointer',
                  editIsDraggingOver
                    ? 'ring-2 ring-[#5b4eff] scale-[1.01]'
                    : editUploadState === 'error'
                      ? isDark ? 'ring-red-500/30 bg-[#1a1d27]' : 'ring-red-300 bg-red-50/30'
                      : isDark
                        ? 'ring-white/10 bg-[#1a1d27] hover:ring-[#5b4eff]/40'
                        : 'ring-gray-200 bg-gray-50 hover:ring-[#5b4eff]/50',
                ]"
                @click="triggerEditFileInput"
                @dragover.prevent="editIsDraggingOver = true"
                @dragleave.prevent="editIsDraggingOver = false"
                @drop.prevent="handleEditDrop"
              >
                <!-- 预览图（现有图或新上传） -->
                <img
                  v-if="editPreviewUrl"
                  ref="editPreviewImgRef"
                  :src="editPreviewUrl"
                  class="w-full object-contain max-h-[200px] p-3"
                  alt="预览"
                />

                <!-- 上传中蒙层 -->
                <div
                  v-if="editUploadState === 'uploading'"
                  class="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[3px]"
                >
                  <svg class="h-7 w-7 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>

                <!-- 空状态占位 -->
                <div v-if="!editPreviewUrl" class="flex flex-col items-center gap-3 py-8 select-none">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors"
                    :class="editIsDraggingOver ? 'bg-[#5b4eff]/20' : 'bg-[#5b4eff]/10'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6 text-[#5b4eff]">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div class="text-center">
                    <p class="font-black" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
                      {{ editIsDraggingOver ? '松开鼠标上传' : '点击或拖拽图片到此处' }}
                    </p>
                    <p class="mt-1 text-[12px] font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                      支持 JPG · PNG · WebP · GIF · AVIF
                    </p>
                  </div>
                </div>

                <!-- 替换图片蒙层 -->
                <div
                  v-if="editPreviewUrl && editUploadState !== 'uploading'"
                  class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/30"
                >
                  <span class="rounded-xl bg-white/15 px-4 py-2 text-[13px] font-black text-white backdrop-blur-sm">
                    {{ editUploadState === 'done' ? '重新上传' : '替换图片' }}
                  </span>
                </div>

                <input ref="editFileInputRef" type="file" class="hidden" accept="image/*" @change="handleEditFileChange" />
              </div>

              <!-- 进度条 -->
              <div
                ref="editProgressWrapRef"
                class="h-1.5 overflow-hidden rounded-full"
                :class="isDark ? 'bg-white/10' : 'bg-gray-100'"
                style="opacity: 0"
              >
                <div
                  ref="editProgressBarRef"
                  class="h-full rounded-full bg-gradient-to-r from-[#5b4eff] to-[#7c6fff]"
                  style="width: 0%"
                />
              </div>

              <!-- 状态文字 -->
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <p v-if="editUploadState === 'done'" class="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 flex-shrink-0">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                  </svg>
                  新图片上传成功，保存后生效
                </p>
                <p v-else-if="editUploadState === 'error'" class="text-[12px] font-bold text-red-500">
                  ✕ {{ editUploadErrorMsg }}
                </p>
              </Transition>

              <!-- 手动输入折叠区 -->
              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1 text-[12px] font-bold transition-colors w-fit"
                  :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                  @click="editShowManualUrl = !editShowManualUrl"
                >
                  <svg
                    class="h-3 w-3 transition-transform duration-200"
                    :class="editShowManualUrl ? 'rotate-90' : ''"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  或手动输入图片地址
                </button>
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="-translate-y-1 opacity-0"
                  enter-to-class="translate-y-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <input
                    v-if="editShowManualUrl"
                    v-model="editForm.imageUrl"
                    class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                    :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                    placeholder="https://..."
                  >
                </Transition>
              </div>
            </div>

            <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
              图片描述
              <textarea
                v-model="editForm.imageDescription"
                rows="3"
                class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
              />
            </label>
          </div>

          <p v-if="editError" class="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-500">
            {{ editError }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-2xl px-6 py-3 text-sm font-black transition-colors"
              :class="isDark ? 'bg-white/5 text-gray-200 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="closeEditModal"
            >
              取消
            </button>
            <button
              type="submit"
              class="rounded-2xl bg-[#5b4eff] px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(91,78,255,0.28)] transition-all hover:bg-[#4d42db] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSavingProduct"
            >
              {{ isSavingProduct ? "保存中..." : "保存修改" }}
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5 py-8 backdrop-blur-sm"
        @click.self="closeCreateModal"
      >
        <form
          class="w-full max-w-[760px] overflow-hidden rounded-[28px] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1"
          :class="
            isDark
              ? 'bg-[#11131c] text-gray-100 ring-white/10'
              : 'bg-white text-gray-900 ring-gray-100'
          "
          @submit.prevent="saveNewProduct"
        >
          <div class="flex items-start justify-between gap-5">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-[#5b4eff]">
                New Product
              </p>
              <h2 class="mt-2 text-2xl font-black">新增商品</h2>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              :class="
                isDark
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              "
              @click="closeCreateModal"
            >
              ×
            </button>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2 text-sm font-black">
              <span class="flex items-center gap-2">
                商品 ID
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'"
                >
                  选填，留空自动生成
                </span>
              </span>
              <input
                v-model="createForm.id"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                placeholder="留空则自动生成 UUID"
              >
            </label>

            <label class="flex flex-col gap-2 text-sm font-black">
              商品名称
              <input
                v-model="createForm.name"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                required
              >
            </label>

            <div class="flex flex-col gap-2 text-sm font-black">
              分类
              <div class="relative create-category-dropdown">
                <button
                  type="button"
                  class="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold outline-none ring-1 transition-all"
                  :class="[
                    isCategoryDropdownOpen ? 'ring-2 ring-[#5b4eff]' : '',
                    isDark ? 'bg-[#1a1d27] ring-white/10 text-gray-100' : 'bg-gray-50 ring-gray-200 text-gray-900',
                  ]"
                  @click.stop="isCategoryDropdownOpen = !isCategoryDropdownOpen"
                >
                  <span class="flex items-center gap-2.5">
                    <span
                      class="h-2 w-2 rotate-45 rounded-[2px] flex-shrink-0"
                      :class="createForm.isNewCategory ? 'bg-[#5b4eff]/50' : 'bg-[#5b4eff]'"
                    />
                    <span :class="isDark ? 'text-gray-100' : 'text-gray-800'">
                      {{ createForm.isNewCategory ? '＋ 新增分类' : (createForm.selectedCategory || '请选择分类') }}
                    </span>
                  </span>
                  <svg
                    class="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                    :class="[
                      isCategoryDropdownOpen ? 'rotate-180' : '',
                      isDark ? 'text-gray-400' : 'text-gray-400',
                    ]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="-translate-y-2 opacity-0"
                  enter-to-class="translate-y-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="translate-y-0 opacity-100"
                  leave-to-class="-translate-y-2 opacity-0"
                >
                  <div
                    v-if="isCategoryDropdownOpen"
                    class="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl shadow-xl ring-1"
                    :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-white ring-gray-100'"
                  >
                    <button
                      v-for="cat in dbCategories"
                      :key="cat.id"
                      type="button"
                      class="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-bold transition-colors"
                      :class="
                        createForm.selectedCategory === cat.name && !createForm.isNewCategory
                          ? 'bg-[#5b4eff]/10 text-[#5b4eff]'
                          : isDark
                            ? 'text-gray-300 hover:bg-white/5'
                            : 'text-gray-700 hover:bg-gray-50'
                      "
                      @click.stop="onCategorySelect(cat.name); isCategoryDropdownOpen = false"
                    >
                      <span
                        class="h-2 w-2 rotate-45 rounded-[2px] flex-shrink-0 transition-colors"
                        :class="
                          createForm.selectedCategory === cat.name && !createForm.isNewCategory
                            ? 'bg-[#5b4eff]'
                            : isDark ? 'bg-gray-600' : 'bg-gray-300'
                        "
                      />
                      {{ cat.name }}
                      <span
                        v-if="createForm.selectedCategory === cat.name && !createForm.isNewCategory"
                        class="ml-auto text-[11px] font-black text-[#5b4eff]"
                      >✓</span>
                    </button>

                    <div
                      class="mx-4 border-t"
                      :class="isDark ? 'border-white/10' : 'border-gray-100'"
                    />

                    <button
                      type="button"
                      class="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-bold transition-colors"
                      :class="
                        createForm.isNewCategory
                          ? 'bg-[#5b4eff]/10 text-[#5b4eff]'
                          : isDark
                            ? 'text-[#5b4eff] hover:bg-[#5b4eff]/10'
                            : 'text-[#5b4eff] hover:bg-[#5b4eff]/5'
                      "
                      @click.stop="onCategorySelect('__new__'); isCategoryDropdownOpen = false"
                    >
                      <span class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#5b4eff]/15 text-[10px] font-black text-[#5b4eff]">＋</span>
                      新增分类
                      <span
                        v-if="createForm.isNewCategory"
                        class="ml-auto text-[11px] font-black text-[#5b4eff]"
                      >✓</span>
                    </button>
                  </div>
                </Transition>
              </div>

              <input
                v-if="createForm.isNewCategory"
                v-model="createForm.newCategoryName"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                placeholder="输入新分类名称，将同步写入数据库"
                required
              >
            </div>

            <label class="flex flex-col gap-2 text-sm font-black">
              价格显示
              <input
                v-model="createForm.priceDisplay"
                class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                placeholder="如 ¥99.00"
                required
              >
            </label>

            <div class="grid grid-cols-2 gap-4">
              <label class="flex flex-col gap-2 text-sm font-black">
                库存
                <input
                  v-model.number="createForm.stock"
                  min="0"
                  type="number"
                  class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                  :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                >
              </label>

              <label class="flex flex-col gap-2 text-sm font-black">
                排序值
                <input
                  v-model.number="createForm.sortOrder"
                  min="0"
                  type="number"
                  class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                  :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                >
              </label>
            </div>

            <div class="md:col-span-2 flex flex-col gap-3 text-sm font-black">
              图片

              <!-- 上传区域 -->
              <div
                class="relative overflow-hidden rounded-2xl ring-1 transition-all duration-200 min-h-[160px] flex items-center justify-center"
                :class="[
                  uploadState === 'uploading' ? 'cursor-wait' : 'cursor-pointer',
                  isDraggingOver
                    ? 'ring-2 ring-[#5b4eff] scale-[1.01]'
                    : uploadState === 'error'
                      ? isDark ? 'ring-red-500/30 bg-[#1a1d27]' : 'ring-red-300 bg-red-50/30'
                      : isDark
                        ? 'ring-white/10 bg-[#1a1d27] hover:ring-[#5b4eff]/40'
                        : 'ring-gray-200 bg-gray-50 hover:ring-[#5b4eff]/50',
                ]"
                @click="triggerFileInput"
                @dragover.prevent="isDraggingOver = true"
                @dragleave.prevent="isDraggingOver = false"
                @drop.prevent="handleDrop"
              >
                <!-- 预览图 -->
                <img
                  v-if="previewUrl"
                  ref="previewImgRef"
                  :src="previewUrl"
                  class="w-full object-contain max-h-[200px] p-3"
                  alt="预览"
                />

                <!-- 上传中蒙层 -->
                <div
                  v-if="uploadState === 'uploading'"
                  class="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[3px]"
                >
                  <svg class="h-7 w-7 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>

                <!-- 空状态占位 -->
                <div v-if="!previewUrl" class="flex flex-col items-center gap-3 py-8 select-none">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors"
                    :class="isDraggingOver ? 'bg-[#5b4eff]/20' : 'bg-[#5b4eff]/10'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6 text-[#5b4eff]">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div class="text-center">
                    <p class="font-black" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
                      {{ isDraggingOver ? '松开鼠标上传' : '点击或拖拽图片到此处' }}
                    </p>
                    <p class="mt-1 text-[12px] font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                      支持 JPG · PNG · WebP · GIF · AVIF
                    </p>
                  </div>
                </div>

                <!-- 重新选择蒙层（有预览且非上传中） -->
                <div
                  v-if="previewUrl && uploadState !== 'uploading'"
                  class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/30"
                >
                  <span class="rounded-xl bg-white/15 px-4 py-2 text-[13px] font-black text-white backdrop-blur-sm">重新选择</span>
                </div>

                <input ref="fileInputRef" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
              </div>

              <!-- 进度条 (GSAP 控制 opacity，初始透明) -->
              <div
                ref="progressWrapRef"
                class="h-1.5 overflow-hidden rounded-full"
                :class="isDark ? 'bg-white/10' : 'bg-gray-100'"
                style="opacity: 0"
              >
                <div
                  ref="progressBarRef"
                  class="h-full rounded-full bg-gradient-to-r from-[#5b4eff] to-[#7c6fff]"
                  style="width: 0%"
                />
              </div>

              <!-- 状态文字 -->
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <p v-if="uploadState === 'done'" class="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 flex-shrink-0">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                  </svg>
                  图片上传成功
                </p>
                <p v-else-if="uploadState === 'error'" class="text-[12px] font-bold text-red-500">
                  ✕ {{ uploadErrorMsg }}
                </p>
              </Transition>

              <!-- 手动输入折叠区 -->
              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1 text-[12px] font-bold transition-colors w-fit"
                  :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                  @click="showManualUrl = !showManualUrl"
                >
                  <svg
                    class="h-3 w-3 transition-transform duration-200"
                    :class="showManualUrl ? 'rotate-90' : ''"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  或手动输入图片地址
                </button>
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="-translate-y-1 opacity-0"
                  enter-to-class="translate-y-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <input
                    v-if="showManualUrl"
                    v-model="createForm.imageUrl"
                    class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                    :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                    placeholder="https://..."
                  >
                </Transition>
              </div>
            </div>

            <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
              图片描述
              <textarea
                v-model="createForm.imageDescription"
                rows="3"
                class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
              />
            </label>
          </div>

          <p v-if="createError" class="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-500">
            {{ createError }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-2xl px-6 py-3 text-sm font-black transition-colors"
              :class="isDark ? 'bg-white/5 text-gray-200 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="closeCreateModal"
            >
              取消
            </button>
            <button
              type="submit"
              class="rounded-2xl bg-[#5b4eff] px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(91,78,255,0.28)] transition-all hover:bg-[#4d42db] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isCreatingProduct"
            >
              {{ isCreatingProduct ? "创建中..." : "创建商品" }}
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- 自定义下架确认弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isConfirmDialogOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
        @click.self="closeDeleteConfirm"
      >
        <Transition
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          appear
        >
          <div
            class="w-full max-w-[420px] rounded-[28px] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ring-1"
            :class="isDark ? 'bg-[#11131c] text-gray-100 ring-white/10' : 'bg-white text-gray-900 ring-gray-100'"
          >
            <!-- 图标 + 标题 -->
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 text-red-500">
                  <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-[17px] font-black">确认下架商品</h3>
                <p class="mt-1.5 text-[13px] font-bold leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                  即将下架并删除
                  <span class="font-black" :class="isDark ? 'text-gray-100' : 'text-gray-900'">「{{ confirmTarget?.name }}」</span>，
                  此操作不可撤销。
                </p>
              </div>
            </div>

            <!-- 错误提示 -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
            >
              <p v-if="deleteError" class="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-[13px] font-black text-red-500">
                {{ deleteError }}
              </p>
            </Transition>

            <!-- 操作按钮 -->
            <div class="mt-5 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-2xl px-6 py-2.5 text-[13px] font-black transition-colors"
                :class="isDark ? 'bg-white/5 text-gray-200 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                :disabled="isDeletingProduct"
                @click="closeDeleteConfirm"
              >
                取消
              </button>
              <button
                type="button"
                class="rounded-2xl bg-red-500 px-6 py-2.5 text-[13px] font-black text-white shadow-[0_4px_14px_rgba(239,68,68,0.30)] transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                :disabled="isDeletingProduct"
                @click="confirmDeleteProduct"
              >
                {{ isDeletingProduct ? '删除中...' : '确认下架' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.products-page * {
  transition-property: background-color, border-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.group-search-focus-within\:text-\[\#5b4eff\]:focus-within {
  color: #5b4eff;
}

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
