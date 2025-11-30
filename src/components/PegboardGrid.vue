<template>
  <div
    ref="boardRef"
    class="grid-board"
    :style="{
      width: boardWidth + 'px',
      marginLeft: '24px',
      gridTemplateColumns: `repeat(${currentColumns}, 140px)`,
      '--grid-columns': currentColumns,
  gridTemplateColumns: `repeat(${currentColumns}, 140px)`,
  width: '100%',
  marginLeft: '16px'
    }"
    @click="handleGridClick"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    
  >
    <!-- 网格线 -->
    <template v-for="rowIndex in currentRows" :key="`row-${rowIndex}`">
      <template v-for="colIndex in currentColumns" :key="`cell-${rowIndex}-${colIndex}`">
        <div
          class="grid-line"
          :style="{
            gridColumn: colIndex,
            gridRow: rowIndex
          }"
        />
      </template>
    </template>

    <!-- 预览框 -->
    <div
  class="preview-box"
  :class="{ hidden: !previewPlacement }"
  :style="previewBoxStyle"
/>

    <!-- 控件渲染 -->
     
    <div
  v-for="(widget, index) in validWidgets"
  :key="widget.renderKey"
  :data-id="widget.id"
  class="widget widget-fade"
  :class="{
  'highlight-error': highlightIndices.includes(index),
  'draggable-enabled': expanded && !['WidgetSelectorWidget', 'IndieTextWidget'].includes(widget.type),
  'moving-selected': pendingMoveWidget?.id === widget.id
}"
  :style="{
    gridColumn: `${widget.x + 1} / span ${widget.w}`,
    gridRow: `${widget.y + 1} / span ${widget.h}`
  }"
  @click.stop
>
  <component
    :is="widgetRegistry[widget.type]"
    v-bind="{ ...widget, ...(widget.props || {}) }"
    @delete-widget="$emit('delete-widget', widget.id)"
    @resize-widget="handleResizeWidget"
    @request-move="handleRequestMove"
  />
  <transition name="rise-fade" mode="out-in">
    <div v-if="expanded && !['WidgetSelectorWidget', 'IndieTextWidget'].includes(widget.type)" class="widget-overlay">
    <div class="widget-sticker">
  {{ widgetMetadata[widget.type]?.icon || '📦' }}
</div>
<button 
  v-if="widget.type !== 'LoginWidget'" 
  class="delete-btn" 
  @click="$emit('delete-widget', widget.id)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="3" width="18" height="3" fill="#ccc" stroke="#333"/>
<circle cx="6" cy="4.5" r="0.5" fill="#333"/>
<circle cx="12" cy="4.5" r="0.5" fill="#333"/>
<circle cx="18" cy="4.5" r="0.5" fill="#333"/>
<rect x="4" y="6" width="16" height="16" rx="2" ry="2" fill="#fff" stroke="#333"/>
<line x1="9" y1="10" x2="9" y2="18"/>
<line x1="15" y1="10" x2="15" y2="18"/>
</svg>

</button>
    <button class="move-btn" @click="handleClickMove(widget)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<line x1="12" y1="2" x2="12" y2="22"/>
<line x1="2" y1="12" x2="22" y2="12"/>
<polyline points="12 2, 8 6, 16 6, 12 2"/>
<polyline points="12 22, 8 18, 16 18, 12 22"/>
<polyline points="2 12, 6 8, 6 16, 2 12"/>
<polyline points="22 12, 18 8, 18 16, 22 12"/>
</svg>
</button>
  </div>
</transition>
</div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, inject} from 'vue'
import { widgetSizes } from '../data/widgetTypes.js'
import { widgetMetadata, widgetRegistry } from '@/components/widgets/registry.js'
import { showClickPreview, removeClickPreview } from '@/scripts/useClickPreview.js'
import { useGridPositioning } from '@/scripts/useGridPositioning.js'

const pendingPlacement = inject('pendingPlacement')
const expanded = inject('pegboardExpanded', ref(false))


const cellSize = 140
const cellGap = 16

const props = defineProps({
  widgets: Array,
  columns: Number,
  rows: Number
})

const emit = defineEmits(['update:widgets', 'delete-widget'])

