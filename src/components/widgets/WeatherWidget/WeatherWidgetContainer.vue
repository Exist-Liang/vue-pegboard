<template>
  <div class="weather-container">
    <div class="background-container">
      <div
        v-for="(theme, index) in bgThemes"
        :key="theme"
        :class="['background-layer', theme]"
        :style="{ opacity: currentBgIndex === index ? 1 : 0 }"
      ></div>
    </div>

    <div class="weather-main">
      <transition name="fade-slide" mode="out-in">
        <component
          v-if="!hideUI && cities.length > 0"
          :is="WeatherWidget"
          :key="cities[currentIndex]"
          :city="cities[currentIndex]"
          class="weather-widget-wrapper"
        />
        <div v-else-if="!hideUI" class="empty-panel">
        </div>
      </transition>
    </div>

    <div class="bottom-controls">
      <div class="city-indicators" v-show="!hideUI && cities.length > 1">
        <span
          v-for="(c, i) in cities"
          :key="c"
          :class="{ dot: true, active: i === currentIndex }"
          :style="{ backgroundColor: i === currentIndex ? 'white' : nextColor }"
        ></span>
      </div>

      <div class="control-row">
        <div class="switch-buttons" v-show="!hideUI && cities.length > 1">
          <button @click="prevCity" aria-label="Previous city" :style="{ backgroundColor: nextColor }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button @click="nextCity" aria-label="Next city" :style="{ backgroundColor: nextColor }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <button
  class="settings-button"
  @click="toggleSettings"
  @mouseenter="hovered = true"
  @mouseleave="hovered = false"
  :style="{ backgroundColor: nextColor }"
  aria-label="Open settings"
