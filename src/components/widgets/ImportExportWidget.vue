<template>
    <div class="terminal-widget" ref="terminalRef" v-terminal-cursor>
      <div class="screen" >
        <div v-if="!showIntro" class="buttons">
            <button
    class="terminal-btn"
    @click="triggerImport"
    aria-label="Import data"
  >
    IMPORT
  </button>
            <button
  v-if="isLoggedIn"
  class="terminal-btn"
  @click="handleExport"
  aria-label="Export data"
>
  EXPORT
</button>
  </div>
        <div v-else class="intro-screen">
          *** ROBCO Industries (TM) Termlink ***
        </div>

  <div class="screen-overlay breathing-glow"></div>

<div class="screen-overlay refresh-sweep"></div>
      </div>
      <input type="file" ref="fileInput" accept="application/json" @change="handleImport" style="display: none;" />
      <div class="scanlines"></div>
  

      <button class="info-btn" @click="triggerIntro" :disabled="isAnimating" aria-label="Toggle intro screen">🛈</button>
    </div>
  </template>
  
  <script setup>
  import { ref, inject, computed } from 'vue'
  import { getExportData , applyImportData } from '@/scripts/exportData.js' 
  
  const auth = inject('auth')
  const layoutCache = inject('layoutCache')
  const isLoggedIn = computed(() => auth.isLoggedIn.value)
  
  const userId = computed(() => auth?.currentUser?.value || 'guest')
  const fileInput = ref(null)
  

  const handleExport = () => {

  ['large', 'medium', 'small'].forEach(sizeKey => {
    const key = `dashboard-layout-${userId.value}-${sizeKey}`
    const cache = localStorage.getItem(key)
    console.log(`[expert] ${key}:`, cache)
    if (!cache) {
      localStorage.setItem(key, JSON.stringify([]))
    }
  })

  const data = getExportData({ userId: userId.value, auth })
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `dashboard-backup-${userId.value}.json`
  link.click()

  URL.revokeObjectURL(url)
}
const triggerImport = () => {
  fileInput.value?.click()
}
function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      console.log('[Import] File content：', e.target.result)
      const data = JSON.parse(e.target.result)
      console.log('[Import] Parse results：', data)

      if (!data.layoutCache || typeof data.layoutCache !== 'object') {
        throw new Error('The layoutCache is missing or has a format error.')
      }

      applyImportData({ data, auth, layoutCache })
      alert('✅ Import successful, data updated.')
    } catch (err) {
      alert('❌ Import failed, file format error.')
      console.error('[Import error]', err)
    } finally {
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}

const showIntro = ref(false)
const isAnimating = ref(false)
const terminalRef = ref(null)

const triggerIntro = () => {
  if (isAnimating.value) return  

  showIntro.value = true
  isAnimating.value = true
  let step = 0

  const flashInterval = setInterval(() => {
    if (step % 2 === 0) {
      terminalRef.value?.classList.add('flash-green') 
    } else {
      terminalRef.value?.classList.remove('flash-green') 
    }
    step++
    if (step >= 6) {
      clearInterval(flashInterval)
      showIntro.value = false
      isAnimating.value = false   
    }
  }, 200)
}
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .terminal-widget {
  width: 100%;
  height: 100%;
  background: #0b0f0c;
  border: 8px solid #666;  
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  font-family: 'VT323', monospace;
  color: #00ff00;
  display: flex;
  justify-content: center;
  align-items: center;


  background-clip: padding-box;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.3), 
    inset 0 -2px 6px rgba(0, 0, 0, 0.6),      
    inset 2px 0 6px rgba(255, 255, 255, 0.1),  
    inset -2px 0 6px rgba(0, 0, 0, 0.6),       
    0 0 15px rgba(64, 64, 64, 0.5),            
    0 2px 8px rgba(0, 0, 0, 0.8);              


  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.02) 75%, transparent 75%, transparent),
    linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 100% 100%, 2px 100%, 100% 2px;


  filter: saturate(0.8) hue-rotate(-5deg);


  transform: perspective(800px) rotateX(1deg) rotateY(0.5deg) scale(1.02);
}
.terminal-widget.flash-green {
  background-color: #00ff00;
}



  
  .screen {
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
    position: relative;
    transform: perspective(800px) rotateX(1deg) rotateY(0.5deg) scale(1.02);
  }

  .screen::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
  z-index: 3;
}


.screen::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(circle at 50% 50%, rgba(0,255,0,0.1) 0%, transparent 70%),
    radial-gradient(circle at 45% 55%, rgba(0,255,0,0.06) 0%, transparent 50%),
    radial-gradient(circle at 55% 45%, rgba(0,255,0,0.06) 0%, transparent 50%);
  filter: blur(1px);
  z-index: 2;
}
  
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .terminal-btn {
  width: 90px;
  height: 36px; 
  font-size: 16px; 
  font-family: 'VT323', monospace;
  color: #00ff00;
  background: transparent;
  border: 2px solid #00ff00;
  border-radius: 6px; 
  cursor: pointer;
  text-shadow: 0 0 3px #00ff00;
  box-shadow: inset 0 0 8px rgba(0, 255, 0, 0.2), 0 0 8px rgba(0, 255, 0, 0.4);
  transition: all 0.1s ease-in-out;
}

.terminal-btn:hover {
  background: rgba(0, 255, 0, 0.1);
}

.terminal-btn:active {
  transform: scale(0.95);
  background: rgba(0, 255, 0, 0.2);
}
  
.intro-screen {
  font-size: 1rem;
  text-align: center;
  letter-spacing: 1px;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
  transition: color 0.1s linear, text-shadow 0.1s linear;
  margin-bottom: 3px;
}


.terminal-widget.flash-green .intro-screen {
  color: #000;
  text-shadow: none;
}

  

  .scanlines {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 255, 0, 0.08) 0px,
    rgba(0, 255, 0, 0.08) 1px,
    transparent 1px,
    transparent 3px
  );
  z-index: 2;
  mix-blend-mode: screen;
  opacity: 0.5;  
}
  

  .info-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #00ff00;
  font-size: 16px;
  text-shadow: 0 0 3px #00ff00;
  z-index: 999;
}

.info-btn:hover {
  color: #66ff66;
}

.info-btn:active {
  transform: scale(0.9);
}

  .flash-effect {
  animation: screenFlash 0.3s steps(1) 3;
}

@keyframes screenFlash {
  0% { background-color: #0b0f0c; }
  50% { background-color: #00ff00; }
  100% { background-color: #0b0f0c; }
}

.screen-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}


.breathing-glow {
  background: radial-gradient(circle at center, rgba(0, 255, 0, 0.4) 0%, transparent 70%);
  animation: breathing 4s ease-in-out infinite;
}

@keyframes breathing {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.05); opacity: 0.3; }
}


.refresh-sweep {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 0, 4) 40%,
    rgba(0, 255, 0, 0.5) 50%,
    rgba(0, 255, 0, 0.4) 60%,
    transparent 100%
  );
  animation: sweep 6s linear infinite;
}

@keyframes sweep {
  0% { transform: translateY(-100%); opacity: 0.2; }
  10% { opacity: 0.3; }
  50% { opacity: 0.15; }
  100% { transform: translateY(100%); opacity: 0.2; }
}
.terminal-btn,
.info-btn {
  cursor: inherit !important;
}
  </style>