const highlightIndices = ref([])
const previewPlacement = ref(null)
const pendingMoveWidget = inject('pendingMoveWidget') 

const widgets = computed({
  get: () => props.widgets,
  set: (val) => emit('update:widgets', val)
})

const validWidgets = computed(() =>
  widgets.value.filter(w => w && typeof w.w === 'number' && typeof w.h === 'number')
)

const currentColumns = computed(() => props.columns)
const currentRows = computed(() => props.rows || 6)
const boardRef = ref(null)

const { step } = useGridPositioning(currentColumns, currentRows, cellSize, cellGap)

const boardWidth = computed(() =>
  currentColumns.value * 140 + (currentColumns.value - 1) * 16
)

const snapToBounds = (x, y, w, h) => {
  const maxX = currentColumns.value - w
  const maxY = currentRows.value - h
  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  }
}

const checkOverlap = (x, y, w, h, excludeId = null) => {
  return widgets.value.findIndex((wgt) => {
    if (excludeId && wgt.id === excludeId) return false
    const withinX = x < wgt.x + wgt.w && x + w > wgt.x
    const withinY = y < wgt.y + wgt.h && y + h > wgt.y
    return withinX && withinY
  })
}

function placeWidget(payload, pointerX, pointerY) {
  const { type, sizeKey, id, renderKey } = payload
  if (!type || !sizeKey || !id || !renderKey) return

  const size = widgetSizes[sizeKey] || { w: 1, h: 1 }
  let x = Math.round(pointerX - size.w / 2)
  let y = Math.round(pointerY - size.h / 2)
  const snapped = snapToBounds(x, y, size.w, size.h)
  x = snapped.x
  y = snapped.y

  const isLoginOrSelector = type === 'LoginWidget' || type === 'WidgetSelectorWidget'

  // ✅ 检查是否已有该类型组件
  if (isLoginOrSelector && !pendingMoveWidget.value) {
    const existingWidgetIndex = widgets.value.findIndex(w => w.type === type)
    if (existingWidgetIndex !== -1) {
      // 如果面板上已存在该组件，禁止添加并触发晃动动画
      highlightIndices.value = [existingWidgetIndex]
      setTimeout(() => (highlightIndices.value = []), 2000)  // 晃动效果
      return
    }
  }

  // 如果是移动组件，继续执行移动逻辑
  if (pendingMoveWidget.value) {
    const targetIndex = widgets.value.findIndex(w => w.id === pendingMoveWidget.value.id)
    if (targetIndex !== -1) {
      // 强制检查是否目标区域已被其他组件占据（不管大小）
      const overlapIndex = checkOverlap(x, y, size.w, size.h, pendingMoveWidget.value.id)
      if (overlapIndex >= 0) {
        highlightIndices.value = [overlapIndex]
        setTimeout(() => (highlightIndices.value = []), 2000)
        return
      }

      // 直接移动
      widgets.value[targetIndex].x = x
      widgets.value[targetIndex].y = y
      pendingMoveWidget.value = null
      return
    }
  }

  // 继续执行添加组件逻辑
  const overlapIndex = checkOverlap(x, y, size.w, size.h)
  if (overlapIndex >= 0) {
    highlightIndices.value = [overlapIndex]
    setTimeout(() => (highlightIndices.value = []), 2000)
    return
  }

  // 只有当没有被禁止的组件时，才添加
  if (!isLoginOrSelector) {
    widgets.value.push({
      ...payload,
      x,
      y
    })
  }
}



function handleMouseMove(event) {
  const rect = boardRef.value.getBoundingClientRect()
  const pointerX = (event.clientX - rect.left) / step.value
  const pointerY = (event.clientY - rect.top) / step.value

  let activeData = pendingPlacement.value || pendingMoveWidget.value
  if (!activeData) {
    previewPlacement.value = null  // 没有数据时隐藏
    return
  }

  const { sizeKey } = activeData
  const size = widgetSizes[sizeKey] || { w: 1, h: 1 }

  let x = Math.round(pointerX - size.w / 2)
  let y = Math.round(pointerY - size.h / 2)

  const snapped = snapToBounds(x, y, size.w, size.h)


  previewPlacement.value = {
    x: snapped.x,
    y: snapped.y,
    w: size.w,
    h: size.h
  }
}
function handleMouseLeave() {
  previewPlacement.value = null
}

