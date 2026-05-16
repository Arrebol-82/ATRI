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

type NewsItem = {
  id: string;
  date: string;
  title: string;
  imageUrl: string;
  body: string[];
  eventDate: string | null;
  eventPlace: string | null;
  eventContent: string | null;
  notes: string[];
  sortOrder: number;
  createdAt?: string | Date;
};

type NewsForm = {
  title: string;
  date: string;
  imageUrl: string;
  bodyText: string;
  eventDate: string;
  eventPlace: string;
  eventContent: string;
  notesText: string;
  sortOrder: number;
};

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const isDark = useState("admin-dark-mode", () => false);
const newsPageRef = ref<HTMLElement | null>(null);
const searchQuery = ref("");

// ── 数据获取与统计 ─────────────────────────────────────────────────────────────

const {
  data: newsList,
  pending,
  error,
  refresh: refreshNews,
} = await useFetch<NewsItem[]>("/api/admin/news", { default: () => [] });

const filteredNews = computed(() => {
  const kw = searchQuery.value.trim().toLowerCase();
  if (!kw) return newsList.value;
  return newsList.value.filter(
    (n) =>
      n.title.toLowerCase().includes(kw) || n.date.toLowerCase().includes(kw),
  );
});

// 计算统计指标
const totalNews = computed(() => newsList.value.length);
const latestDate = computed(() => newsList.value[0]?.date ?? "暂无");
const totalEvents = computed(
  () => newsList.value.filter((n) => !!n.eventDate).length,
);

// 新增的第 4 个卡片数据：模拟本周新增数据
const newThisWeek = computed(() => {
  return 3;
});

// ── 新增弹窗相关引用与逻辑 ────────────────────────────────────────────────────────

const createFileInputRef = ref<HTMLInputElement | null>(null);
const createPreviewImgRef = ref<HTMLElement | null>(null);
const createProgressBarRef = ref<HTMLElement | null>(null);
const createProgressWrapRef = ref<HTMLElement | null>(null);
const createPreviewUrl = ref("");
const createUploadState = ref<"idle" | "uploading" | "done" | "error">("idle");
const createUploadErrorMsg = ref("");
const createShowManualUrl = ref(false);
const createIsDraggingOver = ref(false);

function triggerCreateFileInput() {
  if (createUploadState.value === "uploading") return;
  createFileInputRef.value?.click();
}

function handleCreateFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadCreateFile(file);
  (e.target as HTMLInputElement).value = "";
}

function handleCreateDrop(e: DragEvent) {
  createIsDraggingOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) uploadCreateFile(file);
}

async function uploadCreateFile(file: File) {
  createUploadState.value = "uploading";
  createUploadErrorMsg.value = "";

  if (createPreviewUrl.value?.startsWith("blob:"))
    URL.revokeObjectURL(createPreviewUrl.value);
  createPreviewUrl.value = URL.createObjectURL(file);

  await nextTick();

  if (createPreviewImgRef.value) {
    gsap.fromTo(
      createPreviewImgRef.value,
      { scale: 0.88, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
    );
  }
  if (createProgressWrapRef.value)
    gsap.to(createProgressWrapRef.value, { opacity: 1, duration: 0.2 });
  if (createProgressBarRef.value) {
    gsap.fromTo(
      createProgressBarRef.value,
      { width: "0%" },
      { width: "82%", duration: 2.4, ease: "power2.out" },
    );
  }

  const fd = new FormData();
  fd.append("file", file);

  try {
    const result = await $fetch<{ url: string }>("/api/admin/upload/image", {
      method: "POST",
      body: fd,
    });
    createForm.value.imageUrl = result.url;

    if (createProgressBarRef.value) {
      gsap.killTweensOf(createProgressBarRef.value);
      gsap.to(createProgressBarRef.value, {
        width: "100%",
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          if (createProgressWrapRef.value)
            gsap.to(createProgressWrapRef.value, {
              opacity: 0,
              delay: 0.55,
              duration: 0.35,
            });
        },
      });
    }
    createUploadState.value = "done";
  } catch (err: any) {
    createUploadState.value = "error";
    createUploadErrorMsg.value =
      err?.statusMessage || err?.data?.statusMessage || "上传失败，请重试";
    if (createProgressWrapRef.value) {
      gsap.killTweensOf(createProgressWrapRef.value);
      gsap.to(createProgressWrapRef.value, { opacity: 0, duration: 0.25 });
    }
  }
}

// ── 编辑弹窗相关引用与逻辑 ──────────────────────────────────────────────────────────

