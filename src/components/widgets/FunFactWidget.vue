<template>
    <div class="fun-fact-widget">
      <!-- 按钮组 -->
      <div class="tabs">
  <div
    :class="['tab-item', 'theme-main', { active: viewMode === 'main' }]"
    @click="viewMode = 'main'"
    aria-label="Show random facts"
  >🎲</div>
  <div
    :class="['tab-item', 'theme-liked', { active: viewMode === 'liked' }]"
    @click="viewMode = 'liked'"
    aria-label="Show liked facts"
  >❤️</div>
  <div
    :class="['tab-item', 'theme-manage', { active: viewMode === 'manage' }]"
    @click="viewMode = 'manage'"
    aria-label="Manage facts"
  >🛠</div>
</div>
<div class="card-area" :class="cardClass">

  <div
  class="animated-overlay"
  :class="{ 'main-animation': viewMode === 'main', 'liked-animation': viewMode === 'liked' }"
  v-if="viewMode !== 'manage'"
>
  <!-- 扩散动画 -->
  <div
  v-if="viewMode === 'main'"
  class="wave-circle main-wave-circle"
></div>
<div
  v-if="viewMode === 'liked'"
  class="wave-circle liked-wave-circle"
></div>

  <!-- 脑电波动画（main 页面专属） -->
  <svg v-if="viewMode === 'main'" class="brainwave-line" viewBox="0 0 1200 300" preserveAspectRatio="none">
  <path d="M0,70 L200,70 L300,-30 L400,100 L450,30 L500,70 L560,70 L720,70 L740,60 L760,80 L780,50 L810,70 L1000,70 L1200,70" class="wave-path" />
  <path d="M0,287 L100,287 L120,270 L140,295 L160,287 L250,287 L300,287 L400,287 L500,287 L600,287 L680,287 L720,250 L760,320 L800,287 L850,287 L950,150 L1050,350 L1100,287 L1200,287" class="wave-path" />
  <circle r="10" class="pulse-dot dot1" />
  <circle r="8" class="pulse-dot dot2" />
</svg>
</div>

 <div class="toolbar" v-if="viewMode === 'main'">
    <div class="left-buttons">
    <button   class="nav-button"  :class="{ 'nav-click': navClickAnim === 'prev' }"
     @click="handlePrev" :disabled="isAnimating || !canGoPrev" 
     aria-label="Previous fact">
      <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button   class="nav-button"
  :class="{ 'nav-click': navClickAnim === 'next' }"
     @click="handleNext" :disabled="isAnimating" 
     aria-label="Next fact">
      <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  </div>
  <div class="right-buttons">
    <button @click="handleLikeClick" :disabled="isAnimating">
        <span
    :class="['like-emoji', isLiked(currentFact) ? 'liked' : '', likeAnimating]"
    aria-label="Like or unlike this fact"
  >
    {{ isLiked(currentFact) ? '❤️' : '🤍' }}
  </span>
</button>
  </div>
</div>
  
      <!-- 默认页面 -->
      <div v-if="viewMode === 'main'" class="content">
        <div class="fact-frame-container">
        <div class="fact-frame">
  <!-- 动画遮罩层 -->
  <transition name="emoji-fade" mode="out-in">
  <div class="brain-overlay" v-if="isAnimating" :key="emojiContent">
    <div class="emoji brain-thinking">{{ emojiContent }}</div>
  </div>
</transition>

  <!-- 内容本体 -->
  <transition :name="factTransitionClass" mode="out-in">
  <p class="fact-text" v-if="readyToRender" :key="displayFact">
    {{ displayFact || 'Facts Loading...' }}
  </p>
</transition>
</div>
</div>
<transition-group name="dot" tag="div" class="pagination-dots">
    <span
  v-for="(fact, index) in visibleDots"
  :key="dotWindowStart + index"
  :class="[
    'dot',
    currentIndex === dotWindowStart + index ? 'active' : '',
    'dot-delay-enter-active',
    'dot-delay-leave-active'
  ]"