function handleClickMove(widget) {
  pendingMoveWidget.value = widget
  const { icon } = widgetMetadata[widget.type] || { icon: '📦' }
  showClickPreview({
    icon,
    width: widget.w * 40,
    height: widget.h * 40
  })
}



function handleGridClick(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const pointerX = (event.clientX - rect.left) / step.value
  const pointerY = (event.clientY - rect.top) / step.value

  if (pendingMoveWidget.value) {
    placeWidget(pendingMoveWidget.value, pointerX, pointerY)  
    pendingMoveWidget.value = null
    removeClickPreview()
    previewPlacement.value = null
  } else if (pendingPlacement.value) {
    placeWidget(pendingPlacement.value, pointerX, pointerY)
    pendingPlacement.value = null
    removeClickPreview()
    previewPlacement.value = null
  }
}

const previewBoxStyle = computed(() => {
  if (!previewPlacement.value) {
    return {
      transform: `translate(0, 0)`,
      width: '0px',
      height: '0px'
    }
  }

  const px = previewPlacement.value.x * step.value
  const py = previewPlacement.value.y * step.value
  const width = previewPlacement.value.w * cellSize + (previewPlacement.value.w - 1) * cellGap
  const height = previewPlacement.value.h * cellSize + (previewPlacement.value.h - 1) * cellGap

  return {
    transform: `translate(${px}px, ${py}px)`,
    width: `${width}px`,
    height: `${height}px`
  }
})

function handleResizeWidget({ id, nextSizeKey }) {
  console.log('📐 Received the adjustment request.：', id, nextSizeKey)
  const index = widgets.value.findIndex(w => w.id === id)
  if (index === -1) return

  const widget = widgets.value[index]
  const nextSize = widgetSizes[nextSizeKey] || { w: 2, h: 2 }

  if (nextSize.w > widget.w || nextSize.h > widget.h) {
  const isOutOfBounds =
    widget.x + nextSize.w > currentColumns.value ||
    widget.y + nextSize.h > currentRows.value

  const overlapIndex = checkOverlap(widget.x, widget.y, nextSize.w, nextSize.h, widget.id)

  if (isOutOfBounds || overlapIndex >= 0) {
    highlightIndices.value = [overlapIndex].filter(i => i >= 0) 
    setTimeout(() => (highlightIndices.value = []), 1500)
    return
  }
}

  widget.sizeKey = nextSizeKey
  widget.w = nextSize.w
  widget.h = nextSize.h
  widget.renderKey = `${widget.id}-resized-${Date.now()}`
}

function handleRequestMove(id) {
  const widget = widgets.value.find(w => w.id === id)
  if (!widget) {
    console.warn('❌ The component cannot be found. Unable to enter mobile mode.')
    return
  }

  pendingMoveWidget.value = widget
  const { icon } = widgetMetadata[widget.type] || { icon: '📦' }

  showClickPreview({
    icon,
    width: widget.w * 40,
    height: widget.h * 40
  })

  console.log('🎯 已进入移动模式，等待点击放置：', id)
}
</script>

<style scoped>
.grid-board {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 140px);
  grid-auto-rows: 140px;
  gap: 16px;
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

.grid-line {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px dashed #cccccc;  
  background-color: #e6e6e6;   
  box-sizing: border-box;
  border-radius: 8px;
  z-index: 0;
  transition: border-color 0.3s ease;
}
.grid-line:hover {
  border-color: #007bff;
}

.widget {
  position: relative;
  z-index: 10;
  user-select: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: default;
  transform: none;
}

/* ✅ 保留可用状态下的上浮提示 */
.widget.draggable-enabled {
  transform: translateY(-6px);
}
.widget.draggable-enabled:hover {
  transform: translateY(-10px) scale(1.02);
}



