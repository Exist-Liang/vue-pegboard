<template>
    <div   
    class="pomodoro-widget"
    :class="currentMode"
    :style="{ pointerEvents: props.dragLocked ? 'none' : 'auto' }">
      <!-- 中心圆环 + emoji -->
      <div class="center-area">
  <svg class="circle-timer" viewBox="0 0 100 100">
    <circle class="background" cx="50" cy="50" r="45" />
    <circle
      class="progress"
      cx="50"
      cy="50"
      r="45"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="progressOffset"
    />
  </svg>

  <transition name="emoji-fade" mode="out-in">
  <div
    class="emoji-overlay"
    :key="currentMode"
    :class="[emojiAnimation, emojiClass]"
    @animationend="emojiAnimation = ''"
  >
    {{ currentMode === 'work' ? '🍅' : '🥛' }}
  </div>
</transition>
</div>
  
      <div class="corner-controls">
  <button class="bottom-left" v-if="isPaused" @click="reset" aria-label="Reset timer">
    <RotateCcw :size="20" />
    
  </button>

  <button class="bottom-right" @click="toggleRun" :aria-label="isRunning ? 'Pause timer' : 'Start timer'">
    <component :is="isRunning ? Pause : Play" :size="20" />
  </button>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, computed, onBeforeUnmount,onMounted } from 'vue'
import { Play, Pause, RotateCcw } from 'lucide-vue-next'
const totalTime = computed(() => currentMode.value === 'work' ? WORK_TIME : BREAK_TIME)

const emojiClass = computed(() => {
  if (!isRunning.value) return ''
  return currentMode.value === 'work' ? 'floating-emoji' : 'tilting-emoji'
})

const MAX_SESSION_DURATION = (WORK_TIME + BREAK_TIME) * 1000

const props = defineProps({
  dragLocked: Boolean
})



onMounted(() => {
  if (Notification && Notification.permission !== 'granted') {
    Notification.requestPermission()
  }
})

const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

const currentMode = ref('work')
const timeLeft = ref(WORK_TIME)
const isRunning = ref(false)
const isPaused = ref(false)
const emojiAnimation = ref('')
let timer = null
let sessionStart = 0
let sessionEnd = 0
const notified = ref(false)

const radius = 45
const circumference = 2 * Math.PI * radius
const progress = computed(() => {
  const max = currentMode.value === 'work' ? WORK_TIME : BREAK_TIME
  return (max - timeLeft.value) / max
})
const progressOffset = computed(() => (1 - progress.value) * circumference)



const tick = () => {
  if (!isRunning.value || isPaused.value) return

  const now = Date.now()
  const elapsedTotal = now - sessionStart  

  if (elapsedTotal > MAX_SESSION_DURATION) {
    reset()
    return
  }

  const remaining = Math.max(0, Math.floor((sessionEnd - now) / 1000))
  timeLeft.value = remaining               

  if (remaining <= 0 && !notified.value) {
    notified.value = true
    notify(
      currentMode.value === 'work'
        ? '🍅 Focus session complete! Take a well-deserved break!'
        : '🥛 Break is over! Time to start a new pomodoro!'
    )
    switchMode()
  }
}

const toggleRun = () => {
  if (isRunning.value) {
    pause()
  } else if (isPaused.value) {
    resume()
  } else {
    start()
  }
}

const start = () => {
  const now = Date.now()
  sessionStart = now
  sessionEnd = now + totalTime.value * 1000

  timeLeft.value = totalTime.value
  isRunning.value = true
  isPaused.value = false
  notified.value = false

  timer = setInterval(tick, 1000)
}

const pause = () => {
  isRunning.value = false
  isPaused.value = true
  clearInterval(timer)
  emojiAnimation.value = 'pause-jump'
}

const reset = () => {
  clearInterval(timer)
  isRunning.value = false
  isPaused.value = false
  currentMode.value = 'work'
  timeLeft.value = WORK_TIME
  emojiAnimation.value = 'reset-spin'
}

const resume = () => {
  const now = Date.now()
  const elapsed = totalTime.value - timeLeft.value

  sessionStart = now - elapsed * 1000
  sessionEnd = now + timeLeft.value * 1000

  isRunning.value = true
  isPaused.value = false
  notified.value = false

  timer = setInterval(tick, 1000)
}

const switchMode = () => {
  currentMode.value = currentMode.value === 'work' ? 'break' : 'work'
  start()
}

const notify = (message) => {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification('Pomodoro Reminder', {
      body: message,
      icon: '🍅'
    })
  }
}



onBeforeUnmount(() => clearInterval(timer))
</script>
  
<style scoped>
.pomodoro-widget {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  padding: 8px;
  box-sizing: border-box;
  position: relative;
  background: linear-gradient(to bottom right, #ff7e5f, #feb47b);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pomodoro-widget.work {
  background: linear-gradient(to bottom right, #ff7e5f, #feb47b);
}
.pomodoro-widget.break {
  background: linear-gradient(to bottom right, #56ab2f, #a8e063);
}

.center-area {
  position: relative;
  width: 80%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  margin-top: -18px;
}

.circle-timer {
  width: 100%;
  height: 100%;
}

circle.background {
  fill: none;
  stroke: #ffffff40;
  stroke-width: 5;
}

circle.progress {
  fill: none;
  stroke: #ffffffcc;
  stroke-width: 6;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 1s linear;
}

.emoji-overlay {
  position: absolute;
  font-size: 60px;
  transform-origin: center;
  transition: transform 0.3s ease;
  z-index: 1;
  margin-top: -4px;
}
.corner-controls {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  height: 0;
  pointer-events: none;
}

.bottom-left,
.bottom-right {
  position: absolute;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
  pointer-events: auto;
}

.bottom-left {
  left: 4px;
  bottom: -4px;
}
.bottom-right {
  right: 4px;
  bottom: -4px;
}

.bottom-left:hover,
.bottom-right:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: opacity 0.3s ease;
}
.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
}



.pause-jump {
  animation: jump 0.4s ease;
}
@keyframes jump {
  0%   { transform: translateY(0); }
  40%  { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.reset-spin {
  animation: spin 0.8s ease;
}
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes tilt-emoji {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

.floating-emoji {
  animation: float-emoji 2s ease-in-out infinite;
}

.tilting-emoji {
  animation: tilt-emoji 1.5s ease-in-out infinite;
}
  </style>