/>
</transition-group>
      </div>
  
<!-- 喜欢页面 -->
<div v-else-if="viewMode === 'liked'" class="content liked">
  <div class="center-buttons">
  <button
    ref="likeButton"
    class="next-like-button"
    @click="handleLikedNext"
    :disabled="likedFacts.length === 0"
    :class="{
      'heartbeat-animation': likedFacts.length > 0,
      'click-animation': isClicking
    }"
    aria-label="Show next liked fact"
  >
    ❤️
  </button>
</div>
  <div class="fact-frame-container">
    <div class="fact-frame">
      <!-- 动画遮罩层 -->
      <transition name="emoji-fade" mode="out-in">
        <div class="brain-overlay" v-if="isLikedAnimating" :key="likedEmojiContent">
          <div class="emoji brain-thinking">{{ likedEmojiContent }}</div>
        </div>
      </transition>

      <!-- 内容本体 -->
      <transition :name="factTransitionClass" mode="out-in">
        <p class="fact-text" v-if="likedReadyToRender" :key="likedDisplayFact">
          {{ likedDisplayFact }}
        </p>
      </transition>
    </div>
  </div>


</div>
  
      <!-- 管理页面 -->
      <div v-else-if="viewMode === 'manage'" class="content">
        <div class="input-wrapper">
            <input
    class="search-input"
    :placeholder="`${likedFacts.length} ❤️ currently. Try...`"
    v-model="searchKeyword"
  />
  <button class="trash-toggle" @click="currentManageTab = currentManageTab === 'liked' ? 'trash' : 'liked'"
  aria-label="Toggle liked/trash view">
  <transition name="icon-fade" mode="out-in">
    <span :key="currentManageTab">
      {{ currentManageTab === 'liked' ? '🗑' : '❤️' }}
    </span>
  </transition>
</button>
</div>
        <div class="fact-list-box">
    <ul>
        <transition-group name="fade" tag="ul" class="fact-list">
  <li
    v-for="(fact, idx) in filteredFacts"
    :key="fact + '-' + idx"
    class="fact-item"
  >
    <div class="fact-controls">
      <button class="delete-btn" @click="removeFact(idx)"
      aria-label="Delete this fact">❌</button>
      <button
  v-if="currentManageTab === 'trash'"
  class="toggle-btn"
  @click="recoverFromTrash(idx)"
  aria-label="Recover this fact"
>
  ♻️
</button>
<button
  v-else
  class="toggle-btn"
  @click="toggleExpand(idx)"
  aria-label="Expand or collapse this fact"
>
  {{ expandedIndex === idx ? '▲' : '▼' }}
</button>
    </div>
    <div class="fact-text-short" :class="{ expanded: expandedIndex === idx }">
      {{ fact }}
    </div>
  </li>
</transition-group>
    </ul>
  </div>
      </div>
    </div>
</div>
  </template>
  
  <script setup>
