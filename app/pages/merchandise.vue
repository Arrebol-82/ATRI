<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const sideCaptionText = 'ATRIMyDearMoments'
const selectedProduct = ref(null)
const checkoutEffectsVisible = ref(false)
const checkoutOverlayRef = ref(null)
const checkoutStep = ref('order')
const quantity = ref(1)
const customerName = ref('')
const deliveryAddress = ref('')
const paymentMethod = ref('card')
const cardNumber = ref('')
const cardPassword = ref('')
const orderSubmitting = ref(false)
const orderError = ref('')
const router = useRouter()
const route = useRoute()

const DEFAULT_LANGUAGE = 'zh'
const LANGUAGE_STORAGE_KEY = 'atriSiteLanguage'

const injectedI18n = inject('atriI18n', null)
const localLanguage = ref(DEFAULT_LANGUAGE)

const MERCHANDISE_RETURN_TARGET_KEY = 'atriMerchandiseReturnTarget'
const MERCHANDISE_PRODUCTS_STORAGE_KEY = 'atriMerchandiseProductsCache'
const MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY = 'atriMerchandiseProductsCacheTime'
const MERCHANDISE_PRODUCTS_CACHE_MAX_AGE = 1000 * 60 * 60 * 24

const merchandiseCache = useState('merchandise-products-cache', () => [])
const merchandisePreloaded = useState('merchandise-products-preloaded', () => false)
const merchandisePreloading = useState('merchandise-products-preloading', () => false)

const pending = ref(!merchandiseCache.value.length)
const error = ref(null)