const editFileInputRef = ref<HTMLInputElement | null>(null);
const editPreviewImgRef = ref<HTMLElement | null>(null);
const editProgressBarRef = ref<HTMLElement | null>(null);
const editProgressWrapRef = ref<HTMLElement | null>(null);
const editPreviewUrl = ref("");
const editUploadState = ref<"idle" | "uploading" | "done" | "error">("idle");
const editUploadErrorMsg = ref("");
const editShowManualUrl = ref(false);
const editIsDraggingOver = ref(false);

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

  if (editPreviewUrl.value?.startsWith("blob:"))
    URL.revokeObjectURL(editPreviewUrl.value);
  editPreviewUrl.value = URL.createObjectURL(file);

  await nextTick();

  if (editPreviewImgRef.value) {
    gsap.fromTo(
      editPreviewImgRef.value,
      { scale: 0.88, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
    );
  }
  if (editProgressWrapRef.value)
    gsap.to(editProgressWrapRef.value, { opacity: 1, duration: 0.2 });
  if (editProgressBarRef.value) {
    gsap.fromTo(
      editProgressBarRef.value,
      { width: "0%" },
      { width: "82%", duration: 2.4, ease: "power2.out" },
    );
  }

  const fd = new FormData();
  fd.append("file", file);

  try {
    const result = await $fetch<{ url: string }>("/api/admin/upload/image", {
      method: "POST",
      body: fd,
    });
    editForm.value.imageUrl = result.url;

    if (editProgressBarRef.value) {
      gsap.killTweensOf(editProgressBarRef.value);
      gsap.to(editProgressBarRef.value, {
        width: "100%",
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          if (editProgressWrapRef.value)
            gsap.to(editProgressWrapRef.value, {
              opacity: 0,
              delay: 0.55,
              duration: 0.35,
            });
        },
      });
    }
    editUploadState.value = "done";
  } catch (err: any) {
    editUploadState.value = "error";
    editUploadErrorMsg.value =
      err?.statusMessage || err?.data?.statusMessage || "上传失败，请重试";
    if (editProgressWrapRef.value) {
      gsap.killTweensOf(editProgressWrapRef.value);
      gsap.to(editProgressWrapRef.value, { opacity: 0, duration: 0.25 });
    }
  }
}

// ── 辅助函数 ───────────────────────────────────────────────────────────────────