// Vue + Axios + inject + transitions
import { ref, computed, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import '@/assets/css/transitions.css'
import {
  likedFacts,
  trashBin,
  likedCacheKey,
  loadFromStorage,
  saveToStorage,
  factHistory,
  loadFactHistory,
  saveFactHistory
} from '@/scripts/likedStore.js'

// Inject auth and widget lock context
const auth = inject('auth')
const currentUser = auth?.currentUser || ref('')
const widgetLocks = inject('widgetLocks')
const lock = widgetLocks?.FunFactWidget


// Main reactive states
const viewMode = ref('main') // 'main' | 'liked' | 'manage'
const factList = ref([])
const currentIndex = ref(0)
const searchKeyword = ref('')

const cardClass = computed(() => {
  return {
    'theme-main': viewMode.value === 'main',
    'theme-liked': viewMode.value === 'liked',
    'theme-manage': viewMode.value === 'manage'
  }
})




//LIKE ui
const likedFactCache = ref(JSON.parse(localStorage.getItem(likedCacheKey.value) || '[]'))

const likedIndex = ref(0)
const isLikedAnimating = ref(false)
const likedEmojiContent = ref('🧠💗')
const likedDisplayFact = ref('')
const likedReadyToRender = ref(false)
const likeButton = ref(null)    
const isClicking = ref(false)  


const likedShowFact = (fact) => {
  likedEmojiContent.value = '🧠💗'
  likedReadyToRender.value = false
  isLikedAnimating.value = true

  setTimeout(() => {
    likedDisplayFact.value = fact
    likedReadyToRender.value = true
    isLikedAnimating.value = false
  }, 1000)
}

const handleLikedNext = () => {
  if (likedFacts.value.length === 0) return

  // 点击动画
  isClicking.value = false
  void likeButton.value?.offsetWidth
  isClicking.value = true
  setTimeout(() => {
    isClicking.value = false
  }, 300)

  // 获取未展示过的
  const unseen = likedFacts.value.filter(f => !likedFactCache.value.includes(f))
  const canAdd = unseen.length > 0

  if (canAdd) {
    const next = unseen[Math.floor(Math.random() * unseen.length)]
    likedFactCache.value.push(next)
    if (likedFactCache.value.length > 3) likedFactCache.value.shift()

    likedIndex.value = likedFactCache.value.length - 1
  } else {
    // 🔁 如果不能添加新趣闻，则在缓存内循环
    likedIndex.value = (likedIndex.value + 1) % likedFactCache.value.length
  }

  likedShowFact(likedFactCache.value[likedIndex.value])
}

const pinkColors = [
  '#ff69b4', // Hot Pink
  '#ff1493', // Deep Pink
  '#da70d6', // Orchid
  '#f78fa7', // Pink Sherbet
  '#ffdab9', // Peach Puff
];

const setRandomColor = () => {
  const waveCircleEl = document.querySelector('.liked-wave-circle')
  if (waveCircleEl) {
    const color = pinkColors[Math.floor(Math.random() * pinkColors.length)]
    waveCircleEl.style.backgroundColor = color
  }
}

onMounted(() => {
  // 进入 liked 时绑定动画换色
  watch(viewMode, (newMode) => {
    if (newMode === 'liked') {
      setTimeout(() => {
        const waveCircleEl = document.querySelector('.liked-animation .wave-circle')
        if (waveCircleEl) {
          // 设置初始颜色
          setRandomColor()

          // 清除旧监听（防止重复）
          waveCircleEl.removeEventListener('animationiteration', setRandomColor)

          // 添加新监听
          waveCircleEl.addEventListener('animationiteration', setRandomColor)
        }
      }, 100) // 等 DOM 渲染完成
    }
  }, { immediate: true })
})
// Computed: current fact & whether previous is available
const currentFact = computed(() => factList.value[currentIndex.value] || '')
const canGoPrev = computed(() => currentIndex.value > Math.max(0, factList.value.length - 3))

// Used for sliding animation
const readyToRender = ref(false)
const lastDirection = ref('next')
const factTransitionClass = computed(() =>
  lastDirection.value === 'next' ? 'slide-left' : 'slide-right'
)
const dotWindowStart = ref(0)
const dotKeyBase = ref(0)


function useVisibleDots(listRef, startRef, keyBaseRef, currentIndexRef) {
  return computed(() => {
    const list = listRef.value
    const len = list.length
    const start = startRef.value

    if (len <= 1) return []
    if (len === 2) return list.map((fact, i) => ({ fact, key: i }))
    
    // 多于 2 个，截取当前窗口
    return list.slice(start, start + 3).map((fact, idx) => ({
      fact,
      key: `${keyBaseRef.value}-${idx}`,
      active: currentIndexRef.value === start + idx
    }))
  })
}

const visibleDots = useVisibleDots(factList, dotWindowStart, dotKeyBase, currentIndex)


const likeAnimating = ref('')
const handleLikeClick = () => {
  const isNowLiked = !isLiked(currentFact.value)
  likeFact()

  likeAnimating.value = isNowLiked ? 'like-bounce' : 'unlike-shrink'
  setTimeout(() => {
    likeAnimating.value = ''
  }, 500)
}

const navClickAnim = ref('')

const triggerNavAnim = (type) => {
  navClickAnim.value = type
  setTimeout(() => {
    navClickAnim.value = ''
  }, 400)
}

const handleNext = () => {
  triggerNavAnim('next')
  nextFact()
}

const handlePrev = () => {
  triggerNavAnim('prev')
  prevFact()
}
// Delayed content display (after animation)
const displayFact = ref('')


// Overlay animation state
const isAnimating = ref(false)
const emojiContent = ref('')

const startAnimation = (nextFactValue) => {
  if (!nextFactValue || (nextFactValue === displayFact.value && displayFact.value !== '')) return

  isAnimating.value = true
  readyToRender.value = false
  emojiContent.value = '🧠🤔'

  setTimeout(() => {
    displayFact.value = nextFactValue
    isAnimating.value = false
    readyToRender.value = true
  }, 1000)
}
// Load liked facts when user changes
watch(currentUser, () => {
  loadFromStorage(currentUser.value || 'guest')
}, { immediate: true })

function updateLikedFactCache() {
  const all = likedFacts.value

  if (all.length < 3) {
    // 1 或 2 条 → 原样展示
    likedFactCache.value = [...all]
  } else {
    // ≥3 条 → 随机 + 最近
    const recent = all.slice(-2)
    const others = all.slice(0, -2)
    const randomOne = others[Math.floor(Math.random() * others.length)]
    likedFactCache.value = [randomOne, ...recent]
  }

  likedIndex.value = 0
  likedShowFact(likedFactCache.value[0])
}

watch(viewMode, (newMode) => {
  if (newMode === 'liked') {
    if (!likedFacts.value.length) {
      likedDisplayFact.value = 'No Liked Facts here...(Click the heart on the top right corner to save them!)'
      likedReadyToRender.value = true
    } else {
      updateLikedFactCache()
    }
  }

  if (newMode === 'main') {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 1000)
  }
})