const merchandiseTranslations = {
  zh: {
    'merchandise.back.aria': '返回上一页',
    'merchandise.back.main': '返回',
    'merchandise.back.sub': '上一页',
    'merchandise.checkout.close': '关闭结算窗口',
    'merchandise.checkout.dialog': '{product} 结算',
    'merchandise.store': 'ATRI STORE',
    'merchandise.step.orderCode': 'ORDER',
    'merchandise.step.order': '订单',
    'merchandise.step.confirmCode': 'CONFIRM',
    'merchandise.step.confirm': '确认订单',
    'merchandise.step.paymentCode': 'PAYMENT',
    'merchandise.step.payment': '支付',
    'merchandise.step.doneCode': 'ORDER COMPLETE',
    'merchandise.step.done': '支付完成',
    'merchandise.quantity': '数量',
    'merchandise.quantity.aria': '商品数量',
    'merchandise.quantity.decrease': '减少数量',
    'merchandise.quantity.increase': '增加数量',
    'merchandise.subtotal': '小计',
    'merchandise.confirmOrder': '确认订单',
    'merchandise.category': '分类',
    'merchandise.price': '价格',
    'merchandise.stock': '库存',
    'merchandise.available': '有货',
    'merchandise.back': '返回',
    'merchandise.name': '姓名',
    'merchandise.namePlaceholder': '请输入姓名',
    'merchandise.address': '地址',
    'merchandise.addressPlaceholder': '请输入收货地址',
    'merchandise.product': '商品',
    'merchandise.total': '总计',
    'merchandise.goToPay': '去支付',
    'merchandise.creditCard': '信用卡',
    'merchandise.wallet': '电子钱包',
    'merchandise.cod': '货到付款',
    'merchandise.cardNumber': '卡号',
    'merchandise.cardNumberPlaceholder': '请输入卡号',
    'merchandise.password': '支付密码',
    'merchandise.passwordPlaceholder': '请输入支付密码',
    'merchandise.securityNote': '卡号和密码仅用于本次演示支付。支付完成、返回或关闭窗口时会立即清空。',
    'merchandise.amountDue': '应付金额',
    'merchandise.payNow': '立即支付',
    'merchandise.doneBody': '订单已确认，你的订单信息已经记录。',
    'merchandise.doneButton': '完成',
    'merchandise.title': 'PRODUCTS',
    'merchandise.subtitle': '商品信息',
    'merchandise.itemsCount': '12 件商品',
    'merchandise.officialGoods': '官方周边',
    'merchandise.atriStore': 'ATRI STORE',
    'merchandise.loadError': '商品数据加载失败',
    'merchandise.order': '订购',
    'merchandise.category.official': '官方周边',
    'merchandise.category.acrylic': '亚克力',
    'merchandise.category.badge': '徽章',
    'merchandise.category.file': '文件夹',
    'merchandise.category.keyholder': '钥匙扣',
    'merchandise.category.apparel': '服饰',
    'merchandise.category.book': '书籍',
    'merchandise.category.misc': '杂货',
    'merchandise.product.1.name': 'ATRI 亚克力立牌',
    'merchandise.product.1.category': '亚克力',
    'merchandise.product.2.name': 'ATRI 收藏徽章',
    'merchandise.product.2.category': '徽章',
    'merchandise.product.3.name': 'ATRI 透明文件夹',
    'merchandise.product.3.category': '文件夹',
    'merchandise.product.4.name': 'ATRI 钥匙扣',
    'merchandise.product.4.category': '钥匙扣',
    'merchandise.product.5.name': 'ATRI 纪念海报',
    'merchandise.product.5.category': '官方周边',
    'merchandise.product.6.name': 'ATRI 主题 T 恤',
    'merchandise.product.6.category': '服饰',
    'merchandise.product.7.name': 'ATRI 托特包',
    'merchandise.product.7.category': '杂货',
    'merchandise.product.8.name': 'ATRI 马克杯',
    'merchandise.product.8.category': '杂货',
    'merchandise.product.9.name': 'ATRI 毛巾',
    'merchandise.product.9.category': '杂货',
    'merchandise.product.10.name': 'ATRI 贴纸套装',
    'merchandise.product.10.category': '杂货',
    'merchandise.product.11.name': 'ATRI 玩偶挂件',
    'merchandise.product.11.category': '官方周边',
    'merchandise.product.12.name': 'ATRI 纪念画册',
    'merchandise.product.12.category': '书籍'
  },
  en: {
    'merchandise.back.aria': 'Go back',
    'merchandise.back.main': 'BACK',
    'merchandise.back.sub': 'PREV PAGE',
    'merchandise.checkout.close': 'Close checkout',
    'merchandise.checkout.dialog': '{product} checkout',
    'merchandise.store': 'ATRI STORE',
    'merchandise.step.orderCode': 'ORDER',
    'merchandise.step.order': 'Order',
    'merchandise.step.confirmCode': 'CONFIRM',
    'merchandise.step.confirm': 'Confirm Order',
    'merchandise.step.paymentCode': 'PAYMENT',
    'merchandise.step.payment': 'Payment',
    'merchandise.step.doneCode': 'ORDER COMPLETE',
    'merchandise.step.done': 'Payment Complete',
    'merchandise.quantity': 'Quantity',
    'merchandise.quantity.aria': 'Quantity',
    'merchandise.quantity.decrease': 'Decrease quantity',
    'merchandise.quantity.increase': 'Increase quantity',
    'merchandise.subtotal': 'Subtotal',
    'merchandise.confirmOrder': 'Confirm Order',
    'merchandise.category': 'Category',
    'merchandise.price': 'Price',
    'merchandise.stock': 'Stock',
    'merchandise.available': 'Available',
    'merchandise.back': 'Back',
    'merchandise.name': 'Name',
    'merchandise.namePlaceholder': 'Enter your name',
    'merchandise.address': 'Address',
    'merchandise.addressPlaceholder': 'Enter delivery address',
    'merchandise.product': 'Product',
    'merchandise.total': 'Total',
    'merchandise.goToPay': 'Go to Pay',
    'merchandise.creditCard': 'Credit Card',
    'merchandise.wallet': 'E-Wallet',
    'merchandise.cod': 'Pay on Delivery',
    'merchandise.cardNumber': 'Card Number',
    'merchandise.cardNumberPlaceholder': 'Enter card number',
    'merchandise.password': 'Password',
    'merchandise.passwordPlaceholder': 'Enter payment password',
    'merchandise.securityNote': 'Card number and password are only used for this demo payment. They will be cleared immediately after payment, when you go back, or close the window.',
    'merchandise.amountDue': 'Amount Due',
    'merchandise.payNow': 'Pay Now',
    'merchandise.doneBody': 'Order confirmed. Your order details have been recorded.',
    'merchandise.doneButton': 'Done',
    'merchandise.title': 'PRODUCTS',
    'merchandise.subtitle': 'GOODS INFO',
    'merchandise.itemsCount': '12 ITEMS',
    'merchandise.officialGoods': 'OFFICIAL GOODS',
    'merchandise.atriStore': 'ATRI STORE',
    'merchandise.loadError': 'Failed to load product data',
    'merchandise.order': 'Order',
    'merchandise.category.official': 'Official Goods',
    'merchandise.category.acrylic': 'Acrylic',
    'merchandise.category.badge': 'Badge',
    'merchandise.category.file': 'Clear File',
    'merchandise.category.keyholder': 'Key Holder',
    'merchandise.category.apparel': 'Apparel',
    'merchandise.category.book': 'Book',
    'merchandise.category.misc': 'Goods',
    'merchandise.product.1.name': 'ATRI Acrylic Stand',
    'merchandise.product.1.category': 'Acrylic',
    'merchandise.product.2.name': 'ATRI Collectible Badge',
    'merchandise.product.2.category': 'Badge',
    'merchandise.product.3.name': 'ATRI Clear File',
    'merchandise.product.3.category': 'Clear File',
    'merchandise.product.4.name': 'ATRI Key Holder',
    'merchandise.product.4.category': 'Key Holder',
    'merchandise.product.5.name': 'ATRI Memorial Poster',
    'merchandise.product.5.category': 'Official Goods',
    'merchandise.product.6.name': 'ATRI T-Shirt',
    'merchandise.product.6.category': 'Apparel',
    'merchandise.product.7.name': 'ATRI Tote Bag',
    'merchandise.product.7.category': 'Goods',
    'merchandise.product.8.name': 'ATRI Mug',
    'merchandise.product.8.category': 'Goods',
    'merchandise.product.9.name': 'ATRI Towel',
    'merchandise.product.9.category': 'Goods',
    'merchandise.product.10.name': 'ATRI Sticker Set',
    'merchandise.product.10.category': 'Goods',
    'merchandise.product.11.name': 'ATRI Plush Charm',
    'merchandise.product.11.category': 'Official Goods',
    'merchandise.product.12.name': 'ATRI Memorial Book',
    'merchandise.product.12.category': 'Book'
  },
  ja: {
    'merchandise.back.aria': '前のページに戻る',
    'merchandise.back.main': 'BACK',
    'merchandise.back.sub': '前のページ',
    'merchandise.checkout.close': '購入画面を閉じる',
    'merchandise.checkout.dialog': '{product} の購入手続き',
    'merchandise.store': 'ATRI STORE',
    'merchandise.step.orderCode': 'ORDER',
    'merchandise.step.order': '注文',
    'merchandise.step.confirmCode': 'CONFIRM',
    'merchandise.step.confirm': '注文確認',
    'merchandise.step.paymentCode': 'PAYMENT',
    'merchandise.step.payment': '支払い',
    'merchandise.step.doneCode': 'ORDER COMPLETE',
    'merchandise.step.done': '支払い完了',
    'merchandise.quantity': '数量',
    'merchandise.quantity.aria': '数量',
    'merchandise.quantity.decrease': '数量を減らす',
    'merchandise.quantity.increase': '数量を増やす',
    'merchandise.subtotal': '小計',
    'merchandise.confirmOrder': '注文を確認',
    'merchandise.category': 'カテゴリ',
    'merchandise.price': '価格',
    'merchandise.stock': '在庫',
    'merchandise.available': '在庫あり',
    'merchandise.back': '戻る',
    'merchandise.name': 'お名前',
    'merchandise.namePlaceholder': 'お名前を入力してください',
    'merchandise.address': '住所',
    'merchandise.addressPlaceholder': '配送先住所を入力してください',
    'merchandise.product': '商品',
    'merchandise.total': '合計',
    'merchandise.goToPay': '支払いへ進む',
    'merchandise.creditCard': 'クレジットカード',
    'merchandise.wallet': '電子ウォレット',
    'merchandise.cod': '代金引換',
    'merchandise.cardNumber': 'カード番号',
    'merchandise.cardNumberPlaceholder': 'カード番号を入力してください',
    'merchandise.password': '決済パスワード',
    'merchandise.passwordPlaceholder': '決済パスワードを入力してください',
    'merchandise.securityNote': 'カード番号とパスワードはこのデモ決済のみに使用されます。支払い完了、戻る操作、または画面を閉じた時点で即座に消去されます。',
    'merchandise.amountDue': 'お支払い金額',
    'merchandise.payNow': '今すぐ支払う',
    'merchandise.doneBody': '注文が確定しました。注文内容が記録されました。',
    'merchandise.doneButton': '完了',
    'merchandise.title': 'PRODUCTS',
    'merchandise.subtitle': 'グッズ情報',
    'merchandise.itemsCount': '12 ITEMS',
    'merchandise.officialGoods': '公式グッズ',
    'merchandise.atriStore': 'ATRI STORE',
    'merchandise.loadError': '商品データの読み込みに失敗しました',
    'merchandise.order': '注文',
    'merchandise.category.official': '公式グッズ',
    'merchandise.category.acrylic': 'アクリル',
    'merchandise.category.badge': '缶バッジ',
    'merchandise.category.file': 'クリアファイル',
    'merchandise.category.keyholder': 'キーホルダー',
    'merchandise.category.apparel': 'アパレル',
    'merchandise.category.book': '書籍',
    'merchandise.category.misc': 'グッズ',
    'merchandise.product.1.name': 'ATRI アクリルスタンド',
    'merchandise.product.1.category': 'アクリル',
    'merchandise.product.2.name': 'ATRI コレクション缶バッジ',
    'merchandise.product.2.category': '缶バッジ',
    'merchandise.product.3.name': 'ATRI クリアファイル',
    'merchandise.product.3.category': 'クリアファイル',
    'merchandise.product.4.name': 'ATRI キーホルダー',
    'merchandise.product.4.category': 'キーホルダー',
    'merchandise.product.5.name': 'ATRI 記念ポスター',
    'merchandise.product.5.category': '公式グッズ',
    'merchandise.product.6.name': 'ATRI Tシャツ',
    'merchandise.product.6.category': 'アパレル',
    'merchandise.product.7.name': 'ATRI トートバッグ',
    'merchandise.product.7.category': 'グッズ',
    'merchandise.product.8.name': 'ATRI マグカップ',
    'merchandise.product.8.category': 'グッズ',
    'merchandise.product.9.name': 'ATRI タオル',
    'merchandise.product.9.category': 'グッズ',
    'merchandise.product.10.name': 'ATRI ステッカーセット',
    'merchandise.product.10.category': 'グッズ',
    'merchandise.product.11.name': 'ATRI ぬいぐるみチャーム',
    'merchandise.product.11.category': '公式グッズ',
    'merchandise.product.12.name': 'ATRI メモリアルブック',
    'merchandise.product.12.category': '書籍'
  }
}