>
          <transition name="icon-fade" mode="out-in">
            <svg v-if="!hovered" key="menu" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else key="gear" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </transition>
        </button>
      </div>
    </div>

    <transition name="panel-fade">
      <div v-if="showSettings" class="settings-panel">
        <div class="add-row">
          <input
            v-model="newCity"
            placeholder="Enter city name"
            :disabled="cities.length >= 3"
            class="add-input"
          />
          <div class="add-controls">
            <button
              @click="addCity"
              :disabled="cities.length >= 3"
              class="add-btn"
              aria-label="Add city"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <button class="eye-toggle" @click="hideUI = !hideUI" aria-label="Toggle UI visibility">
              <transition name="icon-fade" mode="out-in">
                <svg v-if="!hideUI" key="eye" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#555" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#555"/>
                </svg>
                <svg v-else key="eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#555" stroke-width="2"/>
                  <line x1="4" y1="4" x2="20" y2="20" stroke="#555" stroke-width="2"/>
                </svg>
              </transition>
            </button>
          </div>
        </div>
        <p class="error-msg">{{ errorMsg || '\u00A0' }}</p>
        <ul>
          <transition-group name="fade-slide" tag="ul" class="city-list">
            <li v-for="(city, i) in cities" :key="city" class="city-item">
              <button class="delete-btn" @click="removeCity(i)" aria-label="Delete city">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#f44336"/>
                  <path d="M15 9L9 15M9 9l6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="city-name">{{ city }}</span>
            </li>
          </transition-group>
        </ul>
      </div>
    </transition>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, watch, computed, inject } from 'vue'
  import WeatherWidget from './WeatherWidget.vue'
  import '@/assets/css/transitions.css'
  
  const auth = inject('auth')
  const currentUser = computed(() => auth?.currentUser.value || '')
  const newCity = ref('')
  const currentIndex = ref(0)
  const showSettings = ref(false)
  const errorMsg = ref('')
  const bgThemes = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'default']
  const themeColors = ['#fbc02d', '#90a4ae', '#4fc3f7', '#e0f7fa', '#616161', '#bdbdbd']
  const currentBgIndex = ref(0)
  const isLoading = ref(false)
  const hovered = ref(false)
  const hideUI = ref(false)
  
  const nextColor = computed(() => {
    const nextIndex = (currentBgIndex.value + 1) % themeColors.length
    return themeColors[nextIndex]
  })
  
  onMounted(() => {
    setInterval(() => {
      currentBgIndex.value = (currentBgIndex.value + 1) % bgThemes.length
    }, 4000)
  })
  
  const STORAGE_KEY = computed(() => `weather_widget_cities_user_${currentUser.value}`)
  const cities = ref([])
  
  const loadCities = () => {
    const stored = localStorage.getItem(STORAGE_KEY.value)
    cities.value = stored ? JSON.parse(stored) : []
  }
  
  const saveCities = () => {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(cities.value))
  }
  
  watch(currentUser, loadCities)
  watch(cities, saveCities, { deep: true })
  
  onMounted(() => {
    if (currentUser.value) loadCities()
  })
  
  const toggleSettings = () => {
    showSettings.value = !showSettings.value
  }
  
  const prevCity = () => {
    isLoading.value = true
    currentIndex.value = (currentIndex.value - 1 + cities.value.length) % cities.value.length
    setTimeout(() => (isLoading.value = false), 1000)
  }
  
  const nextCity = () => {
    isLoading.value = true
    currentIndex.value = (currentIndex.value + 1) % cities.value.length
    setTimeout(() => (isLoading.value = false), 1000)
  }
  
  const removeCity = (index) => {
    cities.value.splice(index, 1)
    if (cities.value.length === 0) {
      currentIndex.value = 0
      showSettings.value = true
    } else if (currentIndex.value >= cities.value.length) {
      currentIndex.value = cities.value.length - 1
    }
  }
  const isValidInput = (name) => {
  const trimmed = name.trim()
  return /^[A-Za-z\s]{2,30}$/.test(trimmed) 
}
  
  const addCity = async () => {
    const name = newCity.value.trim()
    if (!name || cities.value.includes(name) || !isValidInput(name)) {
  errorMsg.value = '⚠️ Invalid city name'
  return
}
    const valid = await validateCity(name)
    if (valid) {
      cities.value.push(name)
      newCity.value = ''
      errorMsg.value = ''
    } else {
      errorMsg.value = '⚠️ City not found'
    }
  }
  
  const validateCity = async (name) => {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(name)}&limit=1&appid=46c641c991500a16bf25a469631b4a5a`
    )
    const data = await res.json()
    return data.length > 0
  }
  </script>

<style scoped>
.weather-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  overflow: hidden;
  z-index: 1;
}

.weather-main {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
  min-height: 65px;
}

.city-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  height: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.dot.active {
  background: white;
}

.control-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  box-sizing: border-box;
  min-height: 35px;
}

.switch-buttons {
  display: flex;
  gap: 4px;
}

.switch-buttons button {
  border: none;
  border-radius: 8px;
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s ease;
}

.switch-buttons button:hover {
  background: white;
  transform: scale(1.1);
}

.switch-buttons svg {
  width: 18px;
  height: 18px;
  stroke: #333;
}

.settings-button {
  position: absolute;
  bottom: 12px;
  right: -20px;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.6);
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.settings-button:hover {
  right: 8px;
}

.settings-button svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.settings-panel {
  position: absolute;
  top: 20px;
  right: 8px;
  background: white;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 90%;
  max-width: 200px;
  font-size: 0.85rem;
  box-sizing: border-box;
  overflow: hidden;
}

.settings-panel ul {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  overflow: hidden;
}

.settings-panel li {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-panel li button {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #c00;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.city-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.city-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.settings-panel input {
  width: 100%;
  padding: 4px;
  font-size: 0.85rem;
}

.settings-panel button {
  margin-top: 4px;
  padding: 4px 6px;
  font-size: 0.85rem;
}

.add-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.add-input {
  width: 100%;
  padding: 4px 6px;
  font-size: 0.85rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

.add-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.add-btn,
.eye-toggle {
  background-color: rgba(255, 255, 255, 0.6);
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.add-btn svg {
  stroke: white;
}

.add-btn:disabled {
  background-color: #90a4ae;
  cursor: not-allowed;
}

.empty-panel {
  padding: 1rem;
  text-align: center;
  font-size: 0.95rem;
  opacity: 0.85;
}

.error-msg {
  min-height: 2em;
  font-size: 0.75rem;
  color: red;
  margin: 2px 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.background-container {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 12px;
  overflow: hidden;
  pointer-events: none;
}

.background-layer {
  position: absolute;
  inset: 0;
  transition: opacity 1.5s ease-in-out;
  opacity: 0;
}

.delete-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn svg {
  transition: transform 0.2s ease;
}

.delete-btn:hover svg {
  transform: scale(1.1);
}

.background-layer.sunny {
  background: linear-gradient(to top right, #fbc02d, #ff9800);
}
.background-layer.cloudy {
  background: linear-gradient(to top right, #90a4ae, #cfd8dc);
}
.background-layer.rainy {
  background: linear-gradient(to top right, #4fc3f7, #0288d1);
}
.background-layer.snowy {
  background: linear-gradient(to top right, #e0f7fa, #b2ebf2);
}
.background-layer.stormy {
  background: linear-gradient(to top right, #616161, #212121);
}
.background-layer.default {
  background: linear-gradient(to top right, #bdbdbd, #757575);
}
</style>