// Fetch new fact with deduplication and caching
const fetchNewFact = async () => {
  try {
    let attempts = 0
    let fact = ''
    const MAX_ATTEMPTS = 10

    while (attempts < MAX_ATTEMPTS) {
      const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
      fact = res.data.text
      if (!factHistory.value.includes(fact)) break
      attempts++
    }

    if (fact && !factHistory.value.includes(fact)) {
      factList.value.push(fact)
      currentIndex.value = factList.value.length - 1
      factHistory.value.push(fact)

      if (factHistory.value.length > 200) {
        factHistory.value.shift()
      }

      saveFactHistory(currentUser.value || 'guest')
    } else {
      factList.value.push('No New Facts')
    }
  } catch (err) {
    console.error('加载失败：', err)
    factList.value.push('Failed to load. Please check your network connection or try again later.')
  }
}

// Navigation logic
const nextFact = () => {
  if (lock?.isNextLocked || isAnimating.value) return
  lock.isNextLocked = true
  isAnimating.value = true
  setTimeout(() => (lock.isNextLocked = false), 300)

  const atEnd = currentIndex.value === factList.value.length - 1

  if (atEnd) {
    fetchNewFact().then(() => {
      lastDirection.value = 'next'
      currentIndex.value = factList.value.length - 1

      if (currentIndex.value - dotWindowStart.value >= 3) {
        dotWindowStart.value++
        dotKeyBase.value++
      }

      startAnimation(factList.value[currentIndex.value])
    })
  } else {
    currentIndex.value++
    lastDirection.value = 'next'

    if (currentIndex.value - dotWindowStart.value >= 3) {
      dotWindowStart.value++
      dotKeyBase.value++
    }

    startAnimation(factList.value[currentIndex.value])
  }
}