const currentLanguage = computed(() => {
  const injectedLanguage = injectedI18n?.currentLanguage?.value

  return normalizeLanguage(injectedLanguage || localLanguage.value)
})

const products = computed(() =>
  merchandiseCache.value.map((product, index) => localizeProduct(product, index))
)

const unitPrice = computed(() => {
  if (!selectedProduct.value) {
    return 0
  }

  return Number(String(selectedProduct.value.priceDisplay ?? '').replace(/[^\d]/g, ''))
})

const normalizedQuantity = computed(() => Math.max(1, Math.floor(Number(quantity.value) || 1)))
const selectedProductStock = computed(() => {
  const stock = Number(selectedProduct.value?.stock)
  return Number.isFinite(stock) ? stock : null
})
const hasEnoughSelectedStock = computed(() => {
  return selectedProductStock.value === null || selectedProductStock.value >= normalizedQuantity.value
})

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
  if (!hasEnoughSelectedStock.value) {
    return false
  }

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

watch(selectedProduct, async (product) => {
  if (product) {
    lockPageScroll()
    await nextTick()
    checkoutOverlayRef.value?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    runWhenBrowserIsCalm(() => {
      if (selectedProduct.value) {
        checkoutEffectsVisible.value = true
      }
    }, 900)
    return
  }

  checkoutEffectsVisible.value = false
  unlockPageScroll()
})

