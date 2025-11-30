<template>
  <div class="selector-widget-container">
    <div class="selector-toolbar">
  <!-- 遮罩 -->
  <div class="toolbar-mask" :class="`state-${maskState}`">
  <div class="gear-wrapper" :class="gearRotationClass" :key="gearKey">
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" class="gear-icon">
  <defs>
    <radialGradient id="metalGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="40%" stop-color="#dddddd" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#888888" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="metalEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f2f2f2"/>
      <stop offset="50%" stop-color="#cccccc"/>
      <stop offset="100%" stop-color="#eeeeee"/>
    </linearGradient>
  </defs>
  <g id="gear-body">
    <circle cx="50" cy="50" r="35" fill="url(#metalGlow)" stroke="url(#metalEdge)" stroke-width="6"/>
    <g stroke="url(#metalEdge)" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="5" x2="50" y2="15"/>
      <line x1="50" y1="85" x2="50" y2="95"/>
      <line x1="5" y1="50" x2="15" y2="50"/>
      <line x1="85" y1="50" x2="95" y2="50"/>
      <line x1="22" y1="22" x2="30" y2="30"/>
      <line x1="78" y1="22" x2="70" y2="30"/>
      <line x1="22" y1="78" x2="30" y2="70"/>
      <line x1="78" y1="78" x2="70" y2="70"/>
    </g>
    <circle cx="50" cy="50" r="8" fill="url(#metalEdge)" stroke="#999999" stroke-width="2"/>
    <line x1="50" y1="20" x2="50" y2="80" stroke="url(#metalEdge)" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="50" cy="50" rx="25" ry="12" fill="white" opacity="0.2" transform="rotate(-45 50 50)"/>
  </g>
</svg>
  </div>
  <div
    v-for="(sticker, i) in toolbarStickers"
    :key="`toolbar-sticker-${i}`"
    class="toolbar-sticker"
    :style="{
      top: sticker.top,
      left: sticker.left,
      transform: `rotate(${sticker.rotate}deg)`
    }"
  >
    {{ sticker.emoji }}
  </div>
</div>

  <div class="indicator-light">
  <!-- 光晕层根据 lightState 控制 -->
  <transition name="light-fade" mode="out-in" @before-leave="handleBeforeLeave">
    <div
      v-if="lightState.on"
      ref="indicatorRef"
      :class="['indicator-glow', lightState.color]"
    ></div>
    <div v-else ref="indicatorRef" class="indicator-glow blue"></div>
  </transition>
</div>

  <!-- 编辑模式扳手按钮 -->
  <button
  class="toggle-icon-button" v-rubber-button
  :disabled="!auth.isLoggedIn.value || isMaskAnimating"
  @click="() => { toggleExpanded(); triggerLight('green'); }"
  aria-label="Toggle toolbar"
>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14,12.94a7.91,7.91,0,0,0,.06-1,7.91,7.91,0,0,0-.06-1l2.11-1.65a.5.5,0,0,0,.12-.63l-2-3.46a.5.5,0,0,0-.6-.22L16.9,5.5a7.42,7.42,0,0,0-1.73-1L15,2.5a.5.5,0,0,0-.5-.5H9.5a.5.5,0,0,0-.5.5l-.17,2a7.42,7.42,0,0,0-1.73,1L4.63,5a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.63L4.26,10a7.91,7.91,0,0,0,0,2L2.15,13.65a.5.5,0,0,0-.12.63l2,3.46a.5.5,0,0,0,.6.22L7.1,18.5a7.42,7.42,0,0,0,1.73,1l.17,2a.5.5,0,0,0,.5.5h5a.5.5,0,0,0,.5-.5l.17-2a7.42,7.42,0,0,0,1.73-1l2.47,1.46a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.63ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
  </svg>
  </button>

  <!-- 四向箭头移动按钮 -->
  <button
  class="move-button" v-rubber-button
  :disabled="!auth.isLoggedIn.value || isMaskAnimating"
  @click="() => { handleMoveSelf(); triggerLight('red'); }"
  aria-label="Move widget"