const prevFact = () => {
  if (canGoPrev.value) {
    currentIndex.value--
    lastDirection.value = 'prev'

    if (currentIndex.value < dotWindowStart.value) {
      dotWindowStart.value--
      dotKeyBase.value++
    }

    startAnimation(factList.value[currentIndex.value])
  }
}

// Like / unlike logic
const isLiked = (fact) => likedFacts.value.includes(fact)
const likeFact = () => {
  const fact = currentFact.value
  if (!fact) return

  const index = likedFacts.value.indexOf(fact)
  if (index === -1) {
    likedFacts.value.push(fact)
  } else {
    likedFacts.value.splice(index, 1)
  }
  saveToStorage(currentUser.value || 'guest')
}

const expandedIndex = ref(null)
const currentManageTab = ref('liked') 

const recoverFromTrash = (idx) => {
  const fact = trashBin.value.splice(idx, 1)[0]
  if (fact && !likedFacts.value.includes(fact)) {
    likedFacts.value.push(fact)
    saveToStorage(currentUser.value || 'guest')
  }
}

const toggleExpand = (idx) => {
  expandedIndex.value = expandedIndex.value === idx ? null : idx
}
const removeFact = (idx) => {
  if (currentManageTab.value === 'liked') {
    const removed = likedFacts.value.splice(idx, 1)[0]
    trashBin.value.unshift(removed)
    if (trashBin.value.length > 5) trashBin.value.pop()
    saveToStorage(currentUser.value || 'guest')
  } else {
    trashBin.value.splice(idx, 1) 
  }
}

const filteredFacts = computed(() => {
  const source = currentManageTab.value === 'liked' ? likedFacts.value : trashBin.value
  return source.filter(f => f.toLowerCase().includes(searchKeyword.value.toLowerCase()))
})

watch(likedFacts, () => {
  if (viewMode.value !== 'liked') return

  const all = likedFacts.value
  if (all.length <= 3) {
    likedFactCache.value = [...all]
  } else {
    const recent = all.slice(-2)
    const others = all.slice(0, -2)
    const randomOne = others[Math.floor(Math.random() * others.length)]
    likedFactCache.value = [randomOne, ...recent]
  }

  likedIndex.value = 0
  likedShowFact(likedFactCache.value[0])

  localStorage.setItem(likedCacheKey.value, JSON.stringify(likedFactCache.value))
})

// Initial load
onMounted(() => {
  loadFactHistory(currentUser.value || 'guest')
  factList.value = [...factHistory.value]
  currentIndex.value = factList.value.length - 1
  dotWindowStart.value = Math.max(0, currentIndex.value - 2)
  dotKeyBase.value = 0

  if (factHistory.value.length === 0) {
    fetchNewFact().then(() => {
      const fact = factList.value[factList.value.length - 1] || ''
      startAnimation(fact)
    })
  } else {
    const fact = factList.value[currentIndex.value] || ''
    startAnimation(fact)
  }
})
  </script>
  
  <style scoped>
.fun-fact-widget {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

  .card-area {
  border: none;
  flex-grow: 1;
  border-radius: 6px;
  padding: 12px;
  position: relative;
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  height: 100%;
  overflow: hidden;
  transition: background-color 0.8s ease;
  
}
.card-area.theme-main {
  background: #99d9ff; 
}

.card-area.theme-liked {
  background: #ffb6c8; 
}

.card-area.theme-manage {
  background: #a8f7ba; 
}




  
  .toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  height: 40px; 
  box-sizing: border-box;
  z-index: 3;
  position: relative
  }

  .left-buttons,