watch(currentLanguage, () => {
  if (!selectedProduct.value) return

  const selectedId = selectedProduct.value.id

  selectedProduct.value =
    products.value.find((product) => product.id === selectedId) ||
    selectedProduct.value
})

watch(merchandiseCache, (value) => {
  if (Array.isArray(value) && value.length) {
    pending.value = false
    error.value = null
  }
})

onMounted(() => {
  localLanguage.value = getSavedLanguage()

  if (import.meta.client) {
    window.addEventListener('atri-language-change', handleLanguageChange)
  }

  unlockPageScroll()
  restoreMerchandiseProductsFromStorage()

  if (merchandiseCache.value.length) {
    runWhenBrowserIsCalm(loadMerchandiseProducts, 3600)
  } else {
    loadMerchandiseProducts()
  }
})

onBeforeUnmount(() => {
  unlockPageScroll()

  if (import.meta.client) {
    window.removeEventListener('atri-language-change', handleLanguageChange)
  }
})

function normalizeLanguage(language) {
  return ['zh', 'en', 'ja'].includes(language) ? language : DEFAULT_LANGUAGE
}

function formatMessage(message, params = {}) {
  if (typeof message !== 'string') return message

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value)
  }, message)
}

function t(key, params = {}) {
  const language = currentLanguage.value
  const message =
    merchandiseTranslations[language]?.[key] ||
    merchandiseTranslations[DEFAULT_LANGUAGE]?.[key] ||
    key

  return formatMessage(message, params)
}

function getSavedLanguage() {
  if (!import.meta.client) return DEFAULT_LANGUAGE

  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function handleLanguageChange(event) {
  localLanguage.value = normalizeLanguage(event.detail?.language)
}

function runWhenBrowserIsCalm(callback, timeout = 1400) {
  if (!import.meta.client) return

  const schedule = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout })
    } else {
      window.setTimeout(callback, Math.min(timeout, 900))
    }
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(schedule)
  })
}

function getProductTranslationKey(product, index) {
  const candidates = [
    product?.translationKey,
    product?.i18nKey,
    product?.slug,
    product?.id,
    index + 1
  ]

  const candidate = candidates.find((value) => value !== undefined && value !== null && String(value).trim())

  return String(candidate)
}

function localizeCategory(category = '') {
  const normalizedCategory = String(category).trim().toLowerCase()

  if (normalizedCategory.includes('acrylic') || normalizedCategory.includes('亚克力') || normalizedCategory.includes('アクリル')) {
    return t('merchandise.category.acrylic')
  }

  if (normalizedCategory.includes('badge') || normalizedCategory.includes('徽章') || normalizedCategory.includes('缶バッジ')) {
    return t('merchandise.category.badge')
  }

  if (normalizedCategory.includes('file') || normalizedCategory.includes('文件') || normalizedCategory.includes('クリアファイル')) {
    return t('merchandise.category.file')
  }

  if (normalizedCategory.includes('key') || normalizedCategory.includes('钥匙') || normalizedCategory.includes('キーホルダー')) {
    return t('merchandise.category.keyholder')
  }

  if (normalizedCategory.includes('shirt') || normalizedCategory.includes('t恤') || normalizedCategory.includes('tシャツ')) {
    return t('merchandise.category.apparel')
  }

  if (normalizedCategory.includes('book') || normalizedCategory.includes('书') || normalizedCategory.includes('本')) {
    return t('merchandise.category.book')
  }

  if (normalizedCategory.includes('official') || normalizedCategory.includes('官方') || normalizedCategory.includes('公式')) {
    return t('merchandise.category.official')
  }

  return category || t('merchandise.category.misc')
}

function localizeProduct(product, index) {
  const translationKey = getProductTranslationKey(product, index)
  const translatedName = t(`merchandise.product.${translationKey}.name`)
  const translatedCategory = t(`merchandise.product.${translationKey}.category`)

  const hasTranslatedName = translatedName !== `merchandise.product.${translationKey}.name`
  const hasTranslatedCategory = translatedCategory !== `merchandise.product.${translationKey}.category`

  return {
    ...product,
    originalName: product.name,
    originalCategory: product.category,
    name: hasTranslatedName ? translatedName : product.name,
    category: hasTranslatedCategory ? translatedCategory : localizeCategory(product.category)
  }
}

function lockPageScroll() {
  if (!import.meta.client) {
    return
  }

  document.documentElement.classList.add('merchandise-checkout-open')
  document.body.classList.add('merchandise-checkout-open')
}

function unlockPageScroll() {
  if (!import.meta.client) {
    return
  }

  document.documentElement.classList.remove('merchandise-checkout-open')
  document.body.classList.remove('merchandise-checkout-open')
}