/* 保留错误高亮与 shake 效果 */
.widget.highlight-error {
  background-color: rgba(255, 0, 0, 0.15) !important;
  animation: shake 1s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.preview-box {
  position: absolute;
  top: 0;
  left: 0;
  border: 2px dashed #003366;
  background-color: rgba(0, 64, 128, 0.08);
  border-radius: 6px;
  pointer-events: none;
  z-index: 2;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 1;
}

.preview-box.hidden {
  opacity: 0;
}



.widget-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #d2b48c 0%, #b8865b 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  pointer-events: auto;
  animation: riseFromBottom 0.5s ease-out;
  border-radius: 12px;

 
  box-shadow:
    inset 0 0 0 20px rgba(160, 120, 80, 1),
    inset 0 0 20px rgba(0, 0, 0, 1),
    0 6px 12px rgba(0, 0, 0, 0.3);

  border: none;


  background-image:
    linear-gradient(135deg, #d2b48c, #b8865b),
    repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 60px);;
  background-blend-mode: overlay, normal;
}

.widget-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  z-index: 2;
background:
    radial-gradient(circle at 50% 50%, #c0c0c0 0%, #999 60%, #666 100%) 0% 0%,
    radial-gradient(circle at 50% 50%, #c0c0c0 0%, #999 60%, #666 100%) 100% 0%,
    radial-gradient(circle at 50% 50%, #c0c0c0 0%, #999 60%, #666 100%) 0% 100%,
    radial-gradient(circle at 50% 50%, #c0c0c0 0%, #999 60%, #666 100%) 100% 100%;
  background-size: 32px 32px;
  background-repeat: no-repeat;
  background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}



.rise-fade-enter-active,
.rise-fade-leave-active {
  transition: all 0.5s ease;
}

.rise-fade-enter-from,
.rise-fade-leave-to {
  opacity: 1;
  transform: translateY(100%) scale(0.95);
}

.rise-fade-enter-to,
.rise-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}



/* 按钮保持高对比 */
.delete-btn {
  margin: 6px;
  padding: 10px 20px;
  background: linear-gradient(145deg, #ff4c4c, #cc0000);
  border: 2px solid #660000;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 0 #222;
  box-shadow: 0 4px 0 #333, 0 6px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
  font-family: 'Impact', sans-serif;
  letter-spacing: 1px;
  z-index: 1;
}

.delete-btn:hover {
  background: linear-gradient(145deg, #ff2222, #aa0000);
  filter: brightness(1.05);
  border-color: #440000;
  box-shadow: 0 3px 0 #222, 0 4px 8px rgba(0, 0, 0, 0.5);
}

.delete-btn:active {
  background: linear-gradient(145deg, #cc0000, #880000);
  transform: translateY(4px) scale(0.98);
  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.7);
  border-color: #220000;
  text-shadow: none;
}

/* 移动按钮：工业灰 */
.move-btn {
  margin: 6px;
  padding: 10px 20px;
  background: linear-gradient(145deg, #cccccc, #888888);
  border: 2px solid #444;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  color: #222;
  text-shadow: 0 1px 0 #fff;
  box-shadow: 0 4px 0 #333, 0 6px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
  font-family: 'Impact', sans-serif;
  letter-spacing: 1px;
  z-index: 1;
}

.move-btn:hover {
  background: linear-gradient(145deg, #dddddd, #777777);
  filter: brightness(1.05);
  border-color: #333;
  box-shadow: 0 3px 0 #222, 0 4px 8px rgba(0, 0, 0, 0.5);
}

.move-btn:active {
  background: linear-gradient(145deg, #999999, #555555);
  transform: translateY(4px) scale(0.98);
  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.7);
  border-color: #222;
  text-shadow: none;
}

.widget-sticker {
  position: absolute;
  top: 8px;
  left: 6px;
  background: #fff8dc;
  color: #333;
  padding: 5px 10px;
  font-size: 21.6px;
  border-radius: 5px;
  border: 1px solid #999;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  font-family: 'Impact', sans-serif;
  pointer-events: none;
  z-index: 2;
  transform: rotate(-16deg);

}
.widget-sticker::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 87%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 50% 50%, #ccc 30%, #999 60%, #666 100%);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 3;
}

.moving-selected {
  outline: 2px dashed #007bff;
}



</style>