>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<line x1="12" y1="2" x2="12" y2="22"/>
<line x1="2" y1="12" x2="22" y2="12"/>
<polyline points="12 2, 8 6, 16 6, 12 2"/>
<polyline points="12 22, 8 18, 16 18, 12 22"/>
<polyline points="2 12, 6 8, 6 16, 2 12"/>
<polyline points="22 12, 18 8, 18 16, 22 12"/>
</svg>
  </button>
  <div class="preview-panel-wrapper" :class="wrapperState">
  <div class="preview-panel-inner" :class="innerState">
    <button class="cancel-preview-btn" v-rubber-button @click="() => { cancelPreview(); triggerLight('purple'); }" aria-label="Cancel preview">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="3" width="18" height="3" fill="#ccc" stroke="#333"/>
<circle cx="6" cy="4.5" r="0.5" fill="#333"/>
<circle cx="12" cy="4.5" r="0.5" fill="#333"/>
<circle cx="18" cy="4.5" r="0.5" fill="#333"/>
<rect x="4" y="6" width="16" height="16" rx="2" ry="2" fill="#fff" stroke="#333"/>
<line x1="9" y1="10" x2="9" y2="18"/>
<line x1="15" y1="10" x2="15" y2="18"/>
</svg></button>
  </div>
</div>
</div>
<div class="scroll-wrapper">
  <div :class="['scroll-mask-decoration', maskAnimationState]"></div>
  <div :class="['scroll-mask-wrapper', maskAnimationState]">
  <div class="scroll-mask">
    <div class="sticker-zone">
      <div
        v-for="sticker in stickers"
        :key="sticker.emoji"
        class="widget-sticker"
        :style="{
          top: `${sticker.top}%`,
          left: `${sticker.left}%`,
          transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`
        }"
      >
        {{ sticker.emoji }}
      </div>
    </div>
  </div>
</div>
    <div class="selector-scroll" ref="scrollRef" :class="{ 'locked': !auth.isLoggedIn.value || !expanded }">
      <!-- 渲染分类和组件 -->
      <div v-for="item in sortedWidgetList" :key="item.type">
        <!-- 分类标题 -->
        <div v-if="item.type === 'category'" class="category-title">
          {{ categoryNames[item.category] }}
        </div>

        <!-- 组件卡片 -->
        <div v-else class="widget-card">
          <div class="widget-entry">
            <strong><span class="emoji">{{ item.icon }}</span> {{ item.name }}</strong>
            <div class="size-options">
              <button
                v-for="sizeKey in item.sizeOptions"
                :key="sizeKey"
                class="btn" v-rubber-button
                @click="() => { handleAddClick(item.type, sizeKey); triggerLight('orange'); }"
                :aria-label="`Add widget of size ${sizeKey}`"
              >
                {{ sizeKey }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>

import { inject, watch, nextTick, ref, reactive} from 'vue'
import { widgetSizes } from '@/data/widgetTypes.js'
import { widgetMetadata, categoryOrder } from '@/components/widgets/registry.js'
import { showClickPreview, removeClickPreview } from '@/scripts/useClickPreview'

const auth = inject('auth')
const pendingMoveWidget = inject('pendingMoveWidget')
const widgets = inject('widgets')
const expanded = inject('pegboardExpanded')
const pendingPlacement = inject('pendingPlacement')
const emit = defineEmits(['add-widget'])
const scrollRef = ref(null)

const sortedWidgetList = ref([])

const indicatorRef = ref(null);
const lightState = reactive({
  on: false,
  color: ''
})


// 任何按钮触发 → 设置为指定颜色，保持不熄灭
function triggerLight(color) {
  lightState.on = true
  lightState.color = color
}


function turnOffLight() {
  lightState.on = false
  lightState.color = ''
}

function toggleExpanded() {
  if (!auth?.isLoggedIn.value) {
    console.warn('⚠️ 请先登录');
    return;
  }

  expanded.value = !expanded.value;

  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = 0;
    }
  });
}

const maskState = ref('logged-out')  // 'logged-out' | 'logged-in' | 'editing'


// 监听登录和 expanded，设置 maskState
watch(
  [() => auth.isLoggedIn.value, expanded],
  ([loggedIn, isExpanded]) => {
    if (!loggedIn) {
      maskState.value = 'logged-out'
    } else if (loggedIn && !isExpanded) {
      maskState.value = 'logged-in'
    } else if (loggedIn && isExpanded) {
      maskState.value = 'editing'
    }
  },
  { immediate: true }
)

// 监听 maskState，判断变化趋势（不需要 previousState）
const gearRotationClass = ref('')
const gearKey = ref(0)

watch(
  maskState,
  (newState, oldState) => {
    let direction = ''
    if (oldState === 'logged-in' && newState === 'editing') {
      direction = 'rotate-right'
    } else if (oldState === 'editing' && newState === 'logged-in') {
      direction = 'rotate-left'
    } else if (oldState === 'logged-out' && newState === 'logged-in') {
      direction = 'rotate-right'
    } else if (oldState === 'logged-in' && newState === 'logged-out') {
      direction = 'rotate-left'
    }

    if (direction) {
      gearRotationClass.value = direction
      gearKey.value++  // 强制 gear 刷新
    }
  },
  { immediate: true }
)

const maskAnimationState = ref('closed')
const isMaskAnimating = ref(false)


watch(maskState, (newState) => {
  if (newState === 'editing') {
    maskAnimationState.value = 'closing'
  } else {
    maskAnimationState.value = 'opening'
  }

  isMaskAnimating.value = true


  setTimeout(() => {
    isMaskAnimating.value = false
  }, 1200)
})
// 处理移动组件
function handleMoveSelf() {
  const self = widgets.value.find(w => w.type === 'WidgetSelectorWidget')
  if (!self) {
    console.warn('❌ 找不到 WidgetSelectorWidget 本身')
    return
  }

  pendingMoveWidget.value = self

  showClickPreview({
    icon: '🧩',
    width: self.w * 40,
    height: self.h * 40
  })
  turnOffLight()
}

// 根据 widgetMetadata 生成 widgetList
const widgetList = Object.entries(widgetMetadata)
  .filter(([, meta]) => !meta.hidden)  
  .map(([type, meta]) => ({
    type,
    ...meta
  }))

// 排序后的 widgetList，包括分类标题
watch(() => widgetList, () => {
  const categorizedWidgets = []
  let currentCategory = null

  // 按照 categoryOrder 排序
  widgetList.sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  })

  // 根据排序后的顺序生成带标题的分类
  widgetList.forEach(widget => {
    if (widget.category !== currentCategory) {
      // 如果分类发生变化，添加分类标题
      categorizedWidgets.push({ type: 'category', category: widget.category })
      currentCategory = widget.category
    }
    categorizedWidgets.push(widget)
  })

  // 将排序后的结果保存到 ref 中
  sortedWidgetList.value = categorizedWidgets
}, { immediate: true })

// 分类名称映射
const categoryNames = {
  function: 'FUNCTIONAL WIDGETS',
system: 'SYSTEM WIDGETS',
debug: 'DEBUG WIDGETS'
}
// 创建新组件
function createWidget(type, x = 1, y = 1, sizeKey = null) {
  const meta = widgetMetadata[type];
  const resolvedSizeKey = sizeKey || meta?.sizeOptions?.[0] || 'S';
  const id = `${type}-${resolvedSizeKey}-${Date.now()}`;
  const size = widgetSizes[resolvedSizeKey] || { w: 1, h: 1 };

  return {
    id,
    renderKey: `${id}-render`,
    type,
    sizeKey: resolvedSizeKey,
    x,
    y,
    w: size.w,
    h: size.h
  };
}


// 处理添加新组件
function handleAddClick(type, sizeKey) {
  const newWidget = createWidget(type, 0, 0, sizeKey);  

  // 直接 emit 完整 newWidget
  emit('add-widget', newWidget);

  const { w, h } = widgetSizes[sizeKey];

  showClickPreview({
    icon: widgetMetadata[type]?.icon || '📦',
    width: w * 40,
    height: h * 40
  });

  // 直接赋值 payload = newWidget
  pendingPlacement.value = { ...newWidget };
}

// 监听登出，收起编辑模式并滚动到顶部
watch(() => auth.isLoggedIn.value, (loggedIn) => {
  if (!loggedIn) {
    expanded.value = false
    nextTick(() => {
      if (scrollRef.value) {
        scrollRef.value.scrollTop = 0
      }
    })
  }
})

function handleBeforeLeave(el) {

  if (el.classList.contains('on')) {
    el.classList.remove('on');
    el.style.animation = 'none'; 
    void el.offsetWidth; 
  }
}

const wrapperState = ref('') // probing, opening, closing, retracting
const innerState = ref('')

function openPanel() {
  wrapperState.value = 'probing'
  innerState.value = 'probing'
  setTimeout(() => {
    innerState.value = 'opening'
  }, 300)
}

function closePanel() {
  innerState.value = 'closing'
  setTimeout(() => {
    wrapperState.value = 'retracting'
    innerState.value = 'retracting'
  }, 400)
}

function cancelPreview() {
  closePanel()
  setTimeout(() => {
    removeClickPreview()
    pendingPlacement.value = null
    wrapperState.value = ''
    innerState.value = ''
  }, 700) 
}
watch(pendingPlacement, (val) => {
  if (val) {
    openPanel()
  } else {
    closePanel()
  }
})


// emoji 池
const stickerEmojis = [
  '💡', '🔥', '🔧', '⚡', '🚀', '🛡️', '📦', '🔩', '🔨', '🧰',
  '📡', '💾', '📟', '📠', '🔋', '🛰️', '🔭', '🧲', '📷', '🔗',
  '🔑', '🛠️', '📊', '🗜️', '🧪', '💽', '🧬', '⚙️', '💻', '🔒'
]

// 随机生成 4 个 sticker 配置
const stickers = ref(generateStickers(4))

function generateStickers(count = 4) {
  const result = []
  const usedEmojis = new Set()

  // 安全边距相对于区域的百分比
  const localSafeMargin = 15; 

  const areas = [
    { topStart: 0, leftStart: 0 },
    { topStart: 0, leftStart: 50 },
    { topStart: 50, leftStart: 0 },
    { topStart: 50, leftStart: 50 }
  ]

  const emojiPool = [...stickerEmojis]

  for (let i = 0; i < count; i++) {
    const area = areas[i % areas.length]

    const areaWidth = 50;
    const areaHeight = 50;

    // 计算区域内部安全边界
    const innerTopMin = area.topStart + (areaHeight * localSafeMargin) / 100;
    const innerTopMax = area.topStart + areaHeight - (areaHeight * localSafeMargin) / 100;
    const innerLeftMin = area.leftStart + (areaWidth * localSafeMargin) / 100;
    const innerLeftMax = area.leftStart + areaWidth - (areaWidth * localSafeMargin) / 100;

    // 选一个未使用的 emoji
    const availableEmojis = emojiPool.filter(e => !usedEmojis.has(e));
    const emoji = availableEmojis.length
      ? availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
      : stickerEmojis[Math.floor(Math.random() * stickerEmojis.length)];

    usedEmojis.add(emoji);

    result.push({
      emoji,
      top: Math.random() * (innerTopMax - innerTopMin) + innerTopMin,
      left: Math.random() * (innerLeftMax - innerLeftMin) + innerLeftMin,
      rotate: Math.random() * 40 - 20
    });
  }

  return result;
}


const toolbarStickers = ref(generateToolbarStickers())

function generateToolbarStickers() {
  const positions = [
    { top: '20%', left: '24%', scale: 1 },
    { top: '27%', left: '65%', scale: 1 }
  ]

  const emojiPool = [...stickerEmojis]

  return positions.map(pos => ({
    ...pos,
    emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
    rotate: Math.floor(Math.random() * 20 - 10) 
  }))
}
</script>

  
  <style scoped>
.selector-widget-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background-color: #8B0000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  border: none;
  position: relative;
}

/* 工具栏 - 提手 */
.selector-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 12px;
  background:
    linear-gradient(to bottom, #dddddd, #bbbbbb),
    radial-gradient(circle at 20% 15%, rgba(0, 0, 0, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(0, 0, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.05) 0%, transparent 70%),
    repeating-radial-gradient(circle, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px);
  border-bottom: 2px solid #888;
  border-radius: 12px 12px 0 0;
  box-shadow:
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  position: relative;
  filter: grayscale(0.1) brightness(0.95) contrast(1.1);
  background-blend-mode: multiply, multiply, multiply, multiply, normal;
  overflow: hidden;
}

.indicator-light {
  width: 20px;
  height: 20px;
  margin-right: 16px;
  border-radius: 50%;
  background: #444;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: visible;
}

.indicator-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  pointer-events: none;
  animation: flicker 10s infinite;
  background: currentColor;
  box-shadow:
    0 0 12px currentColor,
    0 0 24px currentColor,
    0 0 36px currentColor;
  opacity: 1;
}

/* 颜色 */
.indicator-glow.green { color: #00ff66; }
.indicator-glow.red { color: #ff3333; }
.indicator-glow.orange { color: #ff9933; }
.indicator-glow.blue { color: #3399ff; }
.indicator-glow.purple { color: #cc66ff; }
@keyframes flicker {
  0%, 100% {
    opacity: 0.95;
    filter: brightness(1);
    transform: translate(0, 0) rotate(0deg);
  }
  3% {
    opacity: 0.7;
    filter: brightness(1.4);
    transform: translate(-0.8px, 0.3px) rotate(-0.5deg);
  }
  7% {
    opacity: 0.85;
    filter: brightness(1.1);
    transform: translate(0.4px, -0.3px) rotate(0.3deg);
  }
  12% {
    opacity: 0.5;
    filter: brightness(0.8);
    transform: translate(-0.5px, 0.5px) rotate(-0.8deg);
  }
  18% {
    opacity: 0.9;
    filter: brightness(1.3);
    transform: translate(0.2px, 0) rotate(0deg);
  }
  26% {
    opacity: 0.6;
    filter: brightness(0.6);
    transform: translate(0.3px, 0.4px) rotate(-0.3deg);
  }
  35% {
    opacity: 0.95;
    filter: brightness(1.5);
    transform: translate(0, 0) rotate(0.1deg);
  }
  45% {
    opacity: 0.55;
    filter: brightness(0.9);
    transform: translate(-0.3px, -0.3px) rotate(0.8deg);
  }
  55% {
    opacity: 0.75;
    filter: brightness(1.2);
    transform: translate(0.2px, 0.2px) rotate(-0.2deg);
  }
  68% {
    opacity: 0.4;
    filter: brightness(0.5);
    transform: translate(-0.4px, 0.4px) rotate(-1deg);
  }
  80% {
    opacity: 0.9;
    filter: brightness(1.4);
    transform: translate(0.5px, -0.5px) rotate(0.5deg);
  }
  90% {
    opacity: 0.6;
    filter: brightness(0.8);
    transform: translate(0, 0) rotate(0deg);
  }
}

.light-fade-enter-active {
  animation: light-on 0.6s forwards;
}

.light-fade-leave-active {
  animation: light-off 0.8s forwards;
}

@keyframes light-on {
  0% {
    opacity: 0.2;
    filter: brightness(0.3);
    box-shadow: 0 0 4px currentColor;
  }
  100% {
    opacity: 1;
    filter: brightness(1);
    box-shadow:
      0 0 16px currentColor,
      0 0 32px currentColor,
      0 0 48px currentColor;
  }
}

@keyframes light-off {
  0% {
    opacity: 1;
    filter: brightness(1);
    box-shadow:
      0 0 16px currentColor,
      0 0 32px currentColor,
      0 0 48px currentColor;
  }
  100% {
    opacity: 0;
    filter: brightness(0.2);
    box-shadow: 0 0 4px currentColor;
  }
}
.selector-toolbar button {
  width: 40px;
  height: 40px;
  font-size: 1rem;
  background: linear-gradient(to bottom, #ff6666, #cc3333);
  color: white;
  border: 2px solid #990000;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.1s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  text-align: center;
  line-height: 1;
  padding: 0;
}






.scroll-wrapper {
  position: relative;
  background: linear-gradient(145deg, #d0d0d0 0%, #999999 100%);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.4),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.4);
  padding: 8px; 
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 12px 12px;
  clip-path: inset(0 0 0 0 round 0 0 12px 12px);
  position: relative; 
  overflow: hidden; 
  z-index: 11;
}

.selector-scroll {
  flex-grow: 1;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  background-color: #8B0000;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  position: relative;
  padding: 12px 8px 20px 8px; 
  box-sizing: border-box;
}


.widget-card {
  position: relative;
  background:
    linear-gradient(145deg, #b0b0b0 0%, #888888 100%),
    repeating-radial-gradient(circle at center, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.02) 1px, transparent 2px, transparent 6px),
    repeating-radial-gradient(circle at center, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 8px),
    repeating-radial-gradient(circle, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px);
    
  background-blend-mode: normal, overlay;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow:
    inset 0 0 10px rgba(255, 255, 255, 0.3),
    inset 0 0 30px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: default;
  color: #222;
  transition: none;
  filter: brightness(0.9) contrast(1.15) saturate(0.7);
  overflow: hidden;
  margin-top: 4px;
}

.widget-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  z-index: 2;
  background:
    radial-gradient(circle at 8px 8px, #c0c0c0 0%, #999 60%, #333 100%),
    radial-gradient(circle at calc(100% - 8px) 8px, #c0c0c0 0%, #999 60%, #333 100%),
    radial-gradient(circle at 8px calc(100% - 8px), #c0c0c0 0%, #999 60%, #333 100%),
    radial-gradient(circle at calc(100% - 8px) calc(100% - 8px), #c0c0c0 0%, #999 60%, #333 100%);
  background-repeat: no-repeat;
  background-size: 10px 10px;
  background-position:
    8px 8px,
    calc(100% - 8px) 8px,
    8px calc(100% - 8px),
    calc(100% - 8px) calc(100% - 8px);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}


/* 卡片内布局 */
.widget-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.widget-entry strong {
  position: relative; 
  background:
    linear-gradient(145deg, #dcdcdc 0%, #b0b0b0 100%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.03) 0, rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 3px),
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 50%);
  background-blend-mode: normal, overlay, overlay, multiply, multiply;
  padding: 6px 12px;
  border-radius: 6px;
  color: #111;
  font-weight: bold;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 3px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
  font-family: 'Arial Black', sans-serif;
  filter: brightness(1.05) contrast(1.05) saturate(0.95);
  padding-left: 20px;
  padding-right: 20px;
}

.widget-entry strong::before,
.widget-entry strong::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 30% 30%, #ccc 0%, #999 60%, #333 100%);
  border-radius: 50%;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
  transform: translateY(-50%);
}

.widget-entry strong::before {
  left: 6px; 
}

.widget-entry strong::after {
  right: 6px;
}

.widget-entry strong .emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;   
  height: 1.5em;
  font-size: 1.2em; 
  line-height: 1;
  filter: brightness(0.6) contrast(1.3) grayscale(1);
  mix-blend-mode: multiply;
  opacity: 0.8;
  transform: scale(1);
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  justify-content: center;
  margin-top: 12px;
}

.btn {
  width: 42px;
  height: 42px;
  font-size: 1.2rem;
  background: linear-gradient(to bottom, #ff6666, #cc3333);
  color: white;
  border: 2px solid #990000;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.1s, transform 0.1s;
  display: flex; 
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box; 
  text-align: center;
  line-height: 1;
  padding: 0; 
}

.category-title {
  position: relative;
  background:
    linear-gradient(145deg, #dcdcdc 0%, #b0b0b0 100%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.03) 0, rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 3px),
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 50%);
  background-blend-mode: normal, overlay, overlay, multiply, multiply;
  padding: 8px 20px;
  border-radius: 6px;
  color: #111;
  font-weight: bold;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 3px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
  font-family: 'Arial Black', sans-serif;
  filter: brightness(1.05) contrast(1.05) saturate(0.95);
  margin-top: 12px;
  text-align: center;
}

/* 两侧铆钉 */
.category-title::before,
.category-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at 30% 30%, #ccc 0%, #999 60%, #333 100%);
  border-radius: 50%;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
  transform: translateY(-50%);
}

.category-title::before {
  left: 6px;
}

.category-title::after {
  right: 6px;
}

/* 工具栏遮罩 */
/* 通用遮罩 */
.toolbar-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 95%;
  height: 100%;
  background:
    linear-gradient(to bottom, #cc3333 0%, #ff5555 50%, #bb2222 100%);
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.4),
    inset 0 4px 8px rgba(255, 255, 255, 0.1),
    0 0 12px rgba(0, 0, 0, 0.6);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  pointer-events: all;
  border-radius: 12px 12px 0 0;
  transition: transform 0.7s ease;
  padding-left: 16px;
  box-sizing: border-box;
  background-blend-mode: overlay, normal; 
}
/* 向左移动到蓝线 (大概 14% 位置) */
.toolbar-mask.state-logged-out {
  transform: translateX(16%);
}

/* 向左移动到绿线 (大概 60% 位置) */
.toolbar-mask.state-logged-in {
  transform: translateX(64%);
}

/* 向左移动到红线 (大概 83% 位置) */
.toolbar-mask.state-editing {
  transform: translateX(94%);
}

.gear-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  margin-left: -4px; 
}

.gear-icon {
  filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.7))
          drop-shadow(0 -1px 2px rgba(0, 0, 0, 0.6));
  transition: transform 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  will-change: transform;
}
.gear-wrapper.rotate-right .gear-icon {
  animation: rotate-right 0.3s linear;
}

.gear-wrapper.rotate-left .gear-icon {
  animation: rotate-left 0.3s linear;
}

@keyframes rotate-right {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

@keyframes rotate-left {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-180deg);
  }
}




/* 控件区遮罩 */
.scroll-mask {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #cc3333 0%, #ff5555 50%, #bb2222 100%);
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.4),
    0 6px 20px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-bottom: 4px solid rgba(0, 0, 0, 0.2);
  transform-origin: top center;
}
.sticker-zone {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  pointer-events: none;
  /* 可选：调试时显示边界 */
  /* border: 1px dashed rgba(0,0,0,0.1); */
}

.widget-sticker {
  position: absolute;
  background: #fff8dc;
  color: #333;
  padding: 5px 10px;
  font-size: 28px;
  border-radius: 5px;
  border: 1px solid #aaa;
  font-family: 'Impact', sans-serif;
  pointer-events: none;
  z-index: 2;
  transform: rotate(-16deg);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.3),   
    0 0 2px rgba(0, 0, 0, 0.15);          
}

.toolbar-sticker {
  position: absolute;
  background: #fff8dc;
  color: #333;
  padding: 2px 4px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #999;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.3),  
    0 0 2px rgba(0, 0, 0, 0.15);          
  font-family: 'Impact', sans-serif;
  pointer-events: none;
  z-index: 3;
}


.preview-panel-wrapper {
  position: absolute;
  right: 20%; 
  top: 50%;
  transform: translateY(-50%) translateY(-120%);
  transition: transform 0.5s ease-out;
  z-index: 5;
}

.preview-panel-wrapper.probing,
.preview-panel-wrapper.opening {
  transform: translateY(-50%) translateY(0);
}

.preview-panel-wrapper.retracting,
.preview-panel-wrapper.closing {
  transform: translateY(-50%) translateY(-120%);
}

/* 内层旋转，确保以中心旋转 */
.preview-panel-inner {
  transform: rotate(90deg) scale(0.98);
  transform-origin: center center; 
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.preview-panel-inner.opening,
.preview-panel-inner.probing {
  transform: rotate(0deg) scale(1);
}

.preview-panel-inner.closing,
.preview-panel-inner.retracting {
  transform: rotate(90deg) scale(0.98);
}
/* 按钮保持原地，仅保持水平对齐，无需 transform */
.cancel-preview-btn {
  width: 42px;
  height: 42px;
  font-size: 1rem;
  background: linear-gradient(to bottom, #ff6666, #cc3333);
  color: white;
  border: 2px solid #990000;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  text-align: center;
  line-height: 1;
  padding: 0;
}





.scroll-mask-wrapper {
  position: absolute;
  inset: 0;
  transform-origin: top center;
  z-index: 20;
  pointer-events: all;
  will-change: transform;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
}

.scroll-mask-wrapper.opening {
  animation: curtain-drop-3steps 1.2s forwards;
}

.scroll-mask-wrapper.closing {
  animation: curtain-retract-3steps 1.2s forwards;
}

.scroll-mask-wrapper {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: all;
  will-change: transform;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
}

.scroll-mask-wrapper.opening {
  animation: curtain-drop-translate 1.2s forwards;
}

.scroll-mask-wrapper.closing {
  animation: curtain-retract-translate 1.2s forwards;
}

/* ✅ 阶梯式下降 */
@keyframes curtain-drop-translate {
  0% {
    transform: translateY(-100%);
  }
  25% {
    transform: translateY(-66%) translateY(-4%);
  }
  28% {
    transform: translateY(-66%);
  }
  30% {
    transform: translateY(-66%) translateY(2%);
  }
  32% {
    transform: translateY(-66%);
  }
  59% {
    transform: translateY(-33%) translateY(-4%);
  }
  62% {
    transform: translateY(-33%);
  }
  64% {
    transform: translateY(-33%) translateY(2%);
  }
  66% {
    transform: translateY(-33%);
  }
  100% {
    transform: translateY(0%);
  }
}

/* ✅ 阶梯式上升 */
@keyframes curtain-retract-translate {
  0% {
    transform: translateY(0%);
    opacity: 1;
  }
  25% {
    transform: translateY(-33%) translateY(4%);
    opacity: 1;
  }
  28% {
    transform: translateY(-33%);
    opacity: 1;
  }
  30% {
    transform: translateY(-33%) translateY(-2%);
    opacity: 1;
  }
  32% {
    transform: translateY(-33%);
    opacity: 1;
  }
  59% {
    transform: translateY(-66%) translateY(4%);
    opacity: 1;
  }
  62% {
    transform: translateY(-66%);
    opacity: 1;
  }
  64% {
    transform: translateY(-66%) translateY(-2%);
    opacity: 1;
  }
  66% {
    transform: translateY(-66%);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 1;
  }
}
.scroll-mask-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.15) 33%, transparent 33%, rgba(255, 255, 255, 0.15) 66%, transparent 66%),
    linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.12) 34%, rgba(0, 0, 0, 0.12) 35%, transparent 35%, rgba(0, 0, 0, 0.12) 67%, rgba(0, 0, 0, 0.12) 68%, transparent 68%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 25;
  opacity: 1;
}

/* 💡 新增绑定动画 */
.scroll-mask-decoration.opening {
  animation: lines-fade-in 1.2s forwards;
}

.scroll-mask-decoration.closing {
  animation: lines-fade-out 1.2s forwards;
}

@keyframes lines-fade-in {
  0% {
    transform: translateY(-100%);
  }
  25% {
    transform: translateY(-66%) translateY(-4%);
  }
  28% {
    transform: translateY(-66%);
  }
  30% {
    transform: translateY(-66%) translateY(2%);
  }
  32% {
    transform: translateY(-66%);
  }
  59% {
    transform: translateY(-33%) translateY(-4%);
  }
  62% {
    transform: translateY(-33%);
  }
  64% {
    transform: translateY(-33%) translateY(2%);
  }
  66% {
    transform: translateY(-33%);
  }
  100% {
    transform: translateY(0%);
  }
}

@keyframes lines-fade-out {
  0% {
    transform: translateY(0%);
    opacity: 1;
  }
  25% {
    transform: translateY(-33%) translateY(4%);
    opacity: 1;
  }
  28% {
    transform: translateY(-33%);
    opacity: 1;
  }
  30% {
    transform: translateY(-33%) translateY(-2%);
    opacity: 1;
  }
  32% {
    transform: translateY(-33%);
    opacity: 1;
  }
  59% {
    transform: translateY(-66%) translateY(4%);
    opacity: 1;
  }
  62% {
    transform: translateY(-66%);
    opacity: 1;
  }
  64% {
    transform: translateY(-66%) translateY(-2%);
    opacity: 1;
  }
  66% {
    transform: translateY(-66%);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 1;
  }
}


  </style>