function readMerchandiseProductsFromStorage() {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = localStorage.getItem(MERCHANDISE_PRODUCTS_STORAGE_KEY)
    const savedAt = Number(localStorage.getItem(MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY) || 0)

    if (!raw || !savedAt) {
      return []
    }

    const isExpired = Date.now() - savedAt > MERCHANDISE_PRODUCTS_CACHE_MAX_AGE
    if (isExpired) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveMerchandiseProductsToStorage(productList) {
  if (!import.meta.client || !Array.isArray(productList)) {
    return
  }

  try {
    localStorage.setItem(MERCHANDISE_PRODUCTS_STORAGE_KEY, JSON.stringify(productList))
    localStorage.setItem(MERCHANDISE_PRODUCTS_STORAGE_TIME_KEY, String(Date.now()))
  } catch {
    // localStorage 可能因为隐私模式或容量限制失败，失败时不影响页面正常显示。
  }
}

function applyMerchandiseProducts(productList) {
  const normalizedProducts = Array.isArray(productList) ? productList : []

  merchandiseCache.value = normalizedProducts

  if (normalizedProducts.length) {
    merchandisePreloaded.value = true
    pending.value = false
    error.value = null
    saveMerchandiseProductsToStorage(normalizedProducts)
  }
}

function syncMerchandiseStock(merchandiseId, stock) {
  const nextStock = Number(stock)

  if (!merchandiseId || !Number.isFinite(nextStock)) {
    return
  }

  const updatedProducts = merchandiseCache.value.map((product) => {
    if (product.id !== merchandiseId) {
      return product
    }

    return {
      ...product,
      stock: nextStock
    }
  })

  merchandiseCache.value = updatedProducts
  saveMerchandiseProductsToStorage(updatedProducts)

  if (selectedProduct.value?.id === merchandiseId) {
    selectedProduct.value = {
      ...selectedProduct.value,
      stock: nextStock
    }
  }
}

function restoreMerchandiseProductsFromStorage() {
  if (merchandiseCache.value.length) {
    pending.value = false
    error.value = null
    return
  }

  const cachedProducts = readMerchandiseProductsFromStorage()

  if (cachedProducts.length) {
    merchandiseCache.value = cachedProducts
    merchandisePreloaded.value = true
    pending.value = false
    error.value = null
  }
}

async function loadMerchandiseProducts() {
  const hasVisibleProducts = merchandiseCache.value.length > 0

  if (hasVisibleProducts) {
    pending.value = false
    error.value = null
  } else {
    pending.value = true
    error.value = null
  }

  if (merchandisePreloading.value) {
    return
  }

  try {
    merchandisePreloading.value = true
    const data = await $fetch('/api/merchandise')

    applyMerchandiseProducts(data)
  } catch (err) {
    if (!hasVisibleProducts) {
      error.value = err
      merchandisePreloaded.value = false
    }
  } finally {
    pending.value = false
    merchandisePreloading.value = false
  }
}

function clearSensitivePayment() {
  cardNumber.value = ''
  cardPassword.value = ''
}

function resetOrderSubmitState() {
  orderSubmitting.value = false
  orderError.value = ''
}

function openCheckout(product) {
  selectedProduct.value = product
  checkoutStep.value = 'order'
  quantity.value = 1
  customerName.value = ''
  deliveryAddress.value = ''
  paymentMethod.value = 'card'
  resetOrderSubmitState()
  clearSensitivePayment()
}

function closeCheckout() {
  resetOrderSubmitState()
  clearSensitivePayment()
  checkoutEffectsVisible.value = false
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

async function completePayment() {
  if (!canCompletePayment.value || orderSubmitting.value || !selectedProduct.value) {
    return
  }

  try {
    orderSubmitting.value = true
    orderError.value = ''

    const result = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        merchandiseId: selectedProduct.value.id,
        quantity: normalizedQuantity.value,
        name: customerName.value.trim(),
        address: deliveryAddress.value.trim(),
        paymentMethod: paymentMethod.value
      }
    })

    syncMerchandiseStock(result?.merchandise?.id, result?.merchandise?.stock)
    clearSensitivePayment()
    checkoutStep.value = 'done'
  } catch (err) {
    orderError.value = err?.statusCode === 409
      ? 'Not enough stock for this order.'
      : 'Order submission failed. Please try again.'
  } finally {
    orderSubmitting.value = false
  }
}

function skipHomeIntroOnce() {
  if (!import.meta.client) {
    return
  }

  try {
    sessionStorage.setItem('atriSkipIntro', '1')
    sessionStorage.setItem('atriSkipHomeIntroOnce', '1')
    sessionStorage.setItem('introPlayed', 'true')
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
    router.replace(returnTarget)
    return
  }

  router.replace('/')
}

onBeforeRouteLeave((to) => {
  unlockPageScroll()

  if (to.path === '/') {
    skipHomeIntroOnce()
  }
})
</script>

