<script setup>
import { computed, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const sideCaptionText = 'ATRIMyDearMoments'
const selectedProduct = ref(null)
const checkoutStep = ref('order')
const quantity = ref(1)
const customerName = ref('')
const deliveryAddress = ref('')
const paymentMethod = ref('card')
const cardNumber = ref('')
const cardPassword = ref('')
const router = useRouter()
const route = useRoute()

const MERCHANDISE_RETURN_TARGET_KEY = 'atriMerchandiseReturnTarget'

const { data: products, pending, error } = await useFetch('/api/merchandise')

const checkoutSteps = [
  { key: 'order', label: '下单' },
  { key: 'confirm', label: '确认订单' },
  { key: 'pay', label: '支付' }
]

const currentStepIndex = computed(() => checkoutSteps.findIndex((step) => step.key === checkoutStep.value))

const unitPrice = computed(() => {
  if (!selectedProduct.value) {
    return 0
  }

  return Number(String(selectedProduct.value.priceDisplay ?? '').replace(/[^\d]/g, ''))
})

const normalizedQuantity = computed(() => Math.max(1, Math.floor(Number(quantity.value) || 1)))

const totalPrice = computed(() => unitPrice.value * normalizedQuantity.value)

const totalPriceDisplay = computed(() => {
  if (!selectedProduct.value) {
    return ''
  }

  if (!totalPrice.value) {
    return selectedProduct.value.priceDisplay
  }

  return `JPY ${new Intl.NumberFormat('ja-JP').format(totalPrice.value)}`
})

const canConfirmOrder = computed(() => customerName.value.trim() && deliveryAddress.value.trim())
const cardNumberDigits = computed(() => cardNumber.value.replace(/\D/g, ''))
const canCompletePayment = computed(() => {
  if (paymentMethod.value !== 'card') {
    return true
  }

  return cardNumberDigits.value.length >= 12 && cardPassword.value.trim().length >= 4
})

watch(paymentMethod, (method) => {
  if (method !== 'card') {
    clearSensitivePayment()
  }
})

function clearSensitivePayment() {
  cardNumber.value = ''
  cardPassword.value = ''
}

function openCheckout(product) {
  selectedProduct.value = product
  checkoutStep.value = 'order'
  quantity.value = 1
  customerName.value = ''
  deliveryAddress.value = ''
  paymentMethod.value = 'card'
  clearSensitivePayment()
}

function closeCheckout() {
  clearSensitivePayment()
  selectedProduct.value = null
  checkoutStep.value = 'order'
}

function increaseQuantity() {
  quantity.value = normalizedQuantity.value + 1
}

function decreaseQuantity() {
  quantity.value = Math.max(1, normalizedQuantity.value - 1)
}

function normalizeQuantity() {
  quantity.value = normalizedQuantity.value
}

function goToConfirm() {
  checkoutStep.value = 'confirm'
}

function goToPay() {
  if (!canConfirmOrder.value) {
    return
  }

  checkoutStep.value = 'pay'
}

function backCheckoutStep() {
  if (checkoutStep.value === 'pay') {
    clearSensitivePayment()
    checkoutStep.value = 'confirm'
    return
  }

  if (checkoutStep.value === 'confirm') {
    checkoutStep.value = 'order'
  }
}

function completePayment() {
  if (!canCompletePayment.value) {
    return
  }

  clearSensitivePayment()
  checkoutStep.value = 'done'
}

function skipHomeIntroOnce() {
  if (!import.meta.client) {
    return
  }

  try {
    sessionStorage.setItem('atriSkipIntro', '1')
    sessionStorage.setItem('atriSkipHomeIntroOnce', '1')
  } catch {
    // The home page can still load normally if session storage is unavailable.
  }
}

function getSafeReturnTarget(value) {
  if (typeof value !== 'string') {
    return ''
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return ''
  }

  return value
}

function getMerchandiseReturnTarget() {
  const returnTo = Array.isArray(route.query.returnTo) ? route.query.returnTo[0] : route.query.returnTo
  const safeRouteTarget = getSafeReturnTarget(returnTo)

  if (safeRouteTarget) {
    return safeRouteTarget
  }

  const from = Array.isArray(route.query.from) ? route.query.from[0] : route.query.from
  if (from === 'story') {
    return '/#story'
  }

  if (!import.meta.client) {
    return ''
  }

  try {
    return getSafeReturnTarget(sessionStorage.getItem(MERCHANDISE_RETURN_TARGET_KEY))
  } catch {
    return ''
  }
}

function clearMerchandiseReturnTarget() {
  if (!import.meta.client) {
    return
  }

  try {
    sessionStorage.removeItem(MERCHANDISE_RETURN_TARGET_KEY)
  } catch {
    // Returning still works if session storage is unavailable.
  }
}

function goBack() {
  skipHomeIntroOnce()

  const returnTarget = getMerchandiseReturnTarget()
  if (returnTarget) {
    clearMerchandiseReturnTarget()
    navigateTo(returnTarget)
    return
  }

  if (import.meta.client && window.history.state?.back) {
    router.back()
    return
  }

  navigateTo('/')
}

onBeforeRouteLeave((to) => {
  if (to.path === '/') {
    skipHomeIntroOnce()
  }
})
</script>

<template>
  <main class="relative min-h-screen overflow-x-hidden bg-white px-6 py-8 text-[#102a3a] md:px-12 lg:px-[7.2vw]">
    <div class="side-caption side-caption-left" aria-hidden="true">
      <div class="side-caption-track side-caption-track-up">
        <span v-for="index in 12" :key="`left-${index}`">{{ sideCaptionText }}</span>
      </div>
    </div>

    <div class="side-caption side-caption-right" aria-hidden="true">
      <div class="side-caption-track side-caption-track-down">
        <span v-for="index in 12" :key="`right-${index}`">{{ sideCaptionText }}</span>
      </div>
    </div>

    <button
      type="button"
      class="back-button fixed left-4 top-8 z-40 md:left-6 lg:left-8 xl:left-10"
      aria-label="Go back"
      @click="goBack"
    >
      <span class="back-button-icon" aria-hidden="true" />
      <span class="back-button-copy">
        <span class="back-button-text">BACK</span>
        <span class="back-button-sub">PREV PAGE</span>
      </span>
    </button>

    <div
      v-if="selectedProduct"
      class="fixed inset-0 z-[60] overflow-y-auto bg-[#f7fcfe]"
    >
      <section
        class="checkout-dialog relative min-h-screen w-full overflow-hidden p-5 text-[#21485d] md:p-8 lg:p-10"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selectedProduct.name} checkout`"
      >
        <div class="checkout-bubbles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <button
          type="button"
          class="checkout-close fixed right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#79d7f0] bg-white/92 text-[#21485d] shadow-[0_10px_22px_rgba(79,176,207,0.14)] backdrop-blur transition hover:bg-[#e8f9ff]"
          aria-label="Close checkout"
          @click="closeCheckout"
        >
          <span class="absolute h-[2px] w-5 rotate-45 rounded-full bg-current" />
          <span class="absolute h-[2px] w-5 -rotate-45 rounded-full bg-current" />
        </button>

        <div class="relative z-[1] mx-auto max-w-[1180px] pr-14 text-center md:px-12">
          <p class="text-xs font-black tracking-[0.22em] text-[#2f9ecd]">ATRI STORE</p>
          <h2 class="mx-auto mt-2 max-w-[780px] text-[clamp(25px,4vw,42px)] font-black leading-tight text-[#21485d]">
            {{ selectedProduct.name }}
          </h2>
        </div>

        <div class="relative z-[1] mx-auto mt-6 grid max-w-[1180px] grid-cols-3 gap-3">
          <div
            v-for="(step, index) in checkoutSteps"
            :key="step.key"
            class="checkout-step"
            :class="{ 'checkout-step-active': currentStepIndex >= index && checkoutStep !== 'done' }"
          >
            <span>{{ index + 1 }}</span>
            <strong>{{ step.label }}</strong>
          </div>
        </div>

        <div v-if="checkoutStep !== 'done'" class="relative z-[1] mx-auto mt-7 grid max-w-[1280px] gap-7 lg:grid-cols-[1fr_380px]">
          <div class="min-w-0">
            <div class="checkout-image mx-auto flex aspect-[1.22] max-w-[780px] items-center justify-center border-[5px] border-[#79d7f0] bg-white/96 p-5 shadow-[0_24px_60px_rgba(79,176,207,0.16)] md:p-8">
              <img
                :src="selectedProduct.imageUrl"
                :alt="selectedProduct.name"
                class="h-full w-full object-contain"
              >
            </div>

            <div class="mt-6 grid gap-3 text-sm font-bold text-[#21485d] sm:grid-cols-3">
              <div class="checkout-fact">
                <span>分类</span>
                <strong>{{ selectedProduct.category }}</strong>
              </div>
              <div class="checkout-fact">
                <span>单价</span>
                <strong>{{ selectedProduct.priceDisplay }}</strong>
              </div>
              <div class="checkout-fact">
                <span>库存</span>
                <strong>可下单</strong>
              </div>
            </div>
          </div>

          <aside class="checkout-panel border-[4px] border-[#79d7f0] bg-white/88 p-5 shadow-[0_18px_42px_rgba(79,176,207,0.16)] backdrop-blur">
            <div v-if="checkoutStep === 'order'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">ORDER</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">下单</h3>

              <div class="mt-6 flex items-center justify-between gap-4 border-b border-[#c9edf8] pb-5">
                <span class="text-sm font-black text-[#21485d]">数量</span>
                <div class="flex h-11 items-center overflow-hidden rounded-full border-2 border-[#79d7f0] bg-[#e8f9ff]">
                  <button
                    type="button"
                    class="h-full w-11 text-xl font-black transition hover:bg-[#d7f3fb]"
                    aria-label="Decrease quantity"
                    @click="decreaseQuantity"
                  >
                    -
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    inputmode="numeric"
                    aria-label="Quantity"
                    class="checkout-quantity-input"
                    @blur="normalizeQuantity"
                    @change="normalizeQuantity"
                  >
                  <button
                    type="button"
                    class="h-full w-11 text-xl font-black transition hover:bg-[#d7f3fb]"
                    aria-label="Increase quantity"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="mt-5 flex items-end justify-between gap-4">
                <span class="text-sm font-black text-[#21485d]">小计</span>
                <strong class="text-2xl font-black text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
              </div>

              <button
                type="button"
                class="checkout-primary mt-7"
                @click="goToConfirm"
              >
                确认订单
              </button>
            </div>

            <div v-else-if="checkoutStep === 'confirm'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">CONFIRM</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">确认订单</h3>

              <button type="button" class="checkout-back-link mt-4" @click="backCheckoutStep">
                <span aria-hidden="true">←</span>
                返回上一步
              </button>

              <label class="checkout-label mt-6">
                <span>收货人</span>
                <input v-model="customerName" type="text" autocomplete="name" placeholder="请输入姓名">
              </label>

              <label class="checkout-label mt-4">
                <span>收货地址</span>
                <textarea v-model="deliveryAddress" rows="4" placeholder="请输入收货地址" />
              </label>

              <div class="mt-5 space-y-3 border-t border-[#c9edf8] pt-5 text-sm font-bold text-[#21485d]">
                <div class="flex justify-between gap-4">
                  <span>商品</span>
                  <strong class="text-right">{{ selectedProduct.name }}</strong>
                </div>
                <div class="flex justify-between gap-4">
                  <span>数量</span>
                  <strong>x {{ quantity }}</strong>
                </div>
                <div class="flex justify-between gap-4">
                  <span>合计</span>
                  <strong class="text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
                </div>
              </div>

              <div class="mt-7 grid grid-cols-2 gap-3">
                <button type="button" class="checkout-secondary checkout-bottom-back" @click="backCheckoutStep">
                  返回上一步
                </button>
                <button type="button" class="checkout-secondary" @click="backCheckoutStep">
                  返回
                </button>
                <button
                  type="button"
                  class="checkout-primary"
                  :disabled="!canConfirmOrder"
                  @click="goToPay"
                >
                  去支付
                </button>
              </div>
            </div>

            <div v-else-if="checkoutStep === 'pay'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">PAYMENT</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">支付</h3>

              <button type="button" class="checkout-back-link mt-4" @click="backCheckoutStep">
                <span aria-hidden="true">←</span>
                返回上一步
              </button>

              <div class="mt-6 space-y-3">
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'card' }">
                  <input v-model="paymentMethod" type="radio" value="card">
                  <span>银行卡</span>
                </label>
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'wallet' }">
                  <input v-model="paymentMethod" type="radio" value="wallet">
                  <span>电子钱包</span>
                </label>
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'cod' }">
                  <input v-model="paymentMethod" type="radio" value="cod">
                  <span>到付</span>
                </label>
              </div>

              <div v-if="paymentMethod === 'card'" class="checkout-card-fields mt-5">
                <label class="checkout-label">
                  <span>银行卡号</span>
                  <input
                    v-model="cardNumber"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="23"
                    placeholder="请输入银行卡号"
                  >
                </label>

                <label class="checkout-label mt-4">
                  <span>支付密码</span>
                  <input
                    v-model="cardPassword"
                    type="password"
                    autocomplete="new-password"
                    maxlength="12"
                    placeholder="请输入支付密码"
                  >
                </label>

                <p class="checkout-security-note mt-3">
                  卡号和密码仅用于本次模拟支付，支付完成、返回或关闭后会立即清空，不会保存。
                </p>
              </div>

              <div class="mt-6 rounded-[8px] bg-[#e8f9ff] p-4">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-black text-[#21485d]">应付金额</span>
                  <strong class="text-2xl font-black text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
                </div>
              </div>

              <div class="mt-7 grid grid-cols-2 gap-3">
                <button type="button" class="checkout-secondary" @click="backCheckoutStep">
                  返回
                </button>
                <button
                  type="button"
                  class="checkout-primary"
                  :disabled="!canCompletePayment"
                  @click="completePayment"
                >
                  立即支付
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div v-else class="checkout-done relative z-[1] mx-auto mt-8 max-w-[760px] border-[4px] border-[#79d7f0] bg-white/90 p-8 text-center shadow-[0_18px_42px_rgba(79,176,207,0.16)] backdrop-blur">
          <p class="text-xs font-black tracking-[0.22em] text-[#2f9ecd]">ORDER COMPLETE</p>
          <h3 class="mt-3 text-[clamp(28px,5vw,46px)] font-black text-[#21485d]">支付完成</h3>
          <p class="mx-auto mt-4 max-w-[520px] text-sm font-bold leading-7 text-[#21485d]">
            订单已生成，商品信息已确认。
          </p>
          <button type="button" class="checkout-primary mx-auto mt-7 max-w-[260px]" @click="closeCheckout">
            完成
          </button>
        </div>

      </section>
    </div>

    <header class="relative z-10 mx-auto max-w-[1120px] pt-16 md:pt-14 lg:pt-12">
      <div class="flex items-end gap-4">
        <h1 class="text-[clamp(56px,8vw,104px)] font-black leading-none tracking-[0.02em] text-[#5fb8d7]">
          PRODUCTS
        </h1>
        <span class="mb-3 text-sm font-bold tracking-[0.12em] text-[#4fb0cf]">
          GOODS INFO
        </span>
      </div>
    </header>

    <section class="relative z-10 mx-auto mt-12 max-w-[1120px]">
      <div class="catalog-accent" aria-hidden="true">
        <span class="catalog-accent-line" />
        <span class="catalog-accent-mark">12 ITEMS</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">OFFICIAL GOODS</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">ATRI STORE</span>
        <span class="catalog-accent-line" />
      </div>

      <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-if="pending" class="col-span-full py-20 text-center font-bold text-[#4fb0cf]">
          正在连接数据库...
        </div>

        <div v-else-if="error" class="col-span-full py-20 text-center font-bold text-[#d45b6a]">
          商品数据加载失败
        </div>

        <article
          v-else
          v-for="product in products"
          :key="product.id"
          class="product-card group flex min-h-[430px] cursor-pointer flex-col rounded-[14px] border-2 border-b-[6px] border-l-[6px] border-[#d3eef4] bg-white p-6 shadow-[0_4px_14px_rgba(91,174,201,0.08)]"
          role="button"
          tabindex="0"
          @click="openCheckout(product)"
          @keydown.enter.prevent="openCheckout(product)"
          @keydown.space.prevent="openCheckout(product)"
        >
          <div class="flex aspect-square items-center justify-center overflow-hidden rounded-[9px] border-2 border-[#dff2f6] bg-[#f7fcfe] p-3">
            <img
              :src="product.imageUrl"
              :alt="product.name"
              class="h-full w-full object-contain"
              loading="lazy"
            >
          </div>

          <div class="mt-4 flex flex-1 flex-col px-3 py-4">
            <div class="flex items-center gap-2 text-sm font-black tracking-[0.04em] text-[#48adcd]">
              <span class="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#2f9ecd]" />
              <span>{{ product.category }}</span>
            </div>

            <h2 class="mt-3 min-h-[88px] text-[17px] font-black leading-[1.65] text-[#102a3a]">
              {{ product.name }}
            </h2>

            <p class="mt-auto pt-5 text-sm font-bold tracking-[0.02em] text-[#102a3a]">
              {{ product.priceDisplay }}
            </p>

            <span class="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#5fb8d7] px-5 text-sm font-black tracking-[0.1em] text-white transition group-hover:bg-[#4fb0cf]">
              下单
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="relative z-10 mx-auto mt-16 max-w-[1120px]">
      <div class="nav-footer relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#fef7ff] to-white p-8">
        <div class="nav-footer-pattern absolute inset-0 opacity-40" aria-hidden="true"></div>
        
        <div class="relative flex items-center justify-between">
          <button class="nav-footer-btn nav-footer-btn-prev flex items-center gap-3 text-[#765a78] transition hover:text-pink-400">
            <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#5fb8d7]">
              <span class="nav-footer-arrow-left"></span>
            </span>
            <span class="text-sm font-black tracking-[0.25em]">PREV</span>
          </button>

          <button class="nav-footer-btn nav-footer-btn-all text-sm font-black tracking-[0.35em] text-[#765a78] transition hover:text-pink-400">
            VIEW ALL
          </button>

          <button class="nav-footer-btn nav-footer-btn-next flex items-center gap-3 text-[#765a78] transition hover:text-pink-400">
            <span class="text-sm font-black tracking-[0.25em]">NEXT</span>
            <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#5fb8d7]">
              <span class="nav-footer-arrow-right"></span>
            </span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.side-caption {
  display: none;
  pointer-events: none;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 0;
  width: clamp(96px, 9vw, 148px);
  overflow: hidden;
}

.side-caption-left {
  left: 0;
}

.side-caption-right {
  right: 0;
}

.side-caption-track {
  position: absolute;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 42px;
  color: rgba(95, 184, 215, 0.13);
  font-size: clamp(72px, 8vw, 118px);
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  transform: translateX(-50%);
  white-space: nowrap;
  will-change: transform;
}

.side-caption-track span {
  display: block;
  writing-mode: vertical-rl;
  text-orientation: sideways;
  white-space: nowrap;
}

.side-caption-left .side-caption-track {
  color: rgba(95, 184, 215, 0.12);
}

.side-caption-right .side-caption-track {
  color: rgba(79, 176, 207, 0.14);
}

.side-caption-track-up {
  animation: side-caption-up 92s linear infinite;
}

.side-caption-track-down {
  animation: side-caption-down 100s linear infinite;
}

@keyframes side-caption-up {
  from {
    transform: translate(-50%, 0);
  }

  to {
    transform: translate(-50%, -50%);
  }
}

@keyframes side-caption-down {
  from {
    transform: translate(-50%, -50%);
  }

  to {
    transform: translate(-50%, 0);
  }
}

.catalog-accent {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 2vw, 22px);
  overflow: hidden;
  border-block: 1px solid rgba(121, 203, 226, 0.28);
  padding: 18px 0;
}

.catalog-accent::before,
.catalog-accent::after {
  position: absolute;
  top: 50%;
  width: 58px;
  height: 58px;
  border: 12px solid rgba(95, 184, 215, 0.08);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

.catalog-accent::before {
  left: 6%;
}

.catalog-accent::after {
  right: 6%;
}

.catalog-accent-line {
  height: 1px;
  flex: 1 1 96px;
  max-width: 180px;
  background: linear-gradient(90deg, transparent, rgba(79, 176, 207, 0.52), transparent);
}

.catalog-accent-mark {
  position: relative;
  z-index: 1;
  color: #48adcd;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  white-space: nowrap;
}

.catalog-accent-diamond {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 2px;
  background: #9be0ef;
  transform: rotate(45deg);
}

.back-button {
  position: relative;
  display: inline-flex;
  min-width: 132px;
  height: 50px;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
  border: 1px solid rgba(121, 215, 240, 0.52);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(232, 249, 255, 0.74)),
    rgba(255, 255, 255, 0.78);
  color: #102a3a;
  cursor: pointer;
  padding: 0 18px 0 15px;
  box-shadow: 0 14px 34px rgba(79, 176, 207, 0.14);
  backdrop-filter: blur(10px);
  transition:
    background-color 0.32s ease,
    border-color 0.32s ease,
    box-shadow 0.32s ease,
    color 0.28s ease,
    transform 0.28s ease;
}

.back-button::before {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: inherit;
  content: "";
}

.back-button::after {
  position: absolute;
  right: -18px;
  bottom: -22px;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(121, 215, 240, 0.28);
  content: "";
  transition: transform 0.32s ease;
}

.back-button-icon {
  position: relative;
  z-index: 1;
  display: block;
  width: 36px;
  height: 20px;
  color: #2f9ecd;
  transition: transform 0.32s ease;
}

.back-button-icon::before,
.back-button-icon::after {
  position: absolute;
  content: "";
}

.back-button-icon::before {
  left: 1px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.back-button-icon::after {
  left: 3px;
  top: 9px;
  width: 33px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.back-button-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
}

.back-button-text {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.back-button-sub {
  color: rgba(16, 42, 58, 0.42);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  transition: color 0.28s ease;
}

.back-button:hover {
  border-color: #79d7f0;
  box-shadow: 0 16px 36px rgba(79, 176, 207, 0.22);
  transform: translateX(-3px);
}

.back-button:hover::after {
  transform: scale(1.18);
}

.back-button:hover .back-button-icon {
  transform: translateX(-4px);
}

.product-card {
  transform-origin: center;
  transition:
    background-color 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card:hover {
  border-color: #79d7f0;
  background-color: #e8f9ff;
  box-shadow: 0 16px 34px rgba(79, 176, 207, 0.2);
  transform: scale(1.025);
  transition-duration: 0.26s;
}

.product-card:focus-visible {
  outline: 4px solid rgba(121, 215, 240, 0.72);
  outline-offset: 4px;
}



.checkout-dialog {
  isolation: isolate;
  background-color: #f7fcfe;
  background-image:
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.98) 0 170px, transparent 172px),
    radial-gradient(circle at 92% 12%, rgba(232, 249, 255, 0.92) 0 130px, transparent 132px),
    linear-gradient(180deg, #ffffff 0%, #f7fcfe 42%, #e8f9ff 100%);
  background-position:
    0 0,
    0 0,
    0 0;
  background-size:
    100% 100%,
    100% 100%,
    100% 100%;
}

.checkout-bubbles {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.checkout-bubbles span {
  position: absolute;
  bottom: -160px;
  display: block;
  width: var(--bubble-size);
  height: var(--bubble-size);
  border: 3px solid rgba(95, 184, 215, 0.58);
  border-radius: 999px;
  background:
    radial-gradient(circle at 28% 26%, rgba(255, 255, 255, 0.98) 0 15%, transparent 16%),
    radial-gradient(circle at 68% 72%, rgba(121, 215, 240, 0.32) 0 22%, transparent 24%),
    rgba(232, 249, 255, 0.5);
  box-shadow:
    inset 0 0 34px rgba(255, 255, 255, 0.92),
    0 18px 42px rgba(79, 176, 207, 0.2);
  animation:
    bubble-float var(--bubble-duration) linear infinite,
    bubble-pulse 4.8s ease-in-out infinite;
  animation-delay: var(--bubble-delay);
  left: var(--bubble-left);
  opacity: var(--bubble-opacity);
}

.checkout-bubbles span:nth-child(1) {
  --bubble-size: 92px;
  --bubble-left: 6%;
  --bubble-duration: 16s;
  --bubble-delay: -4s;
  --bubble-opacity: 0.72;
}

.checkout-bubbles span:nth-child(2) {
  --bubble-size: 152px;
  --bubble-left: 15%;
  --bubble-duration: 21s;
  --bubble-delay: -17s;
  --bubble-opacity: 0.54;
}

.checkout-bubbles span:nth-child(3) {
  --bubble-size: 62px;
  --bubble-left: 24%;
  --bubble-duration: 14s;
  --bubble-delay: -9s;
  --bubble-opacity: 0.68;
}

.checkout-bubbles span:nth-child(4) {
  --bubble-size: 118px;
  --bubble-left: 34%;
  --bubble-duration: 19s;
  --bubble-delay: -2s;
  --bubble-opacity: 0.64;
}

.checkout-bubbles span:nth-child(5) {
  --bubble-size: 176px;
  --bubble-left: 47%;
  --bubble-duration: 24s;
  --bubble-delay: -21s;
  --bubble-opacity: 0.48;
}

.checkout-bubbles span:nth-child(6) {
  --bubble-size: 78px;
  --bubble-left: 57%;
  --bubble-duration: 15s;
  --bubble-delay: -12s;
  --bubble-opacity: 0.7;
}

.checkout-bubbles span:nth-child(7) {
  --bubble-size: 136px;
  --bubble-left: 66%;
  --bubble-duration: 20s;
  --bubble-delay: -7s;
  --bubble-opacity: 0.58;
}

.checkout-bubbles span:nth-child(8) {
  --bubble-size: 88px;
  --bubble-left: 76%;
  --bubble-duration: 17s;
  --bubble-delay: -15s;
  --bubble-opacity: 0.7;
}

.checkout-bubbles span:nth-child(9) {
  --bubble-size: 190px;
  --bubble-left: 84%;
  --bubble-duration: 26s;
  --bubble-delay: -25s;
  --bubble-opacity: 0.46;
}

.checkout-bubbles span:nth-child(10) {
  --bubble-size: 58px;
  --bubble-left: 91%;
  --bubble-duration: 13s;
  --bubble-delay: -5s;
  --bubble-opacity: 0.76;
}

.checkout-bubbles span:nth-child(11) {
  --bubble-size: 110px;
  --bubble-left: 3%;
  --bubble-duration: 18s;
  --bubble-delay: -23s;
  --bubble-opacity: 0.58;
}

.checkout-bubbles span:nth-child(12) {
  --bubble-size: 72px;
  --bubble-left: 72%;
  --bubble-duration: 14s;
  --bubble-delay: -1s;
  --bubble-opacity: 0.72;
}

@keyframes bubble-float {
  0% {
    transform: translate3d(0, 0, 0) scale(0.92);
  }

  25% {
    transform: translate3d(44px, -30vh, 0) scale(1.04);
  }

  55% {
    transform: translate3d(-38px, -62vh, 0) scale(1.1);
  }

  78% {
    transform: translate3d(30px, -88vh, 0) scale(1);
  }

  100% {
    transform: translate3d(-18px, calc(-100vh - 260px), 0) scale(0.94);
  }
}

@keyframes bubble-pulse {
  0%,
  100% {
    filter: saturate(1) brightness(1);
  }

  50% {
    filter: saturate(1.25) brightness(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkout-bubbles span {
    animation: none;
    transform: translateY(-22vh);
  }
}

.checkout-image {
  border-radius: 24px;
}

.checkout-panel,
.checkout-done {
  border-radius: 18px;
}

.checkout-step {
  display: flex;
  min-width: 0;
  height: 58px;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(121, 215, 240, 0.68);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #5f7f92;
  padding: 0 14px;
}

.checkout-step span {
  display: flex;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e8f9ff;
  color: #2f9ecd;
  font-size: 12px;
  font-weight: 900;
}

.checkout-step strong {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkout-step-active {
  border-color: #79d7f0;
  background: #e8f9ff;
  color: #2f9ecd;
}

.checkout-fact {
  border: 2px solid rgba(121, 215, 240, 0.34);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
}

.checkout-fact span,
.checkout-label span {
  display: block;
  color: #5f7f92;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.checkout-fact strong {
  display: block;
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: #21485d;
  font-size: 14px;
  font-weight: 900;
}

.checkout-label input,
.checkout-label textarea {
  width: 100%;
  margin-top: 8px;
  border: 2px solid #c9edf8;
  border-radius: 8px;
  background: #f7fcfe;
  color: #21485d;
  font-weight: 800;
  outline: none;
  padding: 12px 14px;
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.checkout-label input:focus,
.checkout-label textarea:focus {
  border-color: #79d7f0;
  background: white;
  box-shadow: 0 0 0 4px rgba(121, 215, 240, 0.2);
}

.checkout-card-fields {
  border: 2px solid rgba(121, 215, 240, 0.34);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.64);
  padding: 14px;
}

.checkout-quantity-input {
  width: 64px;
  height: 100%;
  border: 0;
  border-inline: 1px solid rgba(121, 215, 240, 0.44);
  background: white;
  color: #21485d;
  font-size: 18px;
  font-weight: 900;
  outline: none;
  text-align: center;
}

.checkout-quantity-input:focus {
  background: #f7fcfe;
  box-shadow: inset 0 0 0 3px rgba(121, 215, 240, 0.2);
}

.checkout-quantity-input::-webkit-inner-spin-button,
.checkout-quantity-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.checkout-back-link {
  display: none;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #2f9ecd;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  padding: 0;
  transition:
    color 0.24s ease,
    transform 0.24s ease;
}

.checkout-back-link:hover {
  color: #21485d;
  transform: translateX(-3px);
}

.checkout-security-note {
  color: #5f7f92;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.7;
}

.payment-option {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 12px;
  border: 2px solid #c9edf8;
  border-radius: 8px;
  background: #f7fcfe;
  color: #21485d;
  cursor: pointer;
  font-weight: 900;
  padding: 0 14px;
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    color 0.24s ease;
}

.payment-option input {
  width: 18px;
  height: 18px;
  accent-color: #5fb8d7;
}

.payment-option-active {
  border-color: #79d7f0;
  background: #e8f9ff;
  color: #2f9ecd;
}

.checkout-primary,
.checkout-secondary {
  display: inline-flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    color 0.24s ease,
    transform 0.24s ease,
    opacity 0.24s ease;
}

.checkout-primary {
  background: #5fb8d7;
  color: white;
  box-shadow: 0 12px 24px rgba(79, 176, 207, 0.28);
}

.checkout-primary:hover:not(:disabled) {
  background: #4fb0cf;
  box-shadow: 0 16px 30px rgba(79, 176, 207, 0.36);
  transform: translateY(-1px);
}

.checkout-primary:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.checkout-secondary {
  border: 2px solid #c9edf8;
  background: white;
  color: #2f9ecd;
}

.checkout-secondary:hover {
  border-color: #79d7f0;
  background: #e8f9ff;
}

.checkout-panel .checkout-secondary:not(.checkout-bottom-back) {
  display: none;
}

.checkout-panel .checkout-primary {
  grid-column: 1 / -1;
}

.checkout-close:focus-visible,
.checkout-primary:focus-visible,
.checkout-secondary:focus-visible,
.payment-option:focus-within {
  outline: 4px solid rgba(121, 215, 240, 0.28);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .catalog-accent {
    gap: 12px;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 14px 2px;
  }

  .catalog-accent::before,
  .catalog-accent::after,
  .catalog-accent-line {
    display: none;
  }

  .checkout-step {
    height: 50px;
    justify-content: center;
    padding: 0 8px;
  }

  .checkout-step strong {
    display: none;
  }
}

@media (min-width: 1024px) {
  .side-caption {
    display: block;
  }
}

.nav-footer-pattern {
  background-image: radial-gradient(circle, #ffcbdb 0 2px, transparent 3px);
  background-size: 32px 32px;
}

.nav-footer-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.nav-footer-arrow-left {
  position: relative;
  display: block;
  width: 14px;
  height: 14px;
}

.nav-footer-arrow-left::before,
.nav-footer-arrow-left::after {
  position: absolute;
  content: "";
  background: white;
}

.nav-footer-arrow-left::before {
  top: 50%;
  left: 0;
  width: 14px;
  height: 2px;
  transform: translateY(-50%);
}

.nav-footer-arrow-left::after {
  top: 4px;
  left: 0;
  width: 6px;
  height: 6px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(45deg);
}

.nav-footer-arrow-right {
  position: relative;
  display: block;
  width: 14px;
  height: 14px;
}

.nav-footer-arrow-right::before,
.nav-footer-arrow-right::after {
  position: absolute;
  content: "";
  background: white;
}

.nav-footer-arrow-right::before {
  top: 50%;
  left: 0;
  width: 14px;
  height: 2px;
  transform: translateY(-50%);
}

.nav-footer-arrow-right::after {
  top: 4px;
  right: 0;
  width: 6px;
  height: 6px;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg);
}
</style>