function textToArray(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function resetCreateUpload() {
  if (createPreviewUrl.value?.startsWith("blob:"))
    URL.revokeObjectURL(createPreviewUrl.value);
  createPreviewUrl.value = "";
  createUploadState.value = "idle";
  createUploadErrorMsg.value = "";
  createShowManualUrl.value = false;
  createIsDraggingOver.value = false;
}

function resetEditUpload() {
  if (editPreviewUrl.value?.startsWith("blob:"))
    URL.revokeObjectURL(editPreviewUrl.value);
  editPreviewUrl.value = "";
  editUploadState.value = "idle";
  editUploadErrorMsg.value = "";
  editShowManualUrl.value = false;
  editIsDraggingOver.value = false;
}

// ── 创建弹窗逻辑 ──────────────────────────────────────────────────────────────

const isCreateModalOpen = ref(false);
const isCreatingNews = ref(false);
const createError = ref("");
const createForm = ref<NewsForm>({
  title: "",
  date: "",
  imageUrl: "",
  bodyText: "",
  eventDate: "",
  eventPlace: "",
  eventContent: "",
  notesText: "",
  sortOrder: 0,
});

function openCreateModal() {
  createError.value = "";
  resetCreateUpload();
  createForm.value = {
    title: "",
    date: "",
    imageUrl: "",
    bodyText: "",
    eventDate: "",
    eventPlace: "",
    eventContent: "",
    notesText: "",
    sortOrder: newsList.value.length + 1,
  };
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
  createError.value = "";
  resetCreateUpload();
}

async function saveNewNews() {
  if (isCreatingNews.value) return;
  createError.value = "";

  if (!createForm.value.imageUrl) {
    createError.value = "请上传封面图或手动输入图片地址";
    return;
  }

  isCreatingNews.value = true;
  try {
    await $fetch("/api/admin/news", {
      method: "POST",
      body: {
        title: createForm.value.title,
        date: createForm.value.date,
        imageUrl: createForm.value.imageUrl,
        body: textToArray(createForm.value.bodyText),
        eventDate: createForm.value.eventDate || null,
        eventPlace: createForm.value.eventPlace || null,
        eventContent: createForm.value.eventContent || null,
        notes: textToArray(createForm.value.notesText),
        sortOrder: createForm.value.sortOrder,
      },
    });
    await refreshNews();
    closeCreateModal();
    animateRows();
  } catch (err: any) {
    createError.value =
      err?.statusMessage || err?.data?.statusMessage || "创建失败";
  } finally {
    isCreatingNews.value = false;
  }
}

// ── 编辑弹窗逻辑 ────────────────────────────────────────────────────────────────

const isEditModalOpen = ref(false);
const isSavingNews = ref(false);
const editError = ref("");
const editId = ref("");
const editForm = ref<NewsForm>({
  title: "",
  date: "",
  imageUrl: "",
  bodyText: "",
  eventDate: "",
  eventPlace: "",
  eventContent: "",
  notesText: "",
  sortOrder: 0,
});

function openEditModal(item: NewsItem) {
  editError.value = "";
  editId.value = item.id;
  resetEditUpload();
  editPreviewUrl.value = item.imageUrl;
  editForm.value = {
    title: item.title,
    date: item.date,
    imageUrl: item.imageUrl,
    bodyText: item.body.join("\n"),
    eventDate: item.eventDate ?? "",
    eventPlace: item.eventPlace ?? "",
    eventContent: item.eventContent ?? "",
    notesText: item.notes.join("\n"),
    sortOrder: item.sortOrder,
  };
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editError.value = "";
  resetEditUpload();
}

async function saveNewsEdit() {
  if (isSavingNews.value) return;
  editError.value = "";

  if (!editForm.value.imageUrl) {
    editError.value = "图片地址不能为空";
    return;
  }

  isSavingNews.value = true;
  try {
    await $fetch(`/api/admin/news/${encodeURIComponent(editId.value)}`, {
      method: "PATCH",
      body: {
        title: editForm.value.title,
        date: editForm.value.date,
        imageUrl: editForm.value.imageUrl,
        body: textToArray(editForm.value.bodyText),
        eventDate: editForm.value.eventDate || null,
        eventPlace: editForm.value.eventPlace || null,
        eventContent: editForm.value.eventContent || null,
        notes: textToArray(editForm.value.notesText),
        sortOrder: editForm.value.sortOrder,
      },
    });
    await refreshNews();
    closeEditModal();
    animateRows();
  } catch (err: any) {
    editError.value =
      err?.statusMessage || err?.data?.statusMessage || "保存失败";
  } finally {
    isSavingNews.value = false;
  }
}

// ── 删除确认逻辑 ────────────────────────────────────────────────────────────

const isConfirmDialogOpen = ref(false);
const confirmTarget = ref<NewsItem | null>(null);
const isDeletingNews = ref(false);
const deleteError = ref("");

function openDeleteConfirm(item: NewsItem) {
  deleteError.value = "";
  confirmTarget.value = item;
  isConfirmDialogOpen.value = true;
}

function closeDeleteConfirm() {
  isConfirmDialogOpen.value = false;
  confirmTarget.value = null;
  deleteError.value = "";
}

async function confirmDeleteNews() {
  if (!confirmTarget.value || isDeletingNews.value) return;
  isDeletingNews.value = true;
  deleteError.value = "";
  try {
    await $fetch(
      `/api/admin/news/${encodeURIComponent(confirmTarget.value.id)}`,
      { method: "DELETE" },
    );
    closeDeleteConfirm();
    await refreshNews();
    animateRows();
  } catch (err: any) {
    deleteError.value =
      err?.statusMessage || err?.data?.statusMessage || "删除失败";
  } finally {
    isDeletingNews.value = false;
  }
}

// 锁定底层页面滚动
watch(
  [isCreateModalOpen, isEditModalOpen, isConfirmDialogOpen],
  ([create, edit, del]) => {
    if (import.meta.client) {
      const lock = create || edit || del ? "hidden" : "";
      document.documentElement.style.overflow = lock;
      document.body.style.overflow = lock;
    }
  },
);

function toggleTheme() {
  isDark.value = !isDark.value;
}

// ── 动画逻辑 ────────────────────────────────────────────────────────────────

function animateRows() {
  nextTick(() => {
    const els = newsPageRef.value?.querySelectorAll(".table-row");
    if (!els?.length) return;
    gsap.killTweensOf(els);
    gsap.from(els, {
      x: -15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      delay: 0.3,
      ease: "power2.out",
    });
  });
}

onMounted(() => {
  nextTick(() => {
    const cards = newsPageRef.value?.querySelectorAll(".stagger-card");
    if (cards?.length) {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }
  });
  animateRows();
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }
  const els = newsPageRef.value?.querySelectorAll(".table-row, .stagger-card");
  if (els?.length) {
    gsap.killTweensOf(els);
    gsap.set(els, { clearProps: "opacity,transform" });
  }
});
</script>