<template>
  <main class="merchandise-page relative min-h-screen overflow-x-hidden bg-white px-6 py-8 text-[#102a3a] md:px-12 lg:px-[7.2vw]">
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
      :aria-label="t('merchandise.back.aria')"
      @click="goBack"
    >
      <span class="back-button-icon" aria-hidden="true" />
      <span class="back-button-copy">
        <span class="back-button-text">{{ t('merchandise.back.main') }}</span>
        <span class="back-button-sub">{{ t('merchandise.back.sub') }}</span>
      </span>
    </button>

    <div
      v-if="selectedProduct"
      ref="checkoutOverlayRef"
      class="checkout-overlay fixed inset-0 z-[60] overflow-hidden bg-[#f7fcfe]"
    >
      <section
        class="checkout-dialog relative h-[100dvh] w-full overflow-hidden px-5 py-3 text-[#21485d] md:px-8 lg:px-10"
        role="dialog"
        aria-modal="true"
        :aria-label="t('merchandise.checkout.dialog', { product: selectedProduct.name })"
      >
        <div v-if="checkoutEffectsVisible" class="checkout-bubbles" aria-hidden="true">
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
          :aria-label="t('merchandise.checkout.close')"
          @click="closeCheckout"
        >
          <span class="absolute h-[2px] w-5 rotate-45 rounded-full bg-current" />
          <span class="absolute h-[2px] w-5 -rotate-45 rounded-full bg-current" />
        </button>

        <div class="relative z-[1] mx-auto max-w-[1180px] pr-14 text-center md:px-12">
          <p class="text-xs font-black tracking-[0.22em] text-[#2f9ecd]">{{ t('merchandise.store') }}</p>
          <h2 class="mx-auto mt-1 max-w-[780px] text-[clamp(26px,3.2vw,42px)] font-black leading-tight text-[#21485d]">
            {{ selectedProduct.name }}
          </h2>
        </div>

        <div v-if="checkoutStep !== 'done'" class="checkout-main relative z-[1] mx-auto mt-5 grid max-w-[1280px] gap-7 lg:grid-cols-[1fr_380px]">
          <div class="checkout-left min-w-0">
            <div class="checkout-image checkout-image-frame mx-auto flex w-full max-w-[780px] items-center justify-center border-[5px] border-[#79d7f0] bg-white/96 p-5 shadow-[0_24px_60px_rgba(79,176,207,0.16)] md:p-8">
              <img
                :src="selectedProduct.imageUrl"
                :alt="selectedProduct.name"
                class="h-full w-full object-contain"
                decoding="async"
              >
            </div>

            <div class="mt-6 grid gap-3 text-sm font-bold text-[#21485d] sm:grid-cols-3">
              <div class="checkout-fact">
                <span>{{ t('merchandise.category') }}</span>
                <strong>{{ selectedProduct.category }}</strong>
              </div>
              <div class="checkout-fact">
                <span>{{ t('merchandise.price') }}</span>
                <strong>{{ selectedProduct.priceDisplay }}</strong>
              </div>
              <div class="checkout-fact">
                <span>{{ t('merchandise.stock') }}</span>
                <strong>{{ selectedProduct.stock ?? t('merchandise.available') }}</strong>
              </div>
            </div>
          </div>

          <aside class="checkout-panel h-full min-h-0 border-[4px] border-[#79d7f0] bg-white/88 p-5 shadow-[0_18px_42px_rgba(79,176,207,0.16)] backdrop-blur">
            <div v-if="checkoutStep === 'order'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">{{ t('merchandise.step.orderCode') }}</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">{{ t('merchandise.step.order') }}</h3>

              <div class="mt-6 flex items-center justify-between gap-4 border-b border-[#c9edf8] pb-5">
                <span class="text-sm font-black text-[#21485d]">{{ t('merchandise.quantity') }}</span>
                <div class="flex h-11 items-center overflow-hidden rounded-full border-2 border-[#79d7f0] bg-[#e8f9ff]">
                  <button
                    type="button"
                    class="h-full w-11 text-xl font-black transition hover:bg-[#d7f3fb]"
                    :aria-label="t('merchandise.quantity.decrease')"
                    @click="decreaseQuantity"
                  >
                    -
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    inputmode="numeric"
                    :aria-label="t('merchandise.quantity.aria')"
                    class="checkout-quantity-input"
                    @blur="normalizeQuantity"
                    @change="normalizeQuantity"
                  >
                  <button
                    type="button"
                    class="h-full w-11 text-xl font-black transition hover:bg-[#d7f3fb]"
                    :aria-label="t('merchandise.quantity.increase')"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="mt-5 flex items-end justify-between gap-4">
                <span class="text-sm font-black text-[#21485d]">{{ t('merchandise.subtotal') }}</span>
                <strong class="text-2xl font-black text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
              </div>

              <button
                type="button"
                class="checkout-primary mt-7"
                @click="goToConfirm"
              >
                {{ t('merchandise.confirmOrder') }}
              </button>

              <div class="checkout-info-grid mt-7 grid gap-3 text-sm font-bold text-[#21485d]">
                <div class="checkout-fact">
                  <span>{{ t('merchandise.category') }}</span>
                  <strong>{{ selectedProduct.category }}</strong>
                </div>
                <div class="checkout-fact">
                  <span>{{ t('merchandise.price') }}</span>
                  <strong>{{ selectedProduct.priceDisplay }}</strong>
                </div>
                <div class="checkout-fact">
                  <span>{{ t('merchandise.stock') }}</span>
                  <strong>{{ t('merchandise.available') }}</strong>
                </div>
              </div>
            </div>

            <div v-else-if="checkoutStep === 'confirm'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">{{ t('merchandise.step.confirmCode') }}</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">{{ t('merchandise.step.confirm') }}</h3>

              <button type="button" class="checkout-back-link mt-4" @click="backCheckoutStep">
                <span aria-hidden="true">←</span>
                {{ t('merchandise.back') }}
              </button>

              <label class="checkout-label mt-6">
                <span>{{ t('merchandise.name') }}</span>
                <input v-model="customerName" type="text" autocomplete="name" :placeholder="t('merchandise.namePlaceholder')">
              </label>

              <label class="checkout-label mt-4">
                <span>{{ t('merchandise.address') }}</span>
                <textarea v-model="deliveryAddress" rows="4" :placeholder="t('merchandise.addressPlaceholder')" />
              </label>

              <div class="mt-5 space-y-3 border-t border-[#c9edf8] pt-5 text-sm font-bold text-[#21485d]">
                <div class="flex justify-between gap-4">
                  <span>{{ t('merchandise.product') }}</span>
                  <strong class="text-right">{{ selectedProduct.name }}</strong>
                </div>
                <div class="flex justify-between gap-4">
                  <span>{{ t('merchandise.quantity') }}</span>
                  <strong>x {{ quantity }}</strong>
                </div>
                <div class="flex justify-between gap-4">
                  <span>{{ t('merchandise.total') }}</span>
                  <strong class="text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
                </div>
              </div>

              <div class="mt-7 grid grid-cols-2 gap-3">
                <button type="button" class="checkout-secondary checkout-bottom-back" @click="backCheckoutStep">
                  {{ t('merchandise.back') }}
                </button>
                <button
                  type="button"
                  class="checkout-primary"
                  :disabled="!canConfirmOrder"
                  @click="goToPay"
                >
                  {{ t('merchandise.goToPay') }}
                </button>
              </div>
            </div>

            <div v-else-if="checkoutStep === 'pay'">
              <p class="text-xs font-black tracking-[0.18em] text-[#2f9ecd]">{{ t('merchandise.step.paymentCode') }}</p>
              <h3 class="mt-2 text-2xl font-black text-[#21485d]">{{ t('merchandise.step.payment') }}</h3>

              <button type="button" class="checkout-back-link mt-4" @click="backCheckoutStep">
                <span aria-hidden="true">←</span>
                {{ t('merchandise.back') }}
              </button>

              <div class="mt-6 space-y-3">
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'card' }">
                  <input v-model="paymentMethod" type="radio" value="card">
                  <span>{{ t('merchandise.creditCard') }}</span>
                </label>
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'wallet' }">
                  <input v-model="paymentMethod" type="radio" value="wallet">
                  <span>{{ t('merchandise.wallet') }}</span>
                </label>
                <label class="payment-option" :class="{ 'payment-option-active': paymentMethod === 'cod' }">
                  <input v-model="paymentMethod" type="radio" value="cod">
                  <span>{{ t('merchandise.cod') }}</span>
                </label>
              </div>

              <div v-if="paymentMethod === 'card'" class="checkout-card-fields mt-5">
                <label class="checkout-label">
                  <span>{{ t('merchandise.cardNumber') }}</span>
                  <input
                    v-model="cardNumber"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="23"
                    :placeholder="t('merchandise.cardNumberPlaceholder')"
                  >
                </label>

                <label class="checkout-label mt-4">
                  <span>{{ t('merchandise.password') }}</span>
                  <input
                    v-model="cardPassword"
                    type="password"
                    autocomplete="new-password"
                    maxlength="12"
                    :placeholder="t('merchandise.passwordPlaceholder')"
                  >
                </label>

                <p class="checkout-security-note mt-3">
                  {{ t('merchandise.securityNote') }}
                </p>
              </div>

              <div class="mt-6 rounded-[8px] bg-[#e8f9ff] p-4">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-black text-[#21485d]">{{ t('merchandise.amountDue') }}</span>
                  <strong class="text-2xl font-black text-[#2f9ecd]">{{ totalPriceDisplay }}</strong>
                </div>
              </div>

              <p v-if="orderError" class="mt-4 rounded-[8px] bg-[#fff1f3] px-4 py-3 text-sm font-black text-[#d45b6a]">
                {{ orderError }}
              </p>

              <div class="mt-7 grid grid-cols-2 gap-3">
                <button type="button" class="checkout-secondary" @click="backCheckoutStep">
                  {{ t('merchandise.back') }}
                </button>
                <button
                  type="button"
                  class="checkout-primary"
                  :disabled="!canCompletePayment || orderSubmitting"
                  @click="completePayment"
                >
                  {{ orderSubmitting ? '提交中...' : t('merchandise.payNow') }}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div v-else class="checkout-done relative z-[1] mx-auto mt-8 max-w-[760px] border-[4px] border-[#79d7f0] bg-white/90 p-8 text-center shadow-[0_18px_42px_rgba(79,176,207,0.16)] backdrop-blur">
          <p class="text-xs font-black tracking-[0.22em] text-[#2f9ecd]">{{ t('merchandise.step.doneCode') }}</p>
          <h3 class="mt-3 text-[clamp(28px,5vw,46px)] font-black text-[#21485d]">{{ t('merchandise.step.done') }}</h3>
          <p class="mx-auto mt-4 max-w-[520px] text-sm font-bold leading-7 text-[#21485d]">
            {{ t('merchandise.doneBody') }}
          </p>
          <button type="button" class="checkout-primary mx-auto mt-7 max-w-[260px]" @click="closeCheckout">
            {{ t('merchandise.doneButton') }}
          </button>
        </div>
      </section>
    </div>

    <header class="relative z-10 mx-auto max-w-[1120px] pt-16 md:pt-14 lg:pt-12">
      <div class="flex items-end gap-4">
        <h1 class="text-[clamp(56px,8vw,104px)] font-black leading-none tracking-[0.02em] text-[#5fb8d7]">
          {{ t('merchandise.title') }}
        </h1>
        <span class="mb-3 text-sm font-bold tracking-[0.12em] text-[#4fb0cf]">
          {{ t('merchandise.subtitle') }}
        </span>
      </div>
    </header>

    <section class="relative z-10 mx-auto mt-12 max-w-[1120px]">
      <div class="catalog-accent" aria-hidden="true">
        <span class="catalog-accent-line" />
        <span class="catalog-accent-mark">{{ t('merchandise.itemsCount') }}</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">{{ t('merchandise.officialGoods') }}</span>
        <span class="catalog-accent-diamond" />
        <span class="catalog-accent-mark">{{ t('merchandise.atriStore') }}</span>
        <span class="catalog-accent-line" />
      </div>

      <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <template v-if="pending">
          <article
            v-for="index in 6"
            :key="`skeleton-${index}`"
            class="product-card pointer-events-none flex min-h-[430px] flex-col rounded-[14px] border-2 border-b-[6px] border-l-[6px] border-[#d3eef4] bg-white p-6 shadow-[0_4px_14px_rgba(91,174,201,0.08)]"
          >
            <div class="flex aspect-square items-center justify-center overflow-hidden rounded-[9px] border-2 border-[#dff2f6] bg-[#f7fcfe] p-3">
              <div class="h-full w-full animate-pulse rounded-[8px] bg-[#e8f9ff]"></div>
            </div>

            <div class="mt-4 flex flex-1 flex-col px-3 py-4">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b7e8f4]"></span>
                <span class="h-4 w-24 animate-pulse rounded-full bg-[#d7f3fb]"></span>
              </div>

              <div class="mt-5 space-y-3">
                <div class="h-5 w-full animate-pulse rounded-full bg-[#e8f9ff]"></div>
                <div class="h-5 w-4/5 animate-pulse rounded-full bg-[#e8f9ff]"></div>
                <div class="h-5 w-2/3 animate-pulse rounded-full bg-[#e8f9ff]"></div>
              </div>

              <div class="mt-auto pt-5">
                <div class="h-4 w-32 animate-pulse rounded-full bg-[#d7f3fb]"></div>
                <div class="mt-5 h-11 w-full animate-pulse rounded-full bg-[#b7e8f4]"></div>
              </div>
            </div>
          </article>
        </template>

        <div v-else-if="error" class="col-span-full py-20 text-center font-bold text-[#d45b6a]">
          {{ t('merchandise.loadError') }}
        </div>

        <article
          v-else
          v-for="(product, index) in products"
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
              decoding="async"
              :loading="index < 3 ? 'eager' : 'lazy'"
              :fetchpriority="index < 3 ? 'high' : 'low'"
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
              {{ t('merchandise.order') }}
            </span>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.checkout-overlay {
  position: fixed;
  inset: 0;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden !important;
}