.right-buttons {
  display: flex;
  gap: 8px;
}
  .toolbar button {
    background: none;
  border: none;
  border-radius: 50%;
  padding: 4px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
}

.toolbar button:hover {
  background: rgba(0, 0, 0, 0.05);
}
.nav-button {
  transition: transform 0.3s;
}

.nav-click {
  animation: nintendoPop 0.4s cubic-bezier(0.3, 1.4, 0.3, 1);
}

@keyframes nintendoPop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.3); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.like-emoji {
  font-size: 30px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.like-bounce {
  animation: likeBounce 0.4s ease;
}
@keyframes likeBounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); }
  100% { transform: scale(1); }
}


.unlike-shrink {
  animation: unlikeFade 0.4s ease;
}
@keyframes unlikeFade {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(0.6); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
.toolbar svg {
    width: 28px;
  height: 28px;
  fill: #444;
}

.toolbar button:disabled {
    opacity: 0.3;
    pointer-events: none;
}

.toolbar button.active svg {
  fill: #007bff;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; 
  padding-right: 6px; 
  z-index: 2
}
  .fact-frame-container {
  position: relative;
  height: 160px;
  border-radius: 10px;
  z-index: 2
}

.fact-frame {
  height: 160px;
  background: #f9f4ec;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;   
  align-items: flex-start;  
  justify-content: flex-start; 
  overflow-y: auto;         
  overflow-x: hidden;
  padding: 12px;
  margin-top: 12px;
  position: relative;
  z-index: 2;
}


.fact-frame.animating {
  scrollbar-width: none;
}
.fact-frame.animating::-webkit-scrollbar {
  display: none; 
}

.brain-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: rgb(100, 149, 237);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.emoji {
  font-size: 48px;
  transition: transform 0.5s ease;
}


.brain-thinking {
  transform: scale(1.1) rotate(-6deg);
  animation: brainBounce 0.5s ease-in-out;
}

@keyframes brainBounce {
  0% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.15) rotate(-5deg); }
  100% { transform: scale(1.1) rotate(-6deg); }
}


.emoji-fade-enter-from, .emoji-fade-leave-to {
  opacity: 0;
}
.emoji-fade-enter-active, .emoji-fade-leave-active {
  transition: opacity 0.5s;
}
  
.fact-text {
  font-size: 1.1rem;
  font-family: "Segoe UI", "Noto Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
  color: #444; 
  margin: 0;
}
  
  ul {
    list-style: none;
    padding-left: 0;
  }
  
  li {
    margin: 6px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

.tabs {
  display: flex;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
  margin-bottom: -1px; 
  padding-left: 0;
}

.tab-item {
  flex: 1;
  max-width: calc(66.66% / 3);
  text-align: center;
  padding: 2px 0;
  margin: 0 2px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-bottom: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  transition: background 0.2s ease;
  color: #333;
  transform: translateY(50%);
  transition: transform 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
  z-index: 0;
}

.tab-item:hover {
  transform: translateY(0%);
  z-index: 1;
}

.tab-item.active {
  transform: translateY(0%);
  font-weight: bold;
  z-index: 2;
}

.tab-item.theme-main:not(.active) {
    background: #99d9ff;
}
.tab-item.theme-liked:not(.active) {
    background: #ffb6c8;
}
.tab-item.theme-manage:not(.active) {
    background: #a8f7ba;
}

.tab-item.theme-main.active {
  background: #6ec6ff;
}

.tab-item.theme-liked.active {
  background: #ff9eb3;
}

.tab-item.theme-manage.active {
  background: #90f1a0;
}




.pagination-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  z-index: 3;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bbb;
  transition: background 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background: #444;
}

.dot-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.dot-enter-to {
  opacity: 1;
  transform: scale(1);
}
.dot-enter-active,
.dot-leave-active {
  transition: all 0.3s ease;
}
.dot-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.dot-delay-enter-active {
  transition-delay: 0.05s;
}
.dot-delay-leave-active {
  transition-delay: 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}