<template>
  <div
    ref="newsPageRef"
    class="news-page min-h-full px-8 py-8 pb-0 flex flex-col transition-colors duration-500"
    :class="
      isDark ? 'bg-transparent text-gray-100' : 'bg-[#f2f4f8] text-gray-900'
    "
  >
    <AdminHeader
      title="新闻管理"
      :is-dark="isDark"
      @toggle-theme="toggleTheme"
    />

    <!-- 顶部数据看板：调整为 4 列布局 -->
    <div
      class="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10"
    >
      <!-- 统计卡片 1：新闻总量 -->
      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:bg-[#5b4eff] hover:shadow-lg hover:shadow-[#5b4eff]/30"
        :class="
          isDark
            ? 'bg-[#11131c] ring-1 ring-white/5 hover:text-white'
            : 'bg-white ring-1 ring-gray-100/50 hover:text-white'
        "
      >
        <div class="flex items-start justify-between">
          <span
            class="text-[15px] font-bold transition-colors duration-300 group-hover:text-white/90"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >新闻总数量</span
          >
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                : 'bg-green-100 text-green-600 group-hover:bg-green-400/20 group-hover:text-green-300'
            "
          >
            ↑ 2
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
          {{ totalNews }}
        </div>
      </div>

      <!-- 统计卡片 2：最新发布 -->
      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:bg-[#5b4eff] hover:shadow-lg hover:shadow-[#5b4eff]/30"
        :class="
          isDark
            ? 'bg-[#11131c] ring-1 ring-white/5 hover:text-white'
            : 'bg-white ring-1 ring-gray-100/50 hover:text-white'
        "
      >
        <div class="flex items-start justify-between">
          <span
            class="text-[15px] font-bold transition-colors duration-300 group-hover:text-white/90"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >最新的新闻</span
          >
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#5b4eff]/15 text-[#5b4eff] group-hover:bg-white/20 group-hover:text-white'
                : 'bg-[#5b4eff]/10 text-[#5b4eff] group-hover:bg-white/20 group-hover:text-white'
            "
          >
            今天
          </span>
        </div>
        <div
          class="mt-4 text-[28px] font-black tracking-tight"
          :class="
            isDark
              ? 'text-gray-100 group-hover:text-white'
              : 'text-gray-900 group-hover:text-white'
          "
        >
          {{ latestDate }}
        </div>
      </div>

      <!-- 统计卡片 3：包含活动 -->
      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:bg-[#5b4eff] hover:shadow-lg hover:shadow-[#5b4eff]/30"
        :class="
          isDark
            ? 'bg-[#11131c] ring-1 ring-white/5 hover:text-white'
            : 'bg-white ring-1 ring-gray-100/50 hover:text-white'
        "
      >
        <div class="flex items-start justify-between">
          <span
            class="text-[15px] font-bold transition-colors duration-300 group-hover:text-white/90"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >活动性新闻</span
          >
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#f59e0b]/15 text-[#fbbf24] group-hover:bg-yellow-400/20 group-hover:text-yellow-300'
                : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-400/20 group-hover:text-yellow-300'
            "
          >
            ↑ 2
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
          {{ totalEvents }}
        </div>
      </div>

      <!-- 统计卡片 4：本周新增 -->
      <div
        class="stagger-card group relative flex flex-col justify-between rounded-[24px] p-6 min-h-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:bg-[#5b4eff] hover:shadow-lg hover:shadow-[#5b4eff]/30"
        :class="
          isDark
            ? 'bg-[#11131c] ring-1 ring-white/5 hover:text-white'
            : 'bg-white ring-1 ring-gray-100/50 hover:text-white'
        "
      >
        <div class="flex items-start justify-between">
          <span
            class="text-[15px] font-bold transition-colors duration-300 group-hover:text-white/90"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >本周新增</span
          >
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide transition-colors duration-300"
            :class="
              isDark
                ? 'bg-[#1aa467]/15 text-[#34d399] group-hover:bg-green-400/20 group-hover:text-green-300'
                : 'bg-green-100 text-green-600 group-hover:bg-green-400/20 group-hover:text-green-300'
            "
          >
            ↑ 1
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
          {{ newThisWeek }}
        </div>
      </div>
    </div>

    <!-- 主体区域：SVG 异形背景 -->
    <div
      class="relative mt-2.5 filter drop-shadow-[0_8px_40px_rgba(0,0,0,0.04)] flex-1"
    >
      <svg
        class="absolute inset-0 w-full"
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
        <!-- 操作栏 -->
        <div class="flex flex-wrap items-center gap-4 mb-[44px]">
          <!-- 搜索框 -->
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
              placeholder="搜索新闻标题或日期"
              class="w-full border-0 ring-1 shadow-sm rounded-full py-[17px] pl-11 pr-4 text-[13px] font-bold placeholder:font-medium focus:ring-2 focus:ring-[#5b4eff] outline-none transition-all"
              :class="
                isDark
                  ? 'bg-[#1a1d27] ring-white/10 text-gray-100 placeholder:text-gray-500 focus:bg-[#11131c]'
                  : 'bg-white ring-gray-200/80 text-gray-900 placeholder:text-gray-400 focus:bg-white'
              "
            />
          </div>

          <!-- 检索数量 -->
          <p
            class="ml-4 text-[13px] font-bold"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            检索到
            <span class="text-[#5b4eff] font-black">{{
              filteredNews.length
            }}</span>
            篇文章
          </p>

          <!-- 新增按钮：文案更新并向上偏移30px -->
          <button
            class="ml-auto flex items-center gap-2 rounded-full bg-[#5b4eff] px-6 py-[17px] text-[13px] font-black text-white shadow-[0_4px_14px_rgba(91,78,255,0.25)] transition-all hover:bg-[#4d42db] active:scale-95 -translate-y-[30px] relative z-20"
            @click="openCreateModal"
          >
            + 添加新闻
          </button>
        </div>

        <!-- 状态与表格容器 -->
        <div
          class="overflow-hidden -mx-6 px-6 pt-6 transition-colors duration-500 min-h-[400px]"
          :style="{
            clipPath: 'inset(0 0 0 0 round 48px 12px 12px 48px)',
            backgroundColor: isDark ? '#1a1d27' : '#ffffff',
          }"
        >
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            正在连接数据库...
          </div>
          <div
            v-else-if="error"
            class="py-20 text-center text-sm font-bold text-red-500"
          >
            新闻数据加载失败
          </div>
          <div
            v-else-if="!filteredNews.length"
            class="py-20 text-center text-sm font-bold"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            <span class="text-4xl block mb-2 opacity-50">📰</span>
            没有找到匹配的新闻
          </div>

          <!-- 表格内容 -->
          <div v-else class="overflow-x-auto pb-8">
            <table
              class="w-full text-left border-collapse whitespace-nowrap min-w-[720px]"
            >
              <thead>
                <tr
                  class="text-[13px] font-extrabold border-b-[1.5px]"
                  :class="
                    isDark
                      ? 'text-gray-200 border-white/5'
                      : 'text-gray-900 border-gray-100/80'
                  "
                >
                  <th class="pb-4 text-center font-black w-[10%]">排序</th>
                  <th class="pb-4 text-center font-black w-[15%]">封面</th>
                  <th class="pb-4 text-center font-black w-[40%]">标题</th>
                  <th class="pb-4 text-center font-black w-[15%]">日期</th>
                  <th class="pb-4 text-center font-black w-[20%]">操作</th>
                </tr>
              </thead>
              <tbody class="text-[13px] font-bold">
                <tr
                  v-for="item in filteredNews"
                  :key="item.id"
                  class="table-row border-b last:border-none transition-all duration-300"
                  :class="
                    isDark
                      ? 'border-white/5 hover:bg-[#242837]'
                      : 'border-gray-50 hover:bg-[#f2f4f8]/50'
                  "
                >
                  <td class="py-4 pl-4 w-[10%]">
                    <span
                      class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-black"
                      :class="
                        isDark
                          ? 'bg-white/5 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      "
                    >
                      {{ item.sortOrder }}
                    </span>
                  </td>
                  <td class="py-4 w-[15%]">
                    <!-- 图片容器放大了10px：从 h-[46px] w-[68px] 变为 h-[56px] w-[78px] -->
                    <div
                      class="mx-auto h-[56px] w-[78px] overflow-hidden rounded-[10px]"
                      :class="isDark ? 'bg-[#11131c]' : 'bg-gray-100'"
                    >
                      <img
                        :src="item.imageUrl"
                        :alt="item.title"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td
                    class="py-4 w-[40%] pr-4"
                    :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                  >
                    <p class="truncate max-w-[300px] block" :title="item.title">
                      {{ item.title }}
                    </p>
                  </td>
                  <td
                    class="py-4 text-center w-[15%]"
                    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >
                    {{ item.date }}
                  </td>
                  <td class="py-4 text-right w-[20%] pr-6">
                    <div class="flex items-center justify-center gap-3">
                      <button
                        class="flex items-center gap-1.5 transition-colors text-[12px] px-3 py-1.5 rounded-lg border"
                        :class="
                          isDark
                            ? 'text-gray-300 border-white/10 hover:bg-white/5 hover:text-[#715df2]'
                            : 'text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-[#5b4eff]'
                        "
                        @click="openEditModal(item)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        修改
                      </button>
                      <button
                        class="flex items-center gap-1.5 transition-colors text-[12px] px-3 py-1.5 rounded-lg border"
                        :class="
                          isDark
                            ? 'text-gray-300 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                            : 'text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                        "
                        @click="openDeleteConfirm(item)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5"
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
        </div>
      </div>
    </div>

    <!-- ── 全局弹窗：传送至 body 层级 ── -->
    <ClientOnly>
      <Teleport to="body">
        <!-- ── 新增弹窗 ── -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isCreateModalOpen"
            class="fixed inset-0 z-[100]"
            role="dialog"
            aria-modal="true"
          >
            <div
              class="fixed inset-0 bg-black/40 backdrop-blur-sm"
              @click="closeCreateModal"
            ></div>
            <div class="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
              <form
                class="flex flex-col w-full max-w-[760px] h-full rounded-[28px] shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1 overflow-hidden"
                :class="isDark ? 'bg-[#11131c] text-gray-100 ring-white/10' : 'bg-white text-gray-900 ring-gray-100'"
                @submit.prevent="saveNewNews"
              >
                <!-- 固定头部 -->
                <div
                  class="flex-none flex items-center justify-between px-6 py-5 border-b"
                  :class="isDark ? 'border-white/5' : 'border-gray-100'"
                >
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-[#5b4eff]">New Article</p>
                    <h2 class="mt-1 text-xl font-black">新增新闻</h2>
                  </div>
                  <button
                    type="button"
                    class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    :class="isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                    @click="closeCreateModal"
                  >×</button>
                </div>
                <!-- 可滚动内容区（无滚动条） -->
                <div class="flex-1 min-h-0 overflow-y-auto modal-scroll px-6 py-5">
                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="flex flex-col gap-2 text-sm font-black"
                      >标题
                      <input
                        v-model="createForm.title"
                        required
                        class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                        :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                        placeholder="新闻标题"
                      />
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <label class="flex flex-col gap-2 text-sm font-black"
                        >日期
                        <input
                          v-model="createForm.date"
                          required
                          class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                          :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                          placeholder="2026.03.19"
                        />
                      </label>
                      <label class="flex flex-col gap-2 text-sm font-black"
                        >排序值
                        <input
                          v-model.number="createForm.sortOrder"
                          type="number"
                          min="0"
                          class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                          :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                        />
                      </label>
                    </div>
                    <!-- 封面图上传区 -->
                    <div class="md:col-span-2 flex flex-col gap-3 text-sm font-black">
                      封面图
                      <div
                        class="relative overflow-hidden rounded-2xl ring-1 transition-all duration-200 min-h-[100px] flex items-center justify-center"
                        :class="[
                          createUploadState === 'uploading' ? 'cursor-wait' : 'cursor-pointer',
                          createIsDraggingOver
                            ? 'ring-2 ring-[#5b4eff] scale-[1.01]'
                            : createUploadState === 'error'
                              ? isDark ? 'ring-red-500/30 bg-[#1a1d27]' : 'ring-red-300 bg-red-50/30'
                              : isDark ? 'ring-white/10 bg-[#1a1d27] hover:ring-[#5b4eff]/40' : 'ring-gray-200 bg-gray-50 hover:ring-[#5b4eff]/50',
                        ]"
                        @click="triggerCreateFileInput"
                        @dragover.prevent="createIsDraggingOver = true"
                        @dragleave.prevent="createIsDraggingOver = false"
                        @drop.prevent="handleCreateDrop"
                      >
                        <img
                          v-if="createPreviewUrl"
                          ref="createPreviewImgRef"
                          :src="createPreviewUrl"
                          class="w-full object-contain max-h-[140px] p-3"
                          alt="预览"
                        />
                        <div
                          v-if="createUploadState === 'uploading'"
                          class="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[3px]"
                        >
                          <svg class="h-7 w-7 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                        <div v-if="!createPreviewUrl" class="flex flex-col items-center gap-2 py-6 select-none">
                          <div
                            class="flex h-10 w-10 items-center justify-center rounded-2xl"
                            :class="createIsDraggingOver ? 'bg-[#5b4eff]/20' : 'bg-[#5b4eff]/10'"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 text-[#5b4eff]">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                          </div>
                          <p class="font-black text-[13px]" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
                            {{ createIsDraggingOver ? "松开鼠标上传" : "点击或拖拽图片到此处" }}
                          </p>
                          <p class="text-[11px] font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">支持 JPG · PNG · WebP · GIF</p>
                        </div>
                        <div
                          v-if="createPreviewUrl && createUploadState !== 'uploading'"
                          class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30"
                        >
                          <span class="rounded-xl bg-white/15 px-4 py-2 text-[13px] font-black text-white backdrop-blur-sm">重新上传</span>
                        </div>
                        <input ref="createFileInputRef" type="file" class="hidden" accept="image/*" @change="handleCreateFileChange" />
                      </div>
                      <div ref="createProgressWrapRef" class="h-1.5 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-gray-100'" style="opacity: 0">
                        <div ref="createProgressBarRef" class="h-full rounded-full bg-gradient-to-r from-[#5b4eff] to-[#7c6fff]" style="width: 0%" />
                      </div>
                      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                        <p v-if="createUploadState === 'done'" class="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                          </svg>
                          图片上传成功
                        </p>
                        <p v-else-if="createUploadState === 'error'" class="text-[12px] font-bold text-red-500">✕ {{ createUploadErrorMsg }}</p>
                      </Transition>
                      <div class="flex flex-col gap-2">
                        <button
                          type="button"
                          class="flex items-center gap-1 text-[12px] font-bold transition-colors w-fit"
                          :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                          @click="createShowManualUrl = !createShowManualUrl"
                        >
                          <svg class="h-3 w-3 transition-transform duration-200" :class="createShowManualUrl ? 'rotate-90' : ''" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          或手动输入图片地址
                        </button>
                        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                          <input
                            v-if="createShowManualUrl"
                            v-model="createForm.imageUrl"
                            class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                            :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                            placeholder="https://..."
                          />
                        </Transition>
                      </div>
                    </div>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
                      <span class="flex items-center gap-2">正文段落
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'">每行一段</span>
                      </span>
                      <textarea
                        v-model="createForm.bodyText"
                        rows="3"
                        class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                        :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                        placeholder="第一段内容&#10;第二段内容"
                      />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-black">イベント日程
                      <input v-model="createForm.eventDate" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" placeholder="2026年8月16日（日）" />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-black">イベント会場
                      <input v-model="createForm.eventPlace" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" placeholder="アクアシティホール" />
                    </label>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">イベント内容
                      <input v-model="createForm.eventContent" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" placeholder="キャストトーク、展示..." />
                    </label>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
                      <span class="flex items-center gap-2">注意事项
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full" :class="isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'">每行一条</span>
                      </span>
                      <textarea
                        v-model="createForm.notesText"
                        rows="2"
                        class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                        :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                        placeholder="注意事项1&#10;注意事项2"
                      />
                    </label>
                  </div>
                </div>
                <!-- 固定底部 -->
                <div class="flex-none px-6 py-4 border-t" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                  <p v-if="createError" class="mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-500">{{ createError }}</p>
                  <div class="flex justify-end gap-3">
                    <button
                      type="button"
                      class="rounded-2xl px-6 py-3 text-sm font-black transition-colors"
                      :class="isDark ? 'bg-white/5 text-gray-200 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      @click="closeCreateModal"
                    >取消</button>
                    <button
                      type="submit"
                      class="rounded-2xl bg-[#5b4eff] px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(91,78,255,0.28)] transition-all hover:bg-[#4d42db] disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="isCreatingNews"
                    >{{ isCreatingNews ? "创建中..." : "创建新闻" }}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Transition>

        <!-- ── 编辑弹窗 ── -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isEditModalOpen"
            class="fixed inset-0 z-[100]"
            role="dialog"
            aria-modal="true"
          >
            <div
              class="fixed inset-0 bg-black/40 backdrop-blur-sm"
              @click="closeEditModal"
            ></div>
            <div class="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
              <form
                class="flex flex-col w-full max-w-[760px] h-full rounded-[28px] shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1 overflow-hidden"
                :class="isDark ? 'bg-[#11131c] text-gray-100 ring-white/10' : 'bg-white text-gray-900 ring-gray-100'"
                @submit.prevent="saveNewsEdit"
              >
                <!-- 固定头部 -->
                <div
                  class="flex-none flex items-center justify-between px-6 py-5 border-b"
                  :class="isDark ? 'border-white/5' : 'border-gray-100'"
                >
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-[#5b4eff]">Edit Article</p>
                    <h2 class="mt-1 text-xl font-black">修改新闻</h2>
                  </div>
                  <button
                    type="button"
                    class="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    :class="isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                    @click="closeEditModal"
                  >×</button>
                </div>
                <!-- 可滚动内容区（无滚动条） -->
                <div class="flex-1 min-h-0 overflow-y-auto modal-scroll px-6 py-5">
                  <div class="grid gap-4 md:grid-cols-2">
                    <label class="flex flex-col gap-2 text-sm font-black">标题
                      <input
                        v-model="editForm.title"
                        required
                        class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]"
                        :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'"
                      />
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <label class="flex flex-col gap-2 text-sm font-black">日期
                        <input v-model="editForm.date" required class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                      </label>
                      <label class="flex flex-col gap-2 text-sm font-black">排序值
                        <input v-model.number="editForm.sortOrder" type="number" min="0" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                      </label>
                    </div>
                    <!-- 封面图上传区 -->
                    <div class="md:col-span-2 flex flex-col gap-3 text-sm font-black">
                      封面图
                      <div
                        class="relative overflow-hidden rounded-2xl ring-1 transition-all duration-200 min-h-[100px] flex items-center justify-center"
                        :class="[
                          editUploadState === 'uploading' ? 'cursor-wait' : 'cursor-pointer',
                          editIsDraggingOver
                            ? 'ring-2 ring-[#5b4eff] scale-[1.01]'
                            : editUploadState === 'error'
                              ? isDark ? 'ring-red-500/30 bg-[#1a1d27]' : 'ring-red-300 bg-red-50/30'
                              : isDark ? 'ring-white/10 bg-[#1a1d27] hover:ring-[#5b4eff]/40' : 'ring-gray-200 bg-gray-50 hover:ring-[#5b4eff]/50',
                        ]"
                        @click="triggerEditFileInput"
                        @dragover.prevent="editIsDraggingOver = true"
                        @dragleave.prevent="editIsDraggingOver = false"
                        @drop.prevent="handleEditDrop"
                      >
                        <img v-if="editPreviewUrl" ref="editPreviewImgRef" :src="editPreviewUrl" class="w-full object-contain max-h-[140px] p-3" alt="预览" />
                        <div v-if="editUploadState === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[3px]">
                          <svg class="h-7 w-7 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                        <div v-if="!editPreviewUrl" class="flex flex-col items-center gap-2 py-6 select-none">
                          <p class="font-black text-[13px]" :class="isDark ? 'text-gray-200' : 'text-gray-700'">点击或拖拽图片到此处</p>
                        </div>
                        <input ref="editFileInputRef" type="file" class="hidden" accept="image/*" @change="handleEditFileChange" />
                      </div>
                      <div class="flex flex-col gap-2">
                        <button
                          type="button"
                          class="flex items-center gap-1 text-[12px] font-bold transition-colors w-fit"
                          :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                          @click="editShowManualUrl = !editShowManualUrl"
                        >
                          <svg class="h-3 w-3 transition-transform duration-200" :class="editShowManualUrl ? 'rotate-90' : ''" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          手动输入图片地址
                        </button>
                        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                          <input v-if="editShowManualUrl" v-model="editForm.imageUrl" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                        </Transition>
                      </div>
                    </div>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
                      <span class="flex items-center gap-2">正文段落</span>
                      <textarea v-model="editForm.bodyText" rows="3" class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-black">イベント日程
                      <input v-model="editForm.eventDate" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                    </label>
                    <label class="flex flex-col gap-2 text-sm font-black">イベント会場
                      <input v-model="editForm.eventPlace" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                    </label>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">イベント内容
                      <input v-model="editForm.eventContent" class="rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                    </label>
                    <label class="md:col-span-2 flex flex-col gap-2 text-sm font-black">
                      <span class="flex items-center gap-2">注意事项</span>
                      <textarea v-model="editForm.notesText" rows="2" class="resize-none rounded-2xl border-0 px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-2 focus:ring-[#5b4eff]" :class="isDark ? 'bg-[#1a1d27] ring-white/10' : 'bg-gray-50 ring-gray-200'" />
                    </label>
                  </div>
                </div>
                <!-- 固定底部 -->
                <div class="flex-none px-6 py-4 border-t" :class="isDark ? 'border-white/5' : 'border-gray-100'">
                  <p v-if="editError" class="mb-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-500">{{ editError }}</p>
                  <div class="flex justify-end gap-3">
                    <button
                      type="button"
                      class="rounded-2xl px-6 py-3 text-sm font-black transition-colors"
                      :class="isDark ? 'bg-white/5 text-gray-200 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      @click="closeEditModal"
                    >取消</button>
                    <button
                      type="submit"
                      class="rounded-2xl bg-[#5b4eff] px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(91,78,255,0.28)] transition-all hover:bg-[#4d42db] disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="isSavingNews"
                    >{{ isSavingNews ? "保存中..." : "保存修改" }}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Transition>

        <!-- ── 删除确认弹窗 ── -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isConfirmDialogOpen"
            class="fixed inset-0 z-[100]"
            role="dialog"
            aria-modal="true"
          >
            <div
              class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              @click="closeDeleteConfirm"
            ></div>

            <div class="fixed inset-0 z-10 overflow-y-auto overscroll-contain">
              <div
                class="flex min-h-full items-center justify-center p-4 text-center sm:p-6"
                @click.self="closeDeleteConfirm"
              >
                <Transition
                  enter-active-class="transition duration-250 ease-out"
                  enter-from-class="scale-95 opacity-0"
                  enter-to-class="scale-100 opacity-100"
                  appear
                >
                  <div
                    class="relative w-full max-w-[420px] rounded-[28px] p-6 text-left shadow-[0_24px_80px_rgba(15,23,42,0.28)] ring-1"
                    :class="
                      isDark
                        ? 'bg-[#11131c] text-gray-100 ring-white/10'
                        : 'bg-white text-gray-900 ring-gray-100'
                    "
                  >
                    <div class="flex items-start gap-4">
                      <div
                        class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="h-5 w-5 text-red-500"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-[17px] font-black">确认删除</h3>
                        <p
                          class="mt-1.5 text-[13px] font-bold leading-relaxed"
                          :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                        >
                          即将永久删除
                          <span
                            class="font-black"
                            :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                            >「{{ confirmTarget?.title }}」</span
                          >，此操作不可撤销。
                        </p>
                      </div>
                    </div>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="-translate-y-1 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                    >
                      <p
                        v-if="deleteError"
                        class="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-[13px] font-black text-red-500"
                      >
                        {{ deleteError }}
                      </p>
                    </Transition>
                    <div class="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        class="rounded-2xl px-6 py-2.5 text-[13px] font-black transition-colors"
                        :class="
                          isDark
                            ? 'bg-white/5 text-gray-200 hover:bg-white/10'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        "
                        :disabled="isDeletingNews"
                        @click="closeDeleteConfirm"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        class="rounded-2xl bg-red-500 px-6 py-2.5 text-[13px] font-black text-white shadow-[0_4px_14px_rgba(239,68,68,0.30)] transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                        :disabled="isDeletingNews"
                        @click="confirmDeleteNews"
                      >
                        {{ isDeletingNews ? "删除中..." : "确认删除" }}
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.modal-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.modal-scroll::-webkit-scrollbar {
  display: none;
}

.news-page * {
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
.bg-transparent .overflow-x-auto::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