:global(html.merchandise-checkout-open),
:global(body.merchandise-checkout-open) {
  overflow: hidden;
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

.checkout-main {
  height: calc(100dvh - 140px);
  min-height: 0;
  align-items: stretch;
}

.checkout-left {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.checkout-image-frame {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 24px;
}

.checkout-image img {
  max-height: 100%;
  object-fit: contain;
}

.checkout-info-grid {
  flex: 0 0 auto;
}

.checkout-panel,
.checkout-done {
  border-radius: 18px;
}

.checkout-panel {
  overflow: hidden;
}

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
    transform: translate3d(-50%, 0, 0);
  }

  to {
    transform: translate3d(-50%, -50%, 0);
  }
}

@keyframes side-caption-down {
  from {
    transform: translate3d(-50%, -50%, 0);
  }

  to {
    transform: translate3d(-50%, 0, 0);
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
  will-change: transform;
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
  content-visibility: auto;
  contain-intrinsic-size: 430px;
  transition:
    background-color 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card:hover {
  border-color: #79d7f0;
  background-color: #e8f9ff;
  box-shadow: 0 14px 30px rgba(79, 176, 207, 0.18);
  transform: translateY(-4px) scale(1.015);
}

.product-card:focus-visible {
  outline: 4px solid rgba(121, 215, 240, 0.72);
  outline-offset: 4px;
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
  .checkout-bubbles span,
  .side-caption-track-up,
  .side-caption-track-down {
    animation: none;
    transform: translateY(-22vh);
  }
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
  display: inline-flex;
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

.checkout-close:focus-visible,
.checkout-primary:focus-visible,
.checkout-secondary:focus-visible,
.payment-option:focus-within {
  outline: 4px solid rgba(121, 215, 240, 0.28);
  outline-offset: 3px;
}

@media (max-height: 820px) and (min-width: 1024px) {
  .checkout-main {
    height: calc(100dvh - 128px);
  }

  .checkout-image-frame {
    border-radius: 22px;
  }

  .checkout-info-grid {
    margin-top: 10px;
  }

  .checkout-fact {
    padding: 10px 12px;
  }

  .checkout-primary,
  .checkout-secondary {
    min-height: 48px;
  }

  .payment-option {
    min-height: 48px;
  }
}

@media (max-width: 1023px) {
  .checkout-main {
    height: calc(100dvh - 124px);
    grid-template-columns: 1fr;
  }

  .checkout-panel {
    display: none;
  }

  .checkout-image-frame {
    max-width: 760px;
  }
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

  .checkout-main {
    height: calc(100dvh - 112px);
  }

  .checkout-info-grid {
    display: none;
  }
}

@media (min-width: 1280px) {
  .side-caption {
    display: block;
  }
}
</style>