.liked .brain-overlay {
  background: rgba(255, 204, 229, 0.8);
}



.liked .nav-button:hover {
  background: rgba(255, 182, 193, 0.2);
}

.center-buttons {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.next-like-button {
  font-size: 40px;
  background: none;
  border: none;
  cursor: pointer;

}


.next-like-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fact-list-box {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ddd; 
}

.fact-item:last-child {
  border-bottom: none;
}

.fact-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.fact-controls button {
  font-size: 12px;       
  padding: 2px 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 24px;            
  height: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  background: #ffe6e6;
  color: #d00;
}

.delete-btn:hover {
  background: #ffcccc;
}

.toggle-btn {
  background: #e6f0ff;
  color: #333;
}

.toggle-btn:hover {
  background: #d0e5ff;
}

.fact-text-short {
  flex: 1;
  overflow: hidden;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; 
  line-clamp: 2; 
  white-space: normal; 
  text-overflow: ellipsis;
  word-break: break-word;

  line-height: 1.5;
  padding-right: 6px;
  padding-top: 2px;
  transition: all 0.3s ease;
}

.fact-text-short.expanded {
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
  background: #fff8dc;
  padding: 4px;
  border-radius: 4px;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.fact-controls button:hover {
  background: #ddd;
}
.input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.input-wrapper input {
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.trash-toggle {
  font-size: 18px;
  padding: 4px 10px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.trash-toggle:hover {
  background: #ddd;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.heartbeat-animation {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes click-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.click-animation {
  animation: click-pop 300ms ease;
}

.animated-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; 
  overflow: hidden;
}

.brainwave-line {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.wave-path {
  fill: none;
  stroke: rgb(10, 45, 143);
  stroke-width: 3;

}

.pulse-dot {
  fill: #00994d;
  filter: drop-shadow(0 0 5px #00994d);
  offset-distance: 0%;
  offset-rotate: auto;
}

.dot1 {
  offset-path: path("M0,70 L200,70 L300,-30 L400,100 L450,30 L500,70 L560,70 L720,70 L740,60 L760,80 L780,50 L810,70 L1000,70 L1200,70");
  animation: travel-dot 3s linear infinite;
  animation-delay: 2s;
}

.dot2 {
  offset-path: path("M0,287 L100,287 L120,270 L140,295 L160,287 L250,287 L300,287 L400,287 L500,287 L600,287 L680,287 L720,250 L760,320 L800,287 L850,287 L950,150 L1050,350 L1100,287 L1200,287");
  animation-delay: 4.5s;
  animation: travel-dot 5s linear infinite;
}

@keyframes travel-dot {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}

.main-animation .wave-circle {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 8px,
    #00ff88 8px,
    #00ff88 10px
  );
  animation: wave-expand 2.5s ease-out infinite;
  opacity: 0.3;
}

@keyframes wave-expand {
  0% {
    transform: scale(0.6);
    opacity: 0.2;
  }
  70% {
    transform: scale(1.6);
    opacity: 0.05;
  }
  100% {
    transform: scale(2.3);
    opacity: 0;
  }
}

@keyframes pulse-wave-main {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.5;
  }
  60% {
    transform: translate(-50%, -50%) scale(2.4);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.liked-animation .wave-circle {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 105, 180, 0.4); 
  animation: pulse-wave-liked 2.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}




@keyframes pulse-wave-liked {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
    filter: blur(4px);
  }
  10% {
    opacity: 0.7;
    filter: blur(2px);
  }
  30% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0.5;
    filter: blur(1px);
  }
  70% {
    transform: translate(-50%, -50%) scale(2.2);
    opacity: 0.2;
    filter: blur(2px);
  }
  100% {
    transform: translate(-50%, -50%) scale(2.8);
    opacity: 0;
    filter: blur(4px);
  }
}

  </style>