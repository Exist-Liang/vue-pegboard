<template>
  <div class="board-container">
    <PegboardGrid
  ref="pegboardRef"
  :widgets="widgets"
  :columns="columns"
  :drag-enabled="expanded"
  @update:widgets="(val) => (widgets = val)"
  @delete-widget="deleteWidget"
/>
  </div>
</template>

<script setup>
import { ref, inject, reactive, provide, onMounted, onUnmounted, watch, computed } from 'vue'
import PegboardGrid from '../components/PegboardGrid.vue'
import { widgetMetadata } from '@/components/widgets/registry.js'
import { widgetSizes } from '@/data/widgetTypes.js'
import { applyImportData } from '@/scripts/exportData.js'

// ===== 状态初始化 =====
const expanded = ref(false)
const pendingMoveWidget = ref(null)
const pendingPlacement = ref(null)

provide('pendingMoveWidget', pendingMoveWidget)
provide('pegboardExpanded', expanded)
provide('pendingPlacement', pendingPlacement)

const pegboardRef = ref(null)
const auth = inject('auth')

// ===== 响应式窗口宽度 =====
const windowWidth = ref(window.innerWidth)
const currentLayout = computed(() => {
  if (windowWidth.value >= 1200) return 'large'
  if (windowWidth.value >= 768) return 'medium'
  return 'small'
})

// ===== 三套布局缓存 =====
const layoutCache = reactive({
  large: [],
  medium: [],
  small: []
})
provide('layoutCache', layoutCache)
// widgets 自动随 currentLayout 切换
const widgets = computed({
  get: () => layoutCache[currentLayout.value],
  set: (val) => layoutCache[currentLayout.value] = val
})

provide('widgets', widgets)

// columns 根据 currentLayout 决定
const columns = computed(() => {
  if (currentLayout.value === 'large') return 8
  if (currentLayout.value === 'medium') return 5
  return 3
})

// widgetLocks 提供给子组件
const widgetLocks = reactive({})
for (const type in widgetMetadata) {
  widgetLocks[type] = { isNextLocked: false }
}
provide('widgetLocks', widgetLocks)

// ===== 创建组件函数 =====
function createWidget(type, x = 1, y = 1, sizeKey = null) {
  const meta = widgetMetadata[type]
  const resolvedSizeKey = sizeKey || meta?.sizeOptions?.[0] || 'S'
  const id = `${type}-${resolvedSizeKey}-${Date.now()}`
  const size = widgetSizes[resolvedSizeKey] || { w: 1, h: 1 }

  return {
    id,
    renderKey: `${id}-render`,
    type,
    sizeKey: resolvedSizeKey,
    x,
    y,
    w: size.w,
    h: size.h
  }
}


// ===== 删除组件 =====
const deleteWidget = (id) => {
  const index = widgets.value.findIndex(w => w.id === id)
  if (index === -1) {
    console.warn('❌ 删除失败，未找到 ID:', id)
    return
  }

  const widget = widgets.value[index]

  if (widget?.type === 'LoginWidget') {
    auth?.logout()
    console.log('🔒 已登出：LoginWidget 被删除')
  }

  widgets.value = widgets.value.filter(w => w.id !== id)
  console.log('✅ 删除成功:', id)
}

// ===== 初始化缓存或默认布局 =====
function getDefaultLayout(sizeKey) {
  if (sizeKey === 'large') {
    return [
      createWidget('LoginWidget', 1, 1),
      createWidget('WidgetSelectorWidget', 1, 2),
      createWidget('ImportExportWidget', 0, 0),
    ]
  }
  if (sizeKey === 'medium') {
    return [
      createWidget('LoginWidget', 1, 1),
      createWidget('WidgetSelectorWidget', 1, 2),
      createWidget('ImportExportWidget', 0, 0),
    ]
  }
  if (sizeKey === 'small') {
    return [
      createWidget('LoginWidget', 0, 0),
      createWidget('WidgetSelectorWidget', 0, 1),
      createWidget('ImportExportWidget', 2, 0),
    ]
  }
  return []
}

// ===== 本地缓存持久化 =====
const storageKey = computed(() => `dashboard-layout-${auth?.currentUser?.value || 'guest'}-${currentLayout.value}`)

const isImportingLayout = ref(false)  

watch(() => layoutCache[currentLayout.value], (newVal) => {
  if (isImportingLayout.value) return  
  localStorage.setItem(storageKey.value, JSON.stringify(newVal))
}, { deep: true })

const handleImportData = (data) => {
  isImportingLayout.value = true
  applyImportData({ data, auth, layoutCache })
  isImportingLayout.value = false
}
provide('handleImportData', handleImportData)
// ===== 窗口大小监听 & 初始化 =====
onMounted(() => {
  const updateWidth = () => windowWidth.value = window.innerWidth
  window.addEventListener('resize', updateWidth)
  updateWidth()

  const userId = auth?.currentUser?.value || 'guest';

  ['large', 'medium', 'small'].forEach(sizeKey => {
    const cache = localStorage.getItem(`dashboard-layout-${userId}-${sizeKey}`)
    if (cache) {
      layoutCache[sizeKey] = JSON.parse(cache)
    } else {
      layoutCache[sizeKey] = getDefaultLayout(sizeKey)
    }
  })

  watch(windowWidth, () => {
    pendingPlacement.value = null
    pendingMoveWidget.value = null
    console.log('Switched to layout:', currentLayout.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => windowWidth.value = window.innerWidth)
})
</script>

<style scoped>
.board-container {
  overflow-x: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (min-width: 1200px) {
  .board-container {
    max-width: calc(8 * 156px);
    overflow-x: visible;
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .board-container {
    max-width: calc(5 * 156px);
  }
}
@media (max-width: 767px) {
  .board-container {
    max-width: calc(3 * 156px);
  }
}
</style>


<style scoped>
.board-container {
  overflow-x: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 保持原有响应式宽度限制 */
@media (min-width: 1200px) {
  .board-container {
    max-width: calc(8 * 156px);
    overflow-x: visible;
  }
}
@media (min-width: 768px) and (max-width: 1199px) {
  .board-container {
    max-width: calc(5 * 156px);
  }
}
@media (max-width: 767px) {
  .board-container {
    max-width: calc(3 * 156px);
  }
}
</style>

<script>
export default {
  name: 'DashboardPage'
}